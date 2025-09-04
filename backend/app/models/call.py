from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class CallStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class CallTrigger(BaseModel):
    driver_name: str = Field(..., min_length=1, max_length=100)
    phone_number: str = Field(..., min_length=10, max_length=15)
    load_number: str = Field(..., min_length=1, max_length=50)
    agent_config_id: int = Field(..., gt=0)
    
    class Config:
        schema_extra = {
            "example": {
                "driver_name": "John Doe",
                "phone_number": "+1234567890",
                "load_number": "LD-2024-001",
                "agent_config_id": 1
            }
        }

class CallResult(BaseModel):
    id: Optional[int] = None
    call_id: str = Field(..., min_length=1)
    driver_name: str = Field(..., min_length=1, max_length=100)
    phone_number: str = Field(..., min_length=10, max_length=15)
    load_number: str = Field(..., min_length=1, max_length=50)
    status: CallStatus = CallStatus.COMPLETED
    duration_seconds: Optional[int] = None
    transcript: str = Field(..., min_length=1)
    structured_summary: Dict[str, Any] = Field(default_factory=dict)
    agent_config_id: int = Field(..., gt=0)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        schema_extra = {
            "example": {
                "call_id": "call_12345",
                "driver_name": "John Doe",
                "phone_number": "+1234567890",
                "load_number": "LD-2024-001",
                "status": "completed",
                "duration_seconds": 180,
                "transcript": "Full conversation transcript...",
                "structured_summary": {
                    "delivery_confirmed": True,
                    "address_verified": True,
                    "issues_resolved": False,
                    "next_steps": "Driver will call back tomorrow"
                },
                "agent_config_id": 1
            }
        }

class CallResultUpdate(BaseModel):
    status: Optional[CallStatus] = None
    duration_seconds: Optional[int] = None
    transcript: Optional[str] = None
    structured_summary: Optional[Dict[str, Any]] = None
