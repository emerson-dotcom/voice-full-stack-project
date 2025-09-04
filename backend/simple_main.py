#!/usr/bin/env python3
"""
Simple working backend for Voice Agent Admin
Using Flask instead of FastAPI to avoid Python 3.13 compatibility issues
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

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

@app.get("/")
async def root():
    return {"message": "Voice Agent Admin API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/test")
async def test_endpoint():
    return {"message": "Backend is working!", "endpoint": "test"}

@app.post("/api/v1/test-post")
async def test_post_endpoint(data: dict):
    return {"message": "POST request received", "data": data}

if __name__ == "__main__":
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
