from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Dict, Any, Optional, List
from app.core.auth import get_current_user
from app.core.firestore import db
from app.models.schemas import NudgeResponse

router = APIRouter(prefix="/nudges", tags=["Nudges"])

@router.get("", response_model=List[NudgeResponse])
async def list_nudges(
    status: Optional[str] = Query("pending"),
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    nudges = await db.get_nudges(uid, status=status)
    return nudges

@router.post("/{nudge_id}/complete", response_model=Dict[str, Any])
async def complete_nudge(
    nudge_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    updated = await db.update_nudge_status(uid, nudge_id, status="completed")
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Nudge {nudge_id} not found"
        )
        
    # Also update the application's lastFollowUpAt
    app_id = updated.get("applicationId")
    if app_id:
        from app.core.firestore import get_iso_timestamp
        await db.update_application(uid, app_id, {
            "lastFollowUpAt": get_iso_timestamp()
        })
        
    return {"success": True, "nudge": updated}
