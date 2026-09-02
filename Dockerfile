# ========================================================
# CareerOS Multi-Stage Full-Stack Container for Google Cloud Run
# ========================================================

# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend & Static Asset Server
FROM python:3.10-slim AS backend
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend app
COPY backend/app ./app

# Copy built frontend static assets into static directory
COPY --from=frontend-builder /app/frontend/dist /app/static

EXPOSE 8080

# Run with uvicorn honoring Cloud Run dynamic $PORT
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
