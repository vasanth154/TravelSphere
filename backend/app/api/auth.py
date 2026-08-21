"""TravelSphere authentication routes."""

import os
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, Field

from ..db import SessionLocal
from ..models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str | None = None
    role: str = "customer"
    iat: int | None = None
    exp: int | None = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hash: str) -> bool:
    """Verify a password against hash."""
    return bcrypt.checkpw(password.encode("utf-8"), hash.encode("utf-8"))


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token."""
    from datetime import timezone
    expires = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=60))
    to_encode = {"exp": expires, "sub": subject}
    encoded_jwt = jwt.encode(
        to_encode,
        os.getenv("SECRET_KEY", "change-this-to-a-strong-random-value"),
        algorithm="HS256",
    )
    return encoded_jwt


def decode_access_token(token: str) -> dict | None:
    """Decode and validate JWT token."""
    try:
        payload = jwt.decode(
            token,
            os.getenv("SECRET_KEY", "change-this-to-a-strong-random-value"),
            algorithms=["HS256"],
        )
        return payload
    except JWTError:
        return None


# Module-level bearer instance (avoids B008)
_bearer = HTTPBearer(auto_error=False)


# Dependency to get current user from token
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),  # noqa: B008
) -> dict:
    """Get the current user from JWT token."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
        }
    finally:
        db.close()


# Dependency to require admin role
def require_admin(current_user: dict = Depends(get_current_user)) -> dict:  # noqa: B008
    """Require admin role for admin endpoints."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


async def init_admin_user() -> None:
    """Initialize admin user from environment variables if it doesn't exist."""
    admin_email = os.getenv("ADMIN_EMAIL", "admin@travelsphere.com")
    admin_password = os.getenv("ADMIN_PASSWORD")
    if not admin_password:
        return

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == admin_email).first()
        if existing is None:
            admin_user = User(
                id=str(uuid.uuid4()),
                email=admin_email,
                password_hash=hash_password(admin_password),
                full_name="TravelSphere Admin",
                role="admin",
                created_at=datetime.now(timezone.utc).isoformat(),
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    """Register a new user (persisted to the database)."""
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        user = User(
            id=str(uuid.uuid4()),
            email=payload.email,
            password_hash=hash_password(payload.password),
            full_name=payload.full_name,
            role="customer",
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return UserResponse(id=user.id, email=user.email, full_name=user.full_name, role=user.role)
    finally:
        db.close()


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    """Authenticate a user and return a JWT access token."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == payload.email).first()
        if user is None or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        token = create_access_token(user.id)
        return TokenResponse(
            access_token=token,
            expires_in=60 * 60,
            user=UserResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                role=user.role,
            ),
        )
    finally:
        db.close()


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):  # noqa: B008
    """Get current user profile."""
    return UserResponse(**current_user)