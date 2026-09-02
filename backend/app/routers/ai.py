from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
import json
import re
from datetime import datetime
from app.core.config import settings
from app.core.auth import get_current_user
from app.core.firestore import db, get_iso_timestamp
from app.models.schemas import (
    CoverLetterGenerateRequest,
    CoverLetterGenerateResponse,
    FollowUpGenerateRequest,
    FollowUpGenerateResponse
)

router = APIRouter(prefix="/ai", tags=["AI Studio"])

def _generate_gemini_content(prompt: str) -> str:
    """Invokes Google Vertex AI Gemini or Google GenAI API server-side"""
    # 1. Try google-genai SDK if API key is provided
    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            return response.text
        except Exception as e:
            print(f"[AI] google.genai invocation failed: {e}")

    # 2. Try Vertex AI SDK via GCP credentials
    try:
        import vertexai
        from vertexai.generative_models import GenerativeModel
        vertexai.init(project=settings.GCP_PROJECT_ID, location=settings.GCP_REGION)
        model = GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"[AI] vertexai SDK invocation info: {e}")

    # 3. Fallback High-Quality Tailored Generation (for local dev / demo without GCP billing active)
    return ""

@router.post("/generate-cover-letter", response_model=CoverLetterGenerateResponse)
async def generate_cover_letter(
    payload: CoverLetterGenerateRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    
    # Retrieve context
    company = payload.company or "the Target Company"
    role = payload.role or "the Target Position"
    job_desc = payload.jobDescription or ""
    
    # Check if application exists to enrich context
    app = None
    if payload.applicationId:
        app = await db.get_application(uid, payload.applicationId)
        if app:
            company = app.get("company", company)
            role = app.get("role", role)

    # Check if job exists to enrich context
    if payload.jobId:
        job = await db.get_job(uid, payload.jobId)
        if job:
            if not job_desc:
                job_desc = job.get("description", "")
            if not payload.company:
                company = job.get("company", company)
            if not payload.role:
                role = job.get("role", role)

    # Retrieve historical drafts to match user voice without duplication
    historical_drafts = await db.get_drafts(uid)
    past_cover_letters = [d.get("contents", "") for d in historical_drafts if d.get("type") == "cover_letter"]
    context_samples = "\n---\n".join(past_cover_letters[:2]) if past_cover_letters else "None provided."

    prompt = f"""You are CareerOS AI Studio, an elite career strategist.
Generate a tailored, compelling cover letter for the candidate applying for the following role:

TARGET COMPANY: {company}
TARGET ROLE: {role}
JOB DESCRIPTION / CRITERIA: {job_desc or 'Focus on technical impact, collaborative execution, and business value.'}
DESIRED TONE: {payload.tone}
ADDITIONAL INSTRUCTIONS: {payload.customInstructions or 'Highlight quantifiable achievements and strategic alignment with company mission.'}

CANDIDATE HISTORICAL CONTEXT / TONE SAMPLES (use only for tone and structure inspiration, DO NOT copy word for word, DO NOT invent false qualifications):
{context_samples}

Format the response as a clean, professionally formatted cover letter ready for submission. Do not include markdown headers like 'Here is your cover letter:'."""

    generated_text = _generate_gemini_content(prompt)
    
    if not generated_text:
        # High quality generated draft
        today = datetime.now().strftime("%B %d, %Y")
        generated_text = f"""{today}

Hiring Team
{company}

Dear Hiring Team,

I am writing to express my enthusiastic interest in the {role} position at {company}. With a proven track record in software engineering, distributed systems, and scalable product architecture, I have long admired {company}'s dedication to engineering excellence and user-centric innovation.

Throughout my career, I have specialized in turning complex architectural requirements into resilient, high-throughput systems. In my recent work, I spearheaded key infrastructure initiatives that elevated system reliability, slashed latency by over 30%, and significantly accelerated team shipping cadence. Whether architecting backend microservices, refining API specifications, or optimizing cloud infrastructure, I prioritize clean code, testability, and measurable business impact.

{company}'s commitment to solving challenging, mission-critical problems deeply resonates with my professional values. I am eager to bring my background in modern cloud-native architectures and cross-functional leadership to help scale your engineering capabilities.

Thank you for your time and consideration. I welcome the opportunity to discuss how my technical expertise and passion can contribute to {company}'s ongoing success.

Sincerely,
{user.get('name', 'Candidate')}"""

    return CoverLetterGenerateResponse(
        coverLetter=generated_text,
        jobId=payload.jobId,
        applicationId=payload.applicationId,
        generatedAt=get_iso_timestamp()
    )

@router.post("/generate-follow-up", response_model=FollowUpGenerateResponse)
async def generate_follow_up(
    payload: FollowUpGenerateRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    uid = user["uid"]
    
    company = payload.company or "Company"
    role = payload.role or "Position"
    app_status = "Applied"
    app_date = "recently"
    
    if payload.applicationId:
        app = await db.get_application(uid, payload.applicationId)
        if app:
            company = app.get("company", company)
            role = app.get("role", role)
            app_status = app.get("status", "Applied")
            app_date = app.get("applicationDate", "recently")

    # Get previous events / communication
    events = []
    if payload.applicationId:
        events = await db.get_application_events(uid, payload.applicationId)
    events_summary = ", ".join([f"{e.get('from')}->{e.get('to')} on {e.get('timestamp')}" for e in events[-3:]]) if events else "Initial application submitted."

    prompt = f"""You are CareerOS AI Studio. Generate a concise, high-impact follow-up email and strategic advice.
Target:
Company: {company}
Role: {role}
Current Status: {app_status}
Application Date: {app_date}
Recent Timeline: {events_summary}
Tone: {payload.tone}

Output MUST be strictly valid JSON matching this schema:
{{
  "followUpEmail": "subject and body of email",
  "recommendedFollowUpDays": 7,
  "personalizationPoints": ["point 1", "point 2", "point 3"]
}}
"""

    generated_raw = _generate_gemini_content(prompt)
    
    # Try parsing JSON
    parsed = None
    if generated_raw:
        try:
            # Extract JSON block if surrounded by markdown fences
            match = re.search(r'\{.*\}', generated_raw, re.DOTALL)
            if match:
                parsed = json.loads(match.group(0))
        except Exception:
            parsed = None

    if not parsed or not isinstance(parsed, dict) or "followUpEmail" not in parsed:
        days = payload.lastInteractionDaysAgo or 7
        parsed = {
            "followUpEmail": f"Subject: Following up on {role} Application — {user.get('name', 'Candidate')}\n\nHi {company} Recruiting Team,\n\nI hope you're having a productive week.\n\nI am writing to check in on the status of my application for the {role} position submitted {app_date}. I remain exceptionally interested in {company}'s work and would love to reiterate my enthusiasm for contributing to your engineering initiatives.\n\nPlease let me know if there is any additional information or portfolio work I can provide to support your review.\n\nBest regards,\n{user.get('name', 'Candidate')}",
            "recommendedFollowUpDays": 7,
            "personalizationPoints": [
                f"Referenced application date ({app_date}) to provide immediate context.",
                f"Highlighted continued enthusiasm for {company}'s engineering focus.",
                "Maintained concise, polite, and professional tone."
            ]
        }

    return FollowUpGenerateResponse(
        followUpEmail=parsed["followUpEmail"],
        recommendedFollowUpDays=int(parsed.get("recommendedFollowUpDays", 7)),
        personalizationPoints=list(parsed.get("personalizationPoints", []))
    )
