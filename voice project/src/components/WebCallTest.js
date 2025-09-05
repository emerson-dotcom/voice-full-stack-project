import React, { useState, useEffect } from 'react';
import { Globe, Play, ExternalLink, Copy, CheckCircle, XCircle, AlertCircle, Bot, Settings } from 'lucide-react';
import { agentsApi, callApi, ApiError } from '../utils/api';

const WebCallTest = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [webCallResponse, setWebCallResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Load agents on component mount
  useEffect(() => {
    loadAgents();
  }, []);

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

  const openWebCall = () => {
    if (webCallResponse?.web_call_url) {
      window.open(webCallResponse.web_call_url, '_blank');
    }
  };

  const resetTest = () => {
    setWebCallResponse(null);
    setError('');
    setSelectedAgentId('');
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

                    {webCallResponse.web_call_url && (
                      <div className="pt-3 border-t border-green-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Web Call URL:</span>
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
                            className="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Next Steps</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Click the external link button to open the web call in a new tab</li>
                  <li>• The web call will connect you directly to the selected agent</li>
                  <li>• You can test the agent's responses and conversation flow</li>
                  <li>• Check the browser console for any additional debug information</li>
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
