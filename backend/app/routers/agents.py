from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from pydantic import BaseModel
from app.services.retell_service import RetellService
from app.services.agent_config_service import AgentConfigurationService
from app.models.agent_config import AgentConfiguration, ConversationStep
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
retell_service = RetellService()
agent_config_service = AgentConfigurationService()

# Pydantic models
class AgentCreationRequest(BaseModel):
    agent_name: str
    greeting: str
    primary_objective: str
    conversation_flow: List[Dict[str, Any]]
    fallback_responses: List[str]
    call_ending_conditions: List[str]
    voice_id: str = "11labs-Adrian"
    llm_id: str = "llm_234sdertfsdsfsdf"
    response_engine: str = "retell-llm"
    is_active: bool = True

@router.get("/agents", response_model=Dict[str, Any])
async def get_all_agents():
    """Get all agents from Retell AI"""
    try:
        agents_data = await retell_service.get_all_agents()
        if agents_data is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve agents from Retell AI"
            )
        return agents_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/agents/{agent_id}", response_model=Dict[str, Any])
async def get_agent_by_id(agent_id: str):
    """Get a specific agent by ID from Retell AI"""
    try:
        # For now, we'll get all agents and filter by ID
        # In a real implementation, you might want to add a specific endpoint for this
        agents_data = await retell_service.get_all_agents()
        if agents_data is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve agents from Retell AI"
            )
        
        agents = agents_data.get('data', [])
        agent = next((agent for agent in agents if agent.get('agent_id') == agent_id), None)
        
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
        
        return agent
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent {agent_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/agents/create", response_model=Dict[str, Any])
async def create_agent(agent_request: AgentCreationRequest):
    """Create a new agent in both Supabase and Retell AI"""
    try:
        # First, save the configuration to Supabase
        # Convert conversation flow to ConversationStep objects
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
        saved_config = await agent_config_service.create_configuration(config_data)
        if not saved_config:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
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
        retell_agent = await retell_service.create_agent(retell_config)
        if not retell_agent:
            # If Retell AI creation fails, we should still keep the Supabase config
            # but return an error about the Retell AI part
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create agent in Retell AI. Configuration saved to database."
            )
        
        # Update the Supabase config with the Retell agent ID
        await agent_config_service.update_configuration(
            saved_config.id, 
            {"retell_agent_id": retell_agent.get("agent_id")}
        )
        
        return {
            "message": "Agent created successfully",
            "agent_id": retell_agent.get("agent_id"),
            "config_id": saved_config.id,
            "retell_agent": retell_agent,
            "config": saved_config.dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating agent: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
