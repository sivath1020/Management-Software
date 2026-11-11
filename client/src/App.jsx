import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { apiRequest } from './api';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ReportsView from './components/ReportsView';
import MembersView from './components/MembersView';
import AddFundView from './components/AddFundView';
import ExpenseFormModal from './components/ExpenseFormModal';
import ReceiptModal from './components/ReceiptModal';
import LoginView from './components/LoginView';

function MainApp() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  
  // App data
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Modals
  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false);
  const [viewingReceiptExpense, setViewingReceiptExpense] = useState(null);

  const loadData = async () => {
    try {
      setDataLoading(true);
      const [sumData, expData] = await Promise.all([
        apiRequest('/summary'),
        apiRequest('/expenses')
      ]);

      setSummary(sumData);
      setExpenses(expData || []);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <p className="text-xs font-semibold text-slate-300">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      
      {/* Top Navbar & Mobile Capsule Pill Dock */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenNewClaim={() => setIsNewClaimOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-5 pb-24 sm:pb-10">
        
        {activeTab === 'home' && (
          <Dashboard
            summary={summary}
            expenses={expenses}
            onRefresh={loadData}
            onOpenNewClaim={() => setIsNewClaimOpen(true)}
            onOpenAddFund={() => setActiveTab('funds')}
            onOpenAddMember={() => setActiveTab('members')}
            onViewReceipt={(exp) => setViewingReceiptExpense(exp)}
          />
        )}

        {activeTab === 'funds' && isAdmin && (
          <AddFundView
            onSuccess={() => {
              loadData();
              setActiveTab('home');
            }}
            onCancel={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'members' && isAdmin && (
          <MembersView />
        )}

        {activeTab === 'reports' && (
          <ReportsView />
        )}

      </main>

      {/* Bill Submission Modal */}
      <ExpenseFormModal
        isOpen={isNewClaimOpen}
        onClose={() => setIsNewClaimOpen(false)}
        onSuccess={loadData}
      />

      {/* Receipt Image Viewer */}
      <ReceiptModal
        expense={viewingReceiptExpense}
        onClose={() => setViewingReceiptExpense(null)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
