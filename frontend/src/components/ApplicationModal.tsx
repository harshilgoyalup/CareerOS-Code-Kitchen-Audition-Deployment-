import React, { useState, useEffect } from 'react';
import { Application, ApplicationStatus, ApplicationEvent, Draft } from '../types';
import { StatusBadge } from './StatusBadge';
import { api } from '../services/api';

interface ApplicationModalProps {
  application: Application | null;
  onClose: () => void;
  onUpdated: (updatedApp: Application) => void;
  onNavigateAIStudio?: (app: Application) => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  application,
  onClose,
  onUpdated,
  onNavigateAIStudio,
}) => {
  if (!application) return null;

  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus>(application.status);
  const [statusNote, setStatusNote] = useState('');
  const [events, setEvents] = useState<ApplicationEvent[]>(application.events || []);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [nextFollowUpDate, setNextFollowUpDate] = useState(application.nextFollowUpAt || '');
  const [loadingAction, setLoadingAction] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'drafts'>('details');

  useEffect(() => {
    setCurrentStatus(application.status);
    setNextFollowUpDate(application.nextFollowUpAt || '');
    
    // Fetch latest events and drafts
    api.getApplicationEvents(application.id).then(setEvents).catch(console.error);
    api.getDrafts({ applicationId: application.id }).then(setDrafts).catch(console.error);
  }, [application]);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (newStatus === currentStatus) return;
    setLoadingAction(true);
    try {
      const updated = await api.changeApplicationStatus(application.id, newStatus, {
        note: statusNote || `Status changed from ${currentStatus} to ${newStatus}`,
      });
      setCurrentStatus(newStatus);
      setStatusNote('');
      // Refresh events
      const freshEvents = await api.getApplicationEvents(application.id);
      setEvents(freshEvents);
      onUpdated({ ...updated, events: freshEvents });
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSaveFollowUpDate = async () => {
    setLoadingAction(true);
    try {
      const updated = await api.updateApplication(application.id, {
        nextFollowUpAt: nextFollowUpDate || null,
      });
      onUpdated(updated);
      alert('Follow-up schedule saved.');
    } catch (err: any) {
      alert(`Failed to update follow-up date: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const statuses: ApplicationStatus[] = ['Applied', 'Interview', 'Offer', 'Reject'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1b1b1b] border border-[#262626] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#262626] flex justify-between items-start bg-[#131313]/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#2a2a2a] border border-[#353535] flex items-center justify-center font-bold text-lg text-white">
              {application.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{application.role}</h2>
                <StatusBadge status={currentStatus} />
              </div>
              <p className="text-sm text-[#8e9192] mt-0.5">
                {application.company} • Applied {application.applicationDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8e9192] hover:text-white p-2 rounded-lg hover:bg-[#2a2a2a] transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#262626] px-6 bg-[#131313]/30">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-xs font-mono border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-white text-white font-medium'
                : 'border-transparent text-[#8e9192] hover:text-white'
            }`}
          >
            Overview & Status
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-xs font-mono border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-white text-white font-medium'
                : 'border-transparent text-[#8e9192] hover:text-white'
            }`}
          >
            History & Timeline <span className="bg-[#2a2a2a] text-[#c6c6c7] px-1.5 rounded-full text-[10px]">{events.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`py-3 px-4 text-xs font-mono border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'drafts'
                ? 'border-white text-white font-medium'
                : 'border-transparent text-[#8e9192] hover:text-white'
            }`}
          >
            AI Drafts <span className="bg-[#2a2a2a] text-[#c6c6c7] px-1.5 rounded-full text-[10px]">{drafts.length}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'details' && (
            <>
              {/* Status Transition Control */}
              <div className="bg-[#131313] p-4 rounded-xl border border-[#262626] space-y-3">
                <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block">
                  Update Application Status
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {statuses.map((st) => (
                    <button
                      key={st}
                      disabled={loadingAction}
                      onClick={() => handleStatusChange(st)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-center ${
                        currentStatus === st
                          ? 'bg-white text-black border-white shadow-md font-bold'
                          : 'bg-[#1b1b1b] text-[#8e9192] border-[#262626] hover:text-white hover:border-[#444748]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Optional transition note (e.g. Scheduled technical round with HM)"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full bg-[#1b1b1b] border border-[#262626] rounded-lg px-3 py-2 text-xs text-[#e2e2e2] placeholder:text-[#8e9192] focus:outline-none focus:border-white/50"
                />
              </div>

              {/* Follow-up Scheduler */}
              <div className="bg-[#131313] p-4 rounded-xl border border-[#262626] space-y-3">
                <label className="text-xs font-mono text-[#8e9192] uppercase tracking-wider block">
                  Next Follow-up Due Date
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="bg-[#1b1b1b] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:border-white/50"
                  />
                  <button
                    onClick={handleSaveFollowUpDate}
                    disabled={loadingAction}
                    className="btn-primary text-xs font-mono px-4 py-2 rounded-lg font-medium"
                  >
                    Save Schedule
                  </button>
                  {application.lastFollowUpAt && (
                    <span className="text-xs text-[#8e9192]">
                      Last follow-up sent: {new Date(application.lastFollowUpAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* AI Quick Actions */}
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                <div>
                  <h4 className="text-sm font-semibold text-white">Generate AI Response</h4>
                  <p className="text-xs text-[#8e9192]">Craft a cover letter or follow-up note using Vertex AI Gemini</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateAIStudio?.(application);
                  }}
                  className="btn-primary text-xs font-mono px-4 py-2 rounded-lg flex items-center gap-1.5 font-medium"
                >
                  <span className="material-symbols-outlined text-sm">psychology</span>
                  Open in AI Studio
                </button>
              </div>
            </>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-[#8e9192] uppercase tracking-wider">Status History & Audit Trail</h4>
              {events.length === 0 ? (
                <p className="text-xs text-[#8e9192] italic">No status events recorded yet.</p>
              ) : (
                <div className="relative border-l border-[#262626] ml-3 space-y-6">
                  {events.map((ev, idx) => (
                    <div key={ev.id || idx} className="pl-6 relative">
                      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white flex items-center justify-center ring-4 ring-[#1b1b1b]">
                        <span className="material-symbols-outlined text-[10px] text-black">check</span>
                      </span>
                      <div className="bg-[#131313] p-3 rounded-lg border border-[#262626]">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-white">
                            Status changed: <span className="text-[#8e9192]">{ev.from}</span> → <span className="text-white underline">{ev.to}</span>
                          </p>
                          <span className="text-[10px] font-mono text-[#8e9192]">
                            {new Date(ev.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {ev.metadata?.note && (
                          <p className="text-xs text-[#c6c6c7] mt-1.5">{ev.metadata.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'drafts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-mono text-[#8e9192] uppercase tracking-wider">Saved Drafts</h4>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateAIStudio?.(application);
                  }}
                  className="text-xs font-mono text-white underline hover:opacity-80"
                >
                  + New AI Draft
                </button>
              </div>
              {drafts.length === 0 ? (
                <p className="text-xs text-[#8e9192] italic">No saved drafts for this application.</p>
              ) : (
                <div className="space-y-3">
                  {drafts.map((d) => (
                    <div key={d.id} className="bg-[#131313] p-4 rounded-xl border border-[#262626] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-white px-2 py-0.5 rounded bg-[#2a2a2a] uppercase">
                          {d.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-[#8e9192]">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <pre className="text-xs text-[#c6c6c7] font-sans whitespace-pre-wrap line-clamp-4 bg-[#1b1b1b] p-2.5 rounded border border-[#262626]">
                        {d.contents}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
