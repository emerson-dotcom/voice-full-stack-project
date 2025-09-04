# Voice Agent Admin - Full Stack Application

A comprehensive voice agent administration system that allows non-technical administrators to configure, test, and review calls made by adaptive AI voice agents. The system integrates with Retell AI for voice capabilities and uses Supabase for data storage.

## 🏗️ Architecture

### Frontend (React)
- **Location**: `voice project/` directory
- **Technology**: React 18 with Tailwind CSS
- **Port**: 3000 (development)
- **Features**: Responsive design, modern UI components, real-time updates

### Backend (FastAPI)
- **Location**: `backend/` directory
- **Technology**: FastAPI with Python 3.8+
- **Port**: 8000 (development)
- **Database**: Supabase (PostgreSQL)
- **External APIs**: Retell AI for voice calls

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** for backend
- **Node.js 16+** and npm/yarn for frontend
- **Supabase account** and project
- **Retell AI account** and API key

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd "voice full stack project"

# Or if you already have the files, navigate to the project directory
cd "C:\Users\ok\Desktop\voice full stack project"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.template .env
# Edit .env with your actual credentials (see Environment Configuration below)
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd "voice project"

# Install dependencies
npm install
# or
yarn install
```

### 4. Database Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Set up Database Schema**:
   - Open Supabase SQL Editor
   - Copy contents from `backend/database_schema.sql`
   - Paste and execute the script
   - Verify tables are created: `agent_configurations` and `call_results`

### 5. Environment Configuration

Edit `backend/.env` file with your credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Retell AI Configuration
RETELL_API_KEY=your_retell_api_key
RETELL_FROM_NUMBER=+1234567890
RETELL_WEBHOOK_URL=http://localhost:8000/api/v1/webhooks/retell

# Application Configuration
DEBUG=True
DATABASE_URL=your_database_url_if_needed
```

## 🏃‍♂️ Running the Application

### Start Backend Server

```bash
# From backend directory
cd backend

# Activate virtual environment (if not already active)
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Start the server
python main.py
```

**Alternative methods:**
```bash
# Using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Using provided scripts
# Windows:
start.bat
# macOS/Linux:
./start.sh
```

Backend will be available at:
- **API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Start Frontend Server

```bash
# From voice project directory
cd "voice project"

# Start development server
npm start
# or
yarn start
```

Frontend will be available at:
- **Application**: http://localhost:3000

## 🧪 Testing the Application

### Backend Testing

1. **API Documentation**:
   - Visit http://localhost:8000/docs
   - Interactive Swagger UI for testing endpoints
   - Try the endpoints with sample data

2. **Health Check**:
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status": "healthy"}
   ```

3. **Test Scripts**:
   ```bash
   # From backend directory
   python test_setup.py
   python test_app.py
   python test_call_endpoints.py
   ```

### Frontend Testing

1. **Manual Testing**:
   - Open http://localhost:3000
   - Navigate through all tabs
   - Test form submissions
   - Verify responsive design

2. **Component Testing**:
   ```bash
   # From voice project directory
   npm test
   # or
   yarn test
   ```

### Integration Testing

1. **Full Stack Test**:
   - Start both backend and frontend
   - Test agent configuration creation
   - Test call triggering
   - Verify data persistence

2. **Webhook Testing** (Advanced):
   - Use ngrok to expose local backend
   - Configure Retell AI webhook URL
   - Test real call scenarios

## 📋 Available Scripts

### Backend Scripts

```bash
# Start development server
python main.py

# Start with uvicorn
uvicorn main:app --reload

# Run tests
python test_setup.py
python test_app.py
python test_call_endpoints.py

# Database operations
python supabase_simple.py  # Test Supabase connection
```

### Frontend Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App (not recommended)
npm run eject
```

## 🔧 Configuration

### Backend Configuration

- **CORS**: Configured for `http://localhost:3000` (React dev server)
- **Database**: Supabase PostgreSQL with real-time capabilities
- **API**: RESTful endpoints with automatic documentation
- **Webhooks**: Configured for Retell AI integration

### Frontend Configuration

- **API Base URL**: Configured to connect to `http://localhost:8000`
- **Styling**: Tailwind CSS with custom theme
- **Icons**: Lucide React for consistent iconography
- **Build**: Create React App with optimized production builds

## 📁 Project Structure

```
voice full stack project/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── core/              # Configuration
│   │   ├── database/          # Database connection
│   │   ├── models/            # Pydantic models
│   │   ├── routers/           # API routes
│   │   └── services/          # Business logic
│   ├── main.py                # Application entry point
│   ├── requirements.txt       # Python dependencies
│   ├── env.template          # Environment variables template
│   ├── database_schema.sql   # Database schema
│   ├── start.bat             # Windows start script
│   ├── start.sh              # Unix start script
│   └── README.md             # Backend documentation
├── voice project/             # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.js            # Main application
│   │   └── index.js          # Entry point
│   ├── package.json          # Node.js dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   └── README.md             # Frontend documentation
├── PROJECT_SUMMARY.md         # Project overview
└── README.md                  # This file
```

## 🔌 API Endpoints

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

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**:
   - Check Python version (3.8+ required)
   - Verify virtual environment is activated
   - Ensure all dependencies are installed
   - Check `.env` file configuration

2. **Frontend won't start**:
   - Check Node.js version (16+ required)
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

3. **Database connection errors**:
   - Verify Supabase credentials in `.env`
   - Check network connectivity
   - Ensure database tables exist (run `database_schema.sql`)

4. **CORS errors**:
   - Ensure backend is running on port 8000
   - Check CORS configuration in `main.py`
   - Verify frontend is running on port 3000

5. **API calls failing**:
   - Check backend is running and accessible
   - Verify API endpoint URLs
   - Check browser console for errors

### Debug Mode

Enable debug mode by setting `DEBUG=True` in your `.env` file for detailed error messages.

## 🚀 Production Deployment

### Backend Deployment

1. **Environment Variables**:
   - Use production Supabase credentials
   - Set production Retell AI API key
   - Configure production webhook URL

2. **Database**:
   - Use production Supabase project
   - Run database migrations
   - Set up proper indexes

3. **Server**:
   - Use production ASGI server (Gunicorn + Uvicorn)
   - Configure reverse proxy (Nginx)
   - Set up SSL certificates

### Frontend Deployment

1. **Build**:
   ```bash
   npm run build
   ```

2. **Serve**:
   - Use static file server (Nginx, Apache)
   - Or deploy to CDN (Vercel, Netlify)

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📚 Additional Documentation

- **Backend**: See `backend/README.md` for detailed backend documentation
- **Frontend**: See `voice project/README.md` for frontend-specific information
- **Project Overview**: See `PROJECT_SUMMARY.md` for architecture details
- **API Documentation**: Available at http://localhost:8000/docs when backend is running

## 🤝 Support

For issues and questions:

1. **Check the logs** for detailed error information
2. **Verify environment configuration** matches requirements
3. **Test individual components** (backend/frontend separately)
4. **Review API documentation** at `/docs` endpoint
5. **Check browser console** for frontend errors

## 📄 License

This project is part of the Voice Agent Admin application for logistics management.

---

**Built with ❤️ for voice agent administration**
