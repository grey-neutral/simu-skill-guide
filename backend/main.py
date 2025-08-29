from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import personas, cv, interview
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="AI Interview Simulator API",
    description="Backend API for AI-powered interview simulation with real-time voice conversation",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(personas.router, prefix="/api", tags=["personas"])
app.include_router(cv.router, prefix="/api", tags=["cv"])
app.include_router(interview.router, prefix="/api", tags=["interview"])

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "AI Interview Simulator API is running",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )