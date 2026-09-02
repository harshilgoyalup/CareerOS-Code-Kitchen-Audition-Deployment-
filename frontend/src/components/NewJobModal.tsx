import React, { useState } from 'react';
import { Job } from '../types';
import { api } from '../services/api';

interface NewJobModalProps {
  onClose: () => void;
  onCreated: (newJob: Job) => void;
}

export const NewJobModal: React.FC<NewJobModalProps> = ({ onClose, onCreated }) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [type, setType] = useState('full-time');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description && (!company || !role)) {
      alert('Please provide role and company or job description.');
      return;
    }

    setLoading(true);
    try {
      const fullDesc = description || `${role} - ${company}`;
      const created = await api.createJob({
        company: company || 'Company',
        role: role || 'Role',
        type,
        from: fromDate,
        to: toDate || undefined,
        description: fullDesc,
      });
      onCreated(created);
      onClose();
    } catch (err: any) {
      alert(`Failed to create job: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1b1b1b] border border-[#262626] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#262626] flex justify-between items-center bg-[#131313]/60">
          <div>
            <h2 className="text-lg font-bold text-white">Add Job Listing</h2>
            <p className="text-xs text-[#8e9192]">Record job posting parameters for your target roles</p>
          </div>
          <button onClick={onClose} className="text-[#8e9192] hover:text-white p-1 rounded-lg">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block mb-1">Company</label>
              <input
                type="text"
                placeholder="e.g. OpenAI"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-[#131313] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:border-white/50"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block mb-1">Role</label>
              <input
                type="text"
                placeholder="e.g. Systems Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#131313] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:border-white/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#131313] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:border-white/50"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-[#131313] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:border-white/50"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-[#131313] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:border-white/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block mb-1">Job Description & Requirements</label>
            <textarea
              rows={4}
              placeholder="Paste full job description or key criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#131313] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:border-white/50"
            />
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
              {loading ? 'Saving...' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
