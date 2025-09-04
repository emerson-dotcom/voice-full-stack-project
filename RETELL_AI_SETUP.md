# Retell AI Integration Setup

This guide explains how to set up Retell AI integration with your Voice Agent Admin system.

## Environment Variables

### Required
```env
RETELL_API_KEY=your_retell_api_key_here
```

### Optional (Recommended)
```env
RETELL_WEBHOOK_URL=http://your-domain.com/api/v1/webhooks/retell
```

## How It Works

### 1. **With RETELL_API_KEY Only**
✅ **Call triggering will work**
- You can initiate calls through Retell AI
- Calls will be created and tracked in your database
- You'll get a Retell call ID for each call

❌ **What you'll miss:**
- Automatic status updates (calls will stay "in_progress")
- Call completion data (duration, summary, end time)
- Real-time call monitoring

### 2. **With Both API Key and Webhook URL**
✅ **Full functionality**
- Call triggering works
- Automatic status updates
- Call completion data
- Real-time monitoring

## Setup Steps

### Step 1: Get Retell AI Credentials

1. Sign up at [Retell AI](https://retellai.com)
2. Get your API key from the dashboard
3. Add it to your `.env` file:
   ```env
   RETELL_API_KEY=your_actual_api_key_here
   ```

### Step 2: Configure Your Agent in Retell AI

1. Create an agent in Retell AI dashboard
2. Note the `agent_id` from Retell AI
3. You'll need to add this to your agent configurations

### Step 3: Update Agent Configuration Schema

Add a `retell_agent_id` field to your agent configurations:

```sql
-- Add this column to your agent_configurations table
ALTER TABLE agent_configurations 
ADD COLUMN retell_agent_id VARCHAR(100);
```

### Step 4: Update Agent Configuration Model

Update your `AgentConfiguration` model in `simple_main.py`:

```python
class AgentConfiguration(BaseModel):
    id: Optional[int] = None
    agent_name: str = Field(..., min_length=1, max_length=100)
    greeting: str = Field(..., min_length=1, max_length=500)
    primary_objective: str = Field(..., min_length=1, max_length=500)
    conversation_flow: List[ConversationStep] = Field(..., min_items=1)
    fallback_responses: List[str] = Field(default_factory=list)
    call_ending_conditions: List[str] = Field(default_factory=list)
    retell_agent_id: Optional[str] = None  # Add this line
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
```

### Step 5: Set Up Webhook (Optional but Recommended)

#### For Development (Localhost):
1. Add to your `.env` file:
   ```env
   RETELL_WEBHOOK_URL=http://localhost:8000/api/v1/webhooks/retell
   ```
2. Or run the setup script:
   ```bash
   cd backend
   python setup_webhook.py
   ```
3. Go to [Retell AI Webhook Settings](https://dashboard.retellai.com/settings/webhooks)
4. Add the webhook URL: `http://localhost:8000/api/v1/webhooks/retell`
5. Start your backend server: `python simple_main.py`

#### For Development (using ngrok - if localhost doesn't work):
1. Install ngrok: `npm install -g ngrok`
2. Start your backend server
3. In another terminal: `ngrok http 8000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Set webhook URL: `RETELL_WEBHOOK_URL=https://abc123.ngrok.io/api/v1/webhooks/retell`

#### For Production:
1. Deploy your backend to a public URL
2. Set: `RETELL_WEBHOOK_URL=https://your-domain.com/api/v1/webhooks/retell`

### Step 6: Configure Retell AI Phone Number

Update the `from_number` in the `initiate_retell_call` function:

```python
retell_request = {
    "from_number": "+1234567890",  # Replace with your Retell AI phone number
    "to_number": call_request.phone_number,
    "agent_id": agent_config.get("retell_agent_id"),
    # ... rest of the request
}
```

## Testing Without Webhook

### Manual Status Updates

You can manually update call status using the API:

```bash
# Update call to completed
curl -X PUT "http://localhost:8000/api/v1/calls/{call_id}/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "call_summary": "Call completed successfully",
    "end_time": "2024-12-01T10:35:00Z",
    "duration_seconds": 300
  }'
```

### Polling for Updates

You can periodically check call status by calling:
```bash
curl "http://localhost:8000/api/v1/calls/{call_id}"
```

## Testing the Integration

### 1. Test Call Triggering
```bash
cd backend
python test_call_endpoints.py
```

### 2. Check Backend Logs
Look for these messages:
- `✅ Retell AI call initiated: {call_id}` - Success
- `⚠️ RETELL_API_KEY not found. Using simulation mode.` - API key missing
- `❌ Retell AI API error: {status_code}` - API error

### 3. Test Webhook (if configured)
You can simulate a webhook call:

```bash
curl -X POST "http://localhost:8000/api/v1/webhooks/retell" \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "your_retell_call_id",
    "call_status": "ended",
    "call_summary": "Call completed successfully",
    "end_time": "2024-12-01T10:35:00Z",
    "duration_seconds": 300
  }'
```

## Troubleshooting

### Common Issues

1. **"RETELL_API_KEY not found"**
   - Check your `.env` file
   - Restart the backend server
   - Verify the environment variable is loaded

2. **"Retell AI API error: 401"**
   - Invalid API key
   - Check your Retell AI dashboard for the correct key

3. **"Retell AI API error: 400"**
   - Invalid request format
   - Check phone number format
   - Verify agent_id exists in Retell AI

4. **Webhook not receiving updates**
   - Check webhook URL is accessible
   - Verify Retell AI webhook configuration
   - Check backend logs for webhook errors

### Debug Mode

Add debug logging to see what's happening:

```python
# In initiate_retell_call function, add:
print(f"🔍 Retell API Key: {'Set' if retell_api_key else 'Not set'}")
print(f"🔍 Webhook URL: {retell_webhook_url or 'Not set'}")
print(f"🔍 Request data: {retell_request}")
```

## Next Steps

1. **Set up your Retell AI account** and get your API key
2. **Create an agent** in Retell AI dashboard
3. **Add the agent ID** to your agent configurations
4. **Test call triggering** with the API key
5. **Set up webhook** for full functionality (optional)

## Cost Considerations

- Retell AI charges per minute of call time
- Webhook calls are free
- Test with small calls first to understand costs

## Security Notes

- Keep your API key secure
- Use HTTPS for webhook URLs in production
- Consider IP whitelisting for webhook endpoints
- Rotate API keys regularly
