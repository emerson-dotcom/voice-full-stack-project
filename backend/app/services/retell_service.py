import httpx
import logging
from typing import Optional, Dict, Any
from app.core.config import settings
from app.models.call import CallTrigger
from app.services.agent_config_service import AgentConfigurationService
import json
from retell import Retell

logger = logging.getLogger(__name__)

class RetellService:
    def __init__(self):
        self.api_key = settings.retell_api_key
        self.base_url = "https://api.retellai.com"
        self.agent_config_service = AgentConfigurationService()
        # Initialize Retell client
        self.client = Retell(api_key=self.api_key) if self.api_key else None
    
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
    
    async def get_all_agents(self) -> Optional[Dict[str, Any]]:
        """Get all agents from Retell AI"""
        try:
            if not self.api_key:
                logger.error("Retell API key not configured")
                return None
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/v1/agent",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    agents_data = response.json()
                    logger.info(f"Successfully retrieved {len(agents_data.get('data', []))} agents")
                    return agents_data
                else:
                    logger.error(f"Failed to get agents: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting agents: {e}")
            return None
    
    async def create_agent(self, agent_config: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new agent in Retell AI"""
        try:
            if not self.api_key:
                logger.error("Retell API key not configured")
                return None
            
            # Prepare the agent payload for Retell AI
            agent_payload = {
                "response_engine": {
                    "llm_id": agent_config.get("llm_id", "llm_234sdertfsdsfsdf"),
                    "type": agent_config.get("response_engine", "retell-llm")
                },
                "voice_id": agent_config.get("voice_id", "11labs-Adrian"),
                "agent_name": agent_config.get("agent_name", "New Agent"),
                "greeting": agent_config.get("greeting", "Hello, this is your AI assistant."),
                "primary_objective": agent_config.get("primary_objective", "Assist with your request."),
                "conversation_flow": agent_config.get("conversation_flow", []),
                "fallback_responses": agent_config.get("fallback_responses", []),
                "call_ending_conditions": agent_config.get("call_ending_conditions", [])
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/v1/agent",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json=agent_payload,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    agent_data = response.json()
                    logger.info(f"Successfully created agent: {agent_data.get('agent_id')}")
                    return agent_data
                else:
                    logger.error(f"Failed to create agent: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error creating agent: {e}")
            return None
    
    async def create_web_call(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Create a web call using the official Retell SDK"""
        try:
            if not self.client:
                logger.error("Retell client not initialized - API key not configured")
                return None
            
            # Use the official Retell SDK to create web call
            web_call_response = self.client.call.create_web_call(
                agent_id=agent_id
            )
            
            logger.info(f"Successfully created web call for agent: {agent_id}")
            logger.info(f"Web call response agent_id: {web_call_response.agent_id}")
            
            return {
                "agent_id": web_call_response.agent_id,
                "call_id": getattr(web_call_response, 'call_id', None),
                "status": "created",
                "web_call_url": getattr(web_call_response, 'web_call_url', None)
            }
            
        except Exception as e:
            logger.error(f"Error creating web call: {e}")
            return None