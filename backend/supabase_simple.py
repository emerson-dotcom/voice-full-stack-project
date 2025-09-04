"""
Simple Supabase integration using direct HTTP requests
This avoids the websockets.asyncio dependency issue
"""

import os
import httpx
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

# Load environment variables
load_dotenv()

class SimpleSupabaseClient:
    def __init__(self):
        self.url: str = os.getenv("SUPABASE_URL")
        self.key: str = os.getenv("SUPABASE_ANON_KEY")
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables")
        
        self.base_url = f"{self.url}/rest/v1"
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
    
    def create_agent_configuration(self, config_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new agent configuration in Supabase"""
        try:
            # Prepare data for insertion
            insert_data = {
                "agent_name": config_data["agent_name"],
                "greeting": config_data["greeting"],
                "primary_objective": config_data["primary_objective"],
                "conversation_flow": config_data["conversation_flow"],
                "fallback_responses": config_data["fallback_responses"],
                "call_ending_conditions": config_data["call_ending_conditions"],
                "is_active": config_data.get("is_active", True)
            }
            
            with httpx.Client() as client:
                response = client.post(
                    f"{self.base_url}/agent_configurations",
                    headers=self.headers,
                    json=insert_data
                )
                response.raise_for_status()
                result = response.json()
                
                if result:
                    return result[0]
                else:
                    raise Exception("Failed to create agent configuration")
                
        except Exception as e:
            print(f"Error creating agent configuration: {e}")
            raise
    
    def get_agent_configurations(self) -> List[Dict[str, Any]]:
        """Get all agent configurations from Supabase"""
        try:
            with httpx.Client() as client:
                response = client.get(
                    f"{self.base_url}/agent_configurations",
                    headers=self.headers,
                    params={"order": "created_at.desc"}
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            print(f"Error fetching agent configurations: {e}")
            raise
    
    def get_agent_configuration(self, config_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific agent configuration by ID"""
        try:
            with httpx.Client() as client:
                response = client.get(
                    f"{self.base_url}/agent_configurations",
                    headers=self.headers,
                    params={"id": f"eq.{config_id}"}
                )
                response.raise_for_status()
                result = response.json()
                return result[0] if result else None
        except Exception as e:
            print(f"Error fetching agent configuration {config_id}: {e}")
            raise
    
    def update_agent_configuration(self, config_id: int, config_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing agent configuration"""
        try:
            # Prepare data for update
            update_data = {
                "agent_name": config_data["agent_name"],
                "greeting": config_data["greeting"],
                "primary_objective": config_data["primary_objective"],
                "conversation_flow": config_data["conversation_flow"],
                "fallback_responses": config_data["fallback_responses"],
                "call_ending_conditions": config_data["call_ending_conditions"],
                "is_active": config_data.get("is_active", True)
            }
            
            with httpx.Client() as client:
                response = client.patch(
                    f"{self.base_url}/agent_configurations",
                    headers=self.headers,
                    params={"id": f"eq.{config_id}"},
                    json=update_data
                )
                response.raise_for_status()
                result = response.json()
                
                if result:
                    return result[0]
                else:
                    raise Exception("Failed to update agent configuration")
                
        except Exception as e:
            print(f"Error updating agent configuration {config_id}: {e}")
            raise
    
    def delete_agent_configuration(self, config_id: int) -> Dict[str, Any]:
        """Delete an agent configuration"""
        try:
            # First get the configuration to return it
            config = self.get_agent_configuration(config_id)
            if not config:
                raise Exception("Agent configuration not found")
            
            # Delete the configuration
            with httpx.Client() as client:
                response = client.delete(
                    f"{self.base_url}/agent_configurations",
                    headers=self.headers,
                    params={"id": f"eq.{config_id}"}
                )
                response.raise_for_status()
                
                return config
                
        except Exception as e:
            print(f"Error deleting agent configuration {config_id}: {e}")
            raise
    
    # Call Management Methods
    def create_call_record(self, call_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new call record in Supabase"""
        try:
            # Prepare data for insertion
            insert_data = {
                "call_id": call_data["call_id"],
                "agent_config_id": call_data["agent_config_id"],
                "driver_name": call_data["driver_name"],
                "phone_number": call_data["phone_number"],
                "load_number": call_data["load_number"],
                "delivery_address": call_data.get("delivery_address"),
                "expected_delivery_time": call_data.get("expected_delivery_time"),
                "special_instructions": call_data.get("special_instructions"),
                "status": call_data.get("status", "initiated"),
                "retell_call_id": call_data.get("retell_call_id"),
                "start_time": call_data.get("start_time"),
                "end_time": call_data.get("end_time"),
                "duration_seconds": call_data.get("duration_seconds"),
                "call_summary": call_data.get("call_summary")
            }
            
            with httpx.Client() as client:
                response = client.post(
                    f"{self.base_url}/call_records",
                    headers=self.headers,
                    json=insert_data
                )
                response.raise_for_status()
                result = response.json()
                
                if result:
                    return result[0]
                else:
                    raise Exception("Failed to create call record")
                
        except Exception as e:
            print(f"Error creating call record: {e}")
            raise
    
    def get_call_records(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get call records from Supabase with pagination"""
        try:
            with httpx.Client() as client:
                response = client.get(
                    f"{self.base_url}/call_records",
                    headers=self.headers,
                    params={
                        "order": "created_at.desc",
                        "limit": limit,
                        "offset": offset
                    }
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            print(f"Error fetching call records: {e}")
            raise
    
    def get_call_record(self, call_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific call record by call_id"""
        try:
            with httpx.Client() as client:
                response = client.get(
                    f"{self.base_url}/call_records",
                    headers=self.headers,
                    params={"call_id": f"eq.{call_id}"}
                )
                response.raise_for_status()
                result = response.json()
                return result[0] if result else None
        except Exception as e:
            print(f"Error fetching call record {call_id}: {e}")
            raise
    
    def update_call_record(self, call_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing call record"""
        try:
            with httpx.Client() as client:
                response = client.patch(
                    f"{self.base_url}/call_records",
                    headers=self.headers,
                    params={"call_id": f"eq.{call_id}"},
                    json=update_data
                )
                response.raise_for_status()
                result = response.json()
                
                if result:
                    return result[0]
                else:
                    raise Exception("Failed to update call record")
                
        except Exception as e:
            print(f"Error updating call record {call_id}: {e}")
            raise
    
    def get_call_records_by_agent(self, agent_config_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        """Get call records for a specific agent configuration"""
        try:
            with httpx.Client() as client:
                response = client.get(
                    f"{self.base_url}/call_records",
                    headers=self.headers,
                    params={
                        "agent_config_id": f"eq.{agent_config_id}",
                        "order": "created_at.desc",
                        "limit": limit
                    }
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            print(f"Error fetching call records for agent {agent_config_id}: {e}")
            raise
    
    def get_call_records_by_status(self, status: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get call records by status"""
        try:
            with httpx.Client() as client:
                response = client.get(
                    f"{self.base_url}/call_records",
                    headers=self.headers,
                    params={
                        "status": f"eq.{status}",
                        "order": "created_at.desc",
                        "limit": limit
                    }
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            print(f"Error fetching call records with status {status}: {e}")
            raise

# Global instance
supabase_client = None

def get_supabase_client() -> SimpleSupabaseClient:
    """Get the global Supabase client instance"""
    global supabase_client
    if supabase_client is None:
        supabase_client = SimpleSupabaseClient()
    return supabase_client
