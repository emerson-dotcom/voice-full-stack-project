#!/usr/bin/env python3
"""
Test script for call triggering endpoints
Run this after starting the backend server to test the new endpoints
"""

import requests
import json
from datetime import datetime

# Backend URL
BASE_URL = "http://localhost:8000/api/v1"

def test_health_check():
    """Test health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL.replace('/api/v1', '')}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_get_agent_configurations():
    """Test getting agent configurations"""
    print("🔍 Testing get agent configurations...")
    try:
        response = requests.get(f"{BASE_URL}/agent-configurations")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {data.get('count', 0)} agent configurations")
            return data.get('configurations', [])
        else:
            print(f"❌ Failed to get agent configurations: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error getting agent configurations: {e}")
        return []

def test_trigger_call(agent_config_id):
    """Test triggering a call"""
    print(f"🔍 Testing trigger call with agent config {agent_config_id}...")
    
    call_request = {
        "agent_config_id": agent_config_id,
        "driver_name": "Test Driver",
        "phone_number": "+1-555-123-4567",
        "load_number": "TEST-LOAD-001",
        "delivery_address": "123 Test Street, Test City, TC 12345",
        "expected_delivery_time": datetime.now().isoformat(),
        "special_instructions": "This is a test call"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/calls/trigger",
            json=call_request,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Call triggered successfully!")
            print(f"   Call ID: {data.get('call_id')}")
            print(f"   Status: {data.get('status')}")
            return data.get('call_id')
        else:
            print(f"❌ Failed to trigger call: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error triggering call: {e}")
        return None

def test_get_call_records():
    """Test getting call records"""
    print("🔍 Testing get call records...")
    try:
        response = requests.get(f"{BASE_URL}/calls")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {data.get('count', 0)} call records")
            return data.get('call_records', [])
        else:
            print(f"❌ Failed to get call records: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error getting call records: {e}")
        return []

def test_get_specific_call(call_id):
    """Test getting a specific call record"""
    print(f"🔍 Testing get specific call {call_id}...")
    try:
        response = requests.get(f"{BASE_URL}/calls/{call_id}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved call record successfully")
            print(f"   Driver: {data.get('driver_name')}")
            print(f"   Status: {data.get('status')}")
            return data
        else:
            print(f"❌ Failed to get call record: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting call record: {e}")
        return None

def main():
    """Run all tests"""
    print("🚀 Starting call endpoint tests...\n")
    
    # Test health check
    if not test_health_check():
        print("❌ Backend server is not running. Please start it first.")
        return
    
    print()
    
    # Test getting agent configurations
    agent_configs = test_get_agent_configurations()
    if not agent_configs:
        print("❌ No agent configurations found. Please create one first.")
        return
    
    print()
    
    # Use the first agent configuration for testing
    agent_config = agent_configs[0]
    agent_config_id = agent_config['id']
    print(f"📋 Using agent configuration: {agent_config['agent_name']} (ID: {agent_config_id})")
    print()
    
    # Test triggering a call
    call_id = test_trigger_call(agent_config_id)
    if not call_id:
        print("❌ Failed to trigger call. Stopping tests.")
        return
    
    print()
    
    # Test getting call records
    call_records = test_get_call_records()
    print()
    
    # Test getting specific call
    test_get_specific_call(call_id)
    
    print("\n🎉 All tests completed!")

if __name__ == "__main__":
    main()
