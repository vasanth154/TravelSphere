"""TravelSphere FastAPI backend application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.auth import router as auth_router

app = FastAPI(
    title="TravelSphere API",
    description="AI-Powered Multi-Model Travel & Stay Platform",
    version="0.1.0",
)

# CORS - configure for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(auth_router, prefix="/auth", tags=["auth"])


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "travelsphere-backend"}


@app.get("/", tags=["root"])
async def root():
    """Root endpoint."""
    return {"message": "TravelSphere API", "version": "0.1.0"}