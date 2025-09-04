from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ConversationStep(BaseModel):
    id: Optional[int] = None
    step: str = Field(..., min_length=1, max_length=100)
    prompt: str = Field(..., min_length=1, max_length=500)
    required: bool = True
    order: int = Field(..., ge=1)
    
    class Config:
        schema_extra = {
            "example": {
                "step": "Greeting",
                "prompt": "Introduce yourself and explain the purpose of the call",
                "required": True,
                "order": 1
            }
        }

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
    
    class Config:
        schema_extra = {
            "example": {
                "agent_name": "Logistics Assistant",
                "greeting": "Hello, this is your logistics assistant calling about your delivery.",
                "primary_objective": "Confirm delivery details and address any concerns.",
                "conversation_flow": [
                    {
                        "step": "Greeting",
                        "prompt": "Introduce yourself and explain the purpose of the call",
                        "required": True,
                        "order": 1
                    }
                ],
                "fallback_responses": [
                    "I apologize, but I didn't catch that. Could you please repeat?"
                ],
                "call_ending_conditions": [
                    "Driver confirms all details"
                ]
            }
        }

class AgentConfigurationUpdate(BaseModel):
    agent_name: Optional[str] = Field(None, min_length=1, max_length=100)
    greeting: Optional[str] = Field(None, min_length=1, max_length=500)
    primary_objective: Optional[str] = Field(None, min_length=1, max_length=500)
    conversation_flow: Optional[List[ConversationStep]] = None
    fallback_responses: Optional[List[str]] = None
    call_ending_conditions: Optional[List[str]] = None
    is_active: Optional[bool] = None
