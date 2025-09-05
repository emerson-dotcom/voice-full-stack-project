from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from pydantic import BaseModel
from app.models.call import CallTrigger, CallResult
from app.services.call_service import CallService
from app.services.retell_service import RetellService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
call_service = CallService()
retell_service = RetellService()

# Pydantic models
class WebCallRequest(BaseModel):
    agent_id: str

@router.post("/calls/trigger", status_code=status.HTTP_201_CREATED)
async def trigger_call(call_trigger: CallTrigger):
    """Trigger a new voice call"""
    try:
        # First, create a call record in our database
        call_id = await call_service.create_call_from_trigger(call_trigger)
        if not call_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create call record"
            )
        
        # Then initiate the call through Retell AI
        retell_response = await retell_service.initiate_call(call_trigger)
        if not retell_response:
            # Update call status to failed
            await call_service.update_call_status(call_id, "failed")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to initiate call through Retell AI"
            )
        
        # Update call status to in progress
        await call_service.update_call_status(call_id, "in_progress")
        
        return {
            "message": "Call initiated successfully",
            "call_id": call_id,
            "retell_call_id": retell_response.get("call_id"),
            "status": "in_progress"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error triggering call: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/calls", response_model=List[CallResult])
async def get_all_call_results(limit: int = 100):
    """Get all call results with pagination"""
    try:
        calls = await call_service.get_all_call_results(limit)
        return calls
    except Exception as e:
        logger.error(f"Error getting all call results: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/calls/{call_id}", response_model=CallResult)
async def get_call_result(call_id: str):
    """Get a specific call result by call ID"""
    try:
        call_result = await call_service.get_call_result(call_id)
        if not call_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Call result not found"
            )
        return call_result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting call result {call_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/calls/agent/{agent_config_id}", response_model=List[CallResult])
async def get_call_results_by_agent(agent_config_id: int, limit: int = 100):
    """Get call results for a specific agent configuration"""
    try:
        calls = await call_service.get_call_results_by_agent(agent_config_id, limit)
        return calls
    except Exception as e:
        logger.error(f"Error getting call results for agent {agent_config_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/calls/{call_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_call_result(call_id: str):
    """Delete a call result"""
    try:
        success = await call_service.delete_call_result(call_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Call result not found"
            )
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting call result {call_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/calls/{call_id}/status")
async def get_call_status(call_id: str):
    """Get the current status of a call from Retell AI"""
    try:
        # First check our database
        call_result = await call_service.get_call_result(call_id)
        if not call_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Call result not found"
            )
        
        # Then check with Retell AI
        retell_status = await retell_service.get_call_status(call_id)
        
        return {
            "call_id": call_id,
            "local_status": call_result.status,
            "retell_status": retell_status,
            "driver_name": call_result.driver_name,
            "load_number": call_result.load_number,
            "created_at": call_result.created_at
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting call status {call_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/calls/{call_id}/end", status_code=status.HTTP_200_OK)
async def end_call(call_id: str):
    """End an active call"""
    try:
        # Check if call exists in our database
        call_result = await call_service.get_call_result(call_id)
        if not call_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Call result not found"
            )
        
        # End call through Retell AI
        success = await retell_service.end_call(call_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to end call through Retell AI"
            )
        
        # Update local status
        await call_service.update_call_status(call_id, "cancelled")
        
        return {
            "message": "Call ended successfully",
            "call_id": call_id,
            "status": "cancelled"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ending call {call_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/calls/web-call", response_model=Dict[str, Any])
async def create_web_call(web_call_request: WebCallRequest):
    """Create a web call using Retell AI"""
    try:
        web_call_response = await retell_service.create_web_call(web_call_request.agent_id)
        if not web_call_response:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create web call"
            )
        
        return {
            "message": "Web call created successfully",
            "agent_id": web_call_response["agent_id"],
            "call_id": web_call_response.get("call_id"),
            "web_call_url": web_call_response.get("web_call_url"),
            "status": web_call_response["status"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating web call: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
