import { auth } from './firebase';
import { 
  Job, 
  Application, 
  ApplicationEvent, 
  Draft, 
  Nudge, 
  AnalyticsData, 
  ImportResult 
} from '../types';

const API_BASE = '/api';

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch {
      // Fallback dev token if token fetch fails
      headers['Authorization'] = `Bearer ${currentUser.uid}`;
    }
  } else {
    // Check localStorage fallback for dev / demo mode
    const devUid = localStorage.getItem('careeros_dev_uid');
    if (devUid) {
      headers['Authorization'] = `Bearer dev_${devUid}`;
    }
  }
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = `${response.status} ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  getMe: () => request<{ uid: string; email: string; name: string }>('/auth/me'),

  // Jobs
  getJobs: (page = 1, limit = 20, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    return request<{ items: Job[]; total: number; page: number; totalPages: number }>(`/jobs?${params}`);
  },
  createJob: (job: Partial<Job>) => request<Job>('/jobs', {
    method: 'POST',
    body: JSON.stringify(job),
  }),
  getJob: (id: string) => request<Job>(`/jobs/${id}`),

  // Applications
  getApplications: (params?: { page?: number; limit?: number; status?: string; company?: string; role?: string; search?: string; sort_by?: string; sort_desc?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.status) searchParams.append('status', params.status);
    if (params?.company) searchParams.append('company', params.company);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params?.sort_desc !== undefined) searchParams.append('sort_desc', String(params.sort_desc));
    return request<{ items: Application[]; total: number; page: number; totalPages: number }>(`/applications?${searchParams}`);
  },
  getApplication: (id: string) => request<Application>(`/applications/${id}`),
  createApplication: (app: Partial<Application>) => request<Application>('/applications', {
    method: 'POST',
    body: JSON.stringify(app),
  }),
  updateApplication: (id: string, updates: Partial<Application>) => request<Application>(`/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  changeApplicationStatus: (id: string, status: string, metadata?: Record<string, any>) => request<Application>(`/applications/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status, metadata }),
  }),
  getApplicationEvents: (id: string) => request<ApplicationEvent[]>(`/applications/${id}/events`),

  // Drafts
  getDrafts: (params?: { applicationId?: string; jobId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.applicationId) searchParams.append('applicationId', params.applicationId);
    if (params?.jobId) searchParams.append('jobId', params.jobId);
    return request<Draft[]>(`/drafts?${searchParams}`);
  },
  createDraft: (draft: Partial<Draft>) => request<Draft>('/drafts', {
    method: 'POST',
    body: JSON.stringify(draft),
  }),
  updateDraft: (id: string, updates: Partial<Draft>) => request<Draft>(`/drafts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  // Nudges
  getNudges: (status = 'pending') => request<Nudge[]>(`/nudges?status=${status}`),
  completeNudge: (id: string) => request<{ success: boolean; nudge: Nudge }>(`/nudges/${id}/complete`, {
    method: 'POST',
  }),

  // Bulk Import
  importData: (data: { jobs: any[]; drafts: any[] }) => request<ImportResult>('/import', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // AI Studio
  generateCoverLetter: (payload: {
    jobId?: string;
    applicationId?: string;
    company?: string;
    role?: string;
    jobDescription?: string;
    tone?: string;
    customInstructions?: string;
  }) => request<{ coverLetter: string; jobId?: string; applicationId?: string; generatedAt: string }>('/ai/generate-cover-letter', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  generateFollowUp: (payload: {
    applicationId?: string;
    jobId?: string;
    company?: string;
    role?: string;
    tone?: string;
    lastInteractionDaysAgo?: number;
  }) => request<{ followUpEmail: string; recommendedFollowUpDays: number; personalizationPoints: string[] }>('/ai/generate-follow-up', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Analytics
  getAnalytics: () => request<AnalyticsData>('/analytics'),
};
