import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [health, setHealth] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  useEffect(() => {
    setLoadingHealth(true);
    fetch('/health')
      .then((res) => res.json())
      .then(setHealth)
      .catch((err) => setHealth({ status: 'offline', error: err.message }))
      .finally(() => setLoadingHealth(false));
  }, []);

  return (
    <div className="pt-24 px-6 md:px-12 pb-16 mx-auto w-full max-w-[1440px] animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">System & Workspace Settings</h2>
        <p className="text-sm text-[#8e9192]">Manage your tenant credentials, cloud connectivity, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Identity */}
        <div className="glass-panel rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Authenticated Profile</h3>
          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between p-3 bg-[#131313] rounded-lg border border-[#262626]">
              <span className="text-[#8e9192]">Firebase UID</span>
              <span className="text-white font-bold">{user?.uid || 'Not available'}</span>
            </div>
            <div className="flex justify-between p-3 bg-[#131313] rounded-lg border border-[#262626]">
              <span className="text-[#8e9192]">Email Address</span>
              <span className="text-white">{user?.email || 'None'}</span>
            </div>
            <div className="flex justify-between p-3 bg-[#131313] rounded-lg border border-[#262626]">
              <span className="text-[#8e9192]">Display Name</span>
              <span className="text-white">{user?.displayName || 'User'}</span>
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-[#93000a]/20 hover:bg-[#93000a]/30 border border-[#93000a]/40 text-[#ffb4ab] text-xs font-mono rounded-lg transition-all"
            >
              Sign Out of CareerOS
            </button>
          </div>
        </div>

        {/* Backend & Cloud Connectivity */}
        <div className="glass-panel rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Cloud Architecture Status</h3>
          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between p-3 bg-[#131313] rounded-lg border border-[#262626]">
              <span className="text-[#8e9192]">FastAPI Backend</span>
              <span className={health?.status === 'healthy' ? 'text-white font-bold' : 'text-[#ffb4ab]'}>
                {loadingHealth ? 'Checking...' : health?.status === 'healthy' ? '● Connected' : '○ Standby'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-[#131313] rounded-lg border border-[#262626]">
              <span className="text-[#8e9192]">Database</span>
              <span className="text-white">Cloud Firestore (Tenant Isolated)</span>
            </div>
            <div className="flex justify-between p-3 bg-[#131313] rounded-lg border border-[#262626]">
              <span className="text-[#8e9192]">AI Engine</span>
              <span className="text-white">Google Vertex AI Gemini 1.5</span>
            </div>
            <div className="flex justify-between p-3 bg-[#131313] rounded-lg border border-[#262626]">
              <span className="text-[#8e9192]">Scheduler</span>
              <span className="text-white">Google Cloud Scheduler (Daily Nudge Run)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
