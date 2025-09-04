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

# Global instance
supabase_client = None

def get_supabase_client() -> SimpleSupabaseClient:
    """Get the global Supabase client instance"""
    global supabase_client
    if supabase_client is None:
        supabase_client = SimpleSupabaseClient()
    return supabase_client
