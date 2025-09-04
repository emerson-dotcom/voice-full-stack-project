from typing import List, Optional
from app.database.connection import get_db
from app.models.call import CallTrigger, CallResult, CallResultUpdate, CallStatus
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class CallService:
    def __init__(self):
        self.table_name = "call_results"
    
    async def create_call_result(self, call_result: CallResult) -> Optional[CallResult]:
        """Create a new call result record"""
        try:
            db = get_db()
            if not db:
                logger.error("Database connection not available")
                return None
            
            # Prepare data for insertion
            result_data = call_result.dict(exclude={'id', 'created_at', 'updated_at'})
            result_data['created_at'] = datetime.now(datetime.timezone.utc).isoformat()
            result_data['updated_at'] = datetime.now(datetime.timezone.utc).isoformat()
            
            # Insert into Supabase
            result = db.table(self.table_name).insert(result_data).execute()
            
            if result.data:
                created_result = result.data[0]
                logger.info(f"Created call result: {created_result['id']}")
                return CallResult(**created_result)
            
            return None
            
        except Exception as e:
            logger.error(f"Error creating call result: {e}")
            return None
    
    async def get_call_result(self, call_id: str) -> Optional[CallResult]:
        """Get call result by call ID"""
        try:
            db = get_db()
            if not db:
                return None
            
            result = db.table(self.table_name).select("*").eq("call_id", call_id).execute()
            
            if result.data:
                return CallResult(**result.data[0])
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting call result {call_id}: {e}")
            return None
    
    async def get_all_call_results(self, limit: int = 100) -> List[CallResult]:
        """Get all call results with pagination"""
        try:
            db = get_db()
            if not db:
                return []
            
            result = db.table(self.table_name).select("*").order("created_at", desc=True).limit(limit).execute()
            
            if result.data:
                return [CallResult(**call_result) for call_result in result.data]
            
            return []
            
        except Exception as e:
            logger.error(f"Error getting all call results: {e}")
            return []
    
    async def get_call_results_by_agent(self, agent_config_id: int, limit: int = 100) -> List[CallResult]:
        """Get call results for a specific agent configuration"""
        try:
            db = get_db()
            if not db:
                return []
            
            result = db.table(self.table_name).select("*").eq("agent_config_id", agent_config_id).order("created_at", desc=True).limit(limit).execute()
            
            if result.data:
                return [CallResult(**call_result) for call_result in result.data]
            
            return []
            
        except Exception as e:
            logger.error(f"Error getting call results for agent {agent_config_id}: {e}")
            return []
    
    async def update_call_result(self, call_id: str, updates: CallResultUpdate) -> Optional[CallResult]:
        """Update an existing call result"""
        try:
            db = get_db()
            if not db:
                return None
            
            # Prepare update data
            update_data = updates.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.now(datetime.timezone.utc).isoformat()
            
            # Update in Supabase
            result = db.table(self.table_name).update(update_data).eq("call_id", call_id).execute()
            
            if result.data:
                updated_result = result.data[0]
                logger.info(f"Updated call result: {call_id}")
                return CallResult(**updated_result)
            
            return None
            
        except Exception as e:
            logger.error(f"Error updating call result {call_id}: {e}")
            return None
    
    async def delete_call_result(self, call_id: str) -> bool:
        """Delete a call result"""
        try:
            db = get_db()
            if not db:
                return False
            
            result = db.table(self.table_name).delete().eq("call_id", call_id).execute()
            
            if result.data:
                logger.info(f"Deleted call result: {call_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting call result {call_id}: {e}")
            return False
    
    async def create_call_from_trigger(self, call_trigger: CallTrigger) -> Optional[str]:
        """Create a call record from a trigger request"""
        try:
            # Generate a unique call ID
            call_id = f"call_{uuid.uuid4().hex[:8]}"
            
            # Create initial call result with pending status
            initial_result = CallResult(
                call_id=call_id,
                driver_name=call_trigger.driver_name,
                phone_number=call_trigger.phone_number,
                load_number=call_trigger.load_number,
                status=CallStatus.PENDING,
                agent_config_id=call_trigger.agent_config_id,
                transcript="",
                structured_summary={}
            )
            
            # Save to database
            created_result = await self.create_call_result(initial_result)
            if created_result:
                logger.info(f"Created call from trigger: {call_id}")
                return call_id
            
            return None
            
        except Exception as e:
            logger.error(f"Error creating call from trigger: {e}")
            return None
    
    async def update_call_status(self, call_id: str, status: CallStatus) -> bool:
        """Update the status of a call"""
        try:
            updates = CallResultUpdate(status=status)
            result = await self.update_call_result(call_id, updates)
            return result is not None
            
        except Exception as e:
            logger.error(f"Error updating call status {call_id}: {e}")
            return False
    
    async def add_transcript(self, call_id: str, transcript: str) -> bool:
        """Add or update the transcript for a call"""
        try:
            updates = CallResultUpdate(transcript=transcript)
            result = await self.update_call_result(call_id, updates)
            return result is not None
            
        except Exception as e:
            logger.error(f"Error adding transcript for call {call_id}: {e}")
            return False
    
    async def add_structured_summary(self, call_id: str, summary: dict) -> bool:
        """Add or update the structured summary for a call"""
        try:
            updates = CallResultUpdate(structured_summary=summary)
            result = await self.update_call_result(call_id, updates)
            return result is not None
            
        except Exception as e:
            logger.error(f"Error adding structured summary for call {call_id}: {e}")
            return False
