import React, { useState, useEffect } from 'react';
import { apiRequest, formatDate } from '../api';

export default function MembersView() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showMemberPassword, setShowMemberPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/members');
      setMembers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password) {
      setError('Name, username, and password are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await apiRequest('/members', {
        method: 'POST',
        body: {
          name: name.trim(),
          phone: phone.trim(),
          username: username.trim(),
          password
        }
      });

      setName('');
      setPhone('');
      setUsername('');
      setPassword('');
      setSuccess('Member added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchMembers();
    } catch (err) {
      setError(err.message || 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id, memberName) => {
    if (!window.confirm(`Delete member ${memberName}?`)) return;
    try {
      await apiRequest(`/members/${id}`, { method: 'DELETE' });
      fetchMembers();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">
          Temple Seva Members
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage authorized committee members who can submit expense claims
        </p>
      </div>

      {/* Add Member Form (Direct Page Card, No Popup) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
          Add New Member
        </h3>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            {success}
          </div>
        )}

        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name / Role <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Suresh Kumar (Pooja Incharge)"
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. suresh"
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showMemberPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowMemberPassword(!showMemberPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  title={showMemberPassword ? "Hide password" : "Show password"}
                >
                  {showMemberPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                      <line x1="2" y1="2" x2="22" y2="22"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving Member...' : '+ Save Member'}
            </button>
          </div>
        </form>
      </div>

      {/* Members Directory Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Active Members</span>
          <span className="text-xs text-slate-500 font-semibold">{members.length} Total</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {members.map((m) => (
            <div key={m.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors px-2 rounded-lg">
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-slate-900 block">{m.name}</span>
                <span className="text-slate-500 text-xs">
                  @{m.username} {m.phone ? `• ${m.phone}` : ''}
                </span>
              </div>
              <button
                onClick={() => handleDeleteMember(m.id, m.name)}
                className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-xs font-bold cursor-pointer px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}

          {members.length === 0 && !loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              No registered members found. Use the form above to add members.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
