from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from collections import defaultdict
from app.core.auth import get_current_user
from app.core.firestore import db
from app.models.schemas import AnalyticsResponse, MonthlyTrend, StatusBreakdown

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsResponse)
async def get_analytics(
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    
    # Retrieve all applications for this user
    applications, total = await db.get_applications(uid, limit=10000)
    nudges = await db.get_nudges(uid)
    
    applied_count = sum(1 for a in applications if a.get("status") == "Applied")
    interview_count = sum(1 for a in applications if a.get("status") == "Interview")
    offer_count = sum(1 for a in applications if a.get("status") == "Offer")
    reject_count = sum(1 for a in applications if a.get("status") == "Reject")
    active_count = applied_count + interview_count
    
    # Conversion calculations
    interview_conversion_rate = round((interview_count / total * 100), 1) if total > 0 else 0.0
    offer_conversion_rate = round((offer_count / interview_count * 100), 1) if interview_count > 0 else (round((offer_count / total * 100), 1) if total > 0 else 0.0)
    
    # Follow-ups due
    follow_ups_due = sum(1 for n in nudges if n.get("status") == "pending")
    completed_nudges = sum(1 for n in nudges if n.get("status") == "completed")
    total_nudges = len(nudges)
    follow_up_completion_rate = round((completed_nudges / total_nudges * 100), 1) if total_nudges > 0 else 100.0
    
    # Monthly aggregation
    monthly_counts = defaultdict(int)
    for app in applications:
        date_str = app.get("applicationDate") or app.get("createdAt", "")
        # Format e.g. "2026-06" or "Jun 2026"
        if len(date_str) >= 7:
            month_key = date_str[:7]
            monthly_counts[month_key] += 1
            
    # Sort by month
    sorted_months = sorted(monthly_counts.items(), key=lambda x: x[0])
    trends = [MonthlyTrend(month=k, count=v) for k, v in sorted_months]
    if not trends and total > 0:
        trends = [MonthlyTrend(month="Current", count=total)]
        
    status_distribution = [
        StatusBreakdown(name="Applied", count=applied_count, percentage=round(applied_count/total*100, 1) if total > 0 else 0.0),
        StatusBreakdown(name="Interview", count=interview_count, percentage=round(interview_count/total*100, 1) if total > 0 else 0.0),
        StatusBreakdown(name="Offer", count=offer_count, percentage=round(offer_count/total*100, 1) if total > 0 else 0.0),
        StatusBreakdown(name="Reject", count=reject_count, percentage=round(reject_count/total*100, 1) if total > 0 else 0.0),
    ]

    return AnalyticsResponse(
        totalApplications=total,
        appliedCount=applied_count,
        interviewCount=interview_count,
        offerCount=offer_count,
        rejectCount=reject_count,
        activeCount=active_count,
        interviewConversionRate=interview_conversion_rate,
        offerConversionRate=offer_conversion_rate,
        followUpCompletionRate=follow_up_completion_rate,
        applicationsOverTime=trends,
        statusDistribution=status_distribution,
        followUpsDueCount=follow_ups_due
    )
