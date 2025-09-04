from fastapi import APIRouter, HTTPException, Request, status
from app.services.retell_service import RetellService
from app.services.call_service import CallService
from app.models.call import CallStatus
import logging
import json
from typing import Dict, Any

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
retell_service = RetellService()
call_service = CallService()

@router.post("/webhooks/retell", status_code=status.HTTP_200_OK)
async def handle_retell_webhook(request: Request):
    """Handle incoming webhook events from Retell AI"""
    try:
        # Parse the webhook payload
        body = await request.body()
        webhook_data = json.loads(body)
        
        logger.info(f"Received Retell webhook: {webhook_data.get('event_type', 'unknown')}")
        
        # Process the webhook event
        result = retell_service.process_webhook_event(webhook_data)
        
        # Handle specific event types
        event_type = webhook_data.get("event_type")
        call_id = webhook_data.get("call_id")
        
        if event_type == "call_started" and call_id:
            await call_service.update_call_status(call_id, CallStatus.IN_PROGRESS)
            logger.info(f"Updated call {call_id} status to in_progress")
            
        elif event_type == "call_ended" and call_id:
            await call_service.update_call_status(call_id, CallStatus.COMPLETED)
            
            # Extract duration if available
            duration = webhook_data.get("duration_seconds")
            if duration:
                from app.models.call import CallResultUpdate
                await call_service.update_call_result(call_id, CallResultUpdate(duration_seconds=duration))
            
            logger.info(f"Updated call {call_id} status to completed")
            
        elif event_type == "transcript_updated" and call_id:
            transcript = webhook_data.get("transcript", "")
            if transcript:
                await call_service.add_transcript(call_id, transcript)
                logger.info(f"Updated transcript for call {call_id}")
                
                # Process transcript to extract structured data
                structured_summary = await _extract_structured_data(transcript)
                if structured_summary:
                    await call_service.add_structured_summary(call_id, structured_summary)
                    logger.info(f"Added structured summary for call {call_id}")
        
        return {
            "status": "success",
            "message": "Webhook processed successfully",
            "event_type": event_type,
            "call_id": call_id
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in webhook payload: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )
    except Exception as e:
        logger.error(f"Error processing Retell webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/webhooks/retell/health", status_code=status.HTTP_200_OK)
async def webhook_health_check():
    """Health check endpoint for webhook configuration"""
    return {
        "status": "healthy",
        "service": "Retell AI Webhook Handler",
        "timestamp": "2024-01-01T00:00:00Z"
    }

async def _extract_structured_data(transcript: str) -> Dict[str, Any]:
    """
    Extract structured data from call transcript.
    This is a simplified implementation - in production, you might use:
    - OpenAI GPT for intelligent extraction
    - Rule-based parsing
    - Named Entity Recognition (NER)
    """
    try:
        transcript_lower = transcript.lower()
        
        # Extract key information based on common patterns
        structured_data = {
            "delivery_confirmed": False,
            "address_verified": False,
            "issues_identified": [],
            "next_steps": [],
            "driver_sentiment": "neutral"
        }
        
        # Check for delivery confirmation
        if any(phrase in transcript_lower for phrase in ["confirmed", "yes", "correct", "right"]):
            structured_data["delivery_confirmed"] = True
        
        # Check for address verification
        if any(phrase in transcript_lower for phrase in ["address", "location", "correct address"]):
            structured_data["address_verified"] = True
        
        # Extract issues
        issue_keywords = ["problem", "issue", "concern", "trouble", "difficulty"]
        for keyword in issue_keywords:
            if keyword in transcript_lower:
                # Simple extraction - in production, use more sophisticated NLP
                structured_data["issues_identified"].append(f"Driver mentioned {keyword}")
        
        # Extract next steps
        next_step_keywords = ["call back", "follow up", "tomorrow", "next week", "schedule"]
        for keyword in next_step_keywords:
            if keyword in transcript_lower:
                structured_data["next_steps"].append(f"Action required: {keyword}")
        
        # Basic sentiment analysis
        positive_words = ["good", "great", "excellent", "happy", "satisfied"]
        negative_words = ["bad", "terrible", "unhappy", "angry", "frustrated"]
        
        positive_count = sum(1 for word in positive_words if word in transcript_lower)
        negative_count = sum(1 for word in negative_words if word in transcript_lower)
        
        if positive_count > negative_count:
            structured_data["driver_sentiment"] = "positive"
        elif negative_count > positive_count:
            structured_data["driver_sentiment"] = "negative"
        
        return structured_data
        
    except Exception as e:
        logger.error(f"Error extracting structured data from transcript: {e}")
        return {
            "delivery_confirmed": False,
            "address_verified": False,
            "issues_identified": [],
            "next_steps": [],
            "driver_sentiment": "neutral",
            "extraction_error": str(e)
        }
