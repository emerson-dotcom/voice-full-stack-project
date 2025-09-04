import React, { useState } from 'react';
import { Search, Filter, Download, Eye, EyeOff, Calendar, Clock, Phone, User, Hash, MapPin, X } from 'lucide-react';

const CallResults = () => {
  const [selectedCall, setSelectedCall] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - in real app this would come from your backend
  const mockCalls = [
    {
      id: 'CALL-20241201-001',
      driverName: 'John Smith',
      phoneNumber: '+1 (555) 123-4567',
      loadNumber: 'LOAD-2024-001',
      deliveryAddress: '123 Main St, Anytown, USA',
      callDate: '2024-12-01T10:30:00Z',
      duration: '3:45',
      status: 'completed',
      agent: 'Logistics Assistant',
      summary: {
        loadConfirmed: true,
        addressVerified: true,
        deliveryTime: '2024-12-01T14:00:00Z',
        issues: ['Driver mentioned traffic delay'],
        nextSteps: 'Monitor delivery progress',
        driverSatisfaction: 'Satisfied'
      },
      transcript: [
        { speaker: 'Agent', text: 'Hello, this is your logistics assistant calling about your delivery. How are you today?' },
        { speaker: 'Driver', text: 'Hi, I\'m doing well. I\'m currently on my way with load LOAD-2024-001.' },
        { speaker: 'Agent', text: 'Great! I can see you\'re delivering to 123 Main St in Anytown. Is that address correct?' },
        { speaker: 'Driver', text: 'Yes, that\'s correct. I have the right address.' },
        { speaker: 'Agent', text: 'Perfect. What time do you expect to arrive at the delivery location?' },
        { speaker: 'Driver', text: 'I\'m looking at about 2 PM, but there\'s some traffic so it might be closer to 2:30.' },
        { speaker: 'Agent', text: 'I understand. Traffic can be unpredictable. Is there anything else I should know about this delivery?' },
        { speaker: 'Driver', text: 'No, everything looks good. The load is secure and I\'m on schedule despite the traffic.' },
        { speaker: 'Agent', text: 'Excellent. Thank you for the update. Is there anything else you need assistance with?' },
        { speaker: 'Driver', text: 'No, that covers it. Thanks for checking in.' },
        { speaker: 'Agent', text: 'You\'re welcome. Have a safe trip and thank you for your service. Goodbye!' },
        { speaker: 'Driver', text: 'Goodbye!' }
      ]
    },
    {
      id: 'CALL-20241201-002',
      driverName: 'Sarah Johnson',
      phoneNumber: '+1 (555) 987-6543',
      loadNumber: 'LOAD-2024-002',
      deliveryAddress: '456 Oak Ave, Somewhere, USA',
      callDate: '2024-12-01T11:15:00Z',
      duration: '1:23',
      status: 'in-progress',
      agent: 'Logistics Assistant',
      summary: {
        loadConfirmed: true,
        addressVerified: false,
        deliveryTime: '2024-12-01T16:00:00Z',
        issues: ['Address needs verification', 'Driver has questions about access'],
        nextSteps: 'Verify address with customer',
        driverSatisfaction: 'Neutral'
      },
      transcript: [
        { speaker: 'Agent', text: 'Hello, this is your logistics assistant calling about your delivery. How are you today?' },
        { speaker: 'Driver', text: 'Hi, I\'m good. I\'m calling about load LOAD-2024-002.' },
        { speaker: 'Agent', text: 'Thank you. I can see you\'re delivering to 456 Oak Ave in Somewhere. Is that correct?' },
        { speaker: 'Driver', text: 'Actually, I have some questions about this address. The GPS is taking me to a residential area.' },
        { speaker: 'Agent', text: 'I understand your concern. Let me check the delivery details for you.' },
        { speaker: 'Driver', text: 'Also, is there a loading dock or should I call ahead for access?' },
        { speaker: 'Agent', text: 'Let me get that information for you. One moment please...' }
      ]
    }
  ];

  const filteredCalls = mockCalls.filter(call => {
    const matchesSearch = call.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.loadNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-success-100', text: 'text-success-800', label: 'Completed' },
      'in-progress': { bg: 'bg-warning-100', text: 'text-warning-800', label: 'In Progress' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Scheduled' }
    };
    
    const config = statusConfig[status] || statusConfig.completed;
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDuration = (duration) => {
    return duration;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportCallData = (call) => {
    // In a real app, this would generate and download a report
    console.log('Exporting call data:', call);
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Call Results</h1>
        <p className="text-gray-600">Review and analyze completed voice agent calls</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by driver name, load number, or call ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="failed">Failed</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Call Results List */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Call Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver Info
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{call.id}</div>
                        <div className="text-sm text-gray-500">{call.loadNumber}</div>
                        <div className="text-sm text-gray-500">{call.deliveryAddress}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{call.driverName}</div>
                    <div className="text-sm text-gray-500">{call.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(call.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDuration(call.duration)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(call.callDate)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedCall(call)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => exportCallData(call)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Detail Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedCall(null)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Call Details - {selectedCall.id}</h3>
                  <button
                    onClick={() => setSelectedCall(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Call Summary */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Call Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Load Confirmed:</span>
                        <span className={`text-sm ${selectedCall.summary.loadConfirmed ? 'text-success-600' : 'text-red-600'}`}>
                          {selectedCall.summary.loadConfirmed ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Address Verified:</span>
                        <span className={`text-sm ${selectedCall.summary.addressVerified ? 'text-success-600' : 'text-red-600'}`}>
                          {selectedCall.summary.addressVerified ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Delivery Time:</span>
                        <span className="text-sm text-gray-900">
                          {formatDate(selectedCall.summary.deliveryTime)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Driver Satisfaction:</span>
                        <span className="text-sm text-gray-900">{selectedCall.summary.driverSatisfaction}</span>
                      </div>
                    </div>

                    {selectedCall.summary.issues.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Issues Identified:</h5>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {selectedCall.summary.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Next Steps:</h5>
                      <p className="text-sm text-gray-600">{selectedCall.summary.nextSteps}</p>
                    </div>
                  </div>

                  {/* Call Information */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Call Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedCall.driverName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedCall.phoneNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedCall.loadNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedCall.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{formatDate(selectedCall.callDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Duration:</span>
                        <span className="text-sm text-gray-900">{selectedCall.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transcript Toggle */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                  >
                    {showTranscript ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showTranscript ? 'Hide Transcript' : 'Show Full Transcript'}</span>
                  </button>
                </div>

                {/* Full Transcript */}
                {showTranscript && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Full Transcript</h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      {selectedCall.transcript.map((message, index) => (
                        <div key={index} className={`mb-3 ${message.speaker === 'Agent' ? 'text-right' : 'text-left'}`}>
                          <div className={`inline-block max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                            message.speaker === 'Agent' 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}>
                            <div className="text-xs font-medium mb-1 opacity-75">{message.speaker}</div>
                            <div className="text-sm">{message.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => exportCallData(selectedCall)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </button>
                <button
                  onClick={() => setSelectedCall(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallResults;
