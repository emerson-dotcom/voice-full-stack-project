import React, { useState } from 'react';
import { Phone, Settings, BarChart3, Menu, X, Mic, Users, Bot, Globe } from 'lucide-react';
import AgentConfiguration from './components/AgentConfiguration';
import AgentCreation from './components/AgentCreation';
import CallTriggering from './components/CallTriggering';
import CallResults from './components/CallResults';
import VoiceCall from './components/VoiceCall';
import Agents from './components/Agents';
import WebCallTest from './components/WebCallTest';

function App() {
  const [activeTab, setActiveTab] = useState('configuration');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'configuration', name: 'Agent Configuration', icon: Settings },
    { id: 'agent-creation', name: 'Agent Creation', icon: Bot },
    { id: 'agents', name: 'Retell Agents', icon: Users },
    { id: 'triggering', name: 'Call Triggering', icon: Phone },
    { id: 'voice-call', name: 'Voice Call', icon: Mic },
    { id: 'web-call-test', name: 'Web Call Test', icon: Globe },
    { id: 'results', name: 'Call Results', icon: BarChart3 },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'configuration':
        return <AgentConfiguration />;
      case 'agent-creation':
        return <AgentCreation />;
      case 'agents':
        return <Agents />;
      case 'triggering':
        return <CallTriggering />;
      case 'voice-call':
        return <VoiceCall />;
      case 'web-call-test':
        return <WebCallTest />;
      case 'results':
        return <CallResults />;
      default:
        return <AgentConfiguration />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Voice Agent Admin</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Voice Agent Admin</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="h-6 w-px bg-gray-200 lg:hidden" />
          <h1 className="text-lg font-semibold text-gray-900">Voice Agent Admin</h1>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {renderActiveTab()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
