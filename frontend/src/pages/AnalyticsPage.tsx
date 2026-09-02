import React, { useState, useEffect } from 'react';
import { AnalyticsData } from '../types';
import { api } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then(setAnalytics).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pt-32 text-center text-xs font-mono text-[#8e9192]">
        Calculating real pipeline analytics from Firestore...
      </div>
    );
  }

  return (
    <div className="pt-24 px-6 md:px-12 pb-16 mx-auto w-full max-w-[1440px] animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Career Intelligence Analytics</h2>
        <p className="text-sm text-[#8e9192]">
          Real-time metrics and funnel conversion derived directly from your cloud application database.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-5 space-y-3">
          <p className="font-mono text-xs text-[#8e9192] uppercase tracking-wider">Total Applications</p>
          <p className="text-3xl font-bold text-white">{analytics?.totalApplications ?? 0}</p>
          <p className="text-[11px] text-[#8e9192]">
            {analytics?.activeCount ?? 0} active in pipeline
          </p>
        </div>

        <div className="glass-card rounded-xl p-5 space-y-3 border-l-2 border-white">
          <p className="font-mono text-xs text-[#8e9192] uppercase tracking-wider">Interview Conversion</p>
          <p className="text-3xl font-bold text-white">{analytics?.interviewConversionRate ?? 0}%</p>
          <p className="text-[11px] text-[#8e9192]">
            {analytics?.interviewCount ?? 0} of {analytics?.totalApplications ?? 0} applications
          </p>
        </div>

        <div className="glass-card rounded-xl p-5 space-y-3 border-l-2 border-white">
          <p className="font-mono text-xs text-[#8e9192] uppercase tracking-wider">Offer Conversion</p>
          <p className="text-3xl font-bold text-white">{analytics?.offerConversionRate ?? 0}%</p>
          <p className="text-[11px] text-[#8e9192]">
            {analytics?.offerCount ?? 0} offers received
          </p>
        </div>

        <div className="glass-card rounded-xl p-5 space-y-3">
          <p className="font-mono text-xs text-[#8e9192] uppercase tracking-wider">Follow-up Discipline</p>
          <p className="text-3xl font-bold text-white">{analytics?.followUpCompletionRate ?? 100}%</p>
          <p className="text-[11px] text-[#8e9192]">
            {analytics?.followUpsDueCount ?? 0} actions pending
          </p>
        </div>
      </div>

      {/* Conversion Funnel & Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Funnel Stage Breakdown */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Application Pipeline Funnel</h3>
          <div className="space-y-3">
            {[
              { stage: 'Applied', count: analytics?.appliedCount ?? 0, rate: '100%' },
              { stage: 'Interview', count: analytics?.interviewCount ?? 0, rate: `${analytics?.interviewConversionRate}%` },
              { stage: 'Offer', count: analytics?.offerCount ?? 0, rate: `${analytics?.offerConversionRate}%` },
              { stage: 'Reject', count: analytics?.rejectCount ?? 0, rate: `${analytics?.totalApplications ? Math.round((analytics.rejectCount/analytics.totalApplications)*100) : 0}%` },
            ].map((item) => (
              <div key={item.stage} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white">{item.stage}</span>
                  <span className="text-[#8e9192]">{item.count} ({item.rate})</span>
                </div>
                <div className="w-full bg-[#131313] h-2.5 rounded-full overflow-hidden border border-[#262626]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.stage === 'Offer'
                        ? 'bg-white'
                        : item.stage === 'Interview'
                        ? 'bg-white/70'
                        : item.stage === 'Applied'
                        ? 'bg-white/40'
                        : 'bg-[#ffb4ab]/40'
                    }`}
                    style={{
                      width: `${analytics?.totalApplications ? Math.max(Math.round((item.count / analytics.totalApplications) * 100), 5) : 5}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applications Over Time Trend */}
        <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
          <h3 className="text-base font-bold text-white mb-4">Activity Timeline Trends</h3>
          <div className="flex-1 flex items-end gap-3 min-h-[160px] pb-2 border-b border-[#262626]">
            {analytics?.applicationsOverTime?.length === 0 ? (
              <div className="w-full text-center text-xs font-mono text-[#8e9192]">No trend data available</div>
            ) : (
              analytics?.applicationsOverTime?.map((trend) => (
                <div key={trend.month} className="flex-1 flex flex-col items-center justify-end gap-2 group">
                  <span className="text-[10px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {trend.count}
                  </span>
                  <div
                    className="w-full bg-white/40 hover:bg-white rounded-t-sm transition-all"
                    style={{ height: `${Math.max(trend.count * 20, 20)}px` }}
                  ></div>
                  <span className="text-[10px] font-mono text-[#8e9192]">{trend.month}</span>
                </div>
              ))
            )}
          </div>
          <p className="font-mono text-[11px] text-[#8e9192] mt-3">
            Monthly submission volume tracking
          </p>
        </div>
      </div>
    </div>
  );
};
