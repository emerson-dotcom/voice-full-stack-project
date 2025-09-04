import httpx
import logging
from typing import Optional, Dict, Any
from app.core.config import settings
from app.models.call import CallTrigger
from app.services.agent_config_service import AgentConfigurationService
import json

logger = logging.getLogger(__name__)

class RetellService:
    def __init__(self):
        self.api_key = settings.retell_api_key
        self.base_url = "https://api.retellai.com"
        self.agent_config_service = AgentConfigurationService()
    
    async def initiate_call(self, call_trigger: CallTrigger) -> Optional[Dict[str, Any]]:
        """Initiate a voice call using Retell AI"""
        try:
            if not self.api_key:
                logger.error("Retell API key not configured")
                return None
            
            # Get the agent configuration
            agent_config = await self.agent_config_service.get_configuration(call_trigger.agent_config_id)
            if not agent_config:
                logger.error(f"Agent configuration {call_trigger.agent_config_id} not found")
                return None
            
            # Prepare the call payload
            call_payload = {
                "agent_id": self._get_agent_id_from_config(agent_config),
                "phone_number": call_trigger.phone_number,
                "metadata": {
                    "driver_name": call_trigger.driver_name,
                    "load_number": call_trigger.load_number,
                    "agent_config_id": call_trigger.agent_config_id
                }
            }
            
            # Make API call to Retell
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/v1/call",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json=call_payload,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    call_data = response.json()
                    logger.info(f"Successfully initiated call: {call_data.get('call_id')}")
                    return call_data
                else:
                    logger.error(f"Failed to initiate call: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error initiating call: {e}")
            return None
    
    def _get_agent_id_from_config(self, agent_config) -> str:
        """Extract or generate agent ID from configuration"""
        # This would typically be a pre-configured agent ID in Retell
        # For now, we'll use a default or generate one based on config
        return f"agent_{agent_config.id}_{agent_config.agent_name.lower().replace(' ', '_')}"
    
    async def get_call_status(self, call_id: str) -> Optional[Dict[str, Any]]:
        """Get the status of a call from Retell AI"""
        try:
            if not self.api_key:
                return None
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/v1/call/{call_id}",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to get call status: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting call status: {e}")
            return None
    
    async def end_call(self, call_id: str) -> bool:
        """End an active call"""
        try:
            if not self.api_key:
                return False
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/v1/call/{call_id}/end",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    logger.info(f"Successfully ended call: {call_id}")
                    return True
                else:
                    logger.error(f"Failed to end call: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error ending call: {e}")
            return False
    
    def process_webhook_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming webhook events from Retell AI"""
        try:
            event_type = event_data.get("event_type")
            
            if event_type == "call_started":
                return self._process_call_started(event_data)
            elif event_type == "call_ended":
                return self._process_call_ended(event_data)
            elif event_type == "transcript_updated":
                return self._process_transcript_updated(event_data)
            elif event_type == "agent_response":
                return self._process_agent_response(event_data)
            else:
                logger.warning(f"Unknown webhook event type: {event_type}")
                return {"status": "unknown_event"}
                
        except Exception as e:
            logger.error(f"Error processing webhook event: {e}")
            return {"status": "error", "message": str(e)}
    
    def _process_call_started(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process call started event"""
        call_id = event_data.get("call_id")
        logger.info(f"Call started: {call_id}")
        return {
            "status": "processed",
            "event": "call_started",
            "call_id": call_id
        }
    
    def _process_call_ended(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process call ended event"""
        call_id = event_data.get("call_id")
        duration = event_data.get("duration_seconds", 0)
        logger.info(f"Call ended: {call_id}, duration: {duration}s")
        return {
            "status": "processed",
            "event": "call_ended",
            "call_id": call_id,
            "duration": duration
        }
    
    def _process_transcript_updated(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process transcript updated event"""
        call_id = event_data.get("call_id")
        transcript = event_data.get("transcript", "")
        logger.info(f"Transcript updated for call: {call_id}")
        return {
            "status": "processed",
            "event": "transcript_updated",
            "call_id": call_id,
            "transcript_length": len(transcript)
        }
    
    def _process_agent_response(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process agent response event"""
        call_id = event_data.get("call_id")
        response_text = event_data.get("response_text", "")
        logger.info(f"Agent response for call: {call_id}")
        return {
            "status": "processed",
            "event": "agent_response",
            "call_id": call_id,
            "response_length": len(response_text)
        }
