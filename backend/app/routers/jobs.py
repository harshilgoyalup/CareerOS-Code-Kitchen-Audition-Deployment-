from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Dict, Any, Optional
import math
from app.core.auth import get_current_user
from app.core.firestore import db
from app.models.schemas import JobCreate, JobResponse, JobListResponse

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("", response_model=JobListResponse)
async def list_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    skip = (page - 1) * limit
    items, total = await db.get_jobs(uid, skip=skip, limit=limit, search=search)
    total_pages = math.ceil(total / limit) if total > 0 else 1

    return JobListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        totalPages=total_pages
    )

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    payload: JobCreate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    job_dict = payload.model_dump(by_alias=True, exclude_none=True)
    
    # If ID was passed, check if duplicate
    if payload.id:
        existing = await db.get_job(uid, payload.id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Job with ID {payload.id} already exists"
            )
            
    saved = await db.save_job(uid, job_dict)
    return saved

@router.get("/{job_id}", response_model=JobResponse)
async def get_job_by_id(
    job_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    job = await db.get_job(uid, job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job {job_id} not found"
        )
    return job
