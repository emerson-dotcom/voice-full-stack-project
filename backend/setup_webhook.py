#!/usr/bin/env python3
"""
Setup script to configure localhost webhook for Retell AI
This script helps you set up the webhook URL in your .env file
"""

import os
from pathlib import Path

def setup_webhook():
    """Set up localhost webhook URL in .env file"""
    print("🔧 Setting up localhost webhook for Retell AI...\n")
    
    # Check if .env file exists
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ .env file not found!")
        print("Please create a .env file first with your Supabase and Retell AI credentials.")
        print("You can copy from env.template:")
        print("cp env.template .env")
        return False
    
    # Read current .env file
    with open(env_file, 'r') as f:
        lines = f.readlines()
    
    # Check if RETELL_WEBHOOK_URL already exists
    webhook_line_index = None
    for i, line in enumerate(lines):
        if line.startswith('RETELL_WEBHOOK_URL='):
            webhook_line_index = i
            break
    
    webhook_url = "http://localhost:8000/api/v1/webhooks/retell"
    
    if webhook_line_index is not None:
        # Update existing line
        lines[webhook_line_index] = f"RETELL_WEBHOOK_URL={webhook_url}\n"
        print(f"✅ Updated existing RETELL_WEBHOOK_URL to: {webhook_url}")
    else:
        # Add new line
        lines.append(f"RETELL_WEBHOOK_URL={webhook_url}\n")
        print(f"✅ Added RETELL_WEBHOOK_URL: {webhook_url}")
    
    # Write back to .env file
    with open(env_file, 'w') as f:
        f.writelines(lines)
    
    print("\n📋 Next steps:")
    print("1. Make sure your backend server is running on port 8000")
    print("2. Go to https://dashboard.retellai.com/settings/webhooks")
    print(f"3. Add this webhook URL: {webhook_url}")
    print("4. Test a call to see webhook notifications!")
    
    print("\n🔍 To test the webhook:")
    print("1. Start your backend: python simple_main.py")
    print("2. Trigger a test call from the frontend")
    print("3. Check the backend logs for webhook notifications")
    
    return True

if __name__ == "__main__":
    setup_webhook()
