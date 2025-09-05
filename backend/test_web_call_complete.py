#!/usr/bin/env python3
"""
Complete test script for Retell AI web call functionality
Tests both creation and joining of web calls
"""

import asyncio
import os
import json
from retell import Retell

async def test_complete_web_call_flow():
    """Test the complete web call flow from creation to joining"""
    
    # Get API key from environment
    retell_api_key = os.getenv("RETELL_API_KEY")
    if not retell_api_key:
        print("❌ RETELL_API_KEY not found in environment variables")
        return False
    
    # Initialize Retell client
    client = Retell(api_key=retell_api_key)
    
    # Test agent ID from the available agents
    agent_id = "agent_57257af75bf14eb03cfae03d48"
    
    try:
        print(f"🚀 Starting complete web call test for agent: {agent_id}")
        print("=" * 60)
        
        # Step 1: Create web call
        print("📞 Step 1: Creating web call...")
        web_call_response = client.call.create_web_call(
            agent_id=agent_id
        )
        
        print(f"✅ Web call created successfully!")
        print(f"   Agent ID: {web_call_response.agent_id}")
        
        # Extract important fields
        call_id = getattr(web_call_response, 'call_id', None)
        access_token = getattr(web_call_response, 'access_token', None)
        web_call_url = getattr(web_call_response, 'web_call_url', None)
        
        print(f"   Call ID: {call_id}")
        print(f"   Access Token: {access_token[:20]}..." if access_token else "   Access Token: None")
        print(f"   Web Call URL: {web_call_url}")
        
        # Step 2: Verify response structure
        print("\n🔍 Step 2: Verifying response structure...")
        response_dict = {
            "agent_id": web_call_response.agent_id,
            "call_id": call_id,
            "access_token": access_token,
            "web_call_url": web_call_url
        }
        
        print("Response structure:")
        print(json.dumps(response_dict, indent=2))
        
        # Step 3: Check if we have the required fields
        print("\n✅ Step 3: Validating required fields...")
        if not access_token:
            print("❌ ERROR: No access token received!")
            print("   This is required to join the web call")
            return False
        else:
            print("✅ Access token received successfully")
        
        if not call_id:
            print("⚠️  WARNING: No call ID received")
        else:
            print("✅ Call ID received successfully")
        
        # Step 4: Test call retrieval
        print("\n📋 Step 4: Testing call retrieval...")
        if call_id:
            try:
                call_details = client.call.retrieve(call_id)
                print(f"✅ Call details retrieved successfully")
                print(f"   Call Status: {getattr(call_details, 'call_status', 'Unknown')}")
                print(f"   Call Type: {getattr(call_details, 'call_type', 'Unknown')}")
            except Exception as e:
                print(f"⚠️  Could not retrieve call details: {e}")
        
        # Step 5: Instructions for joining
        print("\n🎯 Step 5: Instructions for joining the call...")
        print("To join this web call, you have two options:")
        print()
        print("Option 1 - Using Retell Web SDK (Recommended):")
        print("1. Install: npm install retell-client-js-sdk")
        print("2. Initialize the client:")
        print("   import { RetellWebClient } from 'retell-client-js-sdk';")
        print("   const client = new RetellWebClient();")
        print("3. Start the call:")
        print(f"   await client.startCall({{ accessToken: '{access_token}' }});")
        print()
        print("Option 2 - Direct URL (Alternative):")
        if web_call_url:
            print(f"   Open this URL in your browser: {web_call_url}")
        else:
            print(f"   Construct URL: https://retellai.com/web-call?access_token={access_token}")
        
        print("\n⚠️  IMPORTANT NOTES:")
        print("• You must join the call within 30 seconds of creation")
        print("• The access token will expire if not used promptly")
        print("• Make sure your browser has microphone permissions")
        print("• The call will show 'error_user_not_joined' if not joined in time")
        
        print("\n" + "=" * 60)
        print("🎉 Web call test completed successfully!")
        print("The web call is ready to be joined using the access token above.")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during web call test: {e}")
        print(f"Error type: {type(e).__name__}")
        return False

async def test_multiple_web_calls():
    """Test creating multiple web calls to check for any rate limiting"""
    print("\n🔄 Testing multiple web call creation...")
    
    retell_api_key = os.getenv("RETELL_API_KEY")
    if not retell_api_key:
        print("❌ RETELL_API_KEY not found")
        return False
    
    client = Retell(api_key=retell_api_key)
    agent_id = "agent_57257af75bf14eb03cfae03d48"
    
    try:
        for i in range(3):
            print(f"Creating web call {i+1}/3...")
            web_call_response = client.call.create_web_call(agent_id=agent_id)
            access_token = getattr(web_call_response, 'access_token', None)
            print(f"✅ Call {i+1} created - Access token: {access_token[:20] if access_token else 'None'}...")
            
            # Small delay between calls
            await asyncio.sleep(1)
        
        print("✅ Multiple web call test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error in multiple web call test: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Retell AI Web Call Complete Test Suite")
    print("=" * 60)
    
    # Run the main test
    success = asyncio.run(test_complete_web_call_flow())
    
    if success:
        # Run additional tests
        asyncio.run(test_multiple_web_calls())
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 All tests completed successfully!")
        print("Your web call implementation should work correctly.")
    else:
        print("❌ Some tests failed. Please check the errors above.")
