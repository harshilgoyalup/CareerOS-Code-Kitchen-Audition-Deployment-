import React, { useState, useEffect } from 'react';
import { Nudge } from '../types';
import { api } from '../services/api';

export const FollowupsPage: React.FC = () => {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
  const [loading, setLoading] = useState(true);

  const fetchNudges = async () => {
    setLoading(true);
    try {
      const res = await api.getNudges(filter);
      setNudges(res);
    } catch (err) {
      console.error('Failed to load nudges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNudges();
  }, [filter]);

  const handleComplete = async (id: string) => {
    try {
      await api.completeNudge(id);
      setNudges((prev) => prev.filter((n) => n.id !== id));
      alert('Follow-up marked as completed and application state updated.');
    } catch (err: any) {
      alert(`Error completing nudge: ${err.message}`);
    }
  };

  return (
    <div className="pt-24 px-6 md:px-12 pb-16 mx-auto w-full max-w-[1440px] animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Follow-up Action Center</h2>
          <p className="text-sm text-[#8e9192]">
            Timely, automated outreach suggestions triggered by CareerOS scheduler engine.
          </p>
        </div>
        <div className="flex gap-2 bg-[#1b1b1b] p-1 rounded-xl border border-[#262626]">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
              filter === 'pending'
                ? 'bg-white text-black font-semibold'
                : 'text-[#8e9192] hover:text-white'
            }`}
          >
            Pending Actions
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
              filter === 'completed'
                ? 'bg-white text-black font-semibold'
                : 'text-[#8e9192] hover:text-white'
            }`}
          >
            Completed History
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs font-mono text-[#8e9192]">Loading follow-ups...</div>
      ) : nudges.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
          <span className="material-symbols-outlined text-4xl text-white">outgoing_mail</span>
          <h3 className="text-lg font-bold text-white">
            {filter === 'pending' ? 'No Pending Follow-ups' : 'No Completed Follow-ups'}
          </h3>
          <p className="text-xs text-[#8e9192]">
            {filter === 'pending'
              ? 'Your applications are up to date! As follow-up deadlines approach, the Cloud Scheduler nudge engine will populate recommendations here.'
              : 'Completed follow-up interactions will appear here for audit history.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nudges.map((nudge) => (
            <div
              key={nudge.id}
              className="glass-card rounded-xl p-6 border-l-4 border-white flex flex-col justify-between space-y-4 interactive-element"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-[10px] px-2.5 py-0.5 rounded bg-[#2a2a2a] text-[#c6c6c7] uppercase">
                    {nudge.type}
                  </span>
                  <span className="font-mono text-[10px] text-[#8e9192]">
                    Due: {nudge.dueDate ? new Date(nudge.dueDate).toLocaleDateString() : 'Immediate'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  {nudge.company || 'Target Organization'}
                </h3>
                <p className="text-sm text-[#e2e2e2] leading-relaxed">{nudge.message}</p>
              </div>

              <div className="pt-3 border-t border-[#262626] flex justify-between items-center">
                <span className="font-mono text-[10px] text-[#8e9192]">
                  Created {new Date(nudge.createdAt).toLocaleDateString()}
                </span>
                {filter === 'pending' && (
                  <button
                    onClick={() => handleComplete(nudge.id)}
                    className="btn-primary px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">done</span>
                    Mark Follow-up Sent
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
