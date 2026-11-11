import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Paperclip, 
  Search, 
  Filter, 
  User, 
  Calendar, 
  Eye, 
  AlertCircle,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { formatINR, formatDate, apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ExpenseList({ 
  expenses, 
  loading, 
  onRefresh, 
  onViewReceipt,
  categories,
  members
}) {
  const { user, isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Rejection Dialog State
  const [rejectingExpense, setRejectingExpense] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Status Action (Accept or Reject)
  const handleUpdateStatus = async (id, status, reason = '') => {
    try {
      setProcessingId(id);
      await apiRequest(`/expenses/${id}/status`, {
        method: 'PUT',
        body: { status, rejectionReason: reason }
      });
      setRejectingExpense(null);
      setRejectionReason('');
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to update expense status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense claim?')) return;
    try {
      setProcessingId(id);
      await apiRequest(`/expenses/${id}`, { method: 'DELETE' });
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to delete claim');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter items
  const filtered = expenses.filter(item => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (isAdmin && selectedMember !== 'all' && item.submittedBy.id !== selectedMember) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = item.title?.toLowerCase().includes(q) ||
        item.notes?.toLowerCase().includes(q) ||
        item.submittedBy?.name?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const pendingCount = expenses.filter(e => e.status === 'PENDING').length;
  const approvedCount = expenses.filter(e => e.status === 'APPROVED').length;
  const rejectedCount = expenses.filter(e => e.status === 'REJECTED').length;

  return (
    <div className="space-y-4">
      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        
        {/* Status Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Claims ({expenses.length})
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'PENDING'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span>Pending Review</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-amber-200 text-amber-900'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Approved ({approvedCount})
          </button>

          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search claim, person, or note..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50 text-slate-700"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Member Filter (Admin only) */}
          {isAdmin && (
            <div className="relative">
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50 text-slate-700"
              >
                <option value="all">All Members</option>
                {members?.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

      </div>

      {/* Expenses Cards List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">Loading expense claims...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No Expense Claims Found</h4>
          <p className="text-xs text-slate-400 mt-1">
            {statusFilter !== 'ALL' ? `No claims found in ${statusFilter.toLowerCase()} status.` : 'No claims match your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isPending = item.status === 'PENDING';
            const isApproved = item.status === 'APPROVED';
            const isRejected = item.status === 'REJECTED';
            const isProcessing = processingId === item.id;

            return (
              <div 
                key={item.id}
                className={`bg-white rounded-xl sm:rounded-2xl border transition-all p-4 shadow-2xs hover:shadow-xs ${
                  isPending ? 'border-amber-200/80 bg-gradient-to-r from-white via-white to-amber-50/20' :
                  isApproved ? 'border-slate-200/80' : 'border-rose-100 bg-rose-50/15'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left Column: Title, Category, Submitter */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                        {item.title}
                      </span>

                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isApproved ? 'bg-emerald-100 text-emerald-800' :
                        isRejected ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
                        {isPending && <Clock className="w-3 h-3 text-amber-600 animate-pulse" />}
                        <span>{item.status}</span>
                      </span>

                      {/* Category Pill */}
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </div>

                    {/* Metadata Sub-row */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {item.submittedBy?.name || 'Member'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(item.date)}
                      </span>
                      {item.billPhotoUrl && (
                        <>
                          <span>•</span>
                          <button
                            onClick={() => onViewReceipt(item)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline text-[11px]"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>View Bill Receipt</span>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Notes if present */}
                    {item.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                        "{item.notes}"
                      </p>
                    )}

                    {/* Rejection reason banner */}
                    {isRejected && item.rejectionReason && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span><strong className="font-semibold">Reason:</strong> {item.rejectionReason}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Amount & Action Buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2">
                    
                    {/* Amount */}
                    <div className="text-left sm:text-right">
                      <span className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight block">
                        {formatINR(item.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isApproved ? 'Deducted from Funds' : isRejected ? 'Excluded from Funds' : 'Pending Verification'}
                      </span>
                    </div>

                    {/* Admin Action Buttons for Pending Claims */}
                    {isAdmin && isPending && (
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={isProcessing}
                          onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                          title="Accept and deduct from fund"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>

                        <button
                          disabled={isProcessing}
                          onClick={() => {
                            setRejectingExpense(item);
                            setRejectionReason('');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                          title="Reject claim"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {/* Member or Admin delete if still pending */}
                    {isPending && (!isAdmin ? item.submittedBy?.id === user?.id : true) && (
                      <button
                        onClick={() => handleDeleteExpense(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-md hover:bg-rose-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                        title="Cancel claim"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px] sm:hidden">Cancel</span>
                      </button>
                    )}

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Rejection Dialog Modal */}
      {rejectingExpense && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Reject Expense Claim
              </h3>
              <button 
                onClick={() => setRejectingExpense(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Are you sure you want to reject the claim <strong className="text-slate-900 font-semibold">{rejectingExpense.title}</strong> for <strong className="text-slate-900 font-semibold">{formatINR(rejectingExpense.amount)}</strong>?
              This amount will be excluded from approved temple disbursements.
            </p>

            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Rejection Reason / Remark
            </label>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Duplicate bill / Bill not clear / Exceeds budget"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 mb-4 text-slate-800"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectingExpense(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => handleUpdateStatus(rejectingExpense.id, 'REJECTED', rejectionReason)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

