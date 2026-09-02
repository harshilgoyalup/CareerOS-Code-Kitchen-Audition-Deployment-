import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

USER_A_HEADERS = {"Authorization": "Bearer dev_user_a"}
USER_B_HEADERS = {"Authorization": "Bearer dev_user_b"}

@pytest.mark.asyncio
async def test_auth_unauthenticated_rejected():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/applications")
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_auth_me():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/auth/me", headers=USER_A_HEADERS)
        assert response.status_code == 200
        data = response.json()
        assert data["uid"] == "user_a"
        assert data["authenticated"] is True

@pytest.mark.asyncio
async def test_tenant_isolation_jobs():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # User A creates a job
        job_data = {
            "id": "job-user-a-1",
            "from": "2026-06-01",
            "to": "2026-06-30",
            "type": "full-time",
            "description": "Senior Backend Engineer at Google",
            "company": "Google",
            "role": "Senior Backend Engineer"
        }
        res_a = await ac.post("/api/jobs", json=job_data, headers=USER_A_HEADERS)
        assert res_a.status_code == 201

        # User B queries jobs and should NOT see User A's job
        res_b = await ac.get("/api/jobs", headers=USER_B_HEADERS)
        assert res_b.status_code == 200
        items_b = res_b.json()["items"]
        assert not any(j["id"] == "job-user-a-1" for j in items_b)

        # User A queries and DOES see the job
        res_a_list = await ac.get("/api/jobs", headers=USER_A_HEADERS)
        assert any(j["id"] == "job-user-a-1" for j in res_a_list.json()["items"])

@pytest.mark.asyncio
async def test_application_lifecycle_and_status_history():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Create Application
        app_payload = {
            "id": "app-test-1",
            "jobId": "job-user-a-1",
            "company": "Stripe",
            "role": "Lead Architect",
            "type": "Full-time",
            "applicationDate": "2026-06-10",
            "status": "Applied"
        }
        res = await ac.post("/api/applications", json=app_payload, headers=USER_A_HEADERS)
        assert res.status_code == 201
        created = res.json()
        assert created["status"] == "Applied"
        assert len(created["events"]) >= 1

        # 2. Change status to Interview
        status_payload = {
            "status": "Interview",
            "metadata": {"interviewer": "Sarah Tech Lead", "round": "System Design"}
        }
        res_status = await ac.post("/api/applications/app-test-1/status", json=status_payload, headers=USER_A_HEADERS)
        assert res_status.status_code == 200
        assert res_status.json()["status"] == "Interview"

        # 3. Verify event timeline
        res_events = await ac.get("/api/applications/app-test-1/events", headers=USER_A_HEADERS)
        assert res_events.status_code == 200
        events = res_events.json()
        assert len(events) >= 2
        # Check transition event from Applied to Interview
        transition = next((e for e in events if e.get("from") == "Applied" and e.get("to") == "Interview"), None)
        assert transition is not None
        assert transition["metadata"]["round"] == "System Design"

@pytest.mark.asyncio
async def test_drafts_creation_and_linking():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        draft_payload = {
            "jobId": "job-user-a-1",
            "applicationId": "app-test-1",
            "type": "cover_letter",
            "contents": "Dear Stripe Team, I am eager to apply for Lead Architect...",
            "status": "draft"
        }
        res = await ac.post("/api/drafts", json=draft_payload, headers=USER_A_HEADERS)
        assert res.status_code == 201
        draft = res.json()
        assert draft["applicationId"] == "app-test-1"

        # Query drafts for application
        res_list = await ac.get("/api/drafts?applicationId=app-test-1", headers=USER_A_HEADERS)
        assert res_list.status_code == 200
        assert len(res_list.json()) >= 1

