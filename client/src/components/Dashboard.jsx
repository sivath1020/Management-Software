import React, { useState } from 'react';
import { formatINR, formatDate, apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ 
  summary, 
  expenses, 
  onRefresh,
  onOpenNewClaim, 
  onOpenAddFund, 
  onOpenAddMember,
  onViewReceipt 
}) {
  const { user, isAdmin } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const totalAmount = summary?.availableBalance ?? 0;

  // Admin pending bills
  const pendingBills = expenses.filter(e => e.status === 'PENDING');
  // Processed bills
  const processedBills = expenses.filter(e => e.status !== 'PENDING');

  // User submitted bills
  const myBills = expenses.filter(e => e.submittedBy?.id === user?.id);

  const handleUpdateStatus = async (id, status, reason = '') => {
    try {
      setProcessingId(id);
      await apiRequest(`/expenses/${id}/status`, {
        method: 'PUT',
        body: { status, rejectionReason: reason }
      });
      setRejectingId(null);
      setRejectionReason('');
      onRefresh();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* 1. Only Total Amount Card (Centered Executive Card) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-900 via-amber-400 to-slate-900"></div>

        <div className="flex flex-col items-center justify-center space-y-2 py-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Available Temple Fund
          </span>
          <div className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
            {formatINR(totalAmount)}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Verified Treasury Balance • Auto-calculated
          </p>

          {/* Centered Action Buttons */}
          <div className="flex items-center justify-center gap-2.5 pt-3 flex-wrap">
            {!isAdmin ? (
              <button
                onClick={onOpenNewClaim}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
              >
                + Submit Bill
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenAddFund}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition-all cursor-pointer text-center"
                >
                  + Add Fund
                </button>
                <button
                  onClick={onOpenAddMember}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-2xs transition-all cursor-pointer text-center"
                >
                  + Add Member
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. ADMIN VIEW */}
      {isAdmin && (
        <div className="space-y-6">
          
          {/* Pending Bills for Approval */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Pending Approvals
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bills waiting for trustee verification
                </p>
              </div>
              <div className="shrink-0 flex items-center">
                {pendingBills.length > 0 ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs">
                      {pendingBills.length}
                    </span>
                    <span className="font-bold text-amber-950">Pending</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-slate-800 font-extrabold text-xs border border-slate-200/90 shadow-2xs">
                      0
                    </span>
                    <span className="font-semibold text-slate-600">Pending</span>
                  </div>
                )}
              </div>
            </div>

            {pendingBills.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-500">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-800">All Bills Reviewed</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No pending bills waiting for approval.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingBills.map((item) => (
                  <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                          {formatINR(item.amount)}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 rounded-md">
                          by {item.submittedBy?.name}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 inline-block mt-0.5">
                          <span className="font-bold text-slate-500">Reason:</span> {item.notes}
                        </p>
                      )}
                      
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                        <span>{formatDate(item.date)}</span>
                        {item.billPhotoUrl && (
                          <>
                            <span>•</span>
                            <button
                              onClick={() => onViewReceipt(item)}
                              className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer underline text-xs"
                            >
                              View Bill Photo
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons: Accept / Reject */}
                    <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                      <button
                        disabled={processingId === item.id}
                        onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                        className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Accept
                      </button>

                      <button
                        disabled={processingId === item.id}
                        onClick={() => {
                          setRejectingId(item.id);
                          setRejectionReason('');
                        }}
                        className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Processed Bills History */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h2 className="text-sm font-bold text-slate-900">
                Processed Bills History
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {processedBills.slice(0, 10).map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-sm text-slate-900 block">
                      {formatINR(item.amount)}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {item.submittedBy?.name} • {formatDate(item.date)}
                    </span>
                    {item.rejectionReason && (
                      <span className="text-rose-600 block text-[11px] font-medium">
                        Rejected Reason: {item.rejectionReason}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {item.billPhotoUrl && (
                      <button
                        onClick={() => onViewReceipt(item)}
                        className="text-blue-600 hover:underline cursor-pointer text-xs font-medium"
                      >
                        Receipt
                      </button>
                    )}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.status === 'APPROVED' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}

              {processedBills.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  No processed bills recorded yet.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 3. USER VIEW (Simplified: Only Total Amount & My Bills) */}
      {!isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              My Bills
            </h2>
            <span className="text-xs text-slate-500">
              {myBills.length} Total Submissions
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {myBills.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between text-xs hover:bg-slate-50/60 transition-colors">
                <div className="space-y-0.5">
                  <span className="text-base font-extrabold text-slate-900 block">
                    {formatINR(item.amount)}
                  </span>
                  {item.notes && (
                    <p className="text-xs text-slate-700 font-medium">
                      <span className="text-slate-400">Reason:</span> {item.notes}
                    </p>
                  )}
                  <span className="text-slate-500 text-[11px] block">
                    Submitted on {formatDate(item.date)}
                  </span>
                  {item.rejectionReason && (
                    <span className="text-rose-600 block text-[11px] font-medium">
                      Note: {item.rejectionReason}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {item.billPhotoUrl && (
                    <button
                      onClick={() => onViewReceipt(item)}
                      className="text-blue-600 hover:underline cursor-pointer font-semibold text-xs"
                    >
                      View Bill
                    </button>
                  )}
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    item.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    item.status === 'REJECTED' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                    'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}

            {myBills.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                You have not submitted any bills yet. Click "+ Submit Bill" to add.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Rejection Dialog Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 modal-animate">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Reject Bill Claim
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              This amount will not be deducted from the temple funds.
            </p>

            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason (Optional)
            </label>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Duplicate bill / Exceeds budget"
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 mb-4 bg-white text-slate-900"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(rejectingId, 'REJECTED', rejectionReason)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer"
              >
                Reject Bill
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
