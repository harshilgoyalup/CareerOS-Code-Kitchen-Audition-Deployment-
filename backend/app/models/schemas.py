from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

# ==================== JOBS ====================
class JobBase(BaseModel):
    id: Optional[str] = None
    from_date: Optional[str] = Field(None, alias="from")
    to_date: Optional[str] = Field(None, alias="to")
    type: str = "full-time"
    description: str
    company: Optional[str] = None
    role: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: str
    createdAt: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)

class JobListResponse(BaseModel):
    items: List[JobResponse]
    total: int
    page: int
    limit: int
    totalPages: int

# ==================== APPLICATIONS ====================
ApplicationStatus = Literal["Applied", "Interview", "Offer", "Reject"]

class ApplicationBase(BaseModel):
    jobId: Optional[str] = None
    company: str
    role: str
    type: Optional[str] = "Full-time"
    applicationDate: str
    status: ApplicationStatus = "Applied"
    lastFollowUpAt: Optional[str] = None
    nextFollowUpAt: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    id: Optional[str] = None

class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    type: Optional[str] = None
    applicationDate: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    lastFollowUpAt: Optional[str] = None
    nextFollowUpAt: Optional[str] = None

class ApplicationStatusChange(BaseModel):
    status: ApplicationStatus
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class ApplicationEvent(BaseModel):
    id: Optional[str] = None
    from_status: str = Field(..., alias="from")
    to_status: str = Field(..., alias="to")
    timestamp: str
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

    model_config = ConfigDict(populate_by_name=True)

class ApplicationResponse(ApplicationBase):
    id: str
    createdAt: str
    updatedAt: str
    events: Optional[List[ApplicationEvent]] = None

    model_config = ConfigDict(populate_by_name=True)

class ApplicationListResponse(BaseModel):
    items: List[ApplicationResponse]
    total: int
    page: int
    limit: int
    totalPages: int

# ==================== DRAFTS ====================
DraftType = Literal["cover_letter", "follow_up_email"]
DraftStatus = Literal["draft", "sent"]

class DraftBase(BaseModel):
    jobId: Optional[str] = None
    applicationId: Optional[str] = None
    type: DraftType = "cover_letter"
    contents: str
    status: DraftStatus = "draft"

class DraftCreate(DraftBase):
    id: Optional[str] = None

class DraftUpdate(BaseModel):
    contents: Optional[str] = None
    status: Optional[DraftStatus] = None

class DraftResponse(DraftBase):
    id: str
    createdAt: str
    updatedAt: Optional[str] = None

# ==================== NUDGES ====================
NudgeStatus = Literal["pending", "completed", "dismissed"]

class NudgeResponse(BaseModel):
    id: str
    applicationId: str
    company: Optional[str] = None
    role: Optional[str] = None
    type: str = "follow_up"
    message: str
    status: NudgeStatus = "pending"
    createdAt: str
    dueDate: Optional[str] = None

# ==================== IMPORT ====================
class ImportRequest(BaseModel):
    jobs: List[Dict[str, Any]] = Field(default_factory=list)
    drafts: List[Dict[str, Any]] = Field(default_factory=list)

class ImportResponse(BaseModel):
    jobsImported: int
    draftsImported: int
    applicationsCreated: int
    linksCreated: int
    duplicates: int
    errors: List[str] = Field(default_factory=list)

# ==================== AI GENERATION ====================
class CoverLetterGenerateRequest(BaseModel):
    jobId: Optional[str] = None
    applicationId: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    jobDescription: Optional[str] = None
    tone: Optional[str] = "Professional & Direct"
    customInstructions: Optional[str] = None

class CoverLetterGenerateResponse(BaseModel):
    coverLetter: str
    jobId: Optional[str] = None
    applicationId: Optional[str] = None
    generatedAt: str

class FollowUpGenerateRequest(BaseModel):
    applicationId: Optional[str] = None
    jobId: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    tone: Optional[str] = "Professional & Direct"
    lastInteractionDaysAgo: Optional[int] = 7

class FollowUpGenerateResponse(BaseModel):
    followUpEmail: str
    recommendedFollowUpDays: int = 7
    personalizationPoints: List[str] = Field(default_factory=list)

# ==================== ANALYTICS ====================
class MonthlyTrend(BaseModel):
    month: str
    count: int

class StatusBreakdown(BaseModel):
    name: str
    count: int
    percentage: float

class AnalyticsResponse(BaseModel):
    totalApplications: int
    appliedCount: int
    interviewCount: int
    offerCount: int
    rejectCount: int
    activeCount: int
    interviewConversionRate: float
    offerConversionRate: float
    followUpCompletionRate: float
    applicationsOverTime: List[MonthlyTrend]
    statusDistribution: List[StatusBreakdown]
    followUpsDueCount: int
