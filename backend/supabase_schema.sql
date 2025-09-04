-- Supabase Database Schema for Voice Agent Admin
-- Run this SQL in your Supabase SQL Editor

-- Create agent_configurations table
CREATE TABLE IF NOT EXISTS agent_configurations (
    id BIGSERIAL PRIMARY KEY,
    agent_name VARCHAR(100) NOT NULL,
    greeting TEXT NOT NULL,
    primary_objective TEXT NOT NULL,
    conversation_flow JSONB NOT NULL,
    fallback_responses TEXT[] DEFAULT '{}',
    call_ending_conditions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on agent_name for faster searches
CREATE INDEX IF NOT EXISTS idx_agent_configurations_agent_name ON agent_configurations(agent_name);

-- Create an index on is_active for filtering active configurations
CREATE INDEX IF NOT EXISTS idx_agent_configurations_is_active ON agent_configurations(is_active);

-- Create an index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_agent_configurations_created_at ON agent_configurations(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE agent_configurations ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
-- You can modify this policy based on your authentication requirements
CREATE POLICY "Allow all operations for authenticated users" ON agent_configurations
    FOR ALL USING (true);

-- Create a policy that allows all operations for anonymous users (for development)
-- Remove this policy in production and use proper authentication
CREATE POLICY "Allow all operations for anonymous users" ON agent_configurations
    FOR ALL USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_agent_configurations_updated_at 
    BEFORE UPDATE ON agent_configurations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
INSERT INTO agent_configurations (
    agent_name,
    greeting,
    primary_objective,
    conversation_flow,
    fallback_responses,
    call_ending_conditions
) VALUES (
    'Logistics Assistant',
    'Hello, this is your logistics assistant calling about your delivery.',
    'Confirm delivery details and address any concerns.',
    '[
        {
            "id": 1,
            "step": "Greeting",
            "prompt": "Introduce yourself and explain the purpose of the call",
            "required": true,
            "order": 1
        },
        {
            "id": 2,
            "step": "Load Confirmation",
            "prompt": "Confirm the load number and delivery details",
            "required": true,
            "order": 2
        },
        {
            "id": 3,
            "step": "Address Verification",
            "prompt": "Verify the delivery address is correct",
            "required": true,
            "order": 3
        },
        {
            "id": 4,
            "step": "Issue Resolution",
            "prompt": "Address any concerns or issues mentioned",
            "required": false,
            "order": 4
        },
        {
            "id": 5,
            "step": "Closing",
            "prompt": "Thank the driver and confirm next steps",
            "required": true,
            "order": 5
        }
    ]'::jsonb,
    ARRAY[
        'I apologize, but I didn''t catch that. Could you please repeat?',
        'I''m having trouble understanding. Let me try to rephrase.',
        'Could you please speak a bit louder or more clearly?'
    ],
    ARRAY[
        'Driver confirms all details',
        'Driver requests callback',
        'Call duration exceeds 5 minutes',
        'Driver hangs up'
    ]
) ON CONFLICT DO NOTHING;
