#!/usr/bin/env python3
"""
Simple working backend for Voice Agent Admin
Using Flask instead of FastAPI to avoid Python 3.13 compatibility issues
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uvicorn
from supabase_simple import get_supabase_client

# Pydantic models for Agent Configuration
class ConversationStep(BaseModel):
    id: Optional[int] = None
    step: str = Field(..., min_length=1, max_length=100)
    prompt: str = Field(..., min_length=1, max_length=500)
    required: bool = True
    order: int = Field(..., ge=1)

class AgentConfiguration(BaseModel):
    id: Optional[int] = None
    agent_name: str = Field(..., min_length=1, max_length=100)
    greeting: str = Field(..., min_length=1, max_length=500)
    primary_objective: str = Field(..., min_length=1, max_length=500)
    conversation_flow: List[ConversationStep] = Field(..., min_items=1)
    fallback_responses: List[str] = Field(default_factory=list)
    call_ending_conditions: List[str] = Field(default_factory=list)
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# Initialize Supabase configuration
try:
    supabase = get_supabase_client()
    print("✅ Supabase connection initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize Supabase: {e}")
    print("Please check your SUPABASE_URL and SUPABASE_ANON_KEY environment variables")
    supabase = None

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

# Agent Configuration endpoints
@app.post("/api/v1/agent-configurations")
async def create_agent_configuration(config: AgentConfiguration):
    """Create a new agent configuration"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Prepare data for Supabase
        config_data = {
            "agent_name": config.agent_name,
            "greeting": config.greeting,
            "primary_objective": config.primary_objective,
            "conversation_flow": [step.dict() for step in config.conversation_flow],
            "fallback_responses": config.fallback_responses,
            "call_ending_conditions": config.call_ending_conditions,
            "is_active": config.is_active
        }
        
        # Create in Supabase
        result = supabase.create_agent_configuration(config_data)
        
        return {
            "message": "Agent configuration created successfully",
            "config": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create agent configuration: {str(e)}")

@app.get("/api/v1/agent-configurations")
async def get_agent_configurations():
    """Get all agent configurations"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        configurations = supabase.get_agent_configurations()
        return {
            "configurations": configurations,
            "count": len(configurations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch agent configurations: {str(e)}")

@app.get("/api/v1/agent-configurations/{config_id}")
async def get_agent_configuration(config_id: int):
    """Get a specific agent configuration by ID"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        config = supabase.get_agent_configuration(config_id)
        if not config:
            raise HTTPException(status_code=404, detail="Agent configuration not found")
        return config
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch agent configuration: {str(e)}")

@app.put("/api/v1/agent-configurations/{config_id}")
async def update_agent_configuration(config_id: int, config_update: AgentConfiguration):
    """Update an existing agent configuration"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Prepare data for Supabase
        config_data = {
            "agent_name": config_update.agent_name,
            "greeting": config_update.greeting,
            "primary_objective": config_update.primary_objective,
            "conversation_flow": [step.dict() for step in config_update.conversation_flow],
            "fallback_responses": config_update.fallback_responses,
            "call_ending_conditions": config_update.call_ending_conditions,
            "is_active": config_update.is_active
        }
        
        # Update in Supabase
        result = supabase.update_agent_configuration(config_id, config_data)
        
        return {
            "message": "Agent configuration updated successfully",
            "config": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update agent configuration: {str(e)}")

@app.delete("/api/v1/agent-configurations/{config_id}")
async def delete_agent_configuration(config_id: int):
    """Delete an agent configuration"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Delete from Supabase
        deleted_config = supabase.delete_agent_configuration(config_id)
        
        return {
            "message": "Agent configuration deleted successfully",
            "config": deleted_config
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete agent configuration: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
