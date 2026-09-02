import React, { useState, useEffect } from 'react';
import { Application, Job } from '../types';
import { api } from '../services/api';

interface AIStudioPageProps {
  initialApp?: Application | null;
  initialJob?: Job | null;
}

export const AIStudioPage: React.FC<AIStudioPageProps> = ({ initialApp, initialJob }) => {
  const [activeTool, setActiveTool] = useState<'cover_letter' | 'follow_up'>('cover_letter');
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>(initialApp?.id || '');
  const [tone, setTone] = useState<string>('Professional & Direct');
  const [customInstructions, setCustomInstructions] = useState('');
  const [content, setContent] = useState('');
  const [personalizationPoints, setPersonalizationPoints] = useState<string[]>([]);
  const [recommendedDays, setRecommendedDays] = useState<number>(7);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    api.getApplications({ page: 1, limit: 100 }).then((res) => {
      setApplications(res.items);
      if (!selectedAppId && res.items.length > 0) {
        setSelectedAppId(res.items[0].id);
      }
    }).catch(console.error);
  }, []);

  const selectedApp = applications.find((a) => a.id === selectedAppId) || initialApp;

  const handleGenerate = async () => {
    setGenerating(true);
    setCopySuccess(false);
    try {
      if (activeTool === 'cover_letter') {
        const res = await api.generateCoverLetter({
          applicationId: selectedApp?.id,
          jobId: selectedApp?.jobId || initialJob?.id,
          company: selectedApp?.company || initialJob?.company || 'Target Company',
          role: selectedApp?.role || initialJob?.role || 'Software Engineer',
          jobDescription: initialJob?.description,
          tone,
          customInstructions,
        });
        setContent(res.coverLetter);
        setPersonalizationPoints([]);
      } else {
        const res = await api.generateFollowUp({
          applicationId: selectedApp?.id,
          jobId: selectedApp?.jobId || initialJob?.id,
          company: selectedApp?.company || initialJob?.company,
          role: selectedApp?.role || initialJob?.role,
          tone,
        });
        setContent(res.followUpEmail);
        setPersonalizationPoints(res.personalizationPoints || []);
        setRecommendedDays(res.recommendedFollowUpDays || 7);
      }
    } catch (err: any) {
      alert(`AI Generation error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!content) {
      alert('Generate or type draft content first.');
      return;
    }
    setSaving(true);
    try {
      await api.createDraft({
        applicationId: selectedApp?.id,
        jobId: selectedApp?.jobId || initialJob?.id,
        type: activeTool === 'cover_letter' ? 'cover_letter' : 'follow_up_email',
        contents: content,
        status: 'draft',
      });
      alert('Draft saved securely to Firestore.');
    } catch (err: any) {
      alert(`Failed to save draft: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="pt-24 pb-16 px-6 md:px-12 mx-auto max-w-[1440px] animate-fade-in">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-white fill">psychology</span>
            <span className="font-mono text-xs text-white uppercase tracking-wider">Vertex AI Workspace</span>
          </div>
          <h2 className="text-3xl font-bold text-white">AI Studio</h2>
          <p className="text-sm text-[#8e9192] mt-1 max-w-2xl">
            Craft compelling narratives and strategic follow-ups powered by Google Vertex AI Gemini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#1b1b1b] border border-[#262626] rounded-full px-4 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span className="font-mono text-xs text-[#c6c6c7]">Model: Vertex AI Gemini 1.5</span>
          </div>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tool Selection Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel rounded-xl p-3 flex flex-col gap-2">
            <button
              onClick={() => { setActiveTool('cover_letter'); setContent(''); }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                activeTool === 'cover_letter'
                  ? 'bg-white/10 border border-white/20 text-white font-medium'
                  : 'hover:bg-[#2a2a2a] text-[#8e9192] hover:text-white'
              }`}
            >
              <div className="p-1.5 bg-white/10 rounded-md text-white">
                <span className="material-symbols-outlined text-sm">description</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">Cover Letter</h3>
              </div>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>

            <button
              onClick={() => { setActiveTool('follow_up'); setContent(''); }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                activeTool === 'follow_up'
                  ? 'bg-white/10 border border-white/20 text-white font-medium'
                  : 'hover:bg-[#2a2a2a] text-[#8e9192] hover:text-white'
              }`}
            >
              <div className="p-1.5 bg-white/10 rounded-md text-white">
                <span className="material-symbols-outlined text-sm">forward_to_inbox</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">Follow-up Email</h3>
              </div>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Active Context Mini-Card */}
          {selectedApp && (
            <div className="glass-panel rounded-xl p-4 border-l-2 border-l-white">
              <h4 className="font-mono text-xs text-[#8e9192] uppercase tracking-wider mb-2">Active Context</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] flex items-center justify-center font-bold text-xs text-white border border-[#353535]">
                  {selectedApp.company.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm text-white">{selectedApp.role}</p>
                  <p className="text-xs text-[#8e9192]">{selectedApp.company} • {selectedApp.status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Personalization Points from Gemini */}
          {personalizationPoints.length > 0 && (
            <div className="glass-panel rounded-xl p-4 space-y-2 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-mono text-white">
                <span className="material-symbols-outlined text-sm">lightbulb</span>
                Strategic Insights
              </div>
              <ul className="text-xs text-[#c6c6c7] space-y-2 list-disc list-inside">
                {personalizationPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
              <div className="pt-2 border-t border-[#262626] font-mono text-[11px] text-[#8e9192]">
                Recommended follow-up window: <strong>{recommendedDays} days</strong>
              </div>
            </div>
          )}
        </div>

        {/* Workspace Area */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          {/* Generator Controls */}
          <div className="glass-panel rounded-xl p-6 flex flex-col md:flex-row gap-4 items-end relative overflow-hidden">
            <div className="flex-1 w-full space-y-2">
              <label className="font-mono text-xs text-[#8e9192] uppercase tracking-wider">Target Application</label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full bg-[#131313] border border-[#262626] rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-white/50"
              >
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.role} at {app.company} ({app.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 w-full space-y-2">
              <label className="font-mono text-xs text-[#8e9192] uppercase tracking-wider">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-[#131313] border border-[#262626] rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-white/50"
              >
                <option value="Professional & Direct">Professional & Direct</option>
                <option value="Confident & Visionary">Confident & Visionary</option>
                <option value="Enthusiastic & Collaborative">Enthusiastic & Collaborative</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full md:w-auto btn-primary px-6 py-2.5 rounded-lg font-mono text-xs font-medium flex items-center justify-center gap-2"
            >
              <span className={`material-symbols-outlined text-sm ${generating ? 'animate-spin' : ''}`}>
                {generating ? 'progress_activity' : 'magic_button'}
              </span>
              {generating ? 'Synthesizing...' : 'Generate Draft'}
            </button>
          </div>

          {/* Document Editor / Preview */}
          <div className="glass-panel rounded-xl flex-1 min-h-[500px] flex flex-col border border-[#262626] shadow-xl relative bg-[#0e0e0e]/50">
            {/* Editor Toolbar */}
            <div className="border-b border-[#262626] p-4 flex flex-wrap items-center justify-between gap-4 bg-[#131313]/60 backdrop-blur-md rounded-t-xl sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-white px-2 py-1 bg-[#2a2a2a] rounded border border-[#353535]">
                  {activeTool === 'cover_letter' ? 'Cover Letter Draft' : 'Follow-up Email Draft'}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-3 py-1.5 text-[#8e9192] hover:text-white bg-[#1b1b1b] hover:bg-[#2a2a2a] border border-[#262626] rounded-md transition-all flex items-center gap-1 text-xs font-mono"
                  title="Regenerate with Gemini"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span> Regenerate
                </button>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-white bg-[#1b1b1b] hover:bg-[#2a2a2a] border border-[#262626] rounded-md transition-all flex items-center gap-1.5 text-xs font-mono"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copySuccess ? 'check' : 'content_copy'}
                  </span>
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="btn-primary px-4 py-1.5 rounded-md transition-all flex items-center gap-1.5 text-xs font-mono font-medium"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
              </div>
            </div>

            {/* Editor Content Canvas */}
            <div className="p-6 md:p-10 flex-1 overflow-y-auto">
              {generating ? (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
                  <span className="material-symbols-outlined text-4xl text-white animate-spin">progress_activity</span>
                  <p className="text-xs font-mono text-[#8e9192]">Generating tailored draft via Vertex AI Gemini...</p>
                </div>
              ) : !content ? (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-3 text-[#8e9192]">
                  <span className="material-symbols-outlined text-4xl">edit_note</span>
                  <p className="text-sm font-medium text-white">Ready to Generate</p>
                  <p className="text-xs max-w-sm">
                    Select a target application above and click "Generate Draft" to synthesize a tailored communication.
                  </p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto bg-[#131313] border border-[#262626] rounded-xl p-8 shadow-sm min-h-[400px]">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-full min-h-[360px] bg-transparent text-[#e2e2e2] text-sm leading-relaxed outline-none resize-none font-sans"
                    placeholder="Type or edit your draft here..."
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
