import React, { useEffect } from 'react';
import './App.css';
import AppLayout from './components/AppLayout';
import Playground from './components/Playground';
import ErrorBoundary from './components/ErrorBoundary';
import { EnhancedDataProcessor } from './components/EnhancedDataProcessor';
import FormulaConfiguration from './components/FormulaConfiguration';
import { databaseManager } from './utils/database';
import { BackendStatusProvider } from './contexts/BackendContext';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Simple dashboard component for the home page
const TestDashboard = () => (
  <div className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    <h1 className="text-4xl font-bold mb-6 text-gray-800">Unified Data Studio v2</h1>
    <p className="text-xl mb-8 text-gray-600">Advanced data processing and workflow management platform</p>
    
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">🚀 Dashboard</h2>
        <p className="text-gray-600 mb-4">Manage your projects, workflows, and data sources</p>
        <a href="#/dashboard" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Go to Dashboard
        </a>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">🎯 Playground</h2>
        <p className="text-gray-600 mb-4">Test formulas, workflows, and data processing</p>
        <a href="#/playground" className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
          Go to Playground
        </a>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">📊 Data Processor</h2>
        <p className="text-gray-600 mb-4">Advanced data processing with Enhanced SQLite</p>
        <a href="#/data-processor" className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          Go to Data Processor
        </a>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">⚙️ Formula Config</h2>
        <p className="text-gray-600 mb-4">Configure and manage formula definitions</p>
        <a href="#/formula-config" className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          Configure Formulas
        </a>
      </div>
    </div>
    
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Features</h3>
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div>✅ Advanced Formulas</div>
        <div>✅ Workflow Engine</div>
        <div>✅ Enhanced SQLite</div>
        <div>✅ Data Processing</div>
        <div>✅ Project Management</div>
        <div>✅ Cross-platform</div>
      </div>
    </div>
  </div>
);

function App() {
  console.log('🚀 App component rendering...'); // Debug log
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 App: Starting database initialization...');
        
        await databaseManager.initializeDatabase();
        
        console.log('✅ App: Database initialization completed successfully');
        
      } catch (error) {
        console.error('❌ App: Database initialization failed:', error);
        if (error instanceof Error) {
          console.error('❌ App: Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        }
      }
    };

    // Initialize database when app starts
    console.log('🚀 App: Calling initializeApp...');
    initializeApp();
  }, []);

  // Apply theme at startup from saved settings so UI reflects preference even before opening Settings
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('dataStudioSettings') || 'null');
      const theme: 'light' | 'dark' | 'auto' = saved?.general?.theme || 'light';
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldDark = theme === 'dark' || (theme === 'auto' && prefersDark);
      const root = document.documentElement;
      if (shouldDark) root.classList.add('dark'); else root.classList.remove('dark');
    } catch (_) {
      // no-op
    }
  }, []);
  
  return (
    <ErrorBoundary>
      <BackendStatusProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<TestDashboard />} />
              <Route path="/dashboard" element={<AppLayout />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/data-processor" element={<EnhancedDataProcessor />} />
              <Route path="/formula-config" element={<FormulaConfiguration />} />
              <Route path="/test" element={<TestDashboard />} />
            </Routes>
          </div>
        </Router>
      </BackendStatusProvider>
    </ErrorBoundary>
  );
}

export default App;
