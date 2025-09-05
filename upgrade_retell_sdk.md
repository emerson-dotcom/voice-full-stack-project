# Upgrade Retell SDK to Fix Method Issues

## Problem
You're getting `startCall is not a function` because you're using an older version of `retell-client-js-sdk` (v1.3.3) that has different method names.

## Solution
Upgrade to the latest version of the SDK which has the correct method names.

## Steps to Fix

### 1. Upgrade the SDK
```bash
cd "voice project"
npm install retell-client-js-sdk@latest
```

### 2. Verify the Installation
```bash
npm list retell-client-js-sdk
```

### 3. Test the Updated Code
The code has been updated to support both old and new API methods, so it should work with either version. However, upgrading to the latest version is recommended for the best experience.

## What the Updated Code Does

The updated `WebCallTest.js` now:

1. **Detects Available Methods**: Checks if `startCall` or `startConversation` exists
2. **Uses Appropriate Method**: Tries the newer API first, falls back to older API
3. **Supports Both Event Systems**: Listens for both `call_started`/`call_ended` and `conversationStarted`/`conversationEnded`
4. **Better Error Handling**: Provides specific error messages for different failure scenarios

## Expected Behavior After Upgrade

With the latest SDK version, you should see:
- ✅ `startCall` method available
- ✅ `call_started` and `call_ended` events
- ✅ Proper access token usage
- ✅ Better error messages

## Fallback Behavior

If you can't upgrade immediately, the code will:
- ✅ Try `startCall` first (newer API)
- ✅ Fall back to `startConversation` (older API)
- ✅ Listen for both event types
- ✅ Provide helpful error messages

## Testing

After upgrading, test the web call flow:
1. Create a web call
2. Check console logs for "Using startCall method (newer API)"
3. Verify the call connects successfully
4. Test ending the call

The updated code should work with both versions, but upgrading to the latest SDK is the recommended solution.
