from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Dict, Any, Optional, List
import math
from app.core.auth import get_current_user
from app.core.firestore import db
from app.models.schemas import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    ApplicationListResponse,
    ApplicationStatusChange,
    ApplicationEvent
)

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("", response_model=ApplicationListResponse)
async def list_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    company: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("updatedAt"),
    sort_desc: bool = Query(True),
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    skip = (page - 1) * limit
    
    items, total = await db.get_applications(
        uid=uid,
        status=status,
        company=company,
        role=role,
        search=search,
        sort_by=sort_by,
        sort_desc=sort_desc,
        skip=skip,
        limit=limit
    )
    
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    return ApplicationListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        totalPages=total_pages
    )

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    payload: ApplicationCreate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    app_dict = payload.model_dump(exclude_none=True)
    
    if payload.id:
        existing = await db.get_application(uid, payload.id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Application with ID {payload.id} already exists"
            )
            
    saved_app = await db.save_application(uid, app_dict)
    
    # Create initial event
    await db.add_application_event(
        uid=uid,
        app_id=saved_app["id"],
        from_status="Created",
        to_status=saved_app.get("status", "Applied"),
        metadata={"note": "Initial application created"}
    )
    
    saved_app["events"] = await db.get_application_events(uid, saved_app["id"])
    return saved_app

@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application_by_id(
    app_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    app = await db.get_application(uid, app_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application {app_id} not found"
        )
    return app

@router.patch("/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: str,
    payload: ApplicationUpdate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    existing = await db.get_application(uid, app_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application {app_id} not found"
        )
        
    updates = payload.model_dump(exclude_none=True)
    
    # If status is being updated directly, create status change event
    if "status" in updates and updates["status"] != existing.get("status"):
        await db.add_application_event(
            uid=uid,
            app_id=app_id,
            from_status=existing.get("status", "Applied"),
            to_status=updates["status"],
            metadata={"source": "patch_update"}
        )
        
    updated = await db.update_application(uid, app_id, updates)
    return updated

@router.post("/{app_id}/status", response_model=ApplicationResponse)
async def change_application_status(
    app_id: str,
    payload: ApplicationStatusChange,
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    existing = await db.get_application(uid, app_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application {app_id} not found"
        )
        
    old_status = existing.get("status", "Applied")
    new_status = payload.status
    
    if old_status == new_status:
        return existing
        
    # Record status transition event
    await db.add_application_event(
        uid=uid,
        app_id=app_id,
        from_status=old_status,
        to_status=new_status,
        metadata=payload.metadata
    )
    
    # Update application status
    updated = await db.update_application(uid, app_id, {"status": new_status})
    return updated

@router.get("/{app_id}/events", response_model=List[ApplicationEvent])
async def get_application_events_timeline(
    app_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    existing = await db.get_application(uid, app_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application {app_id} not found"
        )
        
    events = await db.get_application_events(uid, app_id)
    return events
