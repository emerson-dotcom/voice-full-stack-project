import React, { useState } from 'react';
import { Phone, User, Hash, MapPin, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const CallTriggering = () => {
  const [callData, setCallData] = useState({
    driverName: '',
    phoneNumber: '',
    loadNumber: '',
    deliveryAddress: '',
    expectedDeliveryTime: '',
    specialInstructions: ''
  });

  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, success, failed
  const [callDetails, setCallDetails] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!callData.driverName.trim()) {
      newErrors.driverName = 'Driver name is required';
    }
    
    if (!callData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(callData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
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

  const handleStartCall = async () => {
    if (!validateForm()) {
      return;
    }

    setCallStatus('calling');
    
    // Simulate API call to start the voice agent call
    try {
      // This would be your actual API call to Retell AI
      await simulateCallStart();
      
      setCallStatus('success');
      setCallDetails({
        callId: `CALL-${Date.now()}`,
        startTime: new Date().toISOString(),
        status: 'In Progress',
        duration: '0:00',
        agent: 'Logistics Assistant'
      });
    } catch (error) {
      setCallStatus('failed');
      console.error('Failed to start call:', error);
    }
  };

  const simulateCallStart = () => {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(resolve, 2000);
    });
  };

  const resetForm = () => {
    setCallData({
      driverName: '',
      phoneNumber: '',
      loadNumber: '',
      deliveryAddress: '',
      expectedDeliveryTime: '',
      specialInstructions: ''
    });
    setCallStatus('idle');
    setCallDetails(null);
    setErrors({});
  };

  const getStatusIcon = () => {
    switch (callStatus) {
      case 'calling':
        return <Clock className="w-5 h-5 text-warning-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Phone className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'calling':
        return 'Initiating call...';
      case 'success':
        return 'Call started successfully';
      case 'failed':
        return 'Failed to start call';
      default:
        return 'Ready to start call';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Call Triggering</h1>
        <p className="text-gray-600">Initiate test calls with your configured voice agent</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Form */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Call Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Driver Name *
                </label>
                <input
                  type="text"
                  value={callData.driverName}
                  onChange={(e) => handleInputChange('driverName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.driverName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter driver's full name"
                />
                {errors.driverName && (
                  <p className="mt-1 text-sm text-red-600">{errors.driverName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={callData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
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
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.loadNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={callData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Any special instructions for the driver..."
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleStartCall}
                disabled={callStatus === 'calling'}
                className={`px-6 py-3 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  callStatus === 'calling' 
                    ? 'bg-warning-500 hover:bg-warning-600' 
                    : 'bg-primary-600 hover:bg-primary-700'
                } flex items-center`}
              >
                {getStatusIcon()}
                <span className="ml-2">
                  {callStatus === 'calling' ? 'Starting Call...' : 'Start Test Call'}
                </span>
              </button>

              <button
                onClick={resetForm}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Reset Form
              </button>
            </div>
          </div>
        </div>

        {/* Call Status */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Call Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <span className="text-sm font-medium text-gray-900">{getStatusText()}</span>
              </div>

              {callStatus === 'calling' && (
                <div className="bg-warning-50 border border-warning-200 rounded-md p-3">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-warning-400" />
                    <div className="ml-3">
                      <p className="text-sm text-warning-800">
                        Please wait while we connect your call...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {callStatus === 'success' && callDetails && (
                <div className="bg-success-50 border border-success-200 rounded-md p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-success-800 font-medium">Call ID:</span>
                      <span className="text-success-700">{callDetails.callId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-success-800 font-medium">Start Time:</span>
                      <span className="text-success-700">
                        {new Date(callDetails.startTime).toLocaleTimeString()}
                      </span>
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
                        Failed to start the call. Please try again or check your configuration.
                      </p>
                    </div>
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

      {/* Call History Preview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Call History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Call ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Load
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  CALL-20241201-001
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  John Smith
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  LOAD-2024-001
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-success-100 text-success-800">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  3:45
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Dec 1, 2024
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  CALL-20241201-002
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Sarah Johnson
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  LOAD-2024-002
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-warning-100 text-warning-800">
                    In Progress
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  1:23
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Dec 1, 2024
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CallTriggering;
