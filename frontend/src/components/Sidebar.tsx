import React from 'react';

export type TabType = 'dashboard' | 'applications' | 'jobs' | 'ai-studio' | 'follow-ups' | 'analytics' | 'import' | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'applications', label: 'Applications', icon: 'work_history' },
    { id: 'jobs', label: 'Jobs', icon: 'search' },
    { id: 'ai-studio', label: 'AI Studio', icon: 'psychology' },
    { id: 'follow-ups', label: 'Follow-ups', icon: 'outgoing_mail' },
    { id: 'analytics', label: 'Analytics', icon: 'monitoring' },
  ];

  return (
    <aside className="hidden md:flex bg-[#131313] h-screen w-64 fixed left-0 top-0 border-r border-[#262626] shadow-sm flex-col py-6 z-50">
      {/* Brand */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[#2a2a2a] flex items-center justify-center overflow-hidden border border-[#353535]">
          <span className="material-symbols-outlined text-white text-lg fill">token</span>
        </div>
        <div>
          <h1 className="font-semibold text-lg text-[#e2e2e2] tracking-tight leading-none">CareerOS</h1>
          <p className="font-mono text-[10px] text-[#8e9192] uppercase tracking-wider mt-1">AI Career Intelligence</p>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left ${
                isActive
                  ? 'text-white font-medium bg-[#2a2a2a] border-l-2 border-white shadow-sm'
                  : 'text-[#8e9192] hover:text-[#e2e2e2] hover:bg-[#1f1f1f]'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive ? 'fill text-white' : 'text-[#8e9192]'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="mt-auto px-3 space-y-1 pt-4 border-t border-[#262626]">
        <button
          onClick={() => onSelectTab('import')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left ${
            currentTab === 'import'
              ? 'text-white font-medium bg-[#2a2a2a] border-l-2 border-white shadow-sm'
              : 'text-[#8e9192] hover:text-[#e2e2e2] hover:bg-[#1f1f1f]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">upload_file</span>
          <span>Import Data</span>
        </button>
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left ${
            currentTab === 'settings'
              ? 'text-white font-medium bg-[#2a2a2a] border-l-2 border-white shadow-sm'
              : 'text-[#8e9192] hover:text-[#e2e2e2] hover:bg-[#1f1f1f]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
