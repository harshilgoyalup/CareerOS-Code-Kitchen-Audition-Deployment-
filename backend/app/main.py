from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import time
import logging
from app.core.config import settings
from app.routers import (
    auth,
    jobs,
    applications,
    drafts,
    nudges,
    import_data,
    ai,
    analytics,
    internal
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("careeros-api")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Performance & Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - Status: {response.status_code} - Took {duration:.4f}s")
    return response

# Error Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "Validation error", "errors": exc.errors()},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error", "message": str(exc)},
    )

import os
from fastapi.staticfiles import StaticFiles

# Register Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(drafts.router, prefix=settings.API_V1_STR)
app.include_router(nudges.router, prefix=settings.API_V1_STR)
app.include_router(import_data.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(internal.router) # /internal/process-nudges

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "CareerOS Production API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

# Mount static frontend assets if available (e.g., in containerized full-stack deployment)
static_dir = os.path.join(os.getcwd(), "static")
if not os.path.exists(static_dir):
    static_dir = "/app/static"

if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
else:
    @app.get("/", tags=["Root"])
    async def root():
        return {
            "message": "Welcome to CareerOS Production Backend API",
            "docs": "/docs"
        }

