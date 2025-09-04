from pydantic import BaseModel, Field
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    # Supabase Configuration
    supabase_url: str = Field(default="https://phjwkhunqrsrxujkwgot.supabase.co")
    supabase_key: str = Field(default="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoandraHVucXJzcnh1amt3Z290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMjA2NzcsImV4cCI6MjA3MjU5NjY3N30.hxb6Gv2D8SLK7BxtDWtxMK-beMXYiQQDxAhgIsrFiiE")
    
    # Retell AI Configuration
    retell_api_key: str = Field(default="key_7a79962d3b29d3a33bf65ad316ec")
    retell_webhook_url: str = Field(default="")
    
    # Application Configuration
    app_name: str = Field(default="Voice Agent Admin")
    debug: bool = Field(default=False)
    
    # Database Configuration
    database_url: str = Field(default="")
    
    class Config:
        env_file = ".env"

# Initialize settings with environment variables
settings = Settings(
    supabase_url=os.getenv("SUPABASE_URL", "https://phjwkhunqrsrxujkwgot.supabase.co"),
    supabase_key=os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoandraHVucXJzcnh1amt3Z290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMjA2NzcsImV4cCI6MjA3MjU5NjY3N30.hxb6Gv2D8SLK7BxtDWtxMK-beMXYiQQDxAhgIsrFiiE"),
    retell_api_key=os.getenv("RETELL_API_KEY", "key_7a79962d3b29d3a33bf65ad316ec"),
    retell_webhook_url=os.getenv("RETELL_WEBHOOK_URL", ""),
    debug=os.getenv("DEBUG", "False").lower() == "true",
    database_url=os.getenv("DATABASE_URL", "")
)
