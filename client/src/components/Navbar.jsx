import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenNewClaim 
}) {
  const { user, logout, isAdmin } = useAuth();
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U';

  // Navigation items matching user role
  const navItems = isAdmin
    ? [
        {
          id: 'home',
          label: 'Home',
          onClick: () => setActiveTab('home'),
          isActive: activeTab === 'home',
          icon: (active) => (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
            </svg>
          )
        },
        {
          id: 'funds',
          label: 'Add Fund',
          onClick: () => setActiveTab('funds'),
          isActive: activeTab === 'funds',
          icon: (active) => (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="3"/>
              <path d="M12 9v6"/>
              <path d="M9 12h6"/>
            </svg>
          )
        },
        {
          id: 'members',
          label: 'Members',
          onClick: () => setActiveTab('members'),
          isActive: activeTab === 'members',
          icon: (active) => (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="7" r="4"/>
              <path d="M5.5 21a8.38 8.38 0 0 1 13 0"/>
            </svg>
          )
        },
        {
          id: 'reports',
          label: 'Report',
          onClick: () => setActiveTab('reports'),
          isActive: activeTab === 'reports',
          icon: (active) => (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          )
        }
      ]
    : [
        {
          id: 'home',
          label: 'Home',
          onClick: () => setActiveTab('home'),
          isActive: activeTab === 'home',
          icon: (active) => (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
            </svg>
          )
        },
        {
          id: 'submit',
          label: 'Submit Bill',
          onClick: onOpenNewClaim,
          isActive: false,
          icon: (active) => (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="3"/>
              <path d="M12 9v6"/>
              <path d="M9 12h6"/>
            </svg>
          )
        },
        {
          id: 'reports',
          label: 'Report',
          onClick: () => setActiveTab('reports'),
          isActive: activeTab === 'reports',
          icon: (active) => (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          )
        }
      ];

  return (
    <>
      {/* Top Header with Real Downward Curved Bottom and Yellow Accent */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Title / Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-xs">
                T
              </div>
              <div>
                <span className="font-bold text-base text-white tracking-tight block leading-tight">
                  Temple Funds
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {isAdmin ? 'Trustee Administration' : 'Member Portal'}
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'home' 
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Home
              </button>

              {!isAdmin && (
                <button
                  onClick={onOpenNewClaim}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white shadow-xs cursor-pointer"
                >
                  + Submit Bill
                </button>
              )}

              {isAdmin && (
                <>
                  <button
                    onClick={() => setActiveTab('funds')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      activeTab === 'funds' 
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    Add Fund
                  </button>

                  <button
                    onClick={() => setActiveTab('members')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      activeTab === 'members' 
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    Members
                  </button>
                </>
              )}

              <button
                onClick={() => setActiveTab('reports')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'reports' 
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Report
              </button>
            </nav>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center">
                  {initials}
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-white leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">
                    {isAdmin ? 'Admin' : 'Member'}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="text-xs text-slate-400 hover:text-rose-400 font-medium cursor-pointer px-2 py-1 rounded hover:bg-slate-800 transition-colors"
              >
                Logout
              </button>
            </div>

          </div>
        </div>

        {/* Real Downward Curved Edge with Warm Yellow Stroke Accent */}
        <div className="w-full overflow-hidden leading-none -mb-1 pointer-events-none">
          <svg 
            className="w-full h-5 sm:h-7 block" 
            viewBox="0 0 1000 35" 
            preserveAspectRatio="none"
          >
            {/* Dark background extension into curve */}
            <path 
              d="M 0,0 Q 500,35 1000,0 L 1000,0 L 0,0 Z" 
              fill="#0f172a" 
            />
            {/* Visible Yellow curve stroke along downside */}
            <path 
              d="M 0,0 Q 500,35 1000,0" 
              fill="none" 
              stroke="#fbbf24" 
              strokeWidth="4" 
            />
          </svg>
        </div>
      </header>

      {/* MOBILE CAPSULE PILL NAVBAR */}
      <div className="sm:hidden fixed bottom-4 left-0 right-0 z-40 no-print flex justify-center px-4 pointer-events-none">
        
        {/* Outer White Rounded Capsule Pill Container */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-full p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.12)] border border-slate-200/90 w-full max-w-sm">
          
          {/* Recessed Inset Canal / Track */}
          <div className="bg-slate-100/90 rounded-full p-1 flex items-center justify-between border border-slate-200/60">
            {navItems.map((item) => {
              const isActive = item.isActive;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`flex-1 transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? /* Active Capsule in Vibrant Yellow with Crisp Dark Typography */
                        'bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-2 px-3 sm:px-4 rounded-full shadow-[0_4px_14px_rgba(245,158,11,0.38)] flex flex-col items-center justify-center'
                      : /* Inactive Item with clean icon & label */
                        'py-2 px-2 text-slate-600 hover:text-slate-900 flex flex-col items-center justify-center'
                  }`}
                >
                  <div className={isActive ? 'text-slate-950 mb-0.5' : 'text-slate-500 mb-0.5'}>
                    {item.icon(isActive)}
                  </div>
                  <span className={`text-[10px] tracking-tight leading-none ${
                    isActive ? 'font-extrabold text-slate-950' : 'font-medium text-slate-600'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </>
  );
}
