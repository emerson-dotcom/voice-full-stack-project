# Retell AI Setup Guide

This guide will help you set up actual phone calling functionality using Retell AI.

## Step 1: Create Retell AI Account

1. Go to [retellai.com](https://retellai.com) and sign up for an account
2. Complete the account verification process
3. Add payment method (required for making calls)

## Step 2: Get Your API Key

1. Log into your Retell AI dashboard
2. Navigate to "API Keys" section
3. Click "Add" to create a new API key
4. Copy the API key (starts with `rt_`)

## Step 3: Verify a Phone Number

1. In your Retell AI dashboard, go to "Phone Numbers"
2. Click "Add Phone Number"
3. Choose a phone number for outbound calls
4. Complete the verification process
5. Note down the verified phone number (format: +1234567890)

## Step 4: Update Your Environment Variables

Edit your `.env` file in the backend directory and add:

```env
# Retell AI Configuration
RETELL_API_KEY=rt_your_actual_api_key_here
RETELL_FROM_NUMBER=+1234567890
RETELL_WEBHOOK_URL=http://localhost:8000/api/v1/webhooks/retell
```

Replace:
- `rt_your_actual_api_key_here` with your actual Retell AI API key
- `+1234567890` with your verified Retell AI phone number

## Step 5: Update Database Schema

Run the migration script in your Supabase SQL Editor:

```sql
-- Add retell_agent_id column to agent_configurations table
ALTER TABLE agent_configurations 
ADD COLUMN IF NOT EXISTS retell_agent_id VARCHAR(100);

-- Create an index on retell_agent_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_agent_configurations_retell_agent_id 
ON agent_configurations(retell_agent_id);
```

## Step 6: Test the Integration

1. Restart your backend server
2. Go to your frontend and click "Start Test Call"
3. The system will:
   - Create a Retell AI agent based on your stored configuration
   - Make an actual phone call to the specified number
   - Follow your conversation flow and use your configured prompts

## How It Works

1. **Agent Creation**: When you trigger a call, the system automatically creates a Retell AI agent using your stored configuration (greeting, conversation flow, etc.)

2. **Call Initiation**: The system uses the Retell AI API to make an actual phone call from your verified number to the target number

3. **Conversation Flow**: The AI agent follows your configured conversation steps and prompts

4. **Webhook Updates**: Retell AI sends status updates to your webhook endpoint, which updates the call record in your database

## Troubleshooting

### Common Issues:

1. **"RETELL_API_KEY not found"**: Make sure your `.env` file has the correct API key
2. **"RETELL_FROM_NUMBER not found"**: Make sure you've set your verified phone number
3. **"Failed to create Retell AI agent"**: Check your API key and internet connection
4. **Calls not connecting**: Verify your phone number is properly verified in Retell AI

### Testing Without Real Calls:

If you want to test the system without making real calls, you can:
1. Leave `RETELL_API_KEY` empty in your `.env` file
2. The system will run in simulation mode
3. You'll see simulated call IDs in the logs

## Cost Information

- Retell AI charges per minute of conversation
- Check their pricing page for current rates
- You can set spending limits in your Retell AI dashboard

## Next Steps

Once set up, your voice agent will:
- Make real phone calls to drivers
- Follow your configured conversation flow
- Handle different scenarios based on your prompts
- Update call status in real-time
- Store call summaries and results
