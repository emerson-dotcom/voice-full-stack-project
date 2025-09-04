from typing import List, Optional
from app.database.connection import get_db
from app.models.agent_config import AgentConfiguration, AgentConfigurationUpdate
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class AgentConfigurationService:
    def __init__(self):
        self.table_name = "agent_configurations"
    
    async def create_configuration(self, config: AgentConfiguration) -> Optional[AgentConfiguration]:
        """Create a new agent configuration"""
        try:
            db = get_db()
            if not db:
                logger.error("Database connection not available")
                return None
            
            # Prepare data for insertion
            config_data = config.dict(exclude={'id', 'created_at', 'updated_at'})
            config_data['created_at'] = datetime.now(datetime.timezone.utc).isoformat()
            config_data['updated_at'] = datetime.now(datetime.timezone.utc).isoformat()
            
            # Insert into Supabase
            result = db.table(self.table_name).insert(config_data).execute()
            
            if result.data:
                created_config = result.data[0]
                logger.info(f"Created agent configuration: {created_config['id']}")
                return AgentConfiguration(**created_config)
            
            return None
            
        except Exception as e:
            logger.error(f"Error creating agent configuration: {e}")
            return None
    
    async def get_configuration(self, config_id: int) -> Optional[AgentConfiguration]:
        """Get agent configuration by ID"""
        try:
            db = get_db()
            if not db:
                return None
            
            result = db.table(self.table_name).select("*").eq("id", config_id).execute()
            
            if result.data:
                return AgentConfiguration(**result.data[0])
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting agent configuration {config_id}: {e}")
            return None
    
    async def get_all_configurations(self) -> List[AgentConfiguration]:
        """Get all agent configurations"""
        try:
            db = get_db()
            if not db:
                return []
            
            result = db.table(self.table_name).select("*").order("created_at", desc=True).execute()
            
            if result.data:
                return [AgentConfiguration(**config) for config in result.data]
            
            return []
            
        except Exception as e:
            logger.error(f"Error getting all agent configurations: {e}")
            return []
    
    async def get_active_configuration(self) -> Optional[AgentConfiguration]:
        """Get the currently active agent configuration"""
        try:
            db = get_db()
            if not db:
                return None
            
            result = db.table(self.table_name).select("*").eq("is_active", True).single().execute()
            
            if result.data:
                return AgentConfiguration(**result.data)
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting active agent configuration: {e}")
            return None
    
    async def update_configuration(self, config_id: int, updates: AgentConfigurationUpdate) -> Optional[AgentConfiguration]:
        """Update an existing agent configuration"""
        try:
            db = get_db()
            if not db:
                return None
            
            # Prepare update data
            update_data = updates.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.now(datetime.timezone.utc).isoformat()
            
            # Update in Supabase
            result = db.table(self.table_name).update(update_data).eq("id", config_id).execute()
            
            if result.data:
                updated_config = result.data[0]
                logger.info(f"Updated agent configuration: {config_id}")
                return AgentConfiguration(**updated_config)
            
            return None
            
        except Exception as e:
            logger.error(f"Error updating agent configuration {config_id}: {e}")
            return None
    
    async def delete_configuration(self, config_id: int) -> bool:
        """Delete an agent configuration"""
        try:
            db = get_db()
            if not db:
                return False
            
            result = db.table(self.table_name).delete().eq("id", config_id).execute()
            
            if result.data:
                logger.info(f"Deleted agent configuration: {config_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting agent configuration {config_id}: {e}")
            return False
    
    async def activate_configuration(self, config_id: int) -> bool:
        """Activate a specific configuration and deactivate others"""
        try:
            db = get_db()
            if not db:
                return False
            
            # First, deactivate all configurations
            db.table(self.table_name).update({"is_active": False}).execute()
            
            # Then activate the specified one
            result = db.table(self.table_name).update({"is_active": True}).eq("id", config_id).execute()
            
            if result.data:
                logger.info(f"Activated agent configuration: {config_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error activating agent configuration {config_id}: {e}")
            return False
