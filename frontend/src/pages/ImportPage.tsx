import React, { useState } from 'react';
import { api } from '../services/api';
import { ImportResult } from '../types';

export const ImportPage: React.FC = () => {
  const samplePayload = {
    jobs: [
      {
        id: "job-101",
        from: "2026-06-01",
        to: "2026-06-30",
        type: "full-time",
        description: "Senior Backend Engineer - Google, Bengaluru"
      },
      {
        id: "job-102",
        from: "2026-06-05",
        to: "2026-07-05",
        type: "full-time",
        description: "Staff Frontend Architect - Stripe, San Francisco"
      },
      {
        id: "job-103",
        from: "2026-06-10",
        to: "2026-07-10",
        type: "contract",
        description: "AI Infrastructure Specialist - OpenAI, Remote"
      }
    ],
    drafts: [
      {
        id: "draft-201",
        jobId: "job-101",
        type: "cover_letter",
        contents: "Dear Google Engineering Team,\n\nI am writing to express my enthusiasm for the Senior Backend Engineer role...",
        status: "draft"
      },
      {
        id: "draft-202",
        jobId: "job-102",
        type: "follow_up_email",
        contents: "Hi Stripe Recruiting,\n\nFollowing up on my Staff Frontend Architect application...",
        status: "draft"
      }
    ]
  };

  const [jsonText, setJsonText] = useState(JSON.stringify(samplePayload, null, 2));
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleImport = async () => {
    setParseError(null);
    setResult(null);

    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err: any) {
      setParseError(`JSON Syntax Error: ${err.message}`);
      return;
    }

    if (!parsed || (typeof parsed !== 'object')) {
      setParseError('Payload must be an object with "jobs" and "drafts" arrays.');
      return;
    }

    setImporting(true);
    try {
      const res = await api.importData({
        jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
        drafts: Array.isArray(parsed.drafts) ? parsed.drafts : [],
      });
      setResult(res);
    } catch (err: any) {
      setParseError(`Import API Failure: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="pt-24 px-6 md:px-12 pb-16 mx-auto w-full max-w-[1440px] animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Data Import Engine</h2>
        <p className="text-sm text-[#8e9192]">
          Bulk import jobs and drafts with automatic duplicate detection, atomic batch writes, and relationship resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel rounded-xl p-4 border border-[#262626]">
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-xs text-[#8e9192] uppercase tracking-wider">JSON Import Payload</span>
              <button
                onClick={() => setJsonText(JSON.stringify(samplePayload, null, 2))}
                className="text-xs font-mono text-white underline hover:opacity-80"
              >
                Reset to Sample Dataset
              </button>
            </div>

            <textarea
              rows={16}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-[#131313] border border-[#262626] rounded-lg p-4 font-mono text-xs text-[#e2e2e2] leading-relaxed focus:outline-none focus:border-white/50"
              placeholder="Paste JSON payload containing jobs and drafts..."
            />

            {parseError && (
              <div className="mt-3 p-3 bg-[#93000a]/20 border border-[#93000a]/40 text-[#ffb4ab] text-xs font-mono rounded-lg">
                {parseError}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleImport}
                disabled={importing}
                className="btn-primary px-6 py-2.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">
                  {importing ? 'progress_activity' : 'upload_file'}
                </span>
                {importing ? 'Importing...' : 'Execute Import to Firestore'}
              </button>
            </div>
          </div>
        </div>

        {/* Results & Guidelines Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Result Card */}
          {result && (
            <div className="glass-panel rounded-xl p-6 border-l-4 border-white space-y-4 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white">check_circle</span>
                <h3 className="text-base font-bold text-white">Import Execution Summary</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-[#131313] p-3 rounded-lg border border-[#262626]">
                  <p className="text-[#8e9192]">Jobs Imported</p>
                  <p className="text-lg font-bold text-white mt-1">{result.jobsImported}</p>
                </div>
                <div className="bg-[#131313] p-3 rounded-lg border border-[#262626]">
                  <p className="text-[#8e9192]">Drafts Imported</p>
                  <p className="text-lg font-bold text-white mt-1">{result.draftsImported}</p>
                </div>
                <div className="bg-[#131313] p-3 rounded-lg border border-[#262626]">
                  <p className="text-[#8e9192]">Apps Created</p>
                  <p className="text-lg font-bold text-white mt-1">{result.applicationsCreated}</p>
                </div>
                <div className="bg-[#131313] p-3 rounded-lg border border-[#262626]">
                  <p className="text-[#8e9192]">Links Resolved</p>
                  <p className="text-lg font-bold text-white mt-1">{result.linksCreated}</p>
                </div>
              </div>

              {result.duplicates > 0 && (
                <div className="p-2.5 rounded-lg bg-[#2a2a2a] text-xs font-mono text-[#c6c6c7]">
                  ℹ️ {result.duplicates} duplicate records safely skipped (idempotent write).
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-mono text-[#ffb4ab]">Warnings / Errors:</p>
                  <ul className="text-xs text-[#ffb4ab] list-disc list-inside">
                    {result.errors.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Specs Card */}
          <div className="glass-panel rounded-xl p-6 space-y-3">
            <h4 className="text-xs font-mono text-white uppercase tracking-wider">Import Specifications</h4>
            <ul className="text-xs text-[#8e9192] space-y-2 list-disc list-inside leading-relaxed">
              <li>Automatic relationship preservation between <code className="text-white">jobId</code> and applications.</li>
              <li>Batched writes guarantee complete record insertion.</li>
              <li>Duplicate detection prevents multiple submissions of the same listing.</li>
              <li>Drafts automatically link to newly created or existing applications.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
