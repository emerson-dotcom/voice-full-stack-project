from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

from app.routers import agent_config, call_management, webhooks
from app.core.config import settings

app = FastAPI(
    title="Voice Agent Admin API",
    description="Backend API for managing AI voice agents and call configurations",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agent_config.router, prefix="/api/v1", tags=["Agent Configuration"])
app.include_router(call_management.router, prefix="/api/v1", tags=["Call Management"])
app.include_router(webhooks.router, prefix="/api/v1", tags=["Webhooks"])

@app.get("/")
async def root():
    return {"message": "Voice Agent Admin API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
