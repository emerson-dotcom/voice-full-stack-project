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

-- Create call_records table
CREATE TABLE IF NOT EXISTS call_records (
    id BIGSERIAL PRIMARY KEY,
    call_id VARCHAR(100) NOT NULL UNIQUE,
    agent_config_id BIGINT NOT NULL REFERENCES agent_configurations(id) ON DELETE CASCADE,
    driver_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    load_number VARCHAR(50) NOT NULL,
    delivery_address TEXT,
    expected_delivery_time TIMESTAMP WITH TIME ZONE,
    special_instructions TEXT,
    status VARCHAR(20) DEFAULT 'initiated' CHECK (status IN ('initiated', 'in_progress', 'completed', 'failed')),
    retell_call_id VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    call_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for call_records table
CREATE INDEX IF NOT EXISTS idx_call_records_call_id ON call_records(call_id);
CREATE INDEX IF NOT EXISTS idx_call_records_agent_config_id ON call_records(agent_config_id);
CREATE INDEX IF NOT EXISTS idx_call_records_status ON call_records(status);
CREATE INDEX IF NOT EXISTS idx_call_records_created_at ON call_records(created_at);
CREATE INDEX IF NOT EXISTS idx_call_records_driver_name ON call_records(driver_name);
CREATE INDEX IF NOT EXISTS idx_call_records_load_number ON call_records(load_number);

-- Enable Row Level Security for call_records
ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;

-- Create policies for call_records
CREATE POLICY "Allow all operations for authenticated users" ON call_records
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for anonymous users" ON call_records
    FOR ALL USING (true);

-- Create trigger for call_records updated_at
CREATE TRIGGER update_call_records_updated_at 
    BEFORE UPDATE ON call_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample call records (optional)
INSERT INTO call_records (
    call_id,
    agent_config_id,
    driver_name,
    phone_number,
    load_number,
    delivery_address,
    expected_delivery_time,
    special_instructions,
    status,
    start_time,
    end_time,
    duration_seconds,
    call_summary
) VALUES 
(
    'CALL-20241201-001',
    1,
    'John Smith',
    '+1-555-123-4567',
    'LOAD-2024-001',
    '123 Main St, Anytown, USA',
    '2024-12-01 14:00:00+00',
    'Fragile items - handle with care',
    'completed',
    '2024-12-01 10:30:00+00',
    '2024-12-01 10:33:45+00',
    225,
    'Driver confirmed delivery details and address. No issues reported.'
),
(
    'CALL-20241201-002',
    1,
    'Sarah Johnson',
    '+1-555-987-6543',
    'LOAD-2024-002',
    '456 Oak Ave, Somewhere, USA',
    '2024-12-01 16:00:00+00',
    NULL,
    'in_progress',
    '2024-12-01 11:15:00+00',
    NULL,
    NULL,
    NULL
) ON CONFLICT (call_id) DO NOTHING;