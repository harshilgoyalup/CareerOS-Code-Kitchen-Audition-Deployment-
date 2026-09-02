# CareerOS

> **Next-Generation AI Career Pipeline & Application Intelligence Operating System**

CareerOS is an intelligent, high-performance career management platform designed to automate, optimize, and streamline the entire job search lifecycle. From tracking application pipelines and analyzing interview conversion funnels to generating context-aware cover letters and strategic follow-ups powered by Google's **Gemini Enterprise Agent Platform**, CareerOS serves as an executive command center for modern professionals.

---

## ✨ Features

- **📊 Comprehensive Pipeline Tracking**: Manage job applications across custom lifecycles (`Applied`, `Interview`, `Offer`, `Reject`) with real-time state management and timeline auditing.
- **🤖 AI Studio (Gemini 1.5 Flash / Vertex AI)**:
  - **Context-Aware Cover Letters**: Synthesizes custom cover letters matching candidate voice, target job requirements, and past application drafts.
  - **Structured Strategic Follow-Ups**: Produces follow-up communications, dynamic recommended wait intervals, and key personalization talking points.
- **⚡ Smart Follow-Up Nudges**: Automated, background-driven nudge engine that analyzes application age and scheduled interview checkpoints to alert users when communication is due.
- **📥 Idempotent Bulk Import Engine**: Ingest and deduplicate job postings and historical drafts with automated linking to existing application records.
- **📈 Real-Time Analytics & Funnels**: Live analytics dashboard calculating interview conversion rates, offer ratios, monthly submission velocity, and application status distribution.
- **🔒 Enterprise-Grade Tenant Isolation**: Strict multi-tenant security architecture ensuring user data remains fully isolated in Cloud Firestore subcollections.

---

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/), Python 3.10+, [Pydantic V2](https://docs.pydantic.dev/)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/products/auth) (JWT ID Tokens with server-side validation)
- **Database**: [Google Cloud Firestore](https://cloud.google.com/firestore) (with isolated user document hierarchies)
- **Artificial Intelligence**: Google **Gemini Enterprise Agent Platform** / Vertex AI (`google-genai` SDK & `vertexai`)
- **Deployment & Cloud**: [Google Cloud Run](https://cloud.google.com/run), [Google Cloud Build](https://cloud.google.com/build), [Google Cloud Scheduler](https://cloud.google.com/scheduler)

---

## 🏛️ System Architecture

CareerOS enforces a secure, zero-trust cloud architecture where browser clients never interface directly with sensitive AI APIs or service accounts:

```
┌──────────────────────────────────────────────────────────┐
│                   React + Vite (Frontend)                │
└──────────────┬─────────────────────────────┬─────────────┘
               │ (1) Firebase Web Auth       │ (2) HTTPS + Firebase Bearer Token
               ▼                             ▼
┌──────────────────────────────┐    ┌─────────────────────────────────────────┐
│   Firebase Authentication    │    │          FastAPI Backend API            │
│       (Identity Provider)    │    │           (Google Cloud Run)            │
└──────────────────────────────┘    └───────┬─────────────────────────┬───────┘
                                            │                         │
                     (3) Cryptographic Auth │                         │ (4) Authenticated GenAI
                     & Tenant Isolation     ▼                         ▼     Invocations
                                   ┌─────────────────┐       ┌────────────────────────┐
                                   │ Google Cloud    │       │ Gemini Enterprise      │
                                   │ Firestore       │       │ Agent Platform         │
                                   └─────────────────┘       └────────────────────────┘
```

### Architectural Data Flow:
1. **Frontend ➔ Firebase Authentication**: The client authenticates via Google OAuth or Email/Password, obtaining a signed Firebase ID Token.
2. **Frontend ➔ FastAPI Backend**: All AI operations, CRUD operations, bulk imports, and analytics requests are sent to the FastAPI backend with the ID token in the `Authorization: Bearer <TOKEN>` header.
3. **FastAPI ➔ Gemini Enterprise Agent Platform**: Gemini is invoked strictly server-side using environment-configured API keys or Google Cloud IAM workload identity. **No Gemini credentials are ever sent to or exposed in the browser.**
4. **FastAPI ➔ Cloud Firestore**: The backend verifies token integrity, extracts the authenticated `uid`, and restricts data reads/writes strictly to `users/{uid}/*`.

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: v18.x or v20.x+
- **Python**: v3.10+
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/harshilgoyalup/CareerOS-Code-Kitchen-Audition-Deployment-.git
cd CareerOS-Code-Kitchen-Audition-Deployment-
```

### 2. Backend Setup
```bash
cd backend

# Create and activate a Python virtual environment
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run unit and integration tests
pytest tests/ -v

# Start backend development server
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be live at `http://127.0.0.1:8000`. Interactive documentation is available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start frontend development server
npm run dev
```
Frontend application will be accessible at `http://localhost:3000` (or `http://localhost:5173`).

---

## 🔑 Environment Variables

Never commit real `.env` files to source control. The repository includes `.env.example` templates with placeholders.

### Backend (`backend/.env`):
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PROJECT_NAME` | Service title in OpenAPI docs | `"CareerOS Backend API"` |
| `ENVIRONMENT` | Environment mode (`development` / `production`) | `development` |
| `PORT` | HTTP Port for uvicorn | `8000` (local) / `8080` (Cloud Run) |
| `GCP_PROJECT_ID` | Google Cloud Project ID | `coding-nija` |
| `GCP_REGION` | Google Cloud Region | `us-central1` |
| `GEMINI_MODEL` | Gemini LLM model identifier | `gemini-1.5-flash` |
| `GEMINI_API_KEY` | Gemini API Key (server-side only) | `AIzaSy...` |
| `FIREBASE_PROJECT_ID` | Firebase Project ID | `coding-nija` |
| `INTERNAL_SCHEDULER_SECRET` | Secret token for internal cron/scheduler endpoints | `your-secure-scheduler-secret` |
| `USE_MOCK_STORAGE` | Enable mock in-memory store for local testing without cloud credentials | `true` |

### Frontend (`frontend/.env`):
| Variable | Description | Safe for Browser? |
| :--- | :--- | :---: |
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | ✅ Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | ✅ Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | ✅ Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | ✅ Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | ✅ Yes |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID | ✅ Yes |

---

## 🔒 Security & Best Practices

- **Zero Client-Side Secrets**: All Gemini API keys, Google Cloud service accounts, and private administrative credentials remain exclusively on the backend.
- **Tenant Isolation**: Firestore collections are path-scoped under `users/{userId}`. Strict Firestore security rules prevent cross-user data access:
  ```javascript
  match /users/{userId}/{document=**} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  ```
- **Robust `.gitignore` Policies**: Comprehensive exclusion of `.env`, `.env.*`, credential JSONs, certificate keys (`.pem`, `.key`), build output (`dist/`), and caches.
- **Sanitized Error Responses**: API error handlers return structured JSON messages without exposing internal stack traces or environment secrets.

---

## 🚀 Google Cloud Run Deployment

### 1. Build and Push Container to Google Artifact Registry
```bash
# Set your GCP Project ID and Region
export PROJECT_ID="coding-nija"
export REGION="us-central1"
export REPO_NAME="careeros"

# Configure gcloud
gcloud config set project $PROJECT_ID

# Create Artifact Registry repository (if not already created)
gcloud artifacts repositories create $REPO_NAME \
  --repository-format=docker \
  --location=$REGION \
  --description="CareerOS Docker Repository"

# Build and push backend image
gcloud builds submit backend \
  --tag $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/careeros-backend:latest
```

### 2. Deploy Backend to Cloud Run
```bash
gcloud run deploy careeros-backend \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/careeros-backend:latest \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GCP_PROJECT_ID=$PROJECT_ID,GCP_REGION=$REGION,ENVIRONMENT=production,USE_MOCK_STORAGE=false" \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest,INTERNAL_SCHEDULER_SECRET=SCHEDULER_SECRET:latest"
```

### 3. Configure Automated Daily Follow-Up Cron (Cloud Scheduler)
```bash
gcloud scheduler jobs create http careeros-daily-nudges \
  --schedule="0 9 * * *" \
  --uri="https://<YOUR-CLOUD-RUN-BACKEND-URL>/internal/process-nudges" \
  --http-method=POST \
  --headers="X-Scheduler-Secret=<YOUR_SCHEDULER_SECRET>" \
  --time-zone="UTC"
```

---

## 🌐 Demo Links & Artifacts

- **GitHub Repository**: [https://github.com/harshilgoyalup/CareerOS-Code-Kitchen-Audition-Deployment-](https://github.com/harshilgoyalup/CareerOS-Code-Kitchen-Audition-Deployment-)
- **Live Demo Application**: `https://careeros-app-placeholder.run.app` *(Deploy via Cloud Run)*
- **Demo Walkthrough Video**: `https://youtu.be/placeholder-demo-video`

---

## 🏆 Code Kitchen Audition Submission

This repository is prepared and structured specifically for the **Code Kitchen Auditions**. It contains complete source code, verifiable unit & integration test suites, containerization configurations, and deployment blueprints meeting all evaluation requirements.

For questions or reviews, refer to the maintainer repository at [harshilgoyalup/CareerOS-Code-Kitchen-Audition-Deployment-](https://github.com/harshilgoyalup/CareerOS-Code-Kitchen-Audition-Deployment-).
