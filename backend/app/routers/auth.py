from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.core.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/me")
async def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    """Returns the authenticated user details based on verified Firebase token."""
    return {
        "uid": user["uid"],
        "email": user.get("email"),
        "name": user.get("name"),
        "picture": user.get("picture"),
        "authenticated": True
    }
