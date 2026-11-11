# Temple Treasury & Expense Management Portal (Kovil Nidhi & Selavu Kankku)

A modern, responsive, corporate-grade web application built for temple trusts and committees to manage funds, handle member expense submissions, verify bill receipts, and generate financial audit reports.

---

## 🌟 Key Features

### 1. Mobile-First & Corporate UI
- **Clean & Uncluttered**: Designed with a corporate palette (deep slate, subtle warm temple gold, crisp emerald, and soft shadows). No overcrowded visuals or complex jargon.
- **Mobile-First Experience**:
  - Fixed bottom navigation dock on mobile devices (Home, Claims, Reports, Members).
  - Floating "+ Submit" action button for one-hand thumb access.
  - Native camera capture support (`capture="environment"`) to snap paper bill receipts directly from phone cameras or gallery.
  - Touch-friendly cards, high contrast typography, and Indian Rupee standard formatting (`₹ 1,50,000`).

### 2. Member Workflow (Expense Claim Submission)
- Secure login via Phone Number or Username.
- Member submits an expense claim:
  - **Amount (₹)**
  - **Expense Title / Purpose** (with quick-select suggestions like Flowers, Abhishekam, EB Bill, Annadhanam)
  - **Category** (Pooja & Rituals, Maintenance, Annadhanam, Electricity, etc.)
  - **Date**
  - **Bill / Receipt Photo** (*Optional* — supports camera photo or PDF upload)
  - **Notes / Remarks**
- Real-time status tracking (**Pending Review ⏳**, **Approved ✅**, **Rejected ❌**).

### 3. Admin & Trustee Workflow (Approval & Fund Management)
- **Executive Treasury Dashboard**:
  - **Available Balance**: Accurately computed as `Total Inflow - Approved Expenses`.
  - **Total Funds Inflow**: Temple corpus funds, hundi collections, and devotee ubhayams/donations.
  - **Approved Disbursements**: Verified expenses deducted from the temple treasury.
  - **Pending Verification**: Live counter and total amount awaiting trustee review.
  - **Rejected Claims**: Excluded from disbursements; reasons tracked.
- **One-Tap Accept / Reject**:
  - Click **Accept** to approve the bill — automatically deducts from available balance and updates ledgers.
  - Click **Reject** to decline the bill — opens a prompt to record the rejection reason. The rejected amount is excluded from expenses and the treasury fund remains protected.
- **Bill Lightbox Viewer**: Full-screen modal to examine receipt images/PDFs before accepting.
- **Add Temple Funds**: Trustee can record incoming donations, festival sponsorships, or hundi collections.

### 4. Member Management (Admin Only)
- Admin can add trusted committee volunteers (Name, Phone number, Username, Initial password).
- Activate or deactivate member accounts.
- View individual member statistics (total claims submitted, pending claims, and total approved disbursements).

### 5. Corporate Financial Statements & Audit Reports
- **Executive Audit Statement**:
  - Filter by date range (from/to), category, and member.
  - Visual category breakdown with percentage bars.
  - Detailed ledger table with particulars, category, submitter, bill status, review notes, and amounts.
- **Print / PDF Ready**: Formatted with temple letterhead, trust registration details, and trustee signature fields for A4 paper.
- **Export to CSV**: Instant one-click spreadsheet download.

---

## 🚀 How to Run

### Quick Start (Single Command):

1. **Start the Production Server** (serves both API & Frontend):
   ```bash
   npm start
   ```
   Open your browser at:
   👉 **http://localhost:5000**

2. **For Development (with Hot Reload for Frontend & Backend)**:
   ```bash
   npm run dev
   ```
   - Frontend runs on: **http://localhost:3000**
   - Backend API runs on: **http://localhost:5000**

---

## 🔑 Default Credentials

### Admin (Trustee):
- **Username**: `admin`
- **Password**: `admin123`
*(Full access to approve/reject claims, add funds, add members, and view all reports)*

### Pre-configured Members:
- **Username**: `suresh` | **Password**: `member123` *(Pooja Incharge)*
- **Username**: `ramesh` | **Password**: `member123` *(Maintenance Committee)*
- **Username**: `murugesan` | **Password**: `member123` *(Flowers Seva)*

*(Quick One-Click Demo buttons are also available right on the login screen for testing!)*

---

## 📁 Project Architecture

```
├── client/                     # React 19 + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── api.js              # Centralized API client & INR currency helpers
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication state & role guards
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top corporate bar + mobile bottom dock
│   │   │   ├── Dashboard.jsx       # Financial cards & executive summary
│   │   │   ├── ExpenseFormModal.jsx# Bill entry modal with camera upload
│   │   │   ├── ExpenseList.jsx     # Claims list with Admin Accept/Reject
│   │   │   ├── ReceiptModal.jsx    # Lightbox bill viewer
│   │   │   ├── ReportsView.jsx     # Corporate financial statement & PDF/CSV
│   │   │   ├── MembersView.jsx     # Admin member management
│   │   │   ├── AddFundModal.jsx    # Admin treasury deposit modal
│   │   │   └── LoginView.jsx       # Corporate login screen with quick demo
│   │   └── index.css           # Tailwind CSS & Print styles
│   └── vite.config.js          # Vite config with API proxy
│
├── server/
│   ├── server.js               # Express 5 REST API & static file server
│   ├── data/
│   │   ├── db.js               # Database abstraction & accounting formulas
│   │   └── db.json             # Persistent JSON database (auto-created)
│   └── uploads/                # Stored receipt photos & PDFs
│
├── package.json
└── README.md
```

