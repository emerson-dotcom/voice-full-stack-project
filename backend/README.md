# Voice Agent Admin - Backend

This is the FastAPI backend for the Voice Agent Admin application, which provides APIs for managing AI voice agent configurations, triggering calls, and processing call results through Retell AI integration.

## Features

- **Agent Configuration Management**: CRUD operations for voice agent configurations
- **Call Triggering**: Initiate voice calls through Retell AI
- **Call Results Processing**: Store and retrieve call transcripts and structured summaries
- **Webhook Handling**: Process real-time events from Retell AI
- **Supabase Integration**: PostgreSQL database with real-time capabilities

## Technology Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **Supabase**: Backend-as-a-Service with PostgreSQL database
- **Retell AI**: Voice AI platform for making phone calls
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: ASGI server for running FastAPI applications

## Prerequisites

- Python 3.8+
- Supabase account and project
- Retell AI account and API key
- PostgreSQL database (provided by Supabase)

## Installation

1. **Clone the repository and navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp env.template .env
   # Edit .env with your actual credentials
   ```

5. **Set up Supabase database:**
   - Run the SQL commands from `database_schema.sql` in your Supabase SQL editor
   - Update the `.env` file with your Supabase credentials

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Retell AI Configuration
RETELL_API_KEY=your_retell_api_key
RETELL_WEBHOOK_URL=https://your-domain.com/api/v1/webhooks/retell

# Application Configuration
DEBUG=True
DATABASE_URL=your_database_url_if_needed
```

## Database Setup

1. **Create tables and sample data:**
   - Copy the contents of `database_schema.sql`
   - Paste into your Supabase SQL editor
   - Execute the script

2. **Verify tables created:**
   - `agent_configurations`: Stores voice agent configurations
   - `call_results`: Stores call outcomes and transcripts

## Running the Application

1. **Start the development server:**
   ```bash
   python main.py
   ```

2. **Or use uvicorn directly:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Access the API documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## API Endpoints

### Agent Configuration
- `POST /api/v1/agent-configs` - Create new configuration
- `GET /api/v1/agent-configs` - List all configurations
- `GET /api/v1/agent-configs/{id}` - Get specific configuration
- `PUT /api/v1/agent-configs/{id}` - Update configuration
- `DELETE /api/v1/agent-configs/{id}` - Delete configuration
- `POST /api/v1/agent-configs/{id}/activate` - Activate configuration

### Call Management
- `POST /api/v1/calls/trigger` - Trigger new voice call
- `GET /api/v1/calls` - List all call results
- `GET /api/v1/calls/{id}` - Get specific call result
- `GET /api/v1/calls/agent/{agent_id}` - Get calls by agent
- `DELETE /api/v1/calls/{id}` - Delete call result
- `GET /api/v1/calls/{id}/status` - Get call status
- `POST /api/v1/calls/{id}/end` - End active call

### Webhooks
- `POST /api/v1/webhooks/retell` - Retell AI webhook handler
- `GET /api/v1/webhooks/retell/health` - Webhook health check

## Webhook Configuration

To receive webhooks from Retell AI:

1. **Set your webhook URL in Retell AI dashboard:**
   ```
   https://your-domain.com/api/v1/webhooks/retell
   ```

2. **Ensure your server is accessible from the internet** (use ngrok for local development)

3. **Verify webhook delivery** using the health check endpoint

## Development

### Project Structure
```
backend/
├── app/
│   ├── core/           # Configuration and settings
│   ├── database/       # Database connection and management
│   ├── models/         # Pydantic data models
│   ├── routers/        # API route definitions
│   └── services/       # Business logic and external API calls
├── main.py             # FastAPI application entry point
├── requirements.txt    # Python dependencies
├── env.template        # Environment variables template
├── database_schema.sql # Database schema and sample data
└── README.md          # This file
```

### Adding New Features

1. **Create models** in `app/models/`
2. **Add business logic** in `app/services/`
3. **Define API endpoints** in `app/routers/`
4. **Update database schema** if needed
5. **Add tests** for new functionality

## Testing

1. **Start the application**
2. **Use the interactive API docs** at `/docs`
3. **Test endpoints** with sample data
4. **Verify database operations** in Supabase dashboard

## Deployment

### Production Considerations

1. **Environment variables**: Use production credentials
2. **Database**: Ensure proper connection pooling
3. **Security**: Enable CORS for production domains
4. **Monitoring**: Add logging and health checks
5. **SSL**: Use HTTPS for webhook endpoints

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Troubleshooting

### Common Issues

1. **Database connection errors:**
   - Verify Supabase credentials in `.env`
   - Check network connectivity
   - Ensure database tables exist

2. **Retell AI integration issues:**
   - Verify API key is valid
   - Check webhook URL configuration
   - Review API rate limits

3. **CORS errors:**
   - Update CORS origins in `main.py`
   - Ensure frontend URL is included

### Logs

Check application logs for detailed error information:
```bash
tail -f logs/app.log
```

## Support

For issues and questions:
1. Check the API documentation at `/docs`
2. Review the logs for error details
3. Verify environment configuration
4. Test individual endpoints

## License

This project is part of the Voice Agent Admin application.
