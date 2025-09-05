




# Retell AI Web Call Setup Guide

This guide explains how to properly set up and use Retell AI web calls in your application.

## 🚨 The Problem You Were Facing

You were getting this error response:
```json
{
  "call_id": "call_1f83df18c10feadd56e20d8f953",
  "call_type": "web_call",
  "call_status": "error",
  "disconnection_reason": "error_user_not_joined",
  "duration_ms": 0
}
```

**Root Cause**: The web call was created successfully, but you weren't properly joining it using the Retell Web SDK. The `error_user_not_joined` status means the call was created but no user connected to it within the timeout period.

## ✅ The Solution

### 1. Backend Changes (Already Fixed)

Your backend now properly extracts and returns the `access_token`:

```python
# In simple_main.py - create_web_call endpoint
access_token = getattr(web_call_response, 'access_token', None)
call_id = getattr(web_call_response, 'call_id', None)

return {
    "message": "Web call created successfully",
    "agent_id": web_call_response.agent_id,
    "call_id": call_id,
    "web_call_url": web_call_url,
    "access_token": access_token,  # This is the key!
    "status": "created"
}
```

### 2. Frontend Changes (Already Updated)

The frontend now uses the Retell Web SDK to properly join calls:

```javascript
// Install the SDK
npm install retell-client-js-sdk

// Use it in your component
import { RetellWebClient } from 'retell-client-js-sdk';

const client = new RetellWebClient();

// Join the call using the access token
await client.startCall({
    accessToken: webCallResponse.access_token,
    sampleRate: 24000
});
```

## 🎯 How to Use Web Calls Now

### Step 1: Create a Web Call
```bash
POST /api/v1/calls/web-call
{
    "agent_id": "agent_57257af75bf14eb03cfae03d48"
}
```

**Response:**
```json
{
    "message": "Web call created successfully",
    "agent_id": "agent_57257af75bf14eb03cfae03d48",
    "call_id": "call_1f83df18c10feadd56e20d8f953",
    "access_token": "eyJhbGciOiJIUzI1NiJ9...",
    "web_call_url": "https://retellai.com/web-call?access_token=...",
    "status": "created"
}
```

### Step 2: Join the Call (Two Methods)

#### Method 1: Using Retell Web SDK (Recommended)
```javascript
import { RetellWebClient } from 'retell-client-js-sdk';

const client = new RetellWebClient();

// Set up event listeners
client.on('call_started', () => {
    console.log('Call started');
});

client.on('call_ended', () => {
    console.log('Call ended');
});

client.on('error', (error) => {
    console.error('Call error:', error);
});

// Start the call
await client.startCall({
    accessToken: 'your_access_token_here',
    sampleRate: 24000
});
```

#### Method 2: Direct URL (Alternative)
```javascript
// Open the web_call_url in a new tab
window.open(webCallResponse.web_call_url, '_blank');
```

## 🧪 Testing Your Setup

### 1. Run the Backend Test
```bash
cd backend
python test_web_call_complete.py
```

This will:
- Create a web call
- Verify the response structure
- Show you the access token
- Provide instructions for joining

### 2. Test the Frontend
1. Start your React app: `npm start`
2. Go to the Web Call Test page
3. Select an agent
4. Click "Create Web Call"
5. Click "Join Call" (this uses the Retell Web SDK)
6. Allow microphone permissions
7. The call should start successfully!

### 3. Use the Standalone Test Page
1. Create a web call using your backend
2. Copy the access token
3. Open `voice project/public/web-call-test.html` in your browser
4. Paste the access token and click "Join Call"

## ⚠️ Important Notes

### Timing Requirements
- **You must join the call within 30 seconds** of creation
- The access token expires if not used promptly
- If you don't join in time, you'll get `error_user_not_joined`

### Browser Requirements
- **Microphone permissions** are required
- **HTTPS** is recommended for production
- **Modern browsers** (Chrome, Firefox, Safari, Edge)

### Error Handling
```javascript
client.on('error', (error) => {
    console.error('Call error:', error);
    // Handle the error appropriately
    client.stopCall();
});
```

## 🔧 Troubleshooting

### Common Issues

1. **"error_user_not_joined"**
   - **Cause**: Didn't join the call within 30 seconds
   - **Solution**: Join immediately after creating the call

2. **"Failed to initialize Retell client"**
   - **Cause**: SDK not installed or import error
   - **Solution**: `npm install retell-client-js-sdk`

3. **"No access token available"**
   - **Cause**: Backend not returning access_token
   - **Solution**: Check your backend implementation

4. **Microphone permission denied**
   - **Cause**: Browser blocked microphone access
   - **Solution**: Allow microphone permissions in browser settings

### Debug Steps

1. **Check the browser console** for error messages
2. **Verify the access token** is not null/undefined
3. **Test with the standalone HTML page** to isolate issues
4. **Check network requests** in browser dev tools
5. **Verify your Retell API key** is correct

## 📚 Additional Resources

- [Retell AI Web Call Documentation](https://docs.retellai.com/deploy/web-call)
- [Retell AI API Reference](https://docs.retellai.com/api-references)
- [Retell Web SDK GitHub](https://github.com/retellai/retell-client-js-sdk)

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **Backend**: Web call created with access_token
2. **Frontend**: "Join Call" button works
3. **Browser**: Microphone permission prompt
4. **Call**: Agent responds to your voice
5. **Status**: Call status shows "connected"

The key difference is that you're now using the **Retell Web SDK** to properly join the call with the **access_token**, rather than just opening a URL. This ensures the call is properly established and you won't get the `error_user_not_joined` error anymore.
