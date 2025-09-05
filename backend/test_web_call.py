#!/usr/bin/env python3
"""
Test script for Retell AI web call functionality
"""

import asyncio
import os
from retell import Retell
from app.core.config import settings

async def test_web_call():
    """Test the web call functionality with the provided agent ID"""
    
    # Initialize Retell client
    client = Retell(
        api_key=settings.retell_api_key,
    )
    
    # Test agent ID from the available agents
    agent_id = "agent_57257af75bf14eb03cfae03d48"
    
    try:
        print(f"Creating web call for agent: {agent_id}")
        
        # Create web call
        web_call_response = client.call.create_web_call(
            agent_id=agent_id,
        )
        
        print(f"Web call response agent_id: {web_call_response.agent_id}")
        print(f"Full response: {web_call_response}")
        
        # Print additional attributes if available
        if hasattr(web_call_response, 'call_id'):
            print(f"Call ID: {web_call_response.call_id}")
        
        if hasattr(web_call_response, 'web_call_url'):
            print(f"Web Call URL: {web_call_response.web_call_url}")
        
        return web_call_response
        
    except Exception as e:
        print(f"Error creating web call: {e}")
        return None

if __name__ == "__main__":
    # Run the test
    result = asyncio.run(test_web_call())
    
    if result:
        print("\n✅ Web call test completed successfully!")
        print(f"Agent ID: {result.agent_id}")
    else:
        print("\n❌ Web call test failed!")
