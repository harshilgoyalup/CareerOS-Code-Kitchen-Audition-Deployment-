import React from 'react';
import { useAuth } from '../context/AuthContext';

interface TopNavbarProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onOpenNewApp?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ searchQuery = '', onSearchChange }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-[#131313]/80 backdrop-blur-xl text-white fixed top-0 right-0 md:left-64 left-0 h-16 z-40 border-b border-[#262626] flex justify-between items-center px-6 w-auto md:w-[calc(100%-16rem)]">
      {/* Mobile brand & Search */}
      <div className="flex items-center gap-4 w-full max-w-md">
        <div className="flex items-center gap-2 md:hidden">
          <span className="font-bold text-lg text-white">CareerOS</span>
        </div>
        <div className="relative w-full hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search applications, jobs, companies..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full bg-[#1b1b1b] border border-[#262626] rounded-full pl-10 pr-4 py-2 text-sm text-[#e2e2e2] placeholder:text-[#8e9192] focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all"
          />
        </div>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-4">
        <button 
          title="Notifications"
          className="text-[#8e9192] hover:text-white p-2 rounded-full hover:bg-[#2a2a2a] transition-all relative"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white animate-pulse"></span>
        </button>

        <div className="h-5 w-px bg-[#262626] hidden sm:block"></div>

        {/* User profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#2a2a2a] border border-[#353535] flex items-center justify-center overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
            ) : (
              <span className="font-mono text-xs text-white font-medium">
                {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'OS'}
              </span>
            )}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-medium text-[#e2e2e2] leading-tight">{user?.displayName || 'Active User'}</p>
            <p className="text-[10px] text-[#8e9192] font-mono leading-tight">{user?.email || 'Authenticated'}</p>
          </div>
          <button
            onClick={() => logout()}
            className="text-xs font-mono text-[#8e9192] hover:text-white px-2.5 py-1 rounded bg-[#1b1b1b] hover:bg-[#2a2a2a] border border-[#262626] transition-all"
            title="Sign Out"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};
