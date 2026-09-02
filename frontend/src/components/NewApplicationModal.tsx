import React, { useState, useEffect } from 'react';
import { Job, Application, ApplicationStatus } from '../types';
import { api } from '../services/api';

interface NewApplicationModalProps {
  onClose: () => void;
  onCreated: (newApp: Application) => void;
}

export const NewApplicationModal: React.FC<NewApplicationModalProps> = ({ onClose, onCreated }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [type, setType] = useState('Full-time');
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [nextFollowUpAt, setNextFollowUpAt] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getJobs(1, 50).then((res) => {
      setJobs(res.items);
    }).catch(console.error);
  }, []);

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    if (!jobId) return;
    const matched = jobs.find((j) => j.id === jobId);
    if (matched) {
      if (matched.company) setCompany(matched.company);
      if (matched.role) setRole(matched.role);
      if (matched.type) setType(matched.type.charAt(0).toUpperCase() + matched.type.slice(1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) {
      alert('Company and Role are required.');
      return;
    }

    setLoading(true);
    try {
      const created = await api.createApplication({
        jobId: selectedJobId || undefined,
        company,
        role,
        type,
        applicationDate,
        status,
        nextFollowUpAt: nextFollowUpAt || undefined,
      });
      onCreated(created);
      onClose();
    } catch (err: any) {
      alert(`Failed to create application: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1b1b1b] border border-[#262626] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#262626] flex justify-between items-center bg-[#131313]/60">
          <div>
            <h2 className="text-lg font-bold text-white">Create New Application</h2>
            <p className="text-xs text-[#8e9192]">Track a job opportunity in your pipeline</p>
          </div>
          <button onClick={onClose} className="text-[#8e9192] hover:text-white p-1 rounded-lg">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Link Existing Job */}
          {jobs.length > 0 && (
            <div>
              <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block mb-1">
                Link Existing Job (Optional)
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => handleJobSelect(e.target.value)}
                className="w-full bg-[#131313] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:border-white/50"
              >
                <option value="">Select from imported jobs...</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.role || j.company ? `${j.role} at ${j.company}` : j.description}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Stripe, Google"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-[#131313] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:border-white/50"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block mb-1">
                Role Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Staff Backend Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#131313] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:border-white/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block mb-1">
                Employment Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#131313] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:border-white/50"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block mb-1">
                Application Date
              </label>
              <input
                type="date"
                required
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
                className="w-full bg-[#131313] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:border-white/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full bg-[#131313] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:border-white/50"
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Reject">Reject</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block mb-1">
                Next Follow-up Due (Optional)
              </label>
              <input
                type="date"
                value={nextFollowUpAt}
                onChange={(e) => setNextFollowUpAt(e.target.value)}
                className="w-full bg-[#131313] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:border-white/50"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-[#8e9192] hover:text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-5 py-2 rounded-lg text-xs font-mono font-medium"
            >
              {loading ? 'Creating...' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
