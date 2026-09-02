export type ApplicationStatus = 'Applied' | 'Interview' | 'Offer' | 'Reject';

export interface Job {
  id: string;
  from?: string;
  to?: string;
  type: string;
  description: string;
  company?: string;
  role?: string;
  createdAt?: string;
}

export interface ApplicationEvent {
  id?: string;
  from: string;
  to: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Application {
  id: string;
  jobId?: string;
  company: string;
  role: string;
  type?: string;
  applicationDate: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  lastFollowUpAt?: string | null;
  nextFollowUpAt?: string | null;
  events?: ApplicationEvent[];
}

export interface Draft {
  id: string;
  jobId?: string;
  applicationId?: string;
  type: 'cover_letter' | 'follow_up_email';
  contents: string;
  status: 'draft' | 'sent';
  createdAt: string;
  updatedAt?: string;
}

export interface Nudge {
  id: string;
  applicationId: string;
  company?: string;
  role?: string;
  type: string;
  message: string;
  status: 'pending' | 'completed' | 'dismissed';
  createdAt: string;
  dueDate?: string;
}

export interface AnalyticsData {
  totalApplications: number;
  appliedCount: number;
  interviewCount: number;
  offerCount: number;
  rejectCount: number;
  activeCount: number;
  interviewConversionRate: number;
  offerConversionRate: number;
  followUpCompletionRate: number;
  applicationsOverTime: Array<{ month: string; count: number }>;
  statusDistribution: Array<{ name: string; count: number; percentage: number }>;
  followUpsDueCount: number;
}

export interface ImportResult {
  jobsImported: number;
  draftsImported: number;
  applicationsCreated: number;
  linksCreated: number;
  duplicates: number;
  errors: string[];
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
