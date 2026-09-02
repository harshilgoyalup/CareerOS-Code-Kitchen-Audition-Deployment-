# ========================================================
# CareerOS Backend Container for Google Cloud Run
# ========================================================
FROM python:3.10-slim

WORKDIR /app

# Configure Python execution flags
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY app ./app

# Expose default Cloud Run port
EXPOSE 8080

# Run uvicorn server binding to 0.0.0.0 and dynamic $PORT
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
