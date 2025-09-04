#!/usr/bin/env python3
"""
Test script to verify datetime serialization fix
"""

import requests
import json
from datetime import datetime

def test_datetime_serialization():
    """Test that datetime objects are properly serialized"""
    print("🔍 Testing datetime serialization fix...")
    
    # Test data with datetime
    call_request = {
        "agent_config_id": 1,  # Assuming you have at least one agent config
        "driver_name": "Test Driver",
        "phone_number": "+1-555-123-4567",
        "load_number": "TEST-LOAD-001",
        "delivery_address": "123 Test Street, Test City, TC 12345",
        "expected_delivery_time": datetime.now().isoformat(),  # This should work now
        "special_instructions": "This is a test call with datetime"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/calls/trigger",
            json=call_request,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Datetime serialization fix successful!")
            print(f"   Call ID: {data.get('call_id')}")
            print(f"   Status: {data.get('status')}")
            return True
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_without_datetime():
    """Test without datetime to ensure basic functionality works"""
    print("\n🔍 Testing without datetime...")
    
    call_request = {
        "agent_config_id": 1,
        "driver_name": "Test Driver 2",
        "phone_number": "+1-555-987-6543",
        "load_number": "TEST-LOAD-002",
        "delivery_address": "456 Test Avenue, Test City, TC 54321",
        "special_instructions": "This is a test call without datetime"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/calls/trigger",
            json=call_request,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Call without datetime successful!")
            print(f"   Call ID: {data.get('call_id')}")
            print(f"   Status: {data.get('status')}")
            return True
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run datetime serialization tests"""
    print("🚀 Testing Datetime Serialization Fix...\n")
    
    # Test with datetime
    test_datetime_serialization()
    
    # Test without datetime
    test_without_datetime()
    
    print("\n🎉 Datetime serialization tests completed!")

if __name__ == "__main__":
    main()
