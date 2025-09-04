-- Migration to add retell_agent_id to agent_configurations table
-- Run this SQL in your Supabase SQL Editor

-- Add retell_agent_id column to agent_configurations table
ALTER TABLE agent_configurations 
ADD COLUMN IF NOT EXISTS retell_agent_id VARCHAR(100);

-- Create an index on retell_agent_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_agent_configurations_retell_agent_id 
ON agent_configurations(retell_agent_id);

-- Add a comment to document the column
COMMENT ON COLUMN agent_configurations.retell_agent_id IS 'Retell AI agent ID for voice calling integration';
