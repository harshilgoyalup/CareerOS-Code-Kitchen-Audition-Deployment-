import os
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from app.core.config import settings

# Global in-memory storage for local dev / testing fallback
# Structure: { uid: { "jobs": {}, "applications": {}, "events": { appId: {} }, "drafts": {}, "nudges": {} } }
_MEMORY_STORE: Dict[str, Dict[str, Any]] = {}

def get_iso_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()

class FirestoreDB:
    def __init__(self):
        self._client = None
        self._use_firestore = False
        
        # Check if Firebase / Firestore credentials exist
        if not settings.USE_MOCK_STORAGE:
            try:
                from google.cloud import firestore
                if settings.GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(settings.GOOGLE_APPLICATION_CREDENTIALS):
                    self._client = firestore.Client.from_service_account_json(
                        settings.GOOGLE_APPLICATION_CREDENTIALS,
                        project=settings.GCP_PROJECT_ID
                    )
                else:
                    self._client = firestore.Client(project=settings.GCP_PROJECT_ID)
                self._use_firestore = True
            except Exception as e:
                print(f"[FirestoreDB] Falling back to structured in-memory isolated store: {e}")
                self._use_firestore = False

    def _ensure_user_store(self, uid: str):
        if uid not in _MEMORY_STORE:
            _MEMORY_STORE[uid] = {
                "profile": {"uid": uid, "createdAt": get_iso_timestamp()},
                "jobs": {},
                "applications": {},
                "events": {},  # { appId: { eventId: dict } }
                "drafts": {},
                "nudges": {}
            }

    # ==================== JOBS ====================
    async def get_jobs(self, uid: str, skip: int = 0, limit: int = 20, search: Optional[str] = None) -> Tuple[List[Dict[str, Any]], int]:
        if self._use_firestore:
            coll_ref = self._client.collection(f"users/{uid}/jobs")
            docs = [doc.to_dict() for doc in coll_ref.stream()]
            if search:
                docs = [d for d in docs if search.lower() in d.get("description", "").lower() or search.lower() in d.get("role", "").lower() or search.lower() in d.get("company", "").lower()]
            total = len(docs)
            return docs[skip:skip+limit], total
        else:
            self._ensure_user_store(uid)
            jobs = list(_MEMORY_STORE[uid]["jobs"].values())
            # Sort newest first
            jobs.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
            if search:
                s = search.lower()
                jobs = [j for j in jobs if s in j.get("description", "").lower() or s in (j.get("role") or "").lower() or s in (j.get("company") or "").lower()]
            total = len(jobs)
            return jobs[skip:skip+limit], total

    async def get_job(self, uid: str, job_id: str) -> Optional[Dict[str, Any]]:
        if self._use_firestore:
            doc_ref = self._client.document(f"users/{uid}/jobs/{job_id}")
            doc = doc_ref.get()
            return doc.to_dict() if doc.exists else None
        else:
            self._ensure_user_store(uid)
            return _MEMORY_STORE[uid]["jobs"].get(job_id)

    async def save_job(self, uid: str, job_data: Dict[str, Any]) -> Dict[str, Any]:
        job_id = str(job_data.get("id") or uuid.uuid4())
        job_data["id"] = job_id
        if "createdAt" not in job_data:
            job_data["createdAt"] = get_iso_timestamp()
            
        if self._use_firestore:
            doc_ref = self._client.document(f"users/{uid}/jobs/{job_id}")
            doc_ref.set(job_data, merge=True)
        else:
            self._ensure_user_store(uid)
            _MEMORY_STORE[uid]["jobs"][job_id] = job_data
        return job_data

    # ==================== APPLICATIONS ====================
    async def get_applications(
        self, 
        uid: str, 
        status: Optional[str] = None, 
        company: Optional[str] = None, 
        role: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "updatedAt", 
        sort_desc: bool = True,
        skip: int = 0, 
        limit: int = 20
    ) -> Tuple[List[Dict[str, Any]], int]:
        if self._use_firestore:
            coll_ref = self._client.collection(f"users/{uid}/applications")
            docs = [doc.to_dict() for doc in coll_ref.stream()]
        else:
            self._ensure_user_store(uid)
            docs = list(_MEMORY_STORE[uid]["applications"].values())

        # Filtering
        filtered = []
        for app in docs:
            if status and app.get("status") != status:
                continue
            if company and company.lower() not in app.get("company", "").lower():
                continue
            if role and role.lower() not in app.get("role", "").lower():
                continue
            if search:
                s = search.lower()
                c = app.get("company", "").lower()
                r = app.get("role", "").lower()
                if s not in c and s not in r:
                    continue
            filtered.append(app)

        # Sorting
        def sort_key(x):
            return x.get(sort_by) or x.get("createdAt") or ""
        filtered.sort(key=sort_key, reverse=sort_desc)

        total = len(filtered)
        paginated = filtered[skip:skip+limit]

        # Attach events summary
        for item in paginated:
            app_id = item["id"]
            events = await self.get_application_events(uid, app_id)
            item["events"] = events

        return paginated, total

    async def get_application(self, uid: str, app_id: str) -> Optional[Dict[str, Any]]:
        if self._use_firestore:
            doc_ref = self._client.document(f"users/{uid}/applications/{app_id}")
            doc = doc_ref.get()
            if not doc.exists:
                return None
            app_data = doc.to_dict()
        else:
            self._ensure_user_store(uid)
            app_data = _MEMORY_STORE[uid]["applications"].get(app_id)
            if not app_data:
                return None
            app_data = dict(app_data)

        app_data["events"] = await self.get_application_events(uid, app_id)
        return app_data

    async def save_application(self, uid: str, app_data: Dict[str, Any]) -> Dict[str, Any]:
        app_id = str(app_data.get("id") or uuid.uuid4())
        app_data["id"] = app_id
        now = get_iso_timestamp()
        if "createdAt" not in app_data:
            app_data["createdAt"] = now
        app_data["updatedAt"] = now

        if self._use_firestore:
            doc_ref = self._client.document(f"users/{uid}/applications/{app_id}")
            doc_ref.set(app_data, merge=True)
        else:
            self._ensure_user_store(uid)
            _MEMORY_STORE[uid]["applications"][app_id] = app_data
        return app_data

    async def update_application(self, uid: str, app_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        app = await self.get_application(uid, app_id)
        if not app:
            return None
        
        updates["updatedAt"] = get_iso_timestamp()
        app.update({k: v for k, v in updates.items() if v is not None})
        
        if self._use_firestore:
            doc_ref = self._client.document(f"users/{uid}/applications/{app_id}")
            doc_ref.set(app, merge=True)
        else:
            self._ensure_user_store(uid)
            _MEMORY_STORE[uid]["applications"][app_id] = app
        return app

    # ==================== STATUS HISTORY / EVENTS ====================
    async def add_application_event(self, uid: str, app_id: str, from_status: str, to_status: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        event_id = str(uuid.uuid4())
        event_data = {
            "id": event_id,
            "from": from_status,
            "to": to_status,
            "timestamp": get_iso_timestamp(),
            "metadata": metadata or {}
        }
        if self._use_firestore:
            doc_ref = self._client.document(f"users/{uid}/applications/{app_id}/events/{event_id}")
            doc_ref.set(event_data)
        else:
            self._ensure_user_store(uid)
            if app_id not in _MEMORY_STORE[uid]["events"]:
                _MEMORY_STORE[uid]["events"][app_id] = {}
            _MEMORY_STORE[uid]["events"][app_id][event_id] = event_data
        return event_data

    async def get_application_events(self, uid: str, app_id: str) -> List[Dict[str, Any]]:
        if self._use_firestore:
            coll_ref = self._client.collection(f"users/{uid}/applications/{app_id}/events")
            events = [doc.to_dict() for doc in coll_ref.stream()]
        else:
            self._ensure_user_store(uid)
            events = list(_MEMORY_STORE[uid]["events"].get(app_id, {}).values())
        
        events.sort(key=lambda x: x.get("timestamp", ""), reverse=False)
        return events

    # ==================== DRAFTS ====================
    async def get_drafts(self, uid: str, app_id: Optional[str] = None, job_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if self._use_firestore:
            coll_ref = self._client.collection(f"users/{uid}/drafts")
            drafts = [doc.to_dict() for doc in coll_ref.stream()]
        else:
            self._ensure_user_store(uid)
            drafts = list(_MEMORY_STORE[uid]["drafts"].values())

        if app_id:
            drafts = [d for d in drafts if d.get("applicationId") == app_id]
        if job_id:
            drafts = [d for d in drafts if d.get("jobId") == job_id]
        drafts.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
        return drafts

    async def save_draft(self, uid: str, draft_data: Dict[str, Any]) -> Dict[str, Any]:
        draft_id = str(draft_data.get("id") or uuid.uuid4())
        draft_data["id"] = draft_id
        now = get_iso_timestamp()
        if "createdAt" not in draft_data:
            draft_data["createdAt"] = now
        draft_data["updatedAt"] = now

        if self._use_firestore:
            doc_ref = self._client.document(f"users/{uid}/drafts/{draft_id}")
            doc_ref.set(draft_data, merge=True)
        else:
            self._ensure_user_store(uid)
            _MEMORY_STORE[uid]["drafts"][draft_id] = draft_data
        return draft_data

    async def update_draft(self, uid: str, draft_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if self._use_firestore:
            doc_ref = self._client.document(f"users/{uid}/drafts/{draft_id}")
            doc = doc_ref.get()
            if not doc.exists:
                return None
            data = doc.to_dict()
            updates["updatedAt"] = get_iso_timestamp()
            data.update({k: v for k, v in updates.items() if v is not None})
            doc_ref.set(data, merge=True)
            return data
        else:
            self._ensure_user_store(uid)
            draft = _MEMORY_STORE[uid]["drafts"].get(draft_id)
            if not draft:
                return None
            updates["updatedAt"] = get_iso_timestamp()
            draft.update({k: v for k, v in updates.items() if v is not None})
            return draft

    # ==================== NUDGES ====================
    async def get_nudges(self, uid: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
        if self._use_firestore:
            coll_ref = self._client.collection(f"users/{uid}/nudges")
            nudges = [doc.to_dict() for doc in coll_ref.stream()]
        else:
            self._ensure_user_store(uid)
            nudges = list(_MEMORY_STORE[uid]["nudges"].values())

        if status:
            nudges = [n for n in nudges if n.get("status") == status]
        nudges.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
        return nudges

    async def save_nudge(self, uid: str, nudge_data: Dict[str, Any]) -> Dict[str, Any]:
        nudge_id = str(nudge_data.get("id") or uuid.uuid4())
        nudge_data["id"] = nudge_id
        if "createdAt" not in nudge_data:
            nudge_data["createdAt"] = get_iso_timestamp()

        if self._use_firestore:
            doc_ref = self._client.document(f"users/{uid}/nudges/{nudge_id}")
            doc_ref.set(nudge_data, merge=True)
        else:
            self._ensure_user_store(uid)
            _MEMORY_STORE[uid]["nudges"][nudge_id] = nudge_data
        return nudge_data

    async def update_nudge_status(self, uid: str, nudge_id: str, status: str) -> Optional[Dict[str, Any]]:
        if self._use_firestore:
            doc_ref = self._client.document(f"users/{uid}/nudges/{nudge_id}")
            doc = doc_ref.get()
            if not doc.exists:
                return None
            data = doc.to_dict()
            data["status"] = status
            data["completedAt"] = get_iso_timestamp()
            doc_ref.set(data, merge=True)
            return data
        else:
            self._ensure_user_store(uid)
            nudge = _MEMORY_STORE[uid]["nudges"].get(nudge_id)
            if not nudge:
                return None
            nudge["status"] = status
            nudge["completedAt"] = get_iso_timestamp()
            return nudge

    # Helper for all users (used by internal nudge processor)
    async def get_all_user_ids(self) -> List[str]:
        if self._use_firestore:
            users_ref = self._client.collection("users")
            return [doc.id for doc in users_ref.stream()]
        else:
            return list(_MEMORY_STORE.keys())

db = FirestoreDB()
