"""TravelSphere admin routes."""

from fastapi import APIRouter, Depends

from .auth import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/test")
async def admin_test(current_user: dict = Depends(require_admin)):  # noqa: B008
    """Test admin endpoint - only accessible by admin users."""
    return {"message": "Admin access granted", "user": current_user}


@router.get("/dashboard/stats")
async def admin_dashboard_stats(current_user: dict = Depends(require_admin)):  # noqa: B008
    """Get admin dashboard statistics."""
    from ..db import SessionLocal
    from ..models.user import User

    db = SessionLocal()
    try:
        total_users = db.query(User).count()
        total_admins = db.query(User).filter(User.role == "admin").count()
        total_customers = db.query(User).filter(User.role == "customer").count()
        return {
            "total_users": total_users,
            "total_admins": total_admins,
            "total_customers": total_customers,
        }
    finally:
        db.close()