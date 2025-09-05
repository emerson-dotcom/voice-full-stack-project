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
import httpx
import os
from supabase_simple import get_supabase_client
from retell import Retell

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

# Pydantic models for Call Management
class CallRequest(BaseModel):
    agent_config_id: int = Field(..., description="ID of the agent configuration to use")
    driver_name: str = Field(..., min_length=1, max_length=100)
    phone_number: str = Field(..., min_length=10, max_length=20)
    load_number: str = Field(..., min_length=1, max_length=50)
    delivery_address: Optional[str] = Field(None, max_length=500)
    expected_delivery_time: Optional[datetime] = None
    special_instructions: Optional[str] = Field(None, max_length=1000)

class CallRecord(BaseModel):
    id: Optional[int] = None
    call_id: str = Field(..., description="Unique call identifier")
    agent_config_id: int

class WebCallRequest(BaseModel):
    agent_id: str = Field(..., description="Retell agent ID for web call")

class PhoneCallRequest(BaseModel):
    from_number: str = Field(..., description="Phone number to call from (verified Retell number)")
    to_number: str = Field(..., description="Phone number to call to")

class CallStatusUpdate(BaseModel):
    status: str = Field(..., description="New call status")
    retell_call_id: Optional[str] = None
    call_summary: Optional[str] = None
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None

# Retell AI Integration
async def create_retell_agent(agent_config: dict) -> str:
    """Create or get Retell AI agent based on configuration"""
    retell_api_key = os.getenv("RETELL_API_KEY")
    
    if not retell_api_key:
        print("⚠️ RETELL_API_KEY not found. Cannot create Retell agent.")
        return None
    
    try:
        # Check if agent already exists in Retell AI
        existing_agent_id = agent_config.get("retell_agent_id")
        if existing_agent_id:
            return existing_agent_id
        
        # Create new agent in Retell AI
        agent_request = {
            "response_engine": {
                "llm_id": agent_config.get("llm_id", "llm_234sdertfsdsfsdf"),
                "type": agent_config.get("response_engine", "retell-llm")
            },
            "voice_id": agent_config.get("voice_id", "11labs-Adrian"),
            "agent_name": agent_config.get("agent_name", "Voice Agent"),
            "greeting": agent_config.get("greeting", "Hello, this is your AI assistant."),
            "primary_objective": agent_config.get("primary_objective", "Assist with your request."),
            "conversation_flow": agent_config.get("conversation_flow", []),
            "fallback_responses": agent_config.get("fallback_responses", []),
            "call_ending_conditions": agent_config.get("call_ending_conditions", [])
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.retellai.com/v1/agent",
                headers={
                    "Authorization": f"Bearer {retell_api_key}",
                    "Content-Type": "application/json"
                },
                json=agent_request,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                agent_id = result.get("agent_id")
                print(f"✅ Retell AI agent created: {agent_id}")
                
                # Update agent config with Retell agent ID
                supabase.update_agent_configuration(agent_config["id"], {"retell_agent_id": agent_id})
                
                return agent_id
            else:
                print(f"❌ Retell AI agent creation error: {response.status_code} - {response.text}")
                return None
                
    except Exception as e:
        print(f"❌ Error creating Retell AI agent: {e}")
        return None

async def initiate_retell_call(agent_config: dict, call_request: CallRequest, call_data: dict) -> str:
    """Initiate a call using Retell AI API"""
    retell_api_key = os.getenv("RETELL_API_KEY")
    retell_webhook_url = os.getenv("RETELL_WEBHOOK_URL")
    retell_from_number = os.getenv("RETELL_FROM_NUMBER")  # Your verified Retell AI number
    
    if not retell_api_key:
        print("⚠️ RETELL_API_KEY not found. Using simulation mode.")
        # Return a simulated call ID for testing
        import uuid
        return f"retell_sim_{str(uuid.uuid4())}"
    
    if not retell_from_number:
        print("⚠️ RETELL_FROM_NUMBER not found. Please set your verified Retell AI phone number.")
        import uuid
        return f"retell_error_{str(uuid.uuid4())}"
    
    try:
        # Get or create Retell AI agent
        agent_id = await create_retell_agent(agent_config)
        if not agent_id:
            print("❌ Failed to create/get Retell AI agent")
            import uuid
            return f"retell_error_{str(uuid.uuid4())}"
        
        # Prepare Retell AI call request
        retell_request = {
            "from_number": retell_from_number,
            "to_number": call_request.phone_number,
            "agent_id": agent_id,
            "metadata": {
                "call_id": call_data.get("call_id"),
                "driver_name": call_request.driver_name,
                "load_number": call_request.load_number,
                "delivery_address": call_request.delivery_address,
                "special_instructions": call_request.special_instructions
            }
        }
        
        # Add webhook URL if available
        if retell_webhook_url:
            retell_request["webhook_url"] = retell_webhook_url
        
        # Make request to Retell AI
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.retellai.com/v2/create-phone-call",
                headers={
                    "Authorization": f"Bearer {retell_api_key}",
                    "Content-Type": "application/json"
                },
                json=retell_request,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                retell_call_id = result.get("call_id")
                print(f"✅ Retell AI call initiated: {retell_call_id}")
                print(f"📞 Calling {call_request.phone_number} from {retell_from_number}")
                return retell_call_id
            else:
                print(f"❌ Retell AI API error: {response.status_code} - {response.text}")
                # Fallback to simulation
                import uuid
                return f"retell_error_{str(uuid.uuid4())}"
                
    except Exception as e:
        print(f"❌ Error calling Retell AI: {e}")
        # Fallback to simulation
        import uuid
        return f"retell_error_{str(uuid.uuid4())}"

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

# Call Management endpoints
@app.post("/api/v1/calls/trigger")
async def trigger_test_call(call_request: CallRequest):
    """Trigger a test call using the specified agent configuration"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Verify agent configuration exists
        agent_config = supabase.get_agent_configuration(call_request.agent_config_id)
        if not agent_config:
            raise HTTPException(status_code=404, detail="Agent configuration not found")
        
        # Generate unique call ID
        import uuid
        call_id = f"CALL-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Create call record
        call_data = {
            "call_id": call_id,
            "agent_config_id": call_request.agent_config_id,
            "driver_name": call_request.driver_name,
            "phone_number": call_request.phone_number,
            "load_number": call_request.load_number,
            "delivery_address": call_request.delivery_address,
            "expected_delivery_time": call_request.expected_delivery_time.isoformat() if call_request.expected_delivery_time else None,
            "special_instructions": call_request.special_instructions,
            "status": "initiated",
            "start_time": datetime.now().isoformat()
        }
        
        call_record = supabase.create_call_record(call_data)
        
        # Integrate with Retell AI API
        retell_call_id = await initiate_retell_call(agent_config, call_request, call_data)
        
        # Update call record with retell call ID and status
        update_data = {
            "retell_call_id": retell_call_id,
            "status": "in_progress"
        }
        updated_call = supabase.update_call_record(call_id, update_data)
        
        return {
            "message": "Test call initiated successfully",
            "call_id": call_id,
            "retell_call_id": retell_call_id,
            "status": "in_progress",
            "call_record": updated_call
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to trigger test call: {str(e)}")

@app.post("/api/v1/calls/web-call")
async def create_web_call(web_call_request: WebCallRequest):
    """Create a web call using Retell AI"""
    try:
        # Get Retell API key from environment
        retell_api_key = os.getenv("RETELL_API_KEY")
        if not retell_api_key:
            raise HTTPException(status_code=500, detail="Retell API key not configured")
        
        # Initialize Retell client
        client = Retell(api_key=retell_api_key)
        
        # Create web call
        web_call_response = client.call.create_web_call(
            agent_id=web_call_request.agent_id
        )
        
        print(f"✅ Web call created successfully for agent: {web_call_request.agent_id}")
        print(f"Web call response agent_id: {web_call_response.agent_id}")
        
        # Extract access token and call ID from response
        access_token = getattr(web_call_response, 'access_token', None)
        call_id = getattr(web_call_response, 'call_id', None)
        
        # Construct the web call URL using the access token
        web_call_url = None
        if access_token:
            web_call_url = f"https://retellai.com/web-call?access_token={access_token}"
        
        print(f"✅ Web call created - Call ID: {call_id}, Access Token: {access_token[:20]}..." if access_token else "No access token")
        
        return {
            "message": "Web call created successfully",
            "agent_id": web_call_response.agent_id,
            "call_id": call_id,
            "web_call_url": web_call_url,
            "access_token": access_token,
            "status": "created"
        }
        
    except Exception as e:
        print(f"❌ Error creating web call: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create web call: {str(e)}")

@app.post("/api/v1/calls/phone-call")
async def create_phone_call(phone_call_request: PhoneCallRequest):
    """Create a phone call using Retell AI"""
    try:
        # Get Retell API key from environment
        retell_api_key = os.getenv("RETELL_API_KEY")
        if not retell_api_key:
            raise HTTPException(status_code=500, detail="Retell API key not configured")
        
        # Initialize Retell client
        client = Retell(api_key=retell_api_key)
        
        # Create phone call
        phone_call_response = client.call.create_phone_call(
            from_number=phone_call_request.from_number,
            to_number=phone_call_request.to_number,
        )
        
        print(f"✅ Phone call created successfully")
        print(f"Phone call response agent_id: {phone_call_response.agent_id}")
        
        # Extract call ID from response
        call_id = getattr(phone_call_response, 'call_id', None)
        agent_id = getattr(phone_call_response, 'agent_id', None)
        
        print(f"✅ Phone call created - Call ID: {call_id}, Agent ID: {agent_id}")
        
        return {
            "message": "Phone call created successfully",
            "agent_id": agent_id,
            "call_id": call_id,
            "from_number": phone_call_request.from_number,
            "to_number": phone_call_request.to_number,
            "status": "created"
        }
        
    except Exception as e:
        print(f"❌ Error creating phone call: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create phone call: {str(e)}")

@app.get("/api/v1/calls")
async def get_call_records(limit: int = 50, offset: int = 0):
    """Get call records with pagination"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        call_records = supabase.get_call_records(limit=limit, offset=offset)
        return {
            "call_records": call_records,
            "count": len(call_records),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch call records: {str(e)}")

@app.get("/api/v1/calls/{call_id}")
async def get_call_record(call_id: str):
    """Get a specific call record by call ID"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        call_record = supabase.get_call_record(call_id)
        if not call_record:
            raise HTTPException(status_code=404, detail="Call record not found")
        return call_record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch call record: {str(e)}")

@app.put("/api/v1/calls/{call_id}/status")
async def update_call_status(call_id: str, status_update: CallStatusUpdate):
    """Update call status and related information"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Verify call record exists
        call_record = supabase.get_call_record(call_id)
        if not call_record:
            raise HTTPException(status_code=404, detail="Call record not found")
        
        # Prepare update data
        update_data = {
            "status": status_update.status
        }
        
        if status_update.retell_call_id:
            update_data["retell_call_id"] = status_update.retell_call_id
        
        if status_update.call_summary:
            update_data["call_summary"] = status_update.call_summary
        
        if status_update.end_time:
            update_data["end_time"] = status_update.end_time
        
        if status_update.duration_seconds:
            update_data["duration_seconds"] = status_update.duration_seconds
        
        # Update call record
        updated_call = supabase.update_call_record(call_id, update_data)
        
        return {
            "message": "Call status updated successfully",
            "call_record": updated_call
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update call status: {str(e)}")

@app.get("/api/v1/calls/agent/{agent_config_id}")
async def get_calls_by_agent(agent_config_id: int, limit: int = 50):
    """Get call records for a specific agent configuration"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Verify agent configuration exists
        agent_config = supabase.get_agent_configuration(agent_config_id)
        if not agent_config:
            raise HTTPException(status_code=404, detail="Agent configuration not found")
        
        call_records = supabase.get_call_records_by_agent(agent_config_id, limit=limit)
        return {
            "call_records": call_records,
            "count": len(call_records),
            "agent_config": agent_config,
            "limit": limit
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch call records for agent: {str(e)}")

@app.get("/api/v1/calls/status/{status}")
async def get_calls_by_status(status: str, limit: int = 50):
    """Get call records by status"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        valid_statuses = ["initiated", "in_progress", "completed", "failed"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        call_records = supabase.get_call_records_by_status(status, limit=limit)
        return {
            "call_records": call_records,
            "count": len(call_records),
            "status": status,
            "limit": limit
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch call records by status: {str(e)}")

# Agents endpoints
@app.get("/api/v1/agents")
async def get_all_agents():
    """Get all agents from Retell AI"""
    retell_api_key = os.getenv("RETELL_API_KEY")
    
    if not retell_api_key:
        return {
            "data": [],
            "message": "RETELL_API_KEY not configured",
            "error": "API key missing"
        }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.retellai.com/list-agents",
                headers={
                    "Authorization": f"Bearer {retell_api_key}",
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                agents_data = response.json()
                # The API returns an array directly, not wrapped in a data object
                if isinstance(agents_data, list):
                    print(f"✅ Successfully retrieved {len(agents_data)} agents")
                    return {"data": agents_data}
                else:
                    print(f"✅ Successfully retrieved {len(agents_data.get('data', []))} agents")
                    return agents_data
            else:
                print(f"❌ Failed to get agents: {response.status_code} - {response.text}")
                return {
                    "data": [],
                    "message": f"Failed to retrieve agents: {response.status_code}",
                    "error": response.text
                }
                
    except Exception as e:
        print(f"❌ Error getting agents: {e}")
        return {
            "data": [],
            "message": f"Error retrieving agents: {str(e)}",
            "error": str(e)
        }

@app.get("/api/v1/agents/{agent_id}")
async def get_agent_by_id(agent_id: str):
    """Get a specific agent by ID from Retell AI"""
    retell_api_key = os.getenv("RETELL_API_KEY")
    
    if not retell_api_key:
        raise HTTPException(status_code=500, detail="RETELL_API_KEY not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.retellai.com/v2/get-agent/{agent_id}",
                headers={
                    "Authorization": f"Bearer {retell_api_key}",
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                agent_data = response.json()
                return agent_data
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to get agent: {response.text}"
                )
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting agent: {str(e)}")

# Agent Creation Request Model
class AgentCreationRequest(BaseModel):
    agent_name: str
    greeting: str
    primary_objective: str
    conversation_flow: List[dict]
    fallback_responses: List[str]
    call_ending_conditions: List[str]
    voice_id: str = "11labs-Adrian"
    llm_id: str = "llm_234sdertfsdsfsdf"
    response_engine: str = "retell-llm"
    is_active: bool = True

@app.post("/api/v1/agents/create")
async def create_agent(agent_request: AgentCreationRequest):
    """Create a new agent in both Supabase and Retell AI"""
    try:
        # First, save the configuration to Supabase
        conversation_steps = [
            ConversationStep(**step) for step in agent_request.conversation_flow
        ]
        
        config_data = AgentConfiguration(
            agent_name=agent_request.agent_name,
            greeting=agent_request.greeting,
            primary_objective=agent_request.primary_objective,
            conversation_flow=conversation_steps,
            fallback_responses=agent_request.fallback_responses,
            call_ending_conditions=agent_request.call_ending_conditions,
            is_active=agent_request.is_active
        )
        
        # Save to Supabase
        saved_config = await create_agent_configuration(config_data)
        if not saved_config:
            raise HTTPException(
                status_code=500,
                detail="Failed to save agent configuration to database"
            )
        
        # Prepare data for Retell AI
        retell_config = {
            "agent_name": agent_request.agent_name,
            "greeting": agent_request.greeting,
            "primary_objective": agent_request.primary_objective,
            "conversation_flow": agent_request.conversation_flow,
            "fallback_responses": agent_request.fallback_responses,
            "call_ending_conditions": agent_request.call_ending_conditions,
            "voice_id": agent_request.voice_id,
            "llm_id": agent_request.llm_id,
            "response_engine": agent_request.response_engine
        }
        
        # Create agent in Retell AI
        retell_agent_id = await create_retell_agent(retell_config)
        if not retell_agent_id:
            raise HTTPException(
                status_code=500,
                detail="Failed to create agent in Retell AI. Configuration saved to database."
            )
        
        return {
            "message": "Agent created successfully",
            "agent_id": retell_agent_id,
            "config_id": saved_config.get("id"),
            "retell_agent": {"agent_id": retell_agent_id},
            "config": saved_config
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating agent: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

# Test endpoint to verify webhook is accessible
@app.get("/api/v1/webhooks/retell")
async def webhook_test():
    """Test endpoint to verify webhook URL is accessible"""
    return {
        "message": "Webhook endpoint is working!",
        "status": "ready",
        "webhook_url": "http://localhost:8000/api/v1/webhooks/retell"
    }

# Webhook endpoint for Retell AI call status updates
@app.post("/api/v1/webhooks/retell")
async def retell_webhook(webhook_data: dict):
    """Handle webhook notifications from Retell AI"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Extract call information from webhook
        retell_call_id = webhook_data.get("call_id")
        call_status = webhook_data.get("call_status")
        call_summary = webhook_data.get("call_summary")
        end_time = webhook_data.get("end_time")
        duration_seconds = webhook_data.get("duration_seconds")
        
        if not retell_call_id:
            raise HTTPException(status_code=400, detail="Missing call_id in webhook data")
        
        # Find the call record by retell_call_id
        call_records = supabase.get_call_records()
        call_record = None
        for record in call_records:
            if record.get("retell_call_id") == retell_call_id:
                call_record = record
                break
        
        if not call_record:
            print(f"⚠️ Call record not found for retell_call_id: {retell_call_id}")
            return {"message": "Call record not found"}
        
        # Map Retell AI status to our status
        status_mapping = {
            "queued": "initiated",
            "ringing": "in_progress", 
            "in_progress": "in_progress",
            "ended": "completed",
            "failed": "failed"
        }
        
        mapped_status = status_mapping.get(call_status, "in_progress")
        
        # Prepare update data
        update_data = {
            "status": mapped_status
        }
        
        if call_summary:
            update_data["call_summary"] = call_summary
        
        if end_time:
            # Convert end_time to ISO format if it's a string
            if isinstance(end_time, str):
                update_data["end_time"] = end_time
            else:
                update_data["end_time"] = end_time.isoformat()
        
        if duration_seconds:
            update_data["duration_seconds"] = duration_seconds
        
        # Update the call record
        updated_call = supabase.update_call_record(call_record["call_id"], update_data)
        
        print(f"✅ Updated call {call_record['call_id']} with status: {mapped_status}")
        
        return {
            "message": "Webhook processed successfully",
            "call_id": call_record["call_id"],
            "status": mapped_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error processing Retell webhook: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process webhook: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
