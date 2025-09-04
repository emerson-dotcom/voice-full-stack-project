# Call Triggering Setup Guide

This guide explains how to set up and use the new call triggering functionality in your Voice Agent Admin system.

## Overview

The call triggering system allows you to:
- Trigger test calls using configured agent configurations
- Track call status and history
- Monitor call results and summaries
- Manage call records in Supabase

## Backend Setup

### 1. Database Schema

First, update your Supabase database with the new call records table:

```bash
# Run the updated schema in your Supabase SQL Editor
cat backend/supabase_schema.sql
```

This will create:
- `call_records` table with all necessary fields
- Proper indexes for performance
- Row Level Security policies
- Sample data for testing

### 2. Environment Variables

Make sure your `.env` file contains:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start the Backend Server

```bash
cd backend
python simple_main.py
```

The server will start on `http://localhost:8000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd "voice project"
npm install
```

### 2. Start the Frontend

```bash
npm start
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Call Management Endpoints

#### Trigger a Test Call
```http
POST /api/v1/calls/trigger
Content-Type: application/json

{
  "agent_config_id": 1,
  "driver_name": "John Smith",
  "phone_number": "+1-555-123-4567",
  "load_number": "LOAD-2024-001",
  "delivery_address": "123 Main St, Anytown, USA",
  "expected_delivery_time": "2024-12-01T14:00:00Z",
  "special_instructions": "Fragile items"
}
```

#### Get Call Records
```http
GET /api/v1/calls?limit=50&offset=0
```

#### Get Specific Call
```http
GET /api/v1/calls/{call_id}
```

#### Update Call Status
```http
PUT /api/v1/calls/{call_id}/status
Content-Type: application/json

{
  "status": "completed",
  "call_summary": "Call completed successfully",
  "end_time": "2024-12-01T10:35:00Z",
  "duration_seconds": 300
}
```

#### Get Calls by Agent
```http
GET /api/v1/calls/agent/{agent_config_id}?limit=50
```

#### Get Calls by Status
```http
GET /api/v1/calls/status/{status}?limit=50
```

## Frontend Usage

### 1. Call Triggering Interface

1. Navigate to the "Call Triggering" tab
2. Select an agent configuration from the dropdown
3. Fill in the required fields:
   - Driver Name (required)
   - Phone Number (required)
   - Load Number (required)
   - Delivery Address (optional)
   - Expected Delivery Time (optional)
   - Special Instructions (optional)
4. Click "Start Test Call"

### 2. Call Status Monitoring

The interface shows:
- Real-time call status updates
- Call ID and Retell call ID
- Agent configuration used
- Start time and duration

### 3. Call History

The call history table displays:
- Recent calls with their status
- Driver information
- Load numbers
- Call duration
- Creation dates

## Testing

### Backend Testing

Run the test script to verify endpoints:

```bash
cd backend
python test_call_endpoints.py
```

This will test:
- Health check
- Agent configuration retrieval
- Call triggering
- Call record retrieval
- Specific call lookup

### Frontend Testing

1. Start both backend and frontend servers
2. Navigate to the Call Triggering tab
3. Try triggering a test call
4. Verify the call appears in the history table

## Integration with Retell AI

The current implementation includes placeholder code for Retell AI integration. To complete the integration:

1. **Replace the simulation code** in `simple_main.py` around line 256:
   ```python
   # Replace this simulation code:
   retell_call_id = f"retell_{str(uuid.uuid4())}"
   
   # With actual Retell AI API call:
   # retell_response = retell_client.create_call(...)
   # retell_call_id = retell_response.call_id
   ```

2. **Add Retell AI credentials** to your environment variables:
   ```env
   RETELL_API_KEY=your_retell_api_key
   ```

3. **Implement webhook handling** for call status updates from Retell AI

## Database Schema Details

### Call Records Table

```sql
CREATE TABLE call_records (
    id BIGSERIAL PRIMARY KEY,
    call_id VARCHAR(100) NOT NULL UNIQUE,
    agent_config_id BIGINT NOT NULL REFERENCES agent_configurations(id),
    driver_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    load_number VARCHAR(50) NOT NULL,
    delivery_address TEXT,
    expected_delivery_time TIMESTAMP WITH TIME ZONE,
    special_instructions TEXT,
    status VARCHAR(20) DEFAULT 'initiated',
    retell_call_id VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    call_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Status Values

- `initiated`: Call has been created but not yet started
- `in_progress`: Call is currently active
- `completed`: Call finished successfully
- `failed`: Call failed or was terminated

## Troubleshooting

### Common Issues

1. **Backend not starting**: Check Supabase credentials in `.env`
2. **Frontend can't connect**: Verify backend is running on port 8000
3. **No agent configurations**: Create at least one agent configuration first
4. **Database errors**: Run the updated schema in Supabase

### Error Messages

- `Database connection not available`: Check Supabase configuration
- `Agent configuration not found`: Verify agent config ID exists
- `Failed to trigger call`: Check backend logs for detailed error

## Next Steps

1. **Complete Retell AI integration** for actual voice calls
2. **Add webhook endpoints** for call status updates
3. **Implement call analytics** and reporting
4. **Add call recording playback** functionality
5. **Create call scheduling** features

## Support

For issues or questions:
1. Check the backend logs for error details
2. Verify database schema is up to date
3. Test individual API endpoints using the test script
4. Check browser console for frontend errors
