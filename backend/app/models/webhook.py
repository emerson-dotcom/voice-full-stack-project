from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class WebhookEvent(BaseModel):
    event_type: str = Field(..., description="Type of webhook event")
    timestamp: datetime = Field(..., description="Event timestamp")
    data: Dict[str, Any] = Field(..., description="Event data payload")

class CallStartEvent(BaseModel):
    call_id: str = Field(..., description="Unique call identifier")
    agent_id: str = Field(..., description="Agent identifier")
    phone_number: str = Field(..., description="Called phone number")
    timestamp: datetime = Field(..., description="Call start timestamp")

class CallEndEvent(BaseModel):
    call_id: str = Field(..., description="Unique call identifier")
    duration_seconds: int = Field(..., description="Call duration in seconds")
    status: str = Field(..., description="Call end status")
    timestamp: datetime = Field(..., description="Call end timestamp")

class TranscriptEvent(BaseModel):
    call_id: str = Field(..., description="Unique call identifier")
    transcript: str = Field(..., description="Full call transcript")
    timestamp: datetime = Field(..., description="Transcript timestamp")

class AgentResponseEvent(BaseModel):
    call_id: str = Field(..., description="Unique call identifier")
    response_text: str = Field(..., description="Agent's response text")
    timestamp: datetime = Field(..., description="Response timestamp")
