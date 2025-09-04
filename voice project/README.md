# Voice Agent Administration Dashboard

A modern, intuitive web application for configuring, testing, and reviewing calls made by an adaptive AI voice agent. Built with React, Tailwind CSS, and designed for non-technical administrators.

## Features

### 🎛️ Agent Configuration
- **Conversation Flow Management**: Define step-by-step conversation logic with drag-and-drop reordering
- **Prompt Customization**: Set greeting messages, primary objectives, and conversation prompts
- **Fallback Responses**: Configure backup responses for unclear situations
- **Call Ending Conditions**: Define when and how calls should conclude

### 📞 Call Triggering
- **Driver Information**: Enter driver name, phone number, and load details
- **Call Initiation**: One-click test call triggering with real-time status updates
- **Context Management**: Include delivery addresses, expected times, and special instructions
- **Call History**: Quick access to recent call attempts and their status

### 📊 Call Results & Analysis
- **Structured Summaries**: Key-value pair summaries of call outcomes
- **Full Transcripts**: Complete conversation logs with speaker identification
- **Search & Filtering**: Find specific calls by driver, load, or status
- **Export Functionality**: Download call reports for further analysis

## Technology Stack

- **Frontend**: React 18 with modern hooks
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Lucide React for consistent iconography
- **State Management**: React useState for local component state
- **Build Tool**: Create React App for development and production builds

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern web browser

### Installation

1. **Clone or download the project files**
   ```bash
   # If you have git installed
   git clone <repository-url>
   cd voice-agent-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the application

### Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `build/` directory, ready for deployment.

## Project Structure

```
src/
├── components/
│   ├── AgentConfiguration.js    # Agent setup and conversation flow
│   ├── CallTriggering.js        # Call initiation and status
│   └── CallResults.js          # Results viewing and analysis
├── App.js                       # Main application with navigation
├── index.js                     # React entry point
└── index.css                    # Global styles and Tailwind imports
```

## Usage Guide

### 1. Configure Your Agent
- Navigate to "Agent Configuration" tab
- Set your agent's name and greeting message
- Define the conversation flow steps
- Configure fallback responses and ending conditions
- Click "Save Changes" when done

### 2. Initiate Test Calls
- Go to "Call Triggering" tab
- Fill in driver information (name, phone, load number required)
- Add optional context like delivery address and special instructions
- Click "Start Test Call" to begin
- Monitor call status in real-time

### 3. Review Call Results
- Visit "Call Results" tab to see all calls
- Use search and filters to find specific calls
- Click "View Details" to see structured summaries
- Toggle transcript view for full conversation logs
- Export reports as needed

## Customization

### Styling
The application uses Tailwind CSS with a custom color scheme. Modify `tailwind.config.js` to change:
- Primary colors (currently blue theme)
- Success/warning colors
- Component spacing and sizing

### Data Structure
The components use mock data that can be easily replaced with:
- API calls to your backend
- Database connections
- Real-time updates from your voice system

### Adding New Features
- Create new components in the `src/components/` directory
- Add navigation items in `App.js`
- Extend the conversation flow structure in `AgentConfiguration.js`

## Integration Points

### Backend API (Future Implementation)
- **Agent Configuration**: POST/PUT endpoints for saving agent settings
- **Call Triggering**: POST endpoint to initiate calls via Retell AI
- **Call Results**: Webhook endpoint to receive call completion data
- **Data Storage**: Database integration for persistent configuration and results

### Retell AI Integration
- **Call Initiation**: API calls to start voice agent conversations
- **Webhook Handling**: Receive real-time call updates and transcripts
- **Agent Logic**: Implement conversation flow based on stored configuration

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Notes

- **Responsive Design**: Mobile-first approach with sidebar navigation
- **Accessibility**: Semantic HTML and keyboard navigation support
- **Performance**: Optimized rendering with React hooks
- **Error Handling**: Form validation and user feedback throughout

## Next Steps

1. **Backend Development**: Implement FastAPI backend with Supabase integration
2. **Voice System**: Connect to Retell AI for actual call functionality
3. **Authentication**: Add user management and role-based access
4. **Real-time Updates**: Implement WebSocket connections for live call monitoring
5. **Advanced Analytics**: Add call performance metrics and insights

## Support

For questions or issues:
1. Check the browser console for error messages
2. Verify all dependencies are installed correctly
3. Ensure Node.js version compatibility
4. Review the component structure for customization needs

---

**Built with ❤️ for voice agent administration**
