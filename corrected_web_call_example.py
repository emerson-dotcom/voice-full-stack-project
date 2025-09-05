#!/usr/bin/env python3
"""
CORRECTED EXAMPLE: How to create a web call using Retell AI
This fixes the syntax issues in the user's code snippet
"""

import os
from retell import Retell

def create_web_call_example():
    """Corrected example of creating a web call"""
    
    # Initialize Retell client with your API key
    client = Retell(
        api_key="YOUR_RETELL_API_KEY",  # Replace with your actual API key
    )
    
    # Create web call - CORRECTED METHOD NAME
    web_call_response = client.call.create_web_call(
        agent_id="oBeDLoLOeuAbiuaMFXRtDOLriTJ5tSxD",
    )
    
    # Print the response
    print(f"Agent ID: {web_call_response.agent_id}")
    print(f"Call ID: {web_call_response.call_id}")
    print(f"Access Token: {web_call_response.access_token}")
    
    return web_call_response

if __name__ == "__main__":
    # Example usage
    try:
        response = create_web_call_example()
        print("✅ Web call created successfully!")
    except Exception as e:
        print(f"❌ Error: {e}")
