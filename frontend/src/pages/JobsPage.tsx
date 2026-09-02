import React, { useState, useEffect } from 'react';
import { Job, Application } from '../types';
import { api } from '../services/api';
import { NewJobModal } from '../components/NewJobModal';
import { NewApplicationModal } from '../components/NewApplicationModal';

interface JobsPageProps {
  searchQuery?: string;
  onNavigateAIStudio?: (job: Job) => void;
  onApplicationCreated?: (app: Application) => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({ searchQuery = '', onNavigateAIStudio, onApplicationCreated }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [isNewAppOpen, setIsNewAppOpen] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.getJobs(page, 12, searchQuery);
      setJobs(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, searchQuery]);

  return (
    <div className="pt-24 px-6 md:px-12 pb-16 mx-auto w-full max-w-[1440px] animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Target Jobs & Opportunities</h2>
          <p className="text-sm text-[#8e9192]">Manage job criteria, requirements, and target postings.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsNewJobOpen(true)}
            className="btn-primary px-4 py-2 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add Job Listing
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs font-mono text-[#8e9192]">
          Loading jobs from Firestore...
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
          <span className="material-symbols-outlined text-4xl text-[#8e9192]">search_off</span>
          <h3 className="text-lg font-bold text-white">No Jobs Found</h3>
          <p className="text-xs text-[#8e9192]">
            You have not added or imported any job opportunities yet. Use the Import Data tool or click Add Job Listing.
          </p>
          <button
            onClick={() => setIsNewJobOpen(true)}
            className="btn-primary px-4 py-2 rounded-lg text-xs font-mono font-medium"
          >
            Add Job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="glass-card rounded-xl p-6 flex flex-col justify-between interactive-element space-y-4"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-[#2a2a2a] text-[#c6c6c7] uppercase tracking-wider">
                    {job.type}
                  </span>
                  <span className="font-mono text-[10px] text-[#8e9192]">
                    ID: {job.id.slice(0, 8)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white line-clamp-1">
                  {job.role || job.description.split(' - ')[0] || 'Target Role'}
                </h3>
                <p className="text-xs font-medium text-[#8e9192] mb-3">
                  {job.company || (job.description.split(' - ')[1] ? job.description.split(' - ')[1].split(',')[0] : 'Company')}
                </p>

                <p className="text-xs text-[#c6c6c7] line-clamp-3 bg-[#131313] p-3 rounded-lg border border-[#262626]">
                  {job.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#262626] flex justify-between items-center">
                <span className="font-mono text-[10px] text-[#8e9192]">
                  {job.from ? `Active: ${job.from}` : 'Active Listing'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigateAIStudio?.(job)}
                    className="p-1.5 rounded bg-[#2a2a2a] hover:bg-[#353535] text-white text-xs font-mono flex items-center gap-1"
                    title="Generate Draft in AI Studio"
                  >
                    <span className="material-symbols-outlined text-sm">psychology</span>
                    Draft
                  </button>
                  <button
                    onClick={() => setIsNewAppOpen(true)}
                    className="btn-primary px-2.5 py-1 rounded text-xs font-mono font-medium"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {jobs.length > 0 && (
        <div className="mt-8 flex justify-between items-center text-xs font-mono text-[#8e9192]">
          <span>Showing {jobs.length} of {total} jobs</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded bg-[#1b1b1b] border border-[#262626] hover:bg-[#2a2a2a] disabled:opacity-40 text-white"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 rounded bg-[#1b1b1b] border border-[#262626] hover:bg-[#2a2a2a] disabled:opacity-40 text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isNewJobOpen && (
        <NewJobModal
          onClose={() => setIsNewJobOpen(false)}
          onCreated={(newJob) => setJobs((prev) => [newJob, ...prev])}
        />
      )}

      {isNewAppOpen && (
        <NewApplicationModal
          onClose={() => setIsNewAppOpen(false)}
          onCreated={(newApp) => onApplicationCreated?.(newApp)}
        />
      )}
    </div>
  );
};
