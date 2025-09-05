import React, { useState, useEffect, useRef } from 'react';
import { Globe, Play, ExternalLink, Copy, CheckCircle, XCircle, AlertCircle, Bot, Settings, Phone, PhoneOff } from 'lucide-react';
import { agentsApi, callApi, ApiError } from '../utils/api';
import { RetellWebClient } from 'retell-client-js-sdk';

const WebCallTest = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [webCallResponse, setWebCallResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, connecting, connected, ended, error
  const [retellClient, setRetellClient] = useState(null);
  const retellClientRef = useRef(null);
  const keepAliveIntervalRef = useRef(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load agents on component mount
  useEffect(() => {
    loadAgents();
    initializeRetellClient();
    
    // Cleanup function to clear timeouts/intervals on unmount
    return () => {
      stopKeepAlive();
      if (retellClientRef.current) {
        if (retellClientRef.current._connectionTimeout) {
          clearTimeout(retellClientRef.current._connectionTimeout);
        }
        if (retellClientRef.current._connectionCheckInterval) {
          clearInterval(retellClientRef.current._connectionCheckInterval);
        }
      }
    };
  }, []);

  // Initialize Retell Web Client
  const initializeRetellClient = () => {
    try {
      const client = new RetellWebClient();
      
      // RetellWebClient initialized successfully
      console.log('Retell client created, setting up event listeners...');
      
      // Set up event listeners - support both old and new API versions
      // New API: call_started/call_ended (newer documentation)
      // Old API: conversationStarted/conversationEnded (older SDK versions)
      
      // New API events
      client.on('call_started', () => {
        console.log('✅ Call started event fired (new API) - setting status to connected');
        console.log('🎉 Call is now active and ready for conversation!');
        setCallStatus('connected');
        clearConnectionTimeouts();
      });

      client.on('call_ended', () => {
        console.log('Call ended event fired (new API)');
        setCallStatus('ended');
      });

      // Old API events (for backward compatibility)
      client.on('conversationStarted', () => {
        console.log('✅ Conversation started event fired (old API) - setting status to connected');
        console.log('🎉 Call is now active and ready for conversation!');
        setCallStatus('connected');
        clearConnectionTimeouts();
        
        // Add keepalive to prevent auto-disconnect
        startKeepAlive();
        
        // Show immediate prompt to user
        setError('🎤 SPEAK NOW! The call is active - say something to keep it alive!');
        
        // Clear the prompt after 3 seconds
        setTimeout(() => {
          setError('');
        }, 3000);
      });

      client.on('conversationEnded', (reason) => {
        console.log('❌ Conversation ended event fired (old API)');
        console.log('End reason:', reason);
        console.log('Reason type:', typeof reason);
        setCallStatus('ended');
        stopKeepAlive();
        
        // Provide helpful error message - handle different reason types
        let errorMessage = 'Call ended unexpectedly. Check your microphone and try again.';
        
        if (reason) {
          const reasonStr = typeof reason === 'string' ? reason : JSON.stringify(reason);
          console.log('Reason as string:', reasonStr);
          
          // Handle WebSocket close codes
          if (reason.code === 1005) {
            if (retryCount < 1) { // Reduced to 1 retry to avoid token expiry
              errorMessage = `Connection lost (WebSocket closed unexpectedly). Retrying... (${retryCount + 1}/1)`;
              // Auto-retry for WebSocket 1005 errors
              setTimeout(() => {
                console.log('🔄 Auto-retrying connection...');
                setRetryCount(prev => prev + 1);
                joinWebCall();
              }, 1000); // Faster retry
            } else {
              errorMessage = 'Connection lost (WebSocket closed unexpectedly). This often happens due to network issues, server problems, or expired access token. Try creating a new web call.';
            }
          } else if (reason.code === 1006) {
            errorMessage = 'Connection lost (WebSocket closed abnormally). Check your network connection and try again.';
          } else if (reason.code === 1000) {
            errorMessage = 'Call ended normally.';
          } else if (reason.code) {
            errorMessage = `Connection lost (WebSocket code: ${reason.code}). Try creating a new web call.`;
          } else if (reasonStr.includes('timeout') || reasonStr.includes('Timeout')) {
            errorMessage = 'Call ended due to timeout. Try speaking immediately after joining.';
          } else if (reasonStr.includes('token') || reasonStr.includes('Token') || reasonStr.includes('expired')) {
            errorMessage = 'Call ended due to expired access token. Create a new web call.';
          } else if (reasonStr.includes('error') || reasonStr.includes('Error')) {
            errorMessage = 'Call ended due to an error. Check your connection and try again.';
          }
        }
        
        setError(errorMessage);
      });

      client.on('error', (error) => {
        console.error('Retell client error:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          type: error.type,
          stack: error.stack
        });
        setCallStatus('error');
        setError(`Call error: ${error.message || 'Unknown error'}`);
        stopKeepAlive();
        // Clear any pending timeouts/intervals
        if (client._connectionTimeout) {
          clearTimeout(client._connectionTimeout);
          client._connectionTimeout = null;
        }
        if (client._connectionCheckInterval) {
          clearInterval(client._connectionCheckInterval);
          client._connectionCheckInterval = null;
        }
      });

      // Additional useful events - using official event names from documentation
      client.on('agent_start_talking', () => {
        console.log('Agent started talking');
      });

      client.on('agent_stop_talking', () => {
        console.log('Agent stopped talking');
      });

      client.on('update', (update) => {
        console.log('Update received:', update);
        if (update.transcript) {
          console.log('Transcript:', update.transcript);
        }
      });

      client.on('metadata', (metadata) => {
        console.log('Metadata received:', metadata);
      });

      // Also listen for audio events (though they fire very frequently)
      client.on('audio', (audioData) => {
        // Don't log every audio event as it's very frequent, just log occasionally
        if (Math.random() < 0.01) { // Log 1% of audio events
          console.log('Audio data received:', audioData.length, 'bytes');
        }
      });

      // Debug: Log all available methods and events for troubleshooting
      console.log('Available methods on client:', Object.getOwnPropertyNames(client));
      console.log('Client prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
      
      // Check for specific methods
      console.log('startCall method exists:', typeof client.startCall === 'function');
      console.log('stopCall method exists:', typeof client.stopCall === 'function');

      setRetellClient(client);
      retellClientRef.current = client;
      console.log('✅ Retell client initialized successfully');
      
      // Log all available events for debugging
      if (client._events) {
        console.log('Available events:', Object.keys(client._events));
      }
    } catch (error) {
      console.error('Failed to initialize Retell client:', error);
      setError('Failed to initialize Retell Web SDK. Please ensure the package is installed.');
    }
  };

  const loadAgents = async () => {
    try {
      setLoading(true);
      const response = await agentsApi.getAll();
      setAgents(response.data || []);
    } catch (error) {
      console.error('Failed to load agents:', error);
      setError('Failed to load agents. Please check your Retell API configuration.');
    } finally {
      setLoading(false);
    }
  };

  const createWebCall = async () => {
    if (!selectedAgentId) {
      setError('Please select an agent first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setWebCallResponse(null);
      setRetryCount(0); // Reset retry count for new call

      const response = await callApi.createWebCall(selectedAgentId);
      setWebCallResponse(response);
      
      console.log('Web call response:', response);
      console.log('Agent ID:', response.agent_id);
      
    } catch (error) {
      console.error('Failed to create web call:', error);
      if (error instanceof ApiError) {
        setError(`Failed to create web call: ${error.message}`);
      } else {
        setError('Failed to create web call. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Helper function to clear connection timeouts and intervals
  const clearConnectionTimeouts = () => {
    if (retellClientRef.current) {
      if (retellClientRef.current._connectionTimeout) {
        clearTimeout(retellClientRef.current._connectionTimeout);
        retellClientRef.current._connectionTimeout = null;
      }
      if (retellClientRef.current._connectionCheckInterval) {
        clearInterval(retellClientRef.current._connectionCheckInterval);
        retellClientRef.current._connectionCheckInterval = null;
      }
    }
  };

  // Keepalive functions to prevent auto-disconnect
  const startKeepAlive = () => {
    console.log('🔄 Starting keepalive to prevent auto-disconnect...');
    stopKeepAlive(); // Clear any existing interval
    
    keepAliveIntervalRef.current = setInterval(() => {
      if (retellClientRef.current && callStatus === 'connected') {
        // Send a small audio signal to keep the connection alive
        try {
          // Create a very short, silent audio buffer to keep the connection active
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const buffer = audioContext.createBuffer(1, 1, 44100);
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.start();
          console.log('🔄 Keepalive signal sent');
        } catch (e) {
          console.log('Keepalive signal failed:', e);
        }
      }
    }, 10000); // Send keepalive every 10 seconds
  };

  const stopKeepAlive = () => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
      console.log('🛑 Keepalive stopped');
    }
  };

  const joinWebCall = async () => {
    if (!webCallResponse?.access_token || !retellClientRef.current) {
      setError('No access token available or Retell client not initialized');
      return;
    }

    // Prevent multiple simultaneous connection attempts
    if (callStatus === 'connecting' || callStatus === 'connected') {
      console.log('Connection already in progress or active, ignoring request');
      return;
    }

    try {
      setCallStatus('connecting');
      setError('');

      // Clear any existing timeouts/intervals first
      clearConnectionTimeouts();

      // Check microphone permissions first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone access granted');
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      } catch (micError) {
        console.error('Microphone access denied:', micError);
        setError('Microphone access is required for voice calls. Please allow microphone permissions and try again.');
        setCallStatus('error');
        return;
      }

      // Starting conversation with Retell Web SDK
      console.log('About to start conversation with access token:', webCallResponse.access_token.substring(0, 20) + '...');
      console.log('Full access token:', webCallResponse.access_token);
      
      // Debug: Check what methods are available on the client
      console.log('Available methods on client:', Object.getOwnPropertyNames(retellClientRef.current));
      console.log('Client prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(retellClientRef.current)));
      
      // Try both old and new API methods to support different SDK versions
      let result;
      try {
        console.log('🚀 Starting call with access token...');
        console.log('Web call response:', webCallResponse);
        console.log('Access Token:', webCallResponse.access_token ? webCallResponse.access_token.substring(0, 20) + '...' : 'None');
        console.log('Sample rate: 24000');
        
        // Check what methods are available
        console.log('Available methods:', Object.getOwnPropertyNames(retellClientRef.current));
        console.log('startCall exists:', typeof retellClientRef.current.startCall === 'function');
        console.log('startConversation exists:', typeof retellClientRef.current.startConversation === 'function');
        
        // Try the newer API first (startCall with accessToken)
        if (typeof retellClientRef.current.startCall === 'function') {
          console.log('Using startCall method (newer API)...');
          result = await retellClientRef.current.startCall({
            accessToken: webCallResponse.access_token,
            sampleRate: 24000,
            // Optional: device id of the mic
            captureDeviceId: "default",
            // Optional: device id of the speaker
            playbackDeviceId: "default",
            // Optional: Whether to emit "audio" events that contain raw pcm audio bytes
            emitRawAudioSamples: false,
          });
        }
        // Fallback to older API (startConversation with callId)
        else if (typeof retellClientRef.current.startConversation === 'function') {
          console.log('Using startConversation method (older API)...');
          result = await retellClientRef.current.startConversation({
            callId: webCallResponse.call_id,
            sampleRate: 24000,
            enableUpdate: true
          });
        }
        // If neither method exists, throw an error
        else {
          throw new Error('Neither startCall nor startConversation method found on RetellWebClient. Please check your SDK version.');
        }
        
        console.log('✅ Call started successfully:', result);
        console.log('Result type:', typeof result);
        console.log('Result keys:', result ? Object.keys(result) : 'No result');
        
        // Handle case where method returns undefined (which is normal for some SDK versions)
        if (result === undefined) {
          console.log('ℹ️ Method returned undefined - this is normal for some SDK versions');
          // Don't treat undefined as an error, the connection will be established via events
        }
      } catch (error) {
        console.log('❌ Call start failed:', error.message);
        console.log('Error details:', error);
        
        // Provide more specific error handling
        if (error.message && (error.message.includes('access_token') || error.message.includes('token'))) {
          throw new Error('Invalid or expired access token. Please create a new web call.');
        } else if (error.message && error.message.includes('microphone')) {
          throw new Error('Microphone access denied. Please allow microphone permissions and try again.');
        } else if (error.message && error.message.includes('method found')) {
          throw new Error('SDK version issue: Please update retell-client-js-sdk to the latest version.');
        } else {
          throw error;
        }
      }

      console.log('Call start request completed');
      
      // Set up connection timeout with proper scoping and race condition protection
      const connectionTimeout = setTimeout(() => {
        console.log('⏰ Connection timeout reached - checking if we should assume connected');
        
        // Use functional update to get current status
        setCallStatus(currentStatus => {
          if (currentStatus !== 'connecting') {
            console.log('Status changed during timeout, not setting to connected');
            return currentStatus;
          }
          
          // Check if any events have fired by looking at the client state
          const client = retellClientRef.current;
          if (client) {
            // Try to detect if the call is actually working
            try {
              // Check if we can access audio context or other indicators
              const audioContext = window.AudioContext || window.webkitAudioContext;
              if (audioContext) {
                const context = new audioContext();
                if (context.state === 'running') {
                  console.log('✅ Audio context is running - call appears to be connected');
                  return 'connected';
                }
              }
            } catch (e) {
              console.log('Could not check audio context:', e);
            }
            
            // Final fallback - assume connected if no error occurred and still connecting
            console.log('⚠️ No connection events fired, but no errors - assuming connected');
            return 'connected';
          }
          
          return currentStatus;
        });
      }, 3000); // Reduced to 3 seconds for faster feedback
      
      // Set up a periodic check for connection status
      const connectionCheckInterval = setInterval(() => {
        // Use functional update to get current status
        setCallStatus(currentStatus => {
          if (currentStatus !== 'connecting') {
            console.log('Status changed, clearing interval');
            clearInterval(connectionCheckInterval);
            return currentStatus;
          }
          
          // Check if the client has any connection indicators
          const client = retellClientRef.current;
          if (client && typeof client.getConnectionState === 'function') {
            try {
              const state = client.getConnectionState();
              console.log('Connection state check:', state);
              if (state === 'connected' || state === 'active') {
                console.log('✅ Connection state indicates connected');
                clearTimeout(connectionTimeout);
                clearInterval(connectionCheckInterval);
                return 'connected';
              }
            } catch (e) {
              console.log('Could not check connection state:', e);
            }
          }
          
          // Check for audio activity as an indicator of connection
          try {
            const audioContext = window.AudioContext || window.webkitAudioContext;
            if (audioContext) {
              const context = new audioContext();
              if (context.state === 'running') {
                console.log('✅ Audio context is running - call appears to be connected');
                clearTimeout(connectionTimeout);
                clearInterval(connectionCheckInterval);
                return 'connected';
              }
            }
          } catch (e) {
            console.log('Could not check audio context:', e);
          }
          
          return currentStatus;
        });
      }, 1000); // Check every second
      
      // Store timeout and interval references for cleanup
      retellClientRef.current._connectionTimeout = connectionTimeout;
      retellClientRef.current._connectionCheckInterval = connectionCheckInterval;
      
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus('error');
      
      // Clear timeouts on error
      clearConnectionTimeouts();
      
      // Provide more specific error messages
      let errorMessage = 'Failed to start call: ';
      if (error.message) {
        if (error.message.includes('access_token') || error.message.includes('token')) {
          errorMessage += 'Invalid or expired access token. Please create a new web call.';
        } else if (error.message.includes('microphone') || error.message.includes('audio')) {
          errorMessage += 'Microphone access issue. Please check your browser permissions.';
        } else if (error.message.includes('WebRTC') || error.message.includes('webrtc')) {
          errorMessage += 'WebRTC connection failed. Please check your network and browser settings.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Unknown error occurred. Please try again.';
      }
      
      setError(errorMessage);
    }
  };

  const endWebCall = () => {
    console.log('Ending web call, current status:', callStatus);
    
    // Clear any pending timeouts/intervals first
    clearConnectionTimeouts();
    stopKeepAlive();
    
    // Set status to ending immediately to prevent race conditions
    setCallStatus('ended');
    
    if (retellClientRef.current) {
      // Stop the call using the available API method
      try {
        // Try both stopCall and stopConversation methods
        if (typeof retellClientRef.current.stopCall === 'function') {
          retellClientRef.current.stopCall();
          console.log('Call ended successfully using stopCall');
        } else if (typeof retellClientRef.current.stopConversation === 'function') {
          retellClientRef.current.stopConversation();
          console.log('Call ended successfully using stopConversation');
        } else {
          console.log('No stop method found on RetellWebClient');
        }
      } catch (error) {
        console.log('Error stopping call:', error);
        // Even if stopping fails, we still want to mark as ended
      }
    }
    
    // Clear any error messages
    setError('');
  };

  const openWebCall = () => {
    // Show a warning that direct URL doesn't work
    setError('Direct URL access is not supported. Please use the "Join Call" button above to start the call using the Retell Web SDK.');
  };

  const resetTest = () => {
    console.log('Resetting test, current status:', callStatus);
    
    // Clear any pending timeouts/intervals first
    clearConnectionTimeouts();
    stopKeepAlive();
    
    // Stop call if connected or connecting
    if (retellClientRef.current && (callStatus === 'connected' || callStatus === 'connecting')) {
      try {
        // Try both stopCall and stopConversation methods
        if (typeof retellClientRef.current.stopCall === 'function') {
          retellClientRef.current.stopCall();
          console.log('Call stopped during reset using stopCall');
        } else if (typeof retellClientRef.current.stopConversation === 'function') {
          retellClientRef.current.stopConversation();
          console.log('Call stopped during reset using stopConversation');
        }
      } catch (error) {
        console.log('Error stopping call during reset:', error);
      }
    }
    
    // Reset all state
    setWebCallResponse(null);
    setError('');
    setSelectedAgentId('');
    setCallStatus('idle');
  };

  const selectedAgent = agents.find(agent => agent.agent_id === selectedAgentId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Web Call Test</h1>
        <p className="text-gray-600">Test Retell AI web calls using the official SDK</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Configuration */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Test Configuration
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bot className="w-4 h-4 inline mr-2" />
                Select Agent
              </label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
              >
                <option value="">Select an agent to test</option>
                {agents.map((agent, index) => (
                  <option key={`${agent.agent_id}-${index}`} value={agent.agent_id}>
                    {agent.agent_name} ({agent.agent_id})
                  </option>
                ))}
              </select>
            </div>

            {selectedAgent && (
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Agent Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><span className="font-medium">Name:</span> {selectedAgent.agent_name}</div>
                  <div><span className="font-medium">ID:</span> {selectedAgent.agent_id}</div>
                  <div><span className="font-medium">Voice ID:</span> {selectedAgent.voice_id || 'Default'}</div>
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                      selectedAgent.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedAgent.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={createWebCall}
                disabled={loading || !selectedAgentId}
                className={`px-6 py-3 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                  loading
                    ? 'bg-warning-500 hover:bg-warning-600' 
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                <Play className="w-5 h-5" />
                <span className="ml-2">
                  {loading ? 'Creating Web Call...' : 'Create Web Call'}
                </span>
              </button>

              <button
                onClick={resetTest}
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                Reset
              </button>
            </div>

            {/* Call Status Display */}
            {callStatus !== 'idle' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      callStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                      callStatus === 'connected' ? 'bg-green-400' :
                      callStatus === 'ended' ? 'bg-gray-400' :
                      'bg-red-400'
                    }`}></div>
                    <span className="text-sm font-medium text-blue-800">
                      Call Status: {callStatus.charAt(0).toUpperCase() + callStatus.slice(1)}
                    </span>
                  </div>
                  
                  {callStatus === 'connected' && (
                    <button
                      onClick={endWebCall}
                      className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <PhoneOff className="w-4 h-4 inline mr-1" />
                      End Call
                    </button>
                  )}
                  
                  {callStatus === 'connecting' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log('Manually setting status to connected');
                          setCallStatus('connected');
                        }}
                        className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Mark as Connected
                      </button>
                      <button
                        onClick={() => {
                          console.log('Testing connection manually...');
                          if (retellClientRef.current) {
                            console.log('Client methods:', Object.getOwnPropertyNames(retellClientRef.current));
                            console.log('Client prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(retellClientRef.current)));
                          }
                        }}
                        className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Debug Client
                      </button>
                    </div>
                  )}
                  
                  {callStatus === 'ended' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={createWebCall}
                        className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <Phone className="w-4 h-4 inline mr-1" />
                        Create New Call
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Web Call Results
          </h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {webCallResponse ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="ml-2 text-sm font-medium text-green-800">
                    Web Call Created Successfully
                  </span>
                </div>
                
                {/* Prominent call-to-action */}
                <div className="bg-green-100 border border-green-300 rounded-md p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-green-800">Ready to Join Call!</h4>
                      <p className="text-xs text-green-700">Click the green "Join Call" button below to start talking to the agent</p>
                    </div>
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Agent ID:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                          {webCallResponse.agent_id}
                        </span>
                        <button
                          onClick={() => copyToClipboard(webCallResponse.agent_id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {webCallResponse.call_id && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Call ID:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                            {webCallResponse.call_id}
                          </span>
                          <button
                            onClick={() => copyToClipboard(webCallResponse.call_id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {webCallResponse.status}
                      </span>
                    </div>

                    {webCallResponse.access_token && (
                      <div className="pt-3 border-t border-green-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Access Token:</span>
                          <button
                            onClick={() => copyToClipboard(webCallResponse.access_token)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={webCallResponse.access_token}
                            readOnly
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 font-mono"
                          />
                          <button
                            onClick={joinWebCall}
                            disabled={callStatus === 'connecting' || callStatus === 'connected' || !retellClient}
                            className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            {callStatus === 'connecting' ? 'Connecting...' : 'Join Call'}
                          </button>
                        </div>
                      </div>
                    )}

                    {webCallResponse.web_call_url && (
                      <div className="pt-3 border-t border-green-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Web Call URL (Not Recommended):</span>
                          <button
                            onClick={() => copyToClipboard(webCallResponse.web_call_url)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={webCallResponse.web_call_url}
                            readOnly
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 font-mono"
                          />
                          <button
                            onClick={openWebCall}
                            className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
                            title="This will show an error - use 'Join Call' button instead"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                          ⚠️ This URL will show "Page Not Found" - use the "Join Call" button above instead
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">How to Join the Call</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>✅ CORRECT:</strong> Click the green "Join Call" button above</li>
                  <li>• <strong>❌ DON'T:</strong> Use the external link button (it will show "Page Not Found")</li>
                  <li>• Allow microphone permissions when prompted by your browser</li>
                  <li>• The call will connect you directly to the selected agent</li>
                  <li>• You can test the agent's responses and conversation flow</li>
                  <li>• Use the "End Call" button to terminate the call when done</li>
                  <li>• Check the browser console for any additional debug information</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Troubleshooting Connection Issues</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• <strong>If call ends immediately:</strong> SPEAK IMMEDIATELY after "Call is active" - the call auto-ends if no speech is detected</li>
                  <li>• <strong>WebSocket Code 1005:</strong> Connection lost unexpectedly - try creating a new web call, check network stability</li>
                  <li>• <strong>Access Token Expiry:</strong> Join the call within 30 seconds of creation</li>
                  <li>• <strong>Microphone:</strong> Make sure microphone is working and permissions are granted</li>
                  <li>• <strong>Browser Requirements:</strong> Use Chrome, Firefox, or Edge (latest versions)</li>
                  <li>• <strong>Network:</strong> Ensure stable internet connection, disable VPN if used</li>
                  <li>• <strong>Console Logs:</strong> Open browser DevTools (F12) to see detailed connection logs</li>
                  <li>• <strong>Firewall:</strong> Ensure WebRTC traffic is not blocked by firewall/antivirus</li>
                  <li>• <strong>Auto-Retry:</strong> The system will automatically retry failed connections up to 2 times</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Globe className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Web Call Created</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select an agent and click "Create Web Call" to test the Retell AI integration.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Debug Information */}
      {webCallResponse && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Debug Information</h2>
          <div className="bg-gray-50 rounded-md p-4">
            <pre className="text-sm text-gray-700 overflow-x-auto">
              {JSON.stringify(webCallResponse, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebCallTest;
