import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginView() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter username and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (userType) => {
    try {
      setLoading(true);
      setError('');
      if (userType === 'admin') {
        setUsername('admin');
        setPassword('admin123');
        await login('admin', 'admin123');
      } else if (userType === 'member1') {
        setUsername('suresh');
        setPassword('member123');
        await login('suresh', 'member123');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh relative flex flex-col justify-center items-center px-4 sm:px-6 py-8 overflow-x-hidden">
      
      {/* Fixed Fullscreen Temple Background (Perfect Fit for Both Mobile & Desktop) */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <img 
          src="/temple-bg.jpg" 
          alt="Temple Background" 
          className="w-full h-full object-cover object-[center_20%] sm:object-center transition-all duration-300"
        />
        {/* Balanced Ambient Overlay for Crisp Card Contrast & High Temple Visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/35 via-white/10 to-slate-950/45 backdrop-blur-[0.5px]"></div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto my-auto">
        
        {/* Header Title */}
        <div className="text-center mb-5">
          <div className="inline-block p-1 rounded-2xl bg-white/95 shadow-lg border border-amber-300/70 mb-2">
            <div className="w-11 h-11 bg-slate-900 rounded-[13px] flex items-center justify-center text-amber-400 font-extrabold text-lg shadow-sm">
              T
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 drop-shadow-[0_2px_4px_rgba(255,255,255,0.95)]">
            Temple Funds Portal
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-900 font-bold drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)]">
            Sri Vigneshwara Swamy Temple
          </p>
        </div>

        {/* Crisp Light-Theme Glassmorphism Card */}
        <div className="bg-white/92 backdrop-blur-md py-6 px-5 sm:px-8 shadow-2xl rounded-2xl border border-white/80">
          
          <div className="mb-4 text-center">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Account Login
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sign in to manage and view temple funds
            </p>
          </div>

          {error && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Username or Phone
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or suresh"
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white/95 text-slate-900 transition-all placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            {/* Password with Eye Toggle Button */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white/95 text-slate-900 transition-all placeholder:text-slate-400 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    /* Eye Off */
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                      <line x1="2" y1="2" x2="22" y2="22"/>
                    </svg>
                  ) : (
                    /* Eye Open */
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer shadow-md active:scale-98"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Login Buttons */}
          <div className="mt-4 pt-3.5 border-t border-slate-200">
            <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Instant One-Click Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickLogin('admin')}
                className="py-2 px-2.5 text-xs font-bold text-slate-900 bg-amber-50/90 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer text-center border border-amber-200/80 shadow-2xs"
              >
                Login as Admin
              </button>

              <button
                type="button"
                onClick={() => quickLogin('member1')}
                className="py-2 px-2.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-center border border-slate-200 shadow-2xs"
              >
                Login as Member
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-3.5 text-center text-[11px] text-slate-900 font-bold drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
          Official Treasury & Expense Management Portal
        </p>
      </div>

    </div>
  );
}
