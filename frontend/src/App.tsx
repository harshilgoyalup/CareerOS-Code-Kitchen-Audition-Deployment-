import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar, TabType } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardPage } from './pages/DashboardPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { JobsPage } from './pages/JobsPage';
import { AIStudioPage } from './pages/AIStudioPage';
import { FollowupsPage } from './pages/FollowupsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ImportPage } from './pages/ImportPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { Application, Job } from './types';
import { ApplicationModal } from './components/ApplicationModal';

export const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [aiContextApp, setAiContextApp] = useState<Application | null>(null);
  const [aiContextJob, setAiContextJob] = useState<Job | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131313] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#2a2a2a] border border-[#353535] flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-2xl fill text-white">token</span>
        </div>
        <p className="font-mono text-xs text-[#8e9192]">Initializing CareerOS Secure Session...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleNavigateAIStudioWithApp = (app: Application) => {
    setAiContextApp(app);
    setCurrentTab('ai-studio');
  };

  const handleNavigateAIStudioWithJob = (job: Job) => {
    setAiContextJob(job);
    setCurrentTab('ai-studio');
  };

  return (
    <div className="bg-[#131313] text-[#e2e2e2] min-h-screen flex selection:bg-white/20 selection:text-white">
      {/* Desktop Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
        <TopNavbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <main className="flex-1">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigateTab={setCurrentTab}
              onSelectApplication={(app) => setSelectedApp(app)}
            />
          )}
          {currentTab === 'applications' && (
            <ApplicationsPage
              searchQuery={searchQuery}
              onNavigateAIStudio={handleNavigateAIStudioWithApp}
            />
          )}
          {currentTab === 'jobs' && (
            <JobsPage
              searchQuery={searchQuery}
              onNavigateAIStudio={handleNavigateAIStudioWithJob}
            />
          )}
          {currentTab === 'ai-studio' && (
            <AIStudioPage
              initialApp={aiContextApp}
              initialJob={aiContextJob}
            />
          )}
          {currentTab === 'follow-ups' && <FollowupsPage />}
          {currentTab === 'analytics' && <AnalyticsPage />}
          {currentTab === 'import' && <ImportPage />}
          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Application Detail Modal */}
      {selectedApp && (
        <ApplicationModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdated={(updated) => setSelectedApp(updated)}
          onNavigateAIStudio={handleNavigateAIStudioWithApp}
        />
      )}
    </div>
  );
};
