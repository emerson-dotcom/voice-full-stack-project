// API utility functions for Voice Agent Admin
const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.detail || `HTTP error! status: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Network error: ${error.message}`,
      0,
      null
    );
  }
}

// Agent Configuration API functions
export const agentConfigApi = {
  // Get all agent configurations
  getAll: () => apiRequest('/agent-configurations'),
  
  // Get specific agent configuration
  getById: (id) => apiRequest(`/agent-configurations/${id}`),
  
  // Create new agent configuration
  create: (config) => apiRequest('/agent-configurations', {
    method: 'POST',
    body: JSON.stringify(config),
  }),
  
  // Update agent configuration
  update: (id, config) => apiRequest(`/agent-configurations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(config),
  }),
  
  // Delete agent configuration
  delete: (id) => apiRequest(`/agent-configurations/${id}`, {
    method: 'DELETE',
  }),
};

// Call Management API functions
export const callApi = {
  // Trigger a test call
  trigger: (callRequest) => apiRequest('/calls/trigger', {
    method: 'POST',
    body: JSON.stringify(callRequest),
  }),
  
  // Trigger a voice call (WebRTC)
  triggerVoiceCall: (callRequest) => apiRequest('/calls/voice/trigger', {
    method: 'POST',
    body: JSON.stringify(callRequest),
  }),
  
  // Get all call records
  getAll: (limit = 50, offset = 0) => 
    apiRequest(`/calls?limit=${limit}&offset=${offset}`),
  
  // Get specific call record
  getById: (callId) => apiRequest(`/calls/${callId}`),
  
  // Update call status
  updateStatus: (callId, statusUpdate) => 
    apiRequest(`/calls/${callId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusUpdate),
    }),
  
  // Get calls by agent configuration
  getByAgent: (agentConfigId, limit = 50) => 
    apiRequest(`/calls/agent/${agentConfigId}?limit=${limit}`),
  
  // Get calls by status
  getByStatus: (status, limit = 50) => 
    apiRequest(`/calls/status/${status}?limit=${limit}`),
  
  // Create web call
  createWebCall: (agentId) => apiRequest('/calls/web-call', {
    method: 'POST',
    body: JSON.stringify({ agent_id: agentId }),
  }),
};

// Agents API functions
export const agentsApi = {
  // Get all agents from Retell AI
  getAll: () => apiRequest('/agents'),
  
  // Get specific agent by ID
  getById: (agentId) => apiRequest(`/agents/${agentId}`),
  
  // Create new agent in both Supabase and Retell AI
  create: (agentConfig) => apiRequest('/agents/create', {
    method: 'POST',
    body: JSON.stringify(agentConfig),
  }),
};

// Health check
export const healthApi = {
  check: () => apiRequest('/health'),
};

export { ApiError };
