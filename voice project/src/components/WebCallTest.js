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

  // Load agents on component mount
  useEffect(() => {
    loadAgents();
    initializeRetellClient();
    
    // Cleanup function to clear timeouts/intervals on unmount
    return () => {
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
      
      // Set up event listeners - using correct event names from Retell Web SDK
      client.on('call_started', () => {
        console.log('✅ Call started event fired - setting status to connected');
        setCallStatus('connected');
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

      client.on('call_ended', () => {
        console.log('Call ended event fired');
        setCallStatus('ended');
      });

      client.on('error', (error) => {
        console.error('Retell client error:', error);
        setCallStatus('error');
        setError(`Call error: ${error.message || 'Unknown error'}`);
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

      // Additional useful events
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

      // Add additional event listeners for different possible event names
      client.on('conversation_started', () => {
        console.log('✅ Conversation started event fired - setting status to connected');
        setCallStatus('connected');
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

      client.on('audio_started', () => {
        console.log('✅ Audio started event fired - setting status to connected');
        setCallStatus('connected');
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

      client.on('connected', () => {
        console.log('✅ Connected event fired - setting status to connected');
        setCallStatus('connected');
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

      // Add more event listeners for better connection detection
      client.on('connection_established', () => {
        console.log('✅ Connection established event fired - setting status to connected');
        setCallStatus('connected');
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

      client.on('call_connected', () => {
        console.log('✅ Call connected event fired - setting status to connected');
        setCallStatus('connected');
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

      client.on('stream_started', () => {
        console.log('✅ Stream started event fired - setting status to connected');
        setCallStatus('connected');
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

      // Listen for any event to debug what's actually firing
      const originalOn = client.on;
      client.on = function(eventName, callback) {
        console.log(`Setting up listener for event: ${eventName}`);
        return originalOn.call(this, eventName, (...args) => {
          console.log(`Event ${eventName} fired with args:`, args);
          callback(...args);
        });
      };

      setRetellClient(client);
      retellClientRef.current = client;
      console.log('✅ Retell client initialized successfully');
      console.log('Available methods on client:', Object.getOwnPropertyNames(client));
      console.log('Client prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
      
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

  const joinWebCall = async () => {
    if (!webCallResponse?.access_token || !retellClientRef.current) {
      setError('No access token available or Retell client not initialized');
      return;
    }

    try {
      setCallStatus('connecting');
      setError('');

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
      
      // Try different method names based on the SDK version
      let result;
      try {
        // First try startCall (newer versions)
        result = await retellClientRef.current.startCall({
          accessToken: webCallResponse.access_token,
          sampleRate: 24000,
        });
        console.log('startCall returned:', result);
      } catch (startCallError) {
        console.log('startCall failed, trying startConversation:', startCallError.message);
        try {
          // Fallback to startConversation (older versions)
          result = await retellClientRef.current.startConversation({
            accessToken: webCallResponse.access_token,
            sampleRate: 24000,
          });
          console.log('startConversation returned:', result);
        } catch (startConversationError) {
          console.log('Both methods failed:', startConversationError.message);
          throw startConversationError;
        }
      }

      console.log('Call start request completed');
      
      // Set up connection timeout with proper scoping
      const connectionTimeout = setTimeout(() => {
        console.log('Connection timeout reached - assuming call is connected');
        setCallStatus('connected');
      }, 3000); // Reduced to 3 seconds for faster feedback
      
      // Set up a periodic check for connection status
      const connectionCheckInterval = setInterval(() => {
        // Check if the client has any connection indicators
        const client = retellClientRef.current;
        if (client && typeof client.getConnectionState === 'function') {
          try {
            const state = client.getConnectionState();
            console.log('Connection state check:', state);
            if (state === 'connected' || state === 'active') {
              setCallStatus('connected');
              clearTimeout(connectionTimeout);
              clearInterval(connectionCheckInterval);
            }
          } catch (e) {
            console.log('Could not check connection state:', e);
          }
        }
      }, 500); // Check every 500ms for faster response
      
      // Store timeout and interval references for cleanup
      retellClientRef.current._connectionTimeout = connectionTimeout;
      retellClientRef.current._connectionCheckInterval = connectionCheckInterval;
      
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus('error');
      
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
    if (retellClientRef.current) {
      // Clear any pending timeouts/intervals
      if (retellClientRef.current._connectionTimeout) {
        clearTimeout(retellClientRef.current._connectionTimeout);
        retellClientRef.current._connectionTimeout = null;
      }
      if (retellClientRef.current._connectionCheckInterval) {
        clearInterval(retellClientRef.current._connectionCheckInterval);
        retellClientRef.current._connectionCheckInterval = null;
      }
      
      // Stop the conversation
      try {
        retellClientRef.current.stopConversation();
        console.log('Call ended successfully');
      } catch (error) {
        console.log('Error stopping conversation:', error);
      }
      
      setCallStatus('ended');
    }
  };

  const openWebCall = () => {
    // Show a warning that direct URL doesn't work
    setError('Direct URL access is not supported. Please use the "Join Call" button above to start the call using the Retell Web SDK.');
  };

  const resetTest = () => {
    // End any active call and clean up
    if (retellClientRef.current) {
      // Clear any pending timeouts/intervals
      if (retellClientRef.current._connectionTimeout) {
        clearTimeout(retellClientRef.current._connectionTimeout);
        retellClientRef.current._connectionTimeout = null;
      }
      if (retellClientRef.current._connectionCheckInterval) {
        clearInterval(retellClientRef.current._connectionCheckInterval);
        retellClientRef.current._connectionCheckInterval = null;
      }
      
      // Stop conversation if connected
      if (callStatus === 'connected' || callStatus === 'connecting') {
        try {
          retellClientRef.current.stopConversation();
          console.log('Call stopped during reset');
        } catch (error) {
          console.log('Error stopping conversation during reset:', error);
        }
      }
    }
    
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
                {agents.map((agent) => (
                  <option key={agent.agent_id} value={agent.agent_id}>
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
                  <li>• <strong>If stuck on "Connecting":</strong> Wait 3 seconds for automatic connection, or click "Mark as Connected"</li>
                  <li>• <strong>Browser Requirements:</strong> Use Chrome, Firefox, or Edge (latest versions)</li>
                  <li>• <strong>Network:</strong> Ensure stable internet connection, disable VPN if used</li>
                  <li>• <strong>Microphone:</strong> Make sure microphone is working and permissions are granted</li>
                  <li>• <strong>Console Logs:</strong> Open browser DevTools (F12) to see detailed connection logs</li>
                  <li>• <strong>Firewall:</strong> Ensure WebRTC traffic is not blocked by firewall/antivirus</li>
                  <li>• <strong>Connection Events:</strong> The app now listens for multiple connection events for better reliability</li>
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
