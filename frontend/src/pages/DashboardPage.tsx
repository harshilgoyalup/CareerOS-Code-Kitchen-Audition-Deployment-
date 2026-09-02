import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AnalyticsData, Nudge, Application } from '../types';
import { TabType } from '../components/Sidebar';

interface DashboardPageProps {
  onNavigateTab: (tab: TabType) => void;
  onSelectApplication: (app: Application) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab, onSelectApplication }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, nudgesRes, appsRes] = await Promise.all([
        api.getAnalytics(),
        api.getNudges('pending'),
        api.getApplications({ page: 1, limit: 5, sort_by: 'updatedAt', sort_desc: true }),
      ]);
      setAnalytics(analyticsRes);
      setNudges(nudgesRes);
      setRecentApps(appsRes.items);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCompleteNudge = async (nudgeId: string) => {
    try {
      await api.completeNudge(nudgeId);
      setNudges((prev) => prev.filter((n) => n.id !== nudgeId));
      fetchData();
    } catch (err: any) {
      alert(`Failed to complete action: ${err.message}`);
    }
  };

  return (
    <div className="pt-20 pb-16 px-6 md:px-12 w-full max-w-[1440px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8 mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Good morning, {user?.displayName || 'Candidate'}.
          </h1>
          <p className="text-base text-[#8e9192]">Here's what's happening with your live career pipeline.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigateTab('import')}
            className="px-4 py-2 rounded-lg bg-[#2a2a2a] border border-[#353535] text-xs font-mono text-white hover:bg-[#353535] transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            Import Data
          </button>
          <button
            onClick={() => onNavigateTab('ai-studio')}
            className="btn-primary px-4 py-2 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">magic_button</span>
            AI Studio
          </button>
        </div>
      </div>

      {/* Metric Cards Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="glass-card rounded-xl p-5 flex flex-col justify-between interactive-element">
          <div className="text-[#8e9192] flex items-center gap-1.5 mb-4">
            <span className="material-symbols-outlined text-sm">work</span>
            <span className="font-mono text-xs uppercase tracking-wider">Total Applications</span>
          </div>
          <div className="text-4xl font-bold text-white">{analytics?.totalApplications ?? 0}</div>
        </div>

        <div className="glass-card rounded-xl p-5 flex flex-col justify-between featured-bg interactive-element">
          <div className="text-white flex items-center gap-1.5 mb-4">
            <span className="material-symbols-outlined text-sm fill">cycle</span>
            <span className="font-mono text-xs uppercase tracking-wider">Active</span>
          </div>
          <div className="text-4xl font-bold text-white">{analytics?.activeCount ?? 0}</div>
        </div>

        <div className="glass-card rounded-xl p-5 flex flex-col justify-between interactive-element">
          <div className="text-[#c8c6c5] flex items-center gap-1.5 mb-4">
            <span className="material-symbols-outlined text-sm">groups</span>
            <span className="font-mono text-xs uppercase tracking-wider">Interviews</span>
          </div>
          <div className="text-4xl font-bold text-white">{analytics?.interviewCount ?? 0}</div>
        </div>

        <div className="glass-card rounded-xl p-5 flex flex-col justify-between interactive-element">
          <div className="text-white flex items-center gap-1.5 mb-4">
            <span className="material-symbols-outlined text-sm">workspace_premium</span>
            <span className="font-mono text-xs uppercase tracking-wider">Offers</span>
          </div>
          <div className="text-4xl font-bold text-white">{analytics?.offerCount ?? 0}</div>
        </div>

        <div className="glass-card rounded-xl p-5 flex flex-col justify-between col-span-2 md:col-span-1 border-l-4 border-[#ffb4ab]/50 interactive-element">
          <div className="text-[#ffb4ab] flex items-center gap-1.5 mb-4">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span className="font-mono text-xs uppercase tracking-wider">Follow-ups Due</span>
          </div>
          <div className="text-4xl font-bold text-white">{analytics?.followUpsDueCount ?? 0}</div>
        </div>
      </div>

      {/* Secondary Section: Pipeline & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Pipeline Progression */}
        <div className="md:col-span-2 glass-card rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Pipeline Progression</h2>
          <div className="flex flex-col md:flex-row justify-between items-center relative py-4">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-[#2a2a2a] -translate-y-1/2 hidden md:block z-0"></div>

            {/* Applied */}
            <div className="relative z-10 flex flex-col items-center gap-2 bg-[#1f1f1f] px-4 py-3 rounded-lg w-full md:w-auto mb-3 md:mb-0 border border-[#353535]">
              <div className="w-10 h-10 rounded-full bg-[#393939] flex items-center justify-center text-white font-mono text-sm font-bold">
                {analytics?.appliedCount ?? 0}
              </div>
              <span className="font-mono text-xs text-[#8e9192]">Applied</span>
            </div>

            <span className="material-symbols-outlined text-[#8e9192] md:hidden mb-2">arrow_downward</span>

            {/* Interview */}
            <div className="relative z-10 flex flex-col items-center gap-2 bg-white/10 px-4 py-3 rounded-lg w-full md:w-auto mb-3 md:mb-0 border border-white/30">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold font-mono text-sm">
                {analytics?.interviewCount ?? 0}
              </div>
              <span className="font-mono text-xs text-white">Interview</span>
            </div>

            <span className="material-symbols-outlined text-[#8e9192] md:hidden mb-2">arrow_downward</span>

            {/* Offer */}
            <div className="relative z-10 flex flex-col items-center gap-2 bg-white/10 px-4 py-3 rounded-lg w-full md:w-auto mb-3 md:mb-0 border border-white/30">
              <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold font-mono text-sm">
                {analytics?.offerCount ?? 0}
              </div>
              <span className="font-mono text-xs text-white">Offer</span>
            </div>

            <span className="material-symbols-outlined text-[#8e9192] md:hidden mb-2">arrow_downward</span>

            {/* Reject */}
            <div className="relative z-10 flex flex-col items-center gap-2 bg-[#1f1f1f] px-4 py-3 rounded-lg w-full md:w-auto border border-[#353535]">
              <div className="w-10 h-10 rounded-full bg-[#393939] flex items-center justify-center text-[#8e9192] font-mono text-sm">
                {analytics?.rejectCount ?? 0}
              </div>
              <span className="font-mono text-xs text-[#8e9192]">Reject</span>
            </div>
          </div>
        </div>

        {/* Action Items / Follow-ups Due */}
        <div className="glass-card rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Action Items</h2>
            <span className="bg-[#93000a]/20 text-[#ffb4ab] border border-[#93000a]/40 font-mono text-[11px] px-2 py-0.5 rounded-full">
              {nudges.length} Due
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-56">
            {nudges.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                <span className="material-symbols-outlined text-[#8e9192] text-3xl mb-1">done_all</span>
                <p className="text-xs text-[#8e9192]">All follow-ups completed. Great job!</p>
              </div>
            ) : (
              nudges.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  className="bg-[#1b1b1b] p-3 rounded-lg border-l-2 border-white hover:bg-[#2a2a2a] transition-colors flex justify-between items-center gap-2"
                >
                  <div className="flex-1">
                    <p className="text-xs text-white font-medium line-clamp-1">{n.message}</p>
                    <p className="text-[10px] font-mono text-[#8e9192] mt-0.5">
                      {n.company ? `${n.company} • ` : ''}Due {n.dueDate ? new Date(n.dueDate).toLocaleDateString() : 'Now'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCompleteNudge(n.id)}
                    title="Mark Complete"
                    className="text-[#8e9192] hover:text-white p-1"
                  >
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigateTab('follow-ups')}
            className="w-full mt-4 py-2 rounded-lg btn-primary font-mono text-xs font-medium"
          >
            View All Actions ({nudges.length})
          </button>
        </div>
      </div>

      {/* Tertiary Section: Feed & Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Applications Feed */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Recent Pipeline Activity</h2>
            <button
              onClick={() => onNavigateTab('applications')}
              className="text-xs font-mono text-[#8e9192] hover:text-white"
            >
              View all →
            </button>
          </div>

          {recentApps.length === 0 ? (
            <p className="text-xs text-[#8e9192] italic py-4">No applications created yet. Import or create your first application!</p>
          ) : (
            <ul className="relative border-l border-[#262626] ml-3 space-y-4">
              {recentApps.map((app) => (
                <li
                  key={app.id}
                  onClick={() => onSelectApplication(app)}
                  className="pl-6 relative cursor-pointer group"
                >
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white flex items-center justify-center ring-4 ring-[#131313]">
                    <span className="material-symbols-outlined text-[10px] text-black">work</span>
                  </span>
                  <div className="p-2.5 rounded-lg bg-[#1b1b1b] border border-[#262626] group-hover:border-[#444748] transition-all">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-medium text-white group-hover:text-white transition-colors">
                        {app.role} at {app.company}
                      </p>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2a2a2a] text-[#c6c6c7]">
                        {app.status}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-[#8e9192] mt-1">
                      Updated {new Date(app.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Live Status Distribution Chart */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Status Distribution</h2>
            <span className="font-mono text-xs text-[#8e9192]">{analytics?.totalApplications ?? 0} Total</span>
          </div>

          <div className="flex h-40 items-end gap-3 mt-4 pt-4 border-b border-[#262626]">
            {analytics?.statusDistribution?.map((item) => {
              const heightPct = Math.max(item.percentage, 10);
              return (
                <div key={item.name} className="w-full flex flex-col justify-end gap-2 group items-center">
                  <span className="text-[10px] font-mono text-[#8e9192] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count} ({item.percentage}%)
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-sm transition-all ${
                      item.name === 'Offer'
                        ? 'bg-white'
                        : item.name === 'Interview'
                        ? 'bg-white/60 group-hover:bg-white'
                        : item.name === 'Applied'
                        ? 'bg-white/30 group-hover:bg-white/50'
                        : 'bg-[#353535] group-hover:bg-[#ffb4ab]/40'
                    }`}
                  ></div>
                  <span className="font-mono text-[11px] text-center text-[#8e9192] group-hover:text-white">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-between text-xs font-mono text-[#8e9192]">
            <span>Interview Conversion: <strong className="text-white">{analytics?.interviewConversionRate}%</strong></span>
            <span>Offer Conversion: <strong className="text-white">{analytics?.offerConversionRate}%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
