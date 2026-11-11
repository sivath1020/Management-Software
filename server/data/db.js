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
        id: "usr_admin_1",
        name: "Temple Trustee (Admin)",
        phone: "9876543210",
        username: "admin",
        passwordHash: bcrypt.hashSync("admin123", salt),
        role: "admin",
        status: "active",
        createdAt: "2026-01-01T00:00:00.000Z"
      },
      {
        id: "usr_mem_1",
        name: "Suresh Kumar (Pooja Incharge)",
        phone: "9876501234",
        username: "suresh",
        passwordHash: bcrypt.hashSync("member123", salt),
        role: "member",
        status: "active",
        createdAt: "2026-01-05T00:00:00.000Z"
      },
      {
        id: "usr_mem_2",
        name: "Ramesh Babu (Maintenance)",
        phone: "9876505678",
        username: "ramesh",
        passwordHash: bcrypt.hashSync("member123", salt),
        role: "member",
        status: "active",
        createdAt: "2026-01-10T00:00:00.000Z"
      }
    ],
    funds: [
      {
        id: "fnd_1",
        amount: 150000,
        type: "initial",
        title: "Temple Treasury Opening Balance",
        donorName: "Trust Reserve",
        notes: "Opening corpus for annual pooja & maintenance",
        date: "2026-01-01",
        createdBy: "admin",
        createdAt: "2026-01-01T00:00:00.000Z"
      },
      {
        id: "fnd_2",
        amount: 25000,
        type: "donation",
        title: "Special Festival Ubhayam Donation",
        donorName: "M. K. Swaminathan & Family",
        notes: "For monthly Pradhosham and Annadhanam expenses",
        date: "2026-01-15",
        createdBy: "admin",
        createdAt: "2026-01-15T10:00:00.000Z"
      }
    ],
    expenses: [
      {
        id: "exp_1",
        title: "Special Abhishekam Flowers & Garland",
        amount: 3500,
        category: "Pooja & Rituals",
        date: "2026-01-18",
        billPhotoUrl: null,
        notes: "Jasmine garlands and lotus flowers for Sunday special pooja",
        submittedBy: {
          id: "usr_mem_1",
          name: "Suresh Kumar (Pooja Incharge)",
          phone: "9876501234"
        },
        status: "APPROVED",
        reviewedBy: "Temple Trustee (Admin)",
        reviewDate: "2026-01-19T09:30:00.000Z",
        rejectionReason: null,
        createdAt: "2026-01-18T18:00:00.000Z"
      },
      {
        id: "exp_2",
        title: "Main Sanctum Lighting & Electrical Repairs",
        amount: 4800,
        category: "Temple Maintenance",
        date: "2026-01-22",
        billPhotoUrl: null,
        notes: "Replaced 4 LED spotlight fixtures and breaker wire",
        submittedBy: {
          id: "usr_mem_2",
          name: "Ramesh Babu (Maintenance)",
          phone: "9876505678"
        },
        status: "APPROVED",
        reviewedBy: "Temple Trustee (Admin)",
        reviewDate: "2026-01-23T11:00:00.000Z",
        rejectionReason: null,
        createdAt: "2026-01-22T16:30:00.000Z"
      },
      {
        id: "exp_3",
        title: "Annadhanam Grocery & Cooking Provisions",
        amount: 6200,
        category: "Annadhanam",
        date: "2026-01-28",
        billPhotoUrl: null,
        notes: "Rice bag, dhal, ghee and vegetables for Pournami feast",
        submittedBy: {
          id: "usr_mem_1",
          name: "Suresh Kumar (Pooja Incharge)",
          phone: "9876501234"
        },
        status: "PENDING",
        reviewedBy: null,
        reviewDate: null,
        rejectionReason: null,
        createdAt: "2026-01-28T19:00:00.000Z"
      }
    ],
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

