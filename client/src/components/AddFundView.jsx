import React, { useState } from 'react';
import { apiRequest } from '../api';

export default function AddFundView({ onSuccess, onCancel }) {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await apiRequest('/funds', {
        method: 'POST',
        body: {
          amount: Number(amount),
          title: title.trim() || 'Temple Fund Deposit',
          date
        }
      });

      setAmount('');
      setTitle('');
      setSuccess('Fund successfully credited into Temple Treasury!');
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to add fund');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Add Temple Fund
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Credit donations, hundi collections, or corpus deposits into treasury
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
        >
          Back to Home
        </button>
      </div>

      {/* Direct Page Form Card (No Popup) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Deposit Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-extrabold text-emerald-600 text-2xl pointer-events-none">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3.5 text-2xl sm:text-3xl font-extrabold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/20 text-slate-900"
              />
            </div>
          </div>

          {/* Title / Donor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Source / Donor Name (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Festival Ubhayam, Hundi Inflow, or Donor Name"
              className="w-full px-4 py-3 text-sm font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-slate-50/40"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl text-slate-900 bg-slate-50/40"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
            >
              {loading ? 'Crediting Treasury...' : 'Credit into Treasury'}
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}