@pytest.mark.asyncio
async def test_bulk_import_and_deduplication():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        import_payload = {
            "jobs": [
                {
                    "id": "import-job-1",
                    "from": "2026-06-01",
                    "to": "2026-06-30",
                    "type": "full-time",
                    "description": "Staff Frontend Engineer - Netflix, Los Gatos"
                },
                {
                    "id": "import-job-2",
                    "from": "2026-06-05",
                    "to": "2026-07-05",
                    "type": "contract",
                    "description": "AI Systems Engineer - OpenAI, San Francisco"
                }
            ],
            "drafts": [
                {
                    "id": "import-draft-1",
                    "jobId": "import-job-1",
                    "type": "cover_letter",
                    "contents": "Dear Netflix Team...",
                    "status": "draft"
                }
            ]
        }

        # First import
        res1 = await ac.post("/api/import", json=import_payload, headers=USER_A_HEADERS)
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1["jobsImported"] == 2
        assert data1["draftsImported"] == 1
        assert data1["applicationsCreated"] == 2
        assert data1["linksCreated"] == 1

        # Second import (idempotent duplicate test)
        res2 = await ac.post("/api/import", json=import_payload, headers=USER_A_HEADERS)
        assert res2.status_code == 200
        data2 = res2.json()
        assert data2["duplicates"] >= 1

@pytest.mark.asyncio
async def test_ai_cover_letter_and_follow_up():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Cover letter
        cl_res = await ac.post("/api/ai/generate-cover-letter", json={
            "company": "Figma",
            "role": "Senior Design Technologist",
            "tone": "Confident & Visionary"
        }, headers=USER_A_HEADERS)
        assert cl_res.status_code == 200
        cl_data = cl_res.json()
        assert "coverLetter" in cl_data
        assert "Figma" in cl_data["coverLetter"]

        # Follow up
        fu_res = await ac.post("/api/ai/generate-follow-up", json={
            "company": "Figma",
            "role": "Senior Design Technologist",
            "tone": "Professional & Direct"
        }, headers=USER_A_HEADERS)
        assert fu_res.status_code == 200
        fu_data = fu_res.json()
        assert "followUpEmail" in fu_data
        assert isinstance(fu_data["recommendedFollowUpDays"], int)
        assert isinstance(fu_data["personalizationPoints"], list)

@pytest.mark.asyncio
async def test_internal_nudge_processor_and_duplicate_prevention():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create an application due for follow up
        due_app = {
            "id": "app-due-followup-1",
            "company": "Airbnb",
            "role": "Infrastructure Engineer",
            "applicationDate": "2026-01-01", # Past date > 7 days
            "status": "Applied",
            "nextFollowUpAt": "2026-01-08"
        }
        await ac.post("/api/applications", json=due_app, headers=USER_A_HEADERS)

        # Trigger internal nudge processor
        scheduler_headers = {"X-Scheduler-Secret": "careeros-scheduler-secret-key-prod"}
        proc_res = await ac.post("/internal/process-nudges", headers=scheduler_headers)
        assert proc_res.status_code == 200
        proc_data = proc_res.json()
        assert proc_data["status"] == "success"

        # Check nudges for User A
        nudges_res = await ac.get("/api/nudges", headers=USER_A_HEADERS)
        assert nudges_res.status_code == 200
        nudges = nudges_res.json()
        matched_nudge = next((n for n in nudges if n["applicationId"] == "app-due-followup-1"), None)
        assert matched_nudge is not None
        assert matched_nudge["status"] == "pending"

        # Second trigger should NOT duplicate nudge
        proc_res2 = await ac.post("/internal/process-nudges", headers=scheduler_headers)
        assert proc_res2.status_code == 200
        nudges_res2 = await ac.get("/api/nudges", headers=USER_A_HEADERS)
        matched_nudges = [n for n in nudges_res2.json() if n["applicationId"] == "app-due-followup-1"]
        assert len(matched_nudges) == 1

        # Mark nudge complete
        comp_res = await ac.post(f"/api/nudges/{matched_nudge['id']}/complete", headers=USER_A_HEADERS)
        assert comp_res.status_code == 200

@pytest.mark.asyncio
async def test_analytics_calculated_metrics():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/analytics", headers=USER_A_HEADERS)
        assert res.status_code == 200
        data = res.json()
        assert "totalApplications" in data
        assert data["totalApplications"] >= 1
        assert "appliedCount" in data
        assert "interviewCount" in data
        assert "interviewConversionRate" in data
        assert isinstance(data["statusDistribution"], list)
        assert isinstance(data["applicationsOverTime"], list)
