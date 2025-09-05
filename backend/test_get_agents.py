#!/usr/bin/env python3
"""
Test script to get available agents from Retell AI
"""

import asyncio
from retell import Retell
from app.core.config import settings

async def test_get_agents():
    """Get all available agents from Retell AI"""
    
    # Initialize Retell client
    client = Retell(
        api_key=settings.retell_api_key,
    )
    
    try:
        print("Fetching agents from Retell AI...")
        
        # Get all agents
        agents_response = client.agent.list()
        
        print(f"Found {len(agents_response)} agents:")
        print("-" * 50)
        
        for agent in agents_response:
            print(f"Agent ID: {agent.agent_id}")
            print(f"Name: {agent.agent_name}")
            print(f"Voice ID: {agent.voice_id}")
            print(f"Status: {getattr(agent, 'status', 'Unknown')}")
            print("-" * 50)
        
        return agents_response
        
    except Exception as e:
        print(f"Error fetching agents: {e}")
        return None

if __name__ == "__main__":
    # Run the test
    agents = asyncio.run(test_get_agents())
    
    if agents:
        print(f"\n✅ Successfully retrieved {len(agents)} agents!")
        if agents:
            print(f"\nFirst agent ID for testing: {agents[0].agent_id}")
    else:
        print("\n❌ Failed to retrieve agents!")
