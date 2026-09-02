from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta
from app.core.auth import verify_scheduler_internal
from app.core.firestore import db, get_iso_timestamp

router = APIRouter(prefix="/internal", tags=["Internal / Scheduled Tasks"])

@router.post("/process-nudges")
async def process_nudges(
    authenticated: bool = Depends(verify_scheduler_internal)
):
    """
    Called daily by Google Cloud Scheduler with authenticated service token.
    Scans applications for all users:
    - Identifies applications due for follow-up (nextFollowUpAt reached or >7 days since applied/last follow-up)
    - Ignores 'Reject' status
    - Prevents duplicate pending nudges
    - Creates nudge records and updates application state
    """
    total_scanned = 0
    nudges_created = 0
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    now_date = now.strftime("%Y-%m-%d")

    user_ids = await db.get_all_user_ids()

    for uid in user_ids:
        applications, _ = await db.get_applications(uid, limit=500)
        existing_nudges = await db.get_nudges(uid, status="pending")
        pending_app_ids = set(n.get("applicationId") for n in existing_nudges)

        for app in applications:
            total_scanned += 1
            app_id = app["id"]
            status_val = app.get("status")
            
            # Rule: Ignore Rejected applications
            if status_val == "Reject":
                continue

            # Rule: Prevent duplicate pending nudges for the same application
            if app_id in pending_app_ids:
                continue

            company = app.get("company", "Company")
            role = app.get("role", "Role")
            next_follow_up = app.get("nextFollowUpAt")
            last_follow_up = app.get("lastFollowUpAt")
            app_date = app.get("applicationDate")

            is_due = False
            due_reason = ""

            # Check explicit nextFollowUpAt date
            if next_follow_up:
                try:
                    # e.g. "2026-06-15" or ISO string
                    target_date = next_follow_up[:10]
                    if target_date <= now_date:
                        is_due = True
                        due_reason = f"Scheduled follow-up date ({target_date}) reached"
                except Exception:
                    pass

            # If no explicit next date, check if 7 days passed without follow-up
            if not is_due and not last_follow_up and app_date:
                try:
                    parsed_app_date = datetime.strptime(app_date[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
                    if (now - parsed_app_date).days >= 7:
                        is_due = True
                        due_reason = f"Applied {(now - parsed_app_date).days} days ago with no recent follow-up"
                except Exception:
                    pass

            if is_due:
                # Construct meaningful message based on status
                if status_val == "Interview":
                    message = f"Send interview thank you note / status check to {company} for {role}."
                elif status_val == "Offer":
                    message = f"Follow up on offer review / compensation with {company}."
                else:
                    message = f"Follow up with {company} regarding your {role} application."

                nudge_data = {
                    "applicationId": app_id,
                    "company": company,
                    "role": role,
                    "type": "follow_up",
                    "message": message,
                    "status": "pending",
                    "createdAt": now_iso,
                    "dueDate": next_follow_up or now_iso
                }
                
                await db.save_nudge(uid, nudge_data)
                nudges_created += 1
                pending_app_ids.add(app_id)

    return {
        "status": "success",
        "timestamp": now_iso,
        "usersScanned": len(user_ids),
        "applicationsScanned": total_scanned,
        "nudgesCreated": nudges_created
    }
