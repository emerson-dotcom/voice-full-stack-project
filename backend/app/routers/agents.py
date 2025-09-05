from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from app.services.retell_service import RetellService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize service
retell_service = RetellService()

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
