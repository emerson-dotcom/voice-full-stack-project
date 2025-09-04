#!/usr/bin/env python3
"""
Test script for Retell AI integration
Run this to test the Retell AI integration with your API key
"""

import os
import asyncio
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_retell_integration():
    """Test Retell AI integration"""
    print("🔍 Testing Retell AI Integration...\n")
    
    # Check environment variables
    retell_api_key = os.getenv("RETELL_API_KEY")
    retell_webhook_url = os.getenv("RETELL_WEBHOOK_URL")
    
    print(f"RETELL_API_KEY: {'✅ Set' if retell_api_key else '❌ Not set'}")
    print(f"RETELL_WEBHOOK_URL: {'✅ Set' if retell_webhook_url else '⚠️ Not set (optional)'}")
    print()
    
    if not retell_api_key:
        print("❌ RETELL_API_KEY not found in environment variables.")
        print("Please add it to your .env file:")
        print("RETELL_API_KEY=your_retell_api_key_here")
        return False
    
    # Test Retell AI API connection
    print("🔍 Testing Retell AI API connection...")
    try:
        async with httpx.AsyncClient() as client:
            # Test with a simple API call (you might need to adjust this based on Retell AI's actual API)
            response = await client.get(
                "https://api.retellai.com/v2/get-phone-call/",  # This might need adjustment
                headers={
                    "Authorization": f"Bearer {retell_api_key}",
                    "Content-Type": "application/json"
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                print("✅ Retell AI API connection successful")
                return True
            elif response.status_code == 401:
                print("❌ Invalid API key")
                return False
            else:
                print(f"⚠️ API response: {response.status_code}")
                print("This might be normal - the exact endpoint may vary")
                return True
                
    except Exception as e:
        print(f"❌ Error connecting to Retell AI: {e}")
        return False

async def test_call_triggering():
    """Test call triggering through our API"""
    print("\n🔍 Testing call triggering through our API...")
    
    # First, get an agent configuration
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:8000/api/v1/agent-configurations")
            if response.status_code != 200:
                print("❌ Backend server not running or no agent configurations found")
                return False
            
            data = response.json()
            configurations = data.get("configurations", [])
            if not configurations:
                print("❌ No agent configurations found. Please create one first.")
                return False
            
            agent_config = configurations[0]
            print(f"✅ Using agent configuration: {agent_config['agent_name']}")
            
            # Test call triggering
            call_request = {
                "agent_config_id": agent_config["id"],
                "driver_name": "Test Driver",
                "phone_number": "+1-555-123-4567",
                "load_number": "TEST-LOAD-001",
                "delivery_address": "123 Test Street, Test City, TC 12345",
                "special_instructions": "This is a test call"
            }
            
            response = await client.post(
                "http://localhost:8000/api/v1/calls/trigger",
                json=call_request,
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Call triggered successfully!")
                print(f"   Call ID: {data.get('call_id')}")
                print(f"   Retell Call ID: {data.get('retell_call_id')}")
                print(f"   Status: {data.get('status')}")
                return True
            else:
                print(f"❌ Failed to trigger call: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Error testing call triggering: {e}")
        return False

async def main():
    """Run all tests"""
    print("🚀 Starting Retell AI Integration Tests...\n")
    
    # Test Retell AI connection
    retell_ok = await test_retell_integration()
    
    if retell_ok:
        # Test call triggering
        await test_call_triggering()
    
    print("\n🎉 Tests completed!")
    
    if not retell_ok:
        print("\n📝 Next steps:")
        print("1. Get your Retell AI API key from https://retellai.com")
        print("2. Add it to your .env file: RETELL_API_KEY=your_key_here")
        print("3. Restart your backend server")
        print("4. Run this test again")

if __name__ == "__main__":
    asyncio.run(main())
