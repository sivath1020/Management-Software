import React from 'react';
import { formatINR, formatDate } from '../api';

export default function ReceiptModal({ expense, onClose }) {
  if (!expense || !expense.billPhotoUrl) return null;

  const isPdf = expense.billPhotoUrl.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-xl max-w-lg w-full shadow-xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Bill Photo - {formatINR(expense.amount)}
            </h3>
            <p className="text-[11px] text-slate-500">
              Submitted by {expense.submittedBy?.name} • {formatDate(expense.date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-4 bg-slate-100 flex items-center justify-center max-h-[70vh] overflow-auto">
          {isPdf ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-700 mb-3">PDF Document Attached</p>
              <a
                href={expense.billPhotoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800"
              >
                Open / Download PDF
              </a>
            </div>
          ) : (
            <img
              src={expense.billPhotoUrl}
              alt="Receipt"
              className="max-h-[60vh] w-auto object-contain rounded border border-slate-200 bg-white"
            />
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
