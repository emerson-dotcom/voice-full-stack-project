import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Settings, User, Hash, MapPin, Clock, AlertCircle, CheckCircle, XCircle, Volume2, VolumeX } from 'lucide-react';
import { agentConfigApi, ApiError } from '../utils/api';

const VoiceCall = () => {
  const [callData, setCallData] = useState({
    agentConfigId: '',
    driverName: '',
    loadNumber: '',
    deliveryAddress: '',
    expectedDeliveryTime: '',
    specialInstructions: ''
  });

  const [callStatus, setCallStatus] = useState('idle'); // idle, connecting, connected, ended, failed
  const [callDetails, setCallDetails] = useState(null);
  const [errors, setErrors] = useState({});
  const [agentConfigurations, setAgentConfigurations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);

  // Refs for WebRTC
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const callDurationIntervalRef = useRef(null);

  // Load agent configurations on component mount
  useEffect(() => {
    loadAgentConfigurations();
    return () => {
      // Cleanup on unmount
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current);
      }
      endCall();
    };
  }, []);

  // Update call duration every second when call is active
  useEffect(() => {
    if (callStatus === 'connected' && callStartTime) {
      callDurationIntervalRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    } else {
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current);
        callDurationIntervalRef.current = null;
      }
    }

    return () => {
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current);
      }
    };
  }, [callStatus, callStartTime]);

  const loadAgentConfigurations = async () => {
    try {
      const response = await agentConfigApi.getAll();
      setAgentConfigurations(response.configurations || []);
    } catch (error) {
      console.error('Failed to load agent configurations:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!callData.agentConfigId) {
      newErrors.agentConfigId = 'Please select an agent configuration';
    }
    
    if (!callData.driverName.trim()) {
      newErrors.driverName = 'Driver name is required';
    }
    
    if (!callData.loadNumber.trim()) {
      newErrors.loadNumber = 'Load number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setCallData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async () => {
    if (!validateForm()) {
      return;
    }

    setCallStatus('connecting');
    setLoading(true);
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      
      localStreamRef.current = stream;
      
      // Set up local audio element (for monitoring)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
          setCallStatus('connected');
          setCallStartTime(Date.now());
          setCallDetails({
            callId: `voice_${Date.now()}`,
            startTime: new Date().toISOString(),
            status: 'connected',
            agent: agentConfigurations.find(config => config.id === parseInt(callData.agentConfigId))?.agent_name || 'Unknown Agent'
          });
        } else if (peerConnection.connectionState === 'disconnected' || 
                   peerConnection.connectionState === 'failed') {
          endCall();
        }
      };

      // For demo purposes, we'll simulate a successful connection
      // In a real implementation, you would establish connection with your voice agent service
      setTimeout(() => {
        setCallStatus('connected');
        setCallStartTime(Date.now());
        setCallDetails({
          callId: `voice_${Date.now()}`,
          startTime: new Date().toISOString(),
          status: 'connected',
          agent: agentConfigurations.find(config => config.id === parseInt(callData.agentConfigId))?.agent_name || 'Unknown Agent'
        });
      }, 2000);

    } catch (error) {
      setCallStatus('failed');
      console.error('Failed to start voice call:', error);
      
      if (error.name === 'NotAllowedError') {
        setErrors({ general: 'Microphone access denied. Please allow microphone access and try again.' });
      } else if (error.name === 'NotFoundError') {
        setErrors({ general: 'No microphone found. Please connect a microphone and try again.' });
      } else {
        setErrors({ general: 'Failed to start voice call. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const endCall = () => {
    setCallStatus('ended');
    
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Reset call duration
    setCallDuration(0);
    setCallStartTime(null);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // In a real implementation, you would control the speaker output here
  };

  const resetForm = () => {
    setCallData({
      agentConfigId: '',
      driverName: '',
      loadNumber: '',
      deliveryAddress: '',
      expectedDeliveryTime: '',
      specialInstructions: ''
    });
    setCallStatus('idle');
    setCallDetails(null);
    setErrors({});
    setCallDuration(0);
    setCallStartTime(null);
    setIsMuted(false);
    setIsSpeakerOn(true);
  };

  const getStatusIcon = () => {
    switch (callStatus) {
      case 'connecting':
        return <Phone className="w-5 h-5 text-warning-500 animate-pulse" />;
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'ended':
        return <PhoneOff className="w-5 h-5 text-gray-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Mic className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return 'Connecting to voice agent...';
      case 'connected':
        return `Connected - ${formatDuration(callDuration)}`;
      case 'ended':
        return 'Call ended';
      case 'failed':
        return 'Failed to connect';
      default:
        return 'Ready to start voice call';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Voice Call</h1>
        <p className="text-gray-600">Start a direct voice call with your configured voice agent</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Form */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Call Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Settings className="w-4 h-4 inline mr-2" />
                  Agent Configuration *
                </label>
                <select
                  value={callData.agentConfigId}
                  onChange={(e) => handleInputChange('agentConfigId', e.target.value)}
                  disabled={callStatus === 'connected' || callStatus === 'connecting'}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.agentConfigId ? 'border-red-300' : 'border-gray-300'
                  } ${callStatus === 'connected' || callStatus === 'connecting' ? 'bg-gray-100' : ''}`}
                >
                  <option value="">Select an agent configuration</option>
                  {agentConfigurations.map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.agent_name} {!config.is_active ? '(Inactive)' : ''}
                    </option>
                  ))}
                </select>
                {errors.agentConfigId && (
                  <p className="mt-1 text-sm text-red-600">{errors.agentConfigId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Driver Name *
                </label>
                <input
                  type="text"
                  value={callData.driverName}
                  onChange={(e) => handleInputChange('driverName', e.target.value)}
                  disabled={callStatus === 'connected' || callStatus === 'connecting'}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.driverName ? 'border-red-300' : 'border-gray-300'
                  } ${callStatus === 'connected' || callStatus === 'connecting' ? 'bg-gray-100' : ''}`}
                  placeholder="Enter driver's full name"
                />
                {errors.driverName && (
                  <p className="mt-1 text-sm text-red-600">{errors.driverName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-2" />
                  Load Number *
                </label>
                <input
                  type="text"
                  value={callData.loadNumber}
                  onChange={(e) => handleInputChange('loadNumber', e.target.value)}
                  disabled={callStatus === 'connected' || callStatus === 'connecting'}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.loadNumber ? 'border-red-300' : 'border-gray-300'
                  } ${callStatus === 'connected' || callStatus === 'connecting' ? 'bg-gray-100' : ''}`}
                  placeholder="e.g., LOAD-2024-001"
                />
                {errors.loadNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.loadNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={callData.deliveryAddress}
                  onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                  disabled={callStatus === 'connected' || callStatus === 'connecting'}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    callStatus === 'connected' || callStatus === 'connecting' ? 'bg-gray-100' : ''
                  }`}
                  placeholder="Enter delivery address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Expected Delivery Time
                </label>
                <input
                  type="datetime-local"
                  value={callData.expectedDeliveryTime}
                  onChange={(e) => handleInputChange('expectedDeliveryTime', e.target.value)}
                  disabled={callStatus === 'connected' || callStatus === 'connecting'}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    callStatus === 'connected' || callStatus === 'connecting' ? 'bg-gray-100' : ''
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={callData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  disabled={callStatus === 'connected' || callStatus === 'connecting'}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    callStatus === 'connected' || callStatus === 'connecting' ? 'bg-gray-100' : ''
                  }`}
                  placeholder="Any special instructions for the driver..."
                />
              </div>
            </div>

            {errors.general && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{errors.general}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex space-x-3">
              {callStatus === 'idle' || callStatus === 'ended' || callStatus === 'failed' ? (
                <button
                  onClick={startCall}
                  disabled={loading}
                  className={`px-6 py-3 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    loading
                      ? 'bg-warning-500 hover:bg-warning-600' 
                      : 'bg-primary-600 hover:bg-primary-700'
                  } flex items-center`}
                >
                  <Mic className="w-5 h-5" />
                  <span className="ml-2">
                    {loading ? 'Starting Call...' : 'Start Voice Call'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={endCall}
                  className="px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span className="ml-2">End Call</span>
                </button>
              )}

              <button
                onClick={resetForm}
                disabled={callStatus === 'connected' || callStatus === 'connecting'}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset Form
              </button>
            </div>
          </div>
        </div>

        {/* Call Status and Controls */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Call Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <span className="text-sm font-medium text-gray-900">{getStatusText()}</span>
              </div>

              {callStatus === 'connecting' && (
                <div className="bg-warning-50 border border-warning-200 rounded-md p-3">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-warning-400" />
                    <div className="ml-3">
                      <p className="text-sm text-warning-800">
                        Please allow microphone access when prompted...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {callStatus === 'connected' && callDetails && (
                <div className="bg-success-50 border border-success-200 rounded-md p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-success-800 font-medium">Call ID:</span>
                      <span className="text-success-700">{callDetails.callId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-success-800 font-medium">Duration:</span>
                      <span className="text-success-700">{formatDuration(callDuration)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-success-800 font-medium">Status:</span>
                      <span className="text-success-700">{callDetails.status}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-success-800 font-medium">Agent:</span>
                      <span className="text-success-700">{callDetails.agent}</span>
                    </div>
                  </div>
                </div>
              )}

              {callStatus === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">
                        Failed to start the voice call. Please try again or check your microphone.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Call Controls */}
              {callStatus === 'connected' && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Call Controls</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={toggleMute}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                        isMuted 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } flex items-center justify-center`}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      <span className="ml-1">{isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>
                    
                    <button
                      onClick={toggleSpeaker}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                        isSpeakerOn 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } flex items-center justify-center`}
                    >
                      {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      <span className="ml-1">Speaker</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.href = '#results'}
                    className="w-full text-left px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-md"
                  >
                    View Call Results
                  </button>
                  <button
                    onClick={() => window.location.href = '#configuration'}
                    className="w-full text-left px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-md"
                  >
                    Edit Agent Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Elements (Hidden) */}
      <div className="hidden">
        <audio ref={localVideoRef} autoPlay muted />
        <audio ref={remoteVideoRef} autoPlay />
      </div>
    </div>
  );
};

export default VoiceCall;
