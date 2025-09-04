from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.models.agent_config import AgentConfiguration, AgentConfigurationUpdate
from app.services.agent_config_service import AgentConfigurationService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize service
agent_config_service = AgentConfigurationService()

@router.post("/agent-configs", response_model=AgentConfiguration, status_code=status.HTTP_201_CREATED)
async def create_agent_configuration(config: AgentConfiguration):
    """Create a new agent configuration"""
    try:
        created_config = await agent_config_service.create_configuration(config)
        if not created_config:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create agent configuration"
            )
        return created_config
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating agent configuration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/agent-configs", response_model=List[AgentConfiguration])
async def get_all_agent_configurations():
    """Get all agent configurations"""
    try:
        configs = await agent_config_service.get_all_configurations()
        return configs
    except Exception as e:
        logger.error(f"Error getting all agent configurations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/agent-configs/{config_id}", response_model=AgentConfiguration)
async def get_agent_configuration(config_id: int):
    """Get a specific agent configuration by ID"""
    try:
        config = await agent_config_service.get_configuration(config_id)
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent configuration not found"
            )
        return config
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent configuration {config_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/agent-configs/active/current", response_model=AgentConfiguration)
async def get_active_agent_configuration():
    """Get the currently active agent configuration"""
    try:
        config = await agent_config_service.get_active_configuration()
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active agent configuration found"
            )
        return config
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting active agent configuration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/agent-configs/{config_id}", response_model=AgentConfiguration)
async def update_agent_configuration(config_id: int, updates: AgentConfigurationUpdate):
    """Update an existing agent configuration"""
    try:
        updated_config = await agent_config_service.update_configuration(config_id, updates)
        if not updated_config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent configuration not found"
            )
        return updated_config
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating agent configuration {config_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/agent-configs/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent_configuration(config_id: int):
    """Delete an agent configuration"""
    try:
        success = await agent_config_service.delete_configuration(config_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent configuration not found"
            )
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting agent configuration {config_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/agent-configs/{config_id}/activate", response_model=AgentConfiguration)
async def activate_agent_configuration(config_id: int):
    """Activate a specific agent configuration"""
    try:
        success = await agent_config_service.activate_configuration(config_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent configuration not found"
            )
        
        # Return the activated configuration
        activated_config = await agent_config_service.get_configuration(config_id)
        return activated_config
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error activating agent configuration {config_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
