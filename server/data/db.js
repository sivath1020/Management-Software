const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname);
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getInitialData() {
  const salt = bcrypt.genSaltSync(10);
  return {
    meta: {
      templeName: "Sri Vigneshwara Swamy Temple",
      currency: "INR",
      currencySymbol: "₹",
      trustName: "Temple Development & Seva Trust",
      registrationNo: "TR-2024/78901",
      lastUpdated: new Date().toISOString()
    },
    users: [
      {
        id: "usr_admin_vijay",
        name: "Vijay",
        phone: "9876543210",
        username: "Vijay",
        passwordHash: bcrypt.hashSync("Vijay@123", salt),
        role: "admin",
        status: "active",
        createdAt: new Date().toISOString()
      }
    ],
    funds: [],
    expenses: [],
    categories: [
      "Pooja & Rituals",
      "Temple Maintenance",
      "Annadhanam",
      "Electricity & Utilities",
      "Flowers & Garlands",
      "Sound & Events",
      "Miscellaneous"
    ]
  };
}

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading db.json, returning initial", err);
    return getInitialData();
  }
}

function writeDb(data) {
  data.meta.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getSummary(db) {
  const totalFundsInflow = db.funds.reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  
  const approvedExpenses = db.expenses.filter(e => e.status === 'APPROVED');
  const pendingExpenses = db.expenses.filter(e => e.status === 'PENDING');
  const rejectedExpenses = db.expenses.filter(e => e.status === 'REJECTED');

  const totalApproved = approvedExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const totalPending = pendingExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const totalRejected = rejectedExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  
  // Available Balance = Total Inflow minus Approved Expenses
  const availableBalance = totalFundsInflow - totalApproved;

  return {
    templeName: db.meta.templeName,
    currencySymbol: db.meta.currencySymbol,
    totalFundsInflow,
    totalApproved,
    totalPending,
    totalRejected,
    availableBalance,
    totalClaimsCount: db.expenses.length,
    approvedCount: approvedExpenses.length,
    pendingCount: pendingExpenses.length,
    rejectedCount: rejectedExpenses.length,
    membersCount: db.users.filter(u => u.role === 'member').length
  };
}

module.exports = {
  readDb,
  writeDb,
  getSummary
};

