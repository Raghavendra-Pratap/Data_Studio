import React, { useEffect, useState } from 'react';
import './App.css';
import './styles/responsive.css';
import AppLayout from './components/AppLayout';
import Playground from './components/Playground';
import LoadingPlaceholder from './components/LoadingPlaceholder';
import ErrorBoundary from './components/ErrorBoundary';
import { databaseManager } from './utils/database';
import { BackendStatusProvider } from './contexts/BackendContext';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';



function App() {
  const [isLoading, setIsLoading] = useState(true);
  // const [isInitialized, setIsInitialized] = useState(false); // Not currently used
  
  console.log('🚀 App component rendering...'); // Debug log
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 App: Starting database initialization...');
        
        await databaseManager.initializeDatabase();
        
        console.log('✅ App: Database initialization completed successfully');
        // setIsInitialized(true); // Not currently used
        
      } catch (error) {
        console.error('❌ App: Database initialization failed:', error);
        if (error instanceof Error) {
          console.error('❌ App: Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        }
        // Even if database fails, we can still show the app
        // setIsInitialized(true); // Not currently used
      } finally {
        // Simulate minimum loading time for better UX
        setTimeout(() => setIsLoading(false), 1500);
      }
    };

    // Initialize database when app starts
    console.log('🚀 App: Calling initializeApp...');
    initializeApp();
  }, []);
  
    // Show loading placeholder while initializing
  if (isLoading) {
    return <LoadingPlaceholder />;
  }

  return (
    <ErrorBoundary>
      <BackendStatusProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<AppLayout />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/test" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </BackendStatusProvider>
    </ErrorBoundary>
  );
}

export default App;

