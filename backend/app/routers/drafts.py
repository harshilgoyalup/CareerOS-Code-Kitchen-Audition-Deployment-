from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Dict, Any, Optional, List
from app.core.auth import get_current_user
from app.core.firestore import db
from app.models.schemas import DraftCreate, DraftUpdate, DraftResponse

router = APIRouter(prefix="/drafts", tags=["Drafts"])

@router.get("", response_model=List[DraftResponse])
async def list_drafts(
    app_id: Optional[str] = Query(None, alias="applicationId"),
    job_id: Optional[str] = Query(None, alias="jobId"),
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    drafts = await db.get_drafts(uid, app_id=app_id, job_id=job_id)
    return drafts

@router.post("", response_model=DraftResponse, status_code=status.HTTP_201_CREATED)
async def create_draft(
    payload: DraftCreate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    draft_dict = payload.model_dump(exclude_none=True)
    saved = await db.save_draft(uid, draft_dict)
    return saved

@router.patch("/{draft_id}", response_model=DraftResponse)
async def update_draft(
    draft_id: str,
    payload: DraftUpdate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    updates = payload.model_dump(exclude_none=True)
    updated = await db.update_draft(uid, draft_id, updates)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Draft {draft_id} not found"
        )
    return updated
