# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization and enter project details:
   - Name: `voice-agent-admin`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your location)
5. Click "Create new project"

## 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## 3. Set Up the Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Copy the contents of `supabase_schema.sql` and paste it into the SQL Editor
3. Click **Run** to execute the SQL and create the database schema
4. You should see a success message and the `agent_configurations` table will be created

## 4. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Retell AI Configuration (optional)
RETELL_API_KEY=your_retell_api_key
RETELL_WEBHOOK_URL=https://your-domain.com/api/v1/webhooks/retell

# Application Configuration
DEBUG=True
```

Replace the placeholder values with your actual Supabase credentials.

## 5. Test the Connection

1. Test the Supabase connection:
   ```bash
   cd backend
   .\venv\Scripts\Activate.ps1
   python -c "from supabase_simple import get_supabase_client; print('✅ Connection successful' if get_supabase_client() else '❌ Connection failed')"
   ```

2. Start the backend server:
   ```bash
   python simple_main.py
   ```

3. You should see: `✅ Supabase connection initialized successfully`

4. Test the API endpoints using the React frontend or API testing tools.

## 6. Database Schema

The following table will be created:

### `agent_configurations`
- `id` (BIGSERIAL PRIMARY KEY)
- `agent_name` (VARCHAR(100))
- `greeting` (TEXT)
- `primary_objective` (TEXT)
- `conversation_flow` (JSONB)
- `fallback_responses` (TEXT[])
- `call_ending_conditions` (TEXT[])
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

## 7. Row Level Security (RLS)

The database is configured with Row Level Security enabled. For development, all operations are allowed for anonymous users. In production, you should:

1. Set up proper authentication
2. Modify the RLS policies to restrict access based on user authentication
3. Remove the anonymous access policy

## Troubleshooting

### Connection Issues
- Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check that your Supabase project is active
- Ensure the database schema has been created

### Permission Issues
- Check that RLS policies are properly configured
- Verify your API key has the necessary permissions

### Data Issues
- Check the Supabase dashboard to see if data is being inserted
- Review the API logs for any error messages
