#!/usr/bin/env python3
"""
Test script for webhook functionality
This script tests the webhook endpoint to ensure it's working correctly
"""

import requests
import json
from datetime import datetime

def test_webhook_endpoint():
    """Test the webhook endpoint accessibility"""
    print("🔍 Testing webhook endpoint accessibility...")
    
    try:
        # Test GET endpoint (test endpoint)
        response = requests.get("http://localhost:8000/api/v1/webhooks/retell")
        if response.status_code == 200:
            data = response.json()
            print("✅ Webhook endpoint is accessible!")
            print(f"   Message: {data.get('message')}")
            print(f"   Status: {data.get('status')}")
            return True
        else:
            print(f"❌ Webhook endpoint not accessible: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error accessing webhook endpoint: {e}")
        return False

def test_webhook_processing():
    """Test webhook data processing"""
    print("\n🔍 Testing webhook data processing...")
    
    # Simulate a Retell AI webhook payload
    test_webhook_data = {
        "call_id": "test_retell_call_123",
        "call_status": "ended",
        "call_summary": "Test call completed successfully",
        "end_time": datetime.now().isoformat(),
        "duration_seconds": 120
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/webhooks/retell",
            json=test_webhook_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Webhook processing successful!")
            print(f"   Message: {data.get('message')}")
            return True
        else:
            print(f"❌ Webhook processing failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing webhook processing: {e}")
        return False

def main():
    """Run webhook tests"""
    print("🚀 Starting Webhook Tests...\n")
    
    # Test endpoint accessibility
    endpoint_ok = test_webhook_endpoint()
    
    if endpoint_ok:
        # Test webhook processing
        test_webhook_processing()
    
    print("\n📋 Webhook Setup Instructions:")
    print("1. Make sure your backend server is running: python simple_main.py")
    print("2. Go to https://dashboard.retellai.com/settings/webhooks")
    print("3. Add webhook URL: http://localhost:8000/api/v1/webhooks/retell")
    print("4. Test with a real call to see webhook notifications!")
    
    print("\n🔍 To verify webhook is working:")
    print("1. Trigger a test call from the frontend")
    print("2. Check backend logs for webhook notifications")
    print("3. Check the call status in your database")

if __name__ == "__main__":
    main()
