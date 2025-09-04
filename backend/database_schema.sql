-- Database schema for Voice Agent Admin application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agent Configurations table
CREATE TABLE IF NOT EXISTS agent_configurations (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(100) NOT NULL,
    greeting TEXT NOT NULL,
    primary_objective TEXT NOT NULL,
    conversation_flow JSONB NOT NULL,
    fallback_responses TEXT[] DEFAULT '{}',
    call_ending_conditions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Call Results table
CREATE TABLE IF NOT EXISTS call_results (
    id SERIAL PRIMARY KEY,
    call_id VARCHAR(50) UNIQUE NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    load_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    duration_seconds INTEGER,
    transcript TEXT DEFAULT '',
    structured_summary JSONB DEFAULT '{}',
    agent_config_id INTEGER REFERENCES agent_configurations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_configs_active ON agent_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_call_results_call_id ON call_results(call_id);
CREATE INDEX IF NOT EXISTS idx_call_results_agent_config ON call_results(agent_config_id);
CREATE INDEX IF NOT EXISTS idx_call_results_status ON call_results(status);
CREATE INDEX IF NOT EXISTS idx_call_results_created_at ON call_results(created_at DESC);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_agent_configurations_updated_at 
    BEFORE UPDATE ON agent_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_results_updated_at 
    BEFORE UPDATE ON call_results 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO agent_configurations (
    agent_name, 
    greeting, 
    primary_objective, 
    conversation_flow,
    fallback_responses,
    call_ending_conditions,
    is_active
) VALUES (
    'Logistics Assistant',
    'Hello, this is your logistics assistant calling about your delivery.',
    'Confirm delivery details and address any concerns.',
    '[
        {
            "step": "Greeting",
            "prompt": "Introduce yourself and explain the purpose of the call",
            "required": true,
            "order": 1
        },
        {
            "step": "Load Confirmation",
            "prompt": "Confirm the load number and delivery details",
            "required": true,
            "order": 2
        },
        {
            "step": "Address Verification",
            "prompt": "Verify the delivery address is correct",
            "required": true,
            "order": 3
        },
        {
            "step": "Issue Resolution",
            "prompt": "Address any concerns or issues mentioned",
            "required": false,
            "order": 4
        },
        {
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
    ],
    true
) ON CONFLICT DO NOTHING;

-- Create a view for active agent configurations
CREATE OR REPLACE VIEW active_agent_configs AS
SELECT * FROM agent_configurations WHERE is_active = true;

-- Create a view for recent call results
CREATE OR REPLACE VIEW recent_call_results AS
SELECT 
    cr.*,
    ac.agent_name
FROM call_results cr
LEFT JOIN agent_configurations ac ON cr.agent_config_id = ac.id
ORDER BY cr.created_at DESC;

-- Grant necessary permissions (adjust based on your Supabase setup)
-- GRANT USAGE ON SCHEMA public TO anon, authenticated;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
