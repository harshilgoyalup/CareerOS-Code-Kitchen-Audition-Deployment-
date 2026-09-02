import React, { useState, useEffect } from 'react';
import { Application, ApplicationStatus } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { ApplicationModal } from '../components/ApplicationModal';
import { NewApplicationModal } from '../components/NewApplicationModal';

interface ApplicationsPageProps {
  searchQuery?: string;
  onNavigateAIStudio?: (app: Application) => void;
}

export const ApplicationsPage: React.FC<ApplicationsPageProps> = ({ searchQuery = '', onNavigateAIStudio }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortDesc, setSortDesc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isNewAppOpen, setIsNewAppOpen] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.getApplications({
        page,
        limit: 10,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_desc: sortDesc,
      });
      setApplications(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter, searchQuery, sortBy, sortDesc]);

  const handleApplicationUpdated = (updated: Application) => {
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelectedApp(updated);
  };

  const handleApplicationCreated = (newApp: Application) => {
    setApplications((prev) => [newApp, ...prev]);
    setTotal((t) => t + 1);
  };

  return (
    <div className="pt-24 px-6 md:px-12 pb-16 mx-auto w-full max-w-[1440px] animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Active Applications</h2>
          <p className="text-sm text-[#8e9192]">Track and manage your professional pipeline in real time.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsNewAppOpen(true)}
            className="btn-primary px-4 py-2 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Application
          </button>
        </div>
      </div>

      {/* Table & Controls Container */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-xl border border-[#262626]">
        {/* Table Filter Tabs & Sorting */}
        <div className="p-4 border-b border-[#262626] flex flex-wrap justify-between items-center gap-4 bg-[#0e0e0e]/50">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setStatusFilter(''); setPage(1); }}
              className={`px-3 py-1.5 rounded-full font-mono text-xs flex items-center gap-1.5 transition-colors ${
                statusFilter === ''
                  ? 'bg-[#2a2a2a] text-white border border-white/20'
                  : 'text-[#8e9192] hover:bg-[#1f1f1f] hover:text-white'
              }`}
            >
              All <span className="bg-[#353535] px-1.5 rounded text-[10px]">{total}</span>
            </button>
            {(['Applied', 'Interview', 'Offer', 'Reject'] as ApplicationStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => { setStatusFilter(st); setPage(1); }}
                className={`px-3 py-1.5 rounded-full font-mono text-xs transition-colors ${
                  statusFilter === st
                    ? 'bg-[#2a2a2a] text-white border border-white/20 font-semibold'
                    : 'text-[#8e9192] hover:bg-[#1f1f1f] hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#8e9192]">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#1b1b1b] border border-[#262626] rounded-md px-2 py-1 text-xs text-white focus:outline-none"
            >
              <option value="updatedAt">Last Updated</option>
              <option value="applicationDate">Application Date</option>
              <option value="company">Company</option>
              <option value="role">Role</option>
            </select>
            <button
              onClick={() => setSortDesc(!sortDesc)}
              className="p-1 rounded hover:bg-[#2a2a2a] text-white"
              title="Toggle Sort Order"
            >
              <span className="material-symbols-outlined text-sm">
                {sortDesc ? 'arrow_downward' : 'arrow_upward'}
              </span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#262626] text-[#8e9192] font-mono text-[11px] uppercase tracking-wider bg-[#131313]">
                <th className="py-3 px-5 font-medium">Company & Role</th>
                <th className="py-3 px-5 font-medium">Type</th>
                <th className="py-3 px-5 font-medium">Applied Date</th>
                <th className="py-3 px-5 font-medium">Status</th>
                <th className="py-3 px-5 font-medium">Next Follow-up</th>
                <th className="py-3 px-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#262626]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs font-mono text-[#8e9192]">
                    Loading applications from Firestore...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs font-mono text-[#8e9192]">
                    No applications found matching the criteria. Click "New Application" to add one.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-[#1b1b1b] transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-[#2a2a2a] border border-[#353535] flex items-center justify-center font-bold text-xs text-white shrink-0">
                          {app.company.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:underline">{app.company}</p>
                          <p className="text-xs text-[#8e9192]">{app.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-xs text-[#c6c6c7]">{app.type || 'Full-time'}</td>
                    <td className="py-4 px-5 text-xs text-[#8e9192] font-mono">{app.applicationDate}</td>
                    <td className="py-4 px-5">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-4 px-5">
                      {app.nextFollowUpAt ? (
                        <div className="flex items-center gap-1.5 text-white font-mono text-xs">
                          <span className="material-symbols-outlined text-[15px] text-[#8e9192]">calendar_today</span>
                          {app.nextFollowUpAt}
                        </div>
                      ) : (
                        <span className="text-xs text-[#8e9192] font-mono">—</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                        }}
                        className="text-[#8e9192] hover:text-white p-1.5 rounded-lg hover:bg-[#2a2a2a] transition-all"
                        title="Manage application"
                      >
                        <span className="material-symbols-outlined text-base">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-[#262626] flex justify-between items-center text-xs font-mono text-[#8e9192] bg-[#0e0e0e]/50">
          <span>
            Showing {applications.length} of {total} applications (Page {page} of {totalPages})
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 rounded bg-[#1b1b1b] border border-[#262626] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#1b1b1b] text-white"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1 rounded bg-[#1b1b1b] border border-[#262626] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#1b1b1b] text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedApp && (
        <ApplicationModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdated={handleApplicationUpdated}
          onNavigateAIStudio={onNavigateAIStudio}
        />
      )}

      {isNewAppOpen && (
        <NewApplicationModal
          onClose={() => setIsNewAppOpen(false)}
          onCreated={handleApplicationCreated}
        />
      )}
    </div>
  );
};
