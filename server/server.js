const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { readDb, writeDb, getSummary } = require('./data/db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'temple-fund-secure-key-2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `bill-${Date.now()}-${Math.round(Math.random() * 1E6)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype) || file.mimetype === 'application/pdf';
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (JPG, PNG, WEBP) and PDF files are allowed!'));
  }
});

// Authentication Middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = readDb();
    const user = db.users.find(u => u.id === decoded.id);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'User not active or does not exist' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Admin only guard
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Admin access required' });
}

// ======================== AUTH ROUTES ========================

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/phone and password are required' });
  }

  const db = readDb();
  // Find by username or phone
  const user = db.users.find(u => 
    (u.username && u.username.toLowerCase() === username.trim().toLowerCase()) ||
    (u.phone && u.phone === username.trim())
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or phone number' });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ error: 'Account is deactivated. Contact Temple Admin.' });
  }

  let match = bcrypt.compareSync(password, user.passwordHash);
  // Also support case-flexible first letter for easy mobile/desktop typing (e.g. Vijay@123 vs vijay@123)
  if (!match && password.length > 0) {
    const flippedFirstChar = password[0] === password[0].toUpperCase() 
      ? password[0].toLowerCase() + password.slice(1) 
      : password[0].toUpperCase() + password.slice(1);
    match = bcrypt.compareSync(flippedFirstChar, user.passwordHash);
  }

  if (!match) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      phone: user.phone,
      role: user.role
    }
  });
});

// Current user details
app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    username: req.user.username,
    phone: req.user.phone,
    role: req.user.role
  });
});

// ======================== SUMMARY & FUND ROUTES ========================

// Get Treasury Summary
app.get('/api/summary', authenticate, (req, res) => {
  const db = readDb();
  const summary = getSummary(db);

  // If member, also provide member-specific metrics
  if (req.user.role === 'member') {
    const memberExpenses = db.expenses.filter(e => e.submittedBy.id === req.user.id);
    const myApproved = memberExpenses
      .filter(e => e.status === 'APPROVED')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const myPending = memberExpenses
      .filter(e => e.status === 'PENDING')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const myRejected = memberExpenses
      .filter(e => e.status === 'REJECTED')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    summary.myStats = {
      totalSubmittedCount: memberExpenses.length,
      myApproved,
      myPending,
      myRejected
    };
  }

  res.json(summary);
});

// Get Categories
app.get('/api/categories', authenticate, (req, res) => {
  const db = readDb();
  res.json(db.categories || []);
});

// List Funds Inflow (Deposits)
app.get('/api/funds', authenticate, (req, res) => {
  const db = readDb();
  res.json(db.funds);
});

// Add Fund Inflow / Deposit (Admin only)
app.post('/api/funds', authenticate, requireAdmin, (req, res) => {
  const { amount, title, donorName, notes, date, type } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Valid positive amount is required' });
  }
  if (!title) {
    return res.status(400).json({ error: 'Fund title / purpose is required' });
  }

  const db = readDb();
  const newFund = {
    id: `fnd_${Date.now()}`,
    amount: Number(amount),
    type: type || 'donation',
    title: title.trim(),
    donorName: (donorName || 'Temple Trustee').trim(),
    notes: (notes || '').trim(),
    date: date || new Date().toISOString().split('T')[0],
    createdBy: req.user.name,
    createdAt: new Date().toISOString()
  };

  db.funds.unshift(newFund);
  writeDb(db);

  res.status(201).json({
    message: 'Fund added to temple treasury successfully',
    fund: newFund,
    summary: getSummary(db)
  });
});

// ======================== EXPENSE CLAIMS ROUTES ========================

// Get Expenses (with filters)
app.get('/api/expenses', authenticate, (req, res) => {
  const db = readDb();
  let list = [...db.expenses];

  // If user is a member, they can optionally view only their own or all approved
  // For transparency in temple funds, members can see their own claims or all approved claims
  const { status, category, startDate, endDate, search, userFilter } = req.query;

  if (req.user.role === 'member') {
    // If member selects "my_claims", filter by their ID
    if (userFilter === 'mine' || !userFilter) {
      list = list.filter(e => e.submittedBy.id === req.user.id);
    }
  } else if (userFilter && userFilter !== 'all') {
    // Admin filtering by member
    list = list.filter(e => e.submittedBy.id === userFilter);
  }

  // Filter by status
  if (status && status !== 'ALL') {
    list = list.filter(e => e.status === status.toUpperCase());
  }

  // Filter by category
  if (category && category !== 'ALL') {
    list = list.filter(e => e.category === category);
  }

  // Filter by date range
  if (startDate) {
    list = list.filter(e => e.date >= startDate);
  }
  if (endDate) {
    list = list.filter(e => e.date <= endDate);
  }

  // Search keyword
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(e => 
      e.title.toLowerCase().includes(q) ||
      (e.notes && e.notes.toLowerCase().includes(q)) ||
      e.submittedBy.name.toLowerCase().includes(q) ||
      (e.category && e.category.toLowerCase().includes(q))
    );
  }

  // Sort descending by date / createdAt
  list.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  res.json(list);
});

// Submit New Expense Claim (Multipart form with optional bill photo)
app.post('/api/expenses', authenticate, upload.single('billPhoto'), (req, res) => {
  try {
    const { amount, title, category, date, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid expense amount is required' });
    }

    const db = readDb();

    let billPhotoUrl = null;
    if (req.file) {
      billPhotoUrl = `/uploads/${req.file.filename}`;
    }

    const defaultTitle = title && title.trim() ? title.trim() : `Expense by ${req.user.name}`;

    const newExpense = {
      id: `exp_${Date.now()}`,
      title: defaultTitle,
      amount: Number(amount),
      category: category || 'General Expense',
      date: date || new Date().toISOString().split('T')[0],
      billPhotoUrl,
      notes: (notes || '').trim(),
      submittedBy: {
        id: req.user.id,
        name: req.user.name,
        phone: req.user.phone
      },
      status: 'PENDING',
      reviewedBy: null,
      reviewDate: null,
      rejectionReason: null,
      createdAt: new Date().toISOString()
    };

    db.expenses.unshift(newExpense);
    writeDb(db);

    res.status(201).json({
      message: 'Expense submitted successfully. Awaiting Admin Approval.',
      expense: newExpense,
      summary: getSummary(db)
    });
  } catch (err) {
    console.error("Error creating expense:", err);
    res.status(500).json({ error: err.message || 'Server error creating expense' });
  }
});

// Admin Review: Accept or Reject Expense Claim
app.put('/api/expenses/:id/status', authenticate, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
  }

  const db = readDb();
  const expense = db.expenses.find(e => e.id === id);

  if (!expense) {
    return res.status(404).json({ error: 'Expense claim not found' });
  }

  const prevStatus = expense.status;
  expense.status = status;
  expense.reviewedBy = req.user.name;
  expense.reviewDate = new Date().toISOString();
  
  if (status === 'REJECTED') {
    expense.rejectionReason = rejectionReason ? rejectionReason.trim() : 'Rejected by Admin without specific remark';
  } else {
    expense.rejectionReason = null;
  }

  writeDb(db);

  res.json({
    message: `Expense claim has been ${status.toLowerCase()} successfully`,
    expense,
    summary: getSummary(db)
  });
});

// Delete Expense Claim
app.delete('/api/expenses/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.expenses.findIndex(e => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  const expense = db.expenses[index];

  // Only Admin or the submitter (if still pending) can delete
  if (req.user.role !== 'admin' && (expense.submittedBy.id !== req.user.id || expense.status !== 'PENDING')) {
    return res.status(403).json({ error: 'Cannot delete processed or unauthorized expense claim' });
  }

  // Remove uploaded file if exists
  if (expense.billPhotoUrl) {
    const filePath = path.join(__dirname, expense.billPhotoUrl);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }
  }

  db.expenses.splice(index, 1);
  writeDb(db);

  res.json({
    message: 'Expense claim removed',
    summary: getSummary(db)
  });
});

// ======================== MEMBER MANAGEMENT ROUTES ========================

// Get Members list
app.get('/api/members', authenticate, requireAdmin, (req, res) => {
  const db = readDb();
  const members = db.users
    .filter(u => u.role === 'member')
    .map(u => {
      const userExpenses = db.expenses.filter(e => e.submittedBy.id === u.id);
      const totalClaimed = userExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const totalApproved = userExpenses.filter(e => e.status === 'APPROVED').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const pendingClaims = userExpenses.filter(e => e.status === 'PENDING').length;

      return {
        id: u.id,
        name: u.name,
        phone: u.phone,
        username: u.username,
        status: u.status,
        createdAt: u.createdAt,
        stats: {
          totalClaims: userExpenses.length,
          pendingClaims,
          totalClaimed,
          totalApproved
        }
      };
    });

  res.json(members);
});

// Add New Member (Admin only)
app.post('/api/members', authenticate, requireAdmin, (req, res) => {
  const { name, phone, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Name, Username, and Password are required' });
  }

  const db = readDb();
  
  // Check duplicate username or phone
  const existing = db.users.find(u => 
    u.username.toLowerCase() === username.trim().toLowerCase() ||
    (phone && u.phone === phone.trim())
  );

  if (existing) {
    return res.status(400).json({ error: 'A user with this username or phone number already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const newMember = {
    id: `usr_mem_${Date.now()}`,
    name: name.trim(),
    phone: phone ? phone.trim() : '',
    username: username.trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(password.trim(), salt),
    role: 'member',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  db.users.push(newMember);
  writeDb(db);

  res.status(201).json({
    message: 'Member added successfully',
    member: {
      id: newMember.id,
      name: newMember.name,
      phone: newMember.phone,
      username: newMember.username,
      status: newMember.status,
      createdAt: newMember.createdAt
    }
  });
});

// Toggle Member Status (Active/Inactive)
app.put('/api/members/:id/status', authenticate, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Status must be active or inactive' });
  }

  const db = readDb();
  const member = db.users.find(u => u.id === id);

  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }

  member.status = status;
  writeDb(db);

  res.json({
    message: `Member status updated to ${status}`,
    member: {
      id: member.id,
      name: member.name,
      status: member.status
    }
  });
});

// Delete Member
app.delete('/api/members/:id', authenticate, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.users.findIndex(u => u.id === id && u.role === 'member');

  if (index === -1) {
    return res.status(404).json({ error: 'Member not found or cannot delete admin' });
  }

  db.users.splice(index, 1);
  writeDb(db);

  res.json({ message: 'Member deleted successfully' });
});

// ======================== CORPORATE REPORTS API ========================

app.get('/api/reports', authenticate, (req, res) => {
  const db = readDb();
  const { startDate, endDate, category, memberId } = req.query;

  let expenses = [...db.expenses];

  if (startDate) {
    expenses = expenses.filter(e => e.date >= startDate);
  }
  if (endDate) {
    expenses = expenses.filter(e => e.date <= endDate);
  }
  if (category && category !== 'ALL') {
    expenses = expenses.filter(e => e.category === category);
  }
  if (memberId && memberId !== 'ALL') {
    expenses = expenses.filter(e => e.submittedBy.id === memberId);
  }

  // Aggregations
  const totalApproved = expenses.filter(e => e.status === 'APPROVED').reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalPending = expenses.filter(e => e.status === 'PENDING').reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalRejected = expenses.filter(e => e.status === 'REJECTED').reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalInflow = db.funds.reduce((s, f) => s + (Number(f.amount) || 0), 0);

  // Category breakdown
  const categoryStats = {};
  expenses.filter(e => e.status === 'APPROVED').forEach(e => {
    const cat = e.category || 'Miscellaneous';
    categoryStats[cat] = (categoryStats[cat] || 0) + Number(e.amount);
  });

  // Monthly breakdown
  const monthlyStats = {};
  expenses.forEach(e => {
    const monthKey = (e.date || e.createdAt).substring(0, 7); // YYYY-MM
    if (!monthlyStats[monthKey]) {
      monthlyStats[monthKey] = { approved: 0, pending: 0, rejected: 0, total: 0 };
    }
    const amt = Number(e.amount) || 0;
    if (e.status === 'APPROVED') monthlyStats[monthKey].approved += amt;
    else if (e.status === 'PENDING') monthlyStats[monthKey].pending += amt;
    else if (e.status === 'REJECTED') monthlyStats[monthKey].rejected += amt;
    monthlyStats[monthKey].total += amt;
  });

  // Member breakdown
  const memberStats = {};
  expenses.forEach(e => {
    const mName = e.submittedBy.name;
    if (!memberStats[mName]) {
      memberStats[mName] = { approved: 0, pending: 0, rejected: 0, totalCount: 0 };
    }
    const amt = Number(e.amount) || 0;
    if (e.status === 'APPROVED') memberStats[mName].approved += amt;
    else if (e.status === 'PENDING') memberStats[mName].pending += amt;
    else if (e.status === 'REJECTED') memberStats[mName].rejected += amt;
    memberStats[mName].totalCount += 1;
  });

  res.json({
    summary: {
      totalInflow,
      totalApproved,
      totalPending,
      totalRejected,
      netAvailableBalance: totalInflow - totalApproved,
      totalClaimsCount: expenses.length,
      approvedCount: expenses.filter(e => e.status === 'APPROVED').length,
      pendingCount: expenses.filter(e => e.status === 'PENDING').length,
      rejectedCount: expenses.filter(e => e.status === 'REJECTED').length
    },
    categoryBreakdown: categoryStats,
    monthlyBreakdown: monthlyStats,
    memberBreakdown: memberStats,
    records: expenses
  });
});

// Serve frontend in production if built
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Temple Fund & Expense Server running on http://localhost:${PORT}`);
});
