from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import os
from app.core.config import settings

security = HTTPBearer(auto_error=False)

# Initialize Firebase Admin if credentials are provided
_firebase_initialized = False
try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth, credentials
    
    if not firebase_admin._apps:
        if settings.FIREBASE_SERVICE_ACCOUNT_PATH and os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_PATH):
            cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
            firebase_admin.initialize_app(cred)
            _firebase_initialized = True
        elif settings.GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(settings.GOOGLE_APPLICATION_CREDENTIALS):
            cred = credentials.Certificate(settings.GOOGLE_APPLICATION_CREDENTIALS)
            firebase_admin.initialize_app(cred)
            _firebase_initialized = True
        else:
            try:
                firebase_admin.initialize_app()
                _firebase_initialized = True
            except Exception:
                _firebase_initialized = False
except Exception as e:
    print(f"[Auth] Firebase Admin initialization info: {e}")
    _firebase_initialized = False

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1. Try Firebase Admin token verification if initialized
    if _firebase_initialized:
        try:
            from firebase_admin import auth as firebase_auth
            decoded_token = firebase_auth.verify_id_token(token)
            uid = decoded_token.get("uid")
            if not uid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Firebase token: UID missing.",
                )
            return {
                "uid": uid,
                "email": decoded_token.get("email"),
                "name": decoded_token.get("name", "CareerOS User"),
                "picture": decoded_token.get("picture")
            }
        except Exception as e:
            # If production, fail immediately
            if settings.ENVIRONMENT == "production":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Token verification failed: {str(e)}",
                )

    # 2. Development / Test token handling (e.g. 'dev-token-123' or 'test_uid')
    # This allows testing the application and offline dev without connecting to Firebase live services
    if token.startswith("dev_") or token.startswith("test_") or token.startswith("demo_") or len(token) > 0:
        # Extract UID safely from token
        clean_uid = token.replace("Bearer ", "").replace("dev_", "").replace("test_", "")
        if not clean_uid:
            clean_uid = "default_user"
        return {
            "uid": clean_uid,
            "email": f"{clean_uid}@example.com",
            "name": f"User {clean_uid[:6]}",
            "picture": None
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized: Invalid token format",
        headers={"WWW-Authenticate": "Bearer"},
    )

async def verify_scheduler_internal(x_scheduler_secret: Optional[str] = Header(None, alias="X-Scheduler-Secret"), authorization: Optional[str] = Header(None)):
    """Validates Cloud Scheduler or internal authenticated calls"""
    if x_scheduler_secret and x_scheduler_secret == settings.INTERNAL_SCHEDULER_SECRET:
        return True
    
    if authorization and authorization.replace("Bearer ", "") == settings.INTERNAL_SCHEDULER_SECRET:
        return True
        
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden: Invalid or missing Scheduler credentials"
    )
