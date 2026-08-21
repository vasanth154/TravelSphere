"""TravelSphere FastAPI main application module."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin import router as admin_router
from app.api.ai import router as ai_router
from app.api.auth import init_admin_user
from app.api.auth import router as auth_router
from app.api.comparison import router as comparison_router
from app.api.search import router as search_router
from app.api.weather import router as weather_router

app = FastAPI(
    title="TravelSphere API",
    description="AI-Powered Multi-Model Travel & Stay Platform",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes (routers define their own prefixes)
app.include_router(auth_router, tags=["auth"])
app.include_router(search_router, tags=["search"])
app.include_router(comparison_router, tags=["transport"])
app.include_router(ai_router, tags=["ai"])
app.include_router(weather_router, tags=["weather"])
app.include_router(admin_router, tags=["admin"])

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