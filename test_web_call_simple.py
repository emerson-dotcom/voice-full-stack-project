#!/usr/bin/env python3
"""
Simple test script to create a web call and show how to join it properly
"""

import os
from retell import Retell

def test_web_call():
    """Create a web call and show how to join it"""
    
    # Get API key from environment
    retell_api_key = os.getenv("RETELL_API_KEY")
    if not retell_api_key:
        print("❌ RETELL_API_KEY not found in environment variables")
        print("Please set your Retell API key in the environment")
        return
    
    # Initialize Retell client
    client = Retell(api_key=retell_api_key)
    
    # Test agent ID
    agent_id = "agent_57257af75bf14eb03cfae03d48"
    
    try:
        print("🚀 Creating web call...")
        print(f"Agent ID: {agent_id}")
        print("-" * 50)
        
        # Create web call
        web_call_response = client.call.create_web_call(agent_id=agent_id)
        
        # Extract important fields
        call_id = getattr(web_call_response, 'call_id', None)
        access_token = getattr(web_call_response, 'access_token', None)
        
        print("✅ Web call created successfully!")
        print(f"Call ID: {call_id}")
        print(f"Access Token: {access_token}")
        print()
        
        print("🎯 HOW TO JOIN THE CALL:")
        print("=" * 50)
        print()
        print("❌ DON'T use the direct URL (it will show 'Page Not Found'):")
        print(f"   https://retellai.com/web-call?access_token={access_token}")
        print()
        print("✅ DO use the Retell Web SDK:")
        print("   1. Open the test-web-call.html file in your browser")
        print("   2. Paste the access token above")
        print("   3. Click 'Join Call'")
        print("   4. Allow microphone permissions")
        print("   5. The call will start automatically!")
        print()
        print("🔧 Alternative - Use in your React app:")
        print("   import { RetellWebClient } from 'retell-client-js-sdk';")
        print("   const client = new RetellWebClient();")
        print(f"   await client.startCall({{ accessToken: '{access_token}' }});")
        print()
        print("⚠️  IMPORTANT:")
        print("   • Join within 30 seconds of creation")
        print("   • The access token expires if not used promptly")
        print("   • You need microphone permissions")
        print()
        print("🧪 Test it now:")
        print("   1. Open test-web-call.html in your browser")
        print("   2. The access token is already filled in")
        print("   3. Click 'Join Call'")
        
    except Exception as e:
        print(f"❌ Error creating web call: {e}")
        print(f"Error type: {type(e).__name__}")

if __name__ == "__main__":
    test_web_call()
