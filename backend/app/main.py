"""TravelSphere FastAPI main application module."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin import router as admin_router
from app.api.ai import router as ai_router
from app.api.ai_chat import router as ai_chat_router
from app.api.auth import init_admin_user
from app.api.auth import router as auth_router
from app.api.bookings import router as bookings_router
from app.api.comparison import router as comparison_router
from app.api.discover import router as discover_router
from app.api.hotels import router as hotels_router
from app.api.search import router as search_router
from app.api.trips import router as trips_router
from app.api.weather import router as weather_router

app = FastAPI(
    title="TravelSphere API",
    description="AI-Powered Multi-Model Travel & Stay Platform",
    version="0.1.0",
)

# CORS - configurable via BACKEND_CORS_ORIGINS for local + production (Render/Vercel)
_default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://frontend-omega-drab-59.vercel.app",
    "https://frontend-ez6sc3dks-vasanth-1bf3.vercel.app",
    "https://frontend-2vim57shu-vasanth-1bf3.vercel.app",
]
_extra_origins = os.getenv("BACKEND_CORS_ORIGINS", "")
if _extra_origins:
    _default_origins.extend(o.strip() for o in _extra_origins.split(",") if o.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=_default_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes (routers define their own prefixes)
app.include_router(auth_router, tags=["auth"])
app.include_router(search_router, tags=["search"])
app.include_router(comparison_router, tags=["transport"])
app.include_router(ai_router, tags=["ai"])
app.include_router(ai_chat_router, tags=["ai"])
app.include_router(weather_router, tags=["weather"])
app.include_router(admin_router, tags=["admin"])
app.include_router(hotels_router, tags=["hotels"])
app.include_router(discover_router, tags=["discover"])
app.include_router(trips_router, tags=["trips"])
app.include_router(bookings_router, tags=["bookings"])

# Initialize admin user on startup
@app.on_event("startup")
async def startup_event():
    await init_admin_user()

# Health check
@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy", "service": "travelsphere-backend"}


@app.get("/", tags=["root"])
async def root():
    return {"message": "TravelSphere API", "version": "0.1.0"}