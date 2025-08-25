import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
  onSidebarToggle?: (show: boolean) => void;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  header,
  className = '',
  showSidebar = true,
  onSidebarToggle
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(showSidebar);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1366);
      if (window.innerWidth < 1366 && isSidebarOpen) {
        setIsSidebarOpen(false);
        onSidebarToggle?.(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isSidebarOpen, onSidebarToggle]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    onSidebarToggle?.(newState);
  };

  return (
    <div className={`responsive-layout ${className}`}>
      {/* Header */}
      {header && (
        <header className="header">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle Button */}
              {sidebar && (
                <button
                  onClick={toggleSidebar}
                  className="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
                  aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                >
                  {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              )}
              
              {/* Header Content */}
              <div className="flex-1">
                {header}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <aside
            className={`sidebar transition-all duration-300 ease-in-out ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } ${isMobile ? 'fixed left-0 z-50' : 'relative'}`}
          >
            <div className="h-full overflow-y-auto">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebar && isSidebarOpen ? 'ml-0' : 'ml-0'
        }`}>
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && sidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => {
            setIsSidebarOpen(false);
            onSidebarToggle?.(false);
          }}
        />
      )}
    </div>
  );
};

export default ResponsiveLayout;
