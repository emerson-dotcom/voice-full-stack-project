import React, { useState } from 'react';
import { Save, Plus, Trash2, AlertCircle } from 'lucide-react';

const AgentConfiguration = () => {
  const [config, setConfig] = useState({
    agentName: 'Logistics Assistant',
    greeting: 'Hello, this is your logistics assistant calling about your delivery.',
    primaryObjective: 'Confirm delivery details and address any concerns.',
    conversationFlow: [
      {
        id: 1,
        step: 'Greeting',
        prompt: 'Introduce yourself and explain the purpose of the call',
        required: true,
        order: 1
      },
      {
        id: 2,
        step: 'Load Confirmation',
        prompt: 'Confirm the load number and delivery details',
        required: true,
        order: 2
      },
      {
        id: 3,
        step: 'Address Verification',
        prompt: 'Verify the delivery address is correct',
        required: true,
        order: 3
      },
      {
        id: 4,
        step: 'Issue Resolution',
        prompt: 'Address any concerns or issues mentioned',
        required: false,
        order: 4
      },
      {
        id: 5,
        step: 'Closing',
        prompt: 'Thank the driver and confirm next steps',
        required: true,
        order: 5
      }
    ],
    fallbackResponses: [
      'I apologize, but I didn\'t catch that. Could you please repeat?',
      'I\'m having trouble understanding. Let me try to rephrase.',
      'Could you please speak a bit louder or more clearly?'
    ],
    callEndingConditions: [
      'Driver confirms all details',
      'Driver requests callback',
      'Call duration exceeds 5 minutes',
      'Driver hangs up'
    ]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConversationStepChange = (id, field, value) => {
    setConfig(prev => ({
      ...prev,
      conversationFlow: prev.conversationFlow.map(step =>
        step.id === id ? { ...step, [field]: value } : step
      )
    }));
  };

  const addConversationStep = () => {
    const newStep = {
      id: Date.now(),
      step: 'New Step',
      prompt: 'Enter the prompt for this step',
      required: false,
      order: config.conversationFlow.length + 1
    };
    setConfig(prev => ({
      ...prev,
      conversationFlow: [...prev.conversationFlow, newStep]
    }));
  };

  const removeConversationStep = (id) => {
    setConfig(prev => ({
      ...prev,
      conversationFlow: prev.conversationFlow.filter(step => step.id !== id)
    }));
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const moveStep = (id, direction) => {
    setConfig(prev => {
      const flow = [...prev.conversationFlow];
      const index = flow.findIndex(step => step.id === id);
      if (direction === 'up' && index > 0) {
        [flow[index], flow[index - 1]] = [flow[index - 1], flow[index]];
      } else if (direction === 'down' && index < flow.length - 1) {
        [flow[index], flow[index + 1]] = [flow[index + 1], flow[index]];
      }
      return { ...prev, conversationFlow: flow };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Configuration</h1>
          <p className="text-gray-600">Configure your voice agent's behavior and conversation flow</p>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
            >
              Edit Configuration
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-success-50 border border-success-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-success-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-success-800">
                Configuration saved successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Configuration */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agent Name
            </label>
            <input
              type="text"
              value={config.agentName}
              onChange={(e) => handleInputChange('agentName', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Greeting Message
            </label>
            <textarea
              value={config.greeting}
              onChange={(e) => handleInputChange('greeting', e.target.value)}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Objective
          </label>
          <textarea
            value={config.primaryObjective}
            onChange={(e) => handleInputChange('primaryObjective', e.target.value)}
            disabled={!isEditing}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
      </div>

      {/* Conversation Flow */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Conversation Flow</h2>
          {isEditing && (
            <button
              onClick={addConversationStep}
              className="px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Step
            </button>
          )}
        </div>
        <div className="space-y-4">
          {config.conversationFlow.map((step, index) => (
            <div key={step.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                      {step.order}
                    </span>
                    <input
                      type="text"
                      value={step.step}
                      onChange={(e) => handleConversationStepChange(step.id, 'step', e.target.value)}
                      disabled={!isEditing}
                      className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 disabled:text-gray-900"
                    />
                  </div>
                  <textarea
                    value={step.prompt}
                    onChange={(e) => handleConversationStepChange(step.id, 'prompt', e.target.value)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter the prompt for this conversation step..."
                  />
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={step.required}
                        onChange={(e) => handleConversationStepChange(step.id, 'required', e.target.checked)}
                        disabled={!isEditing}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Required step</span>
                    </label>
                  </div>
                </div>
                {isEditing && (
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => moveStep(step.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveStep(step.id, 'down')}
                      disabled={index === config.conversationFlow.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeConversationStep(step.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fallback Responses */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Fallback Responses</h2>
        <div className="space-y-3">
          {config.fallbackResponses.map((response, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={response}
                onChange={(e) => {
                  const newResponses = [...config.fallbackResponses];
                  newResponses[index] = e.target.value;
                  handleInputChange('fallbackResponses', newResponses);
                }}
                disabled={!isEditing}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
              {isEditing && (
                <button
                  onClick={() => {
                    const newResponses = config.fallbackResponses.filter((_, i) => i !== index);
                    handleInputChange('fallbackResponses', newResponses);
                  }}
                  className="p-2 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <button
              onClick={() => {
                const newResponses = [...config.fallbackResponses, 'New fallback response'];
                handleInputChange('fallbackResponses', newResponses);
              }}
              className="px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Fallback Response
            </button>
          )}
        </div>
      </div>

      {/* Call Ending Conditions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Call Ending Conditions</h2>
        <div className="space-y-3">
          {config.callEndingConditions.map((condition, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={condition}
                onChange={(e) => {
                  const newConditions = [...config.callEndingConditions];
                  newConditions[index] = e.target.value;
                  handleInputChange('callEndingConditions', newConditions);
                }}
                disabled={!isEditing}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
              {isEditing && (
                <button
                  onClick={() => {
                    const newConditions = config.callEndingConditions.filter((_, i) => i !== index);
                    handleInputChange('callEndingConditions', newConditions);
                  }}
                  className="p-2 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <button
              onClick={() => {
                const newConditions = [...config.callEndingConditions, 'New ending condition'];
                handleInputChange('callEndingConditions', newConditions);
              }}
              className="px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Ending Condition
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentConfiguration;
