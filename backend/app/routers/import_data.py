from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
import uuid
from app.core.auth import get_current_user
from app.core.firestore import db, get_iso_timestamp
from app.models.schemas import ImportRequest, ImportResponse

router = APIRouter(prefix="/import", tags=["Import"])

@router.post("", response_model=ImportResponse)
async def import_data(
    payload: ImportRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    
    jobs_imported = 0
    drafts_imported = 0
    apps_created = 0
    links_created = 0
    duplicates = 0
    errors: List[str] = []

    # Map of jobId -> Application
    job_app_map: Dict[str, Dict[str, Any]] = {}

    # 1. Process & Upsert Jobs
    for idx, raw_job in enumerate(payload.jobs):
        try:
            if not isinstance(raw_job, dict):
                errors.append(f"Job at index {idx} is not a valid JSON object")
                continue

            job_id = str(raw_job.get("id") or uuid.uuid4())
            description = raw_job.get("description", "")
            
            # Parse company & role if not directly provided
            company = raw_job.get("company")
            role = raw_job.get("role")
            if not company or not role:
                # Try parsing description: e.g. "Senior Backend Engineer - Python, Bengaluru" or "Google - Software Engineer"
                parts = description.split(" - ")
                if len(parts) >= 2:
                    role = parts[0].strip()
                    company = parts[1].split(",")[0].strip()
                else:
                    role = description or "Job Opportunity"
                    company = "Target Company"

            # Check for existing job
            existing_job = await db.get_job(uid, job_id)
            if existing_job and existing_job.get("description") == description and existing_job.get("from") == raw_job.get("from"):
                duplicates += 1
            else:
                job_record = {
                    "id": job_id,
                    "from": raw_job.get("from"),
                    "to": raw_job.get("to"),
                    "type": raw_job.get("type", "full-time"),
                    "description": description,
                    "company": company,
                    "role": role,
                    "createdAt": get_iso_timestamp()
                }
                await db.save_job(uid, job_record)
                jobs_imported += 1

            # Auto-create or link corresponding Application for this job to preserve relationships
            # Check if an application for this jobId already exists
            existing_apps, _ = await db.get_applications(uid, limit=100)
            matched_app = next((a for a in existing_apps if a.get("jobId") == job_id), None)
            
            if not matched_app:
                new_app = {
                    "jobId": job_id,
                    "company": company,
                    "role": role,
                    "type": raw_job.get("type", "Full-time").capitalize(),
                    "applicationDate": raw_job.get("from") or get_iso_timestamp().split("T")[0],
                    "status": "Applied",
                    "createdAt": get_iso_timestamp(),
                    "updatedAt": get_iso_timestamp()
                }
                saved_app = await db.save_application(uid, new_app)
                await db.add_application_event(
                    uid=uid,
                    app_id=saved_app["id"],
                    from_status="Created",
                    to_status="Applied",
                    metadata={"source": "bulk_import"}
                )
                apps_created += 1
                job_app_map[job_id] = saved_app
            else:
                job_app_map[job_id] = matched_app

        except Exception as e:
            errors.append(f"Error importing job at index {idx}: {str(e)}")

    # 2. Process & Upsert Drafts
    for idx, raw_draft in enumerate(payload.drafts):
        try:
            if not isinstance(raw_draft, dict):
                errors.append(f"Draft at index {idx} is not a valid JSON object")
                continue

            draft_id = str(raw_draft.get("id") or uuid.uuid4())
            target_job_id = raw_draft.get("jobId")
            
            # Resolve linked application
            app_id = raw_draft.get("applicationId")
            if not app_id and target_job_id:
                if target_job_id in job_app_map:
                    app_id = job_app_map[target_job_id]["id"]
                    links_created += 1
                else:
                    # Look up in applications
                    all_apps, _ = await db.get_applications(uid, limit=100)
                    found = next((a for a in all_apps if a.get("jobId") == target_job_id), None)
                    if found:
                        app_id = found["id"]
                        links_created += 1

            draft_record = {
                "id": draft_id,
                "jobId": target_job_id,
                "applicationId": app_id,
                "type": raw_draft.get("type", "cover_letter"),
                "contents": raw_draft.get("contents", ""),
                "status": raw_draft.get("status", "draft"),
                "createdAt": raw_draft.get("createdAt") or get_iso_timestamp()
            }
            await db.save_draft(uid, draft_record)
            drafts_imported += 1

        except Exception as e:
            errors.append(f"Error importing draft at index {idx}: {str(e)}")

    return ImportResponse(
        jobsImported=jobs_imported,
        draftsImported=drafts_imported,
        applicationsCreated=apps_created,
        linksCreated=links_created,
        duplicates=duplicates,
        errors=errors
    )
