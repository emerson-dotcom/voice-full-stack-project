from supabase import create_client, Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.client: Client = None
        self._connect()
    
    def _connect(self):
        """Initialize Supabase connection"""
        try:
            if not settings.supabase_url or not settings.supabase_key:
                logger.warning("Supabase credentials not configured")
                return
            
            self.client = create_client(settings.supabase_url, settings.supabase_key)
            logger.info("Successfully connected to Supabase")
        except Exception as e:
            logger.error(f"Failed to connect to Supabase: {e}")
            self.client = None
    
    def get_client(self) -> Client:
        """Get the Supabase client instance"""
        if not self.client:
            self._connect()
        return self.client
    
    def is_connected(self) -> bool:
        """Check if database connection is active"""
        return self.client is not None

# Global database manager instance
db_manager = DatabaseManager()

def get_db() -> Client:
    """Dependency to get database client"""
    return db_manager.get_client()
