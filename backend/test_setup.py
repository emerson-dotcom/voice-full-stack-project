#!/usr/bin/env python3
"""
Simple test script to verify the backend setup
Run this to check if all dependencies and configurations are working
"""

import sys
import os

def test_imports():
    """Test if all required packages can be imported"""
    print("Testing imports...")
    
    try:
        import fastapi
        print("✓ FastAPI imported successfully")
    except ImportError as e:
        print(f"✗ FastAPI import failed: {e}")
        return False
    
    try:
        import uvicorn
        print("✓ Uvicorn imported successfully")
    except ImportError as e:
        print(f"✗ Uvicorn import failed: {e}")
        return False
    
    try:
        import supabase
        print("✓ Supabase imported successfully")
    except ImportError as e:
        print(f"✗ Supabase import failed: {e}")
        return False
    
    try:
        import httpx
        print("✓ HTTPX imported successfully")
    except ImportError as e:
        print(f"✗ HTTPX import failed: {e}")
        return False
    
    try:
        import pydantic
        print("✓ Pydantic imported successfully")
    except ImportError as e:
        print(f"✗ Pydantic import failed: {e}")
        return False
    
    return True

def test_app_imports():
    """Test if our app modules can be imported"""
    print("\nTesting app imports...")
    
    try:
        from app.core.config import settings
        print("✓ App config imported successfully")
    except ImportError as e:
        print(f"✗ App config import failed: {e}")
        return False
    
    try:
        from app.models.agent_config import AgentConfiguration
        print("✓ Agent configuration model imported successfully")
    except ImportError as e:
        print(f"✗ Agent configuration model import failed: {e}")
        return False
    
    try:
        from app.models.call import CallTrigger
        print("✓ Call models imported successfully")
    except ImportError as e:
        print(f"✗ Call models import failed: {e}")
        return False
    
    try:
        from app.services.agent_config_service import AgentConfigurationService
        print("✓ Agent configuration service imported successfully")
    except ImportError as e:
        print(f"✗ Agent configuration service import failed: {e}")
        return False
    
    try:
        from app.routers.agent_config import router as agent_config_router
        print("✓ Agent configuration router imported successfully")
    except ImportError as e:
        print(f"✗ Agent configuration router import failed: {e}")
        return False
    
    return True

def test_environment():
    """Test environment configuration"""
    print("\nTesting environment configuration...")
    
    # Check if .env file exists
    if os.path.exists('.env'):
        print("✓ .env file found")
    else:
        print("⚠ .env file not found (you may need to create one from env.template)")
    
    # Check if env.template exists
    if os.path.exists('env.template'):
        print("✓ env.template file found")
    else:
        print("✗ env.template file not found")
    
    # Check if database schema exists
    if os.path.exists('database_schema.sql'):
        print("✓ database_schema.sql found")
    else:
        print("✗ database_schema.sql not found")
    
    return True

def main():
    """Main test function"""
    print("Voice Agent Admin Backend - Setup Test")
    print("=" * 50)
    
    # Test imports
    if not test_imports():
        print("\n❌ Import tests failed. Please install missing dependencies:")
        print("   pip install -r requirements.txt")
        return False
    
    # Test app imports
    if not test_app_imports():
        print("\n❌ App import tests failed. Check your app structure.")
        return False
    
    # Test environment
    test_environment()
    
    print("\n" + "=" * 50)
    print("✅ Setup test completed successfully!")
    print("\nNext steps:")
    print("1. Create a .env file from env.template")
    print("2. Configure your Supabase and Retell AI credentials")
    print("3. Run the database schema: database_schema.sql")
    print("4. Start the server: python main.py")
    print("\nThe API will be available at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/docs")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
