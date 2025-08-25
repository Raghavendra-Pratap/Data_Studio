import React, { useState } from 'react';
import ResponsiveLayout from './ResponsiveLayout';
import { 
  Home, 
  BarChart3, 
  FileText, 
  Settings, 
  Users, 
  Database,
  Play,
  Code,
  Zap,
  Globe
} from 'lucide-react';

const ResponsiveDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sample sidebar navigation
  const sidebarContent = (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Unified Data Studio v2</h2>
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              activeTab === 'projects' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Projects</span>
          </button>
          
          <button
            onClick={() => setActiveTab('workflows')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              activeTab === 'workflows' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Code className="h-5 w-5" />
            <span>Workflows</span>
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Analytics</span>
          </button>
          
          <button
            onClick={() => setActiveTab('playground')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              activeTab === 'playground' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Play className="h-5 w-5" />
            <span>Playground</span>
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              activeTab === 'settings' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-600 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            <Zap className="h-4 w-4" />
            <span className="text-sm">New Project</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            <Database className="h-4 w-4" />
            <span className="text-sm">Import Data</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Sample header content
  const headerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-800">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Globe className="h-4 w-4" />
          <span>Connected</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600">Admin User</span>
        </div>
      </div>
    </div>
  );

  // Sample main content
  const mainContent = (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome to {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h2>
        <p className="text-gray-600">
          This is a responsive demo showing how components adapt to different screen sizes.
        </p>
      </div>

      {/* Responsive Grid Demo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div key={item} className="card bg-white">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">{item}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Card {item}</h3>
                <p className="text-sm text-gray-600">Responsive content</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              This card demonstrates responsive behavior across different screen sizes.
            </p>
          </div>
        ))}
      </div>

      {/* Responsive Table Demo */}
      <div className="card bg-white">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Responsive Table</h3>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Status</th>
                <th>Last Modified</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Data Analysis Project', status: 'Active', modified: '2024-12-15', size: '2.4 GB' },
                { name: 'Workflow Template', status: 'Draft', modified: '2024-12-14', size: '156 MB' },
                { name: 'Customer Database', status: 'Completed', modified: '2024-12-13', size: '1.2 GB' },
                { name: 'Sales Report', status: 'Active', modified: '2024-12-12', size: '89 MB' },
              ].map((project, index) => (
                <tr key={index}>
                  <td className="font-medium">{project.name}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === 'Active' ? 'bg-green-100 text-green-800' :
                      project.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="text-sm text-gray-600">{project.modified}</td>
                  <td className="text-sm text-gray-600">{project.size}</td>
                  <td>
                    <button className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screen Size Indicator */}
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm">
        <div className="font-medium">Screen Size</div>
        <div className="text-xs opacity-75">
          {window.innerWidth < 1366 ? 'Small Laptop' :
           window.innerWidth < 1440 ? 'Standard Laptop' :
           window.innerWidth < 1920 ? 'Large Laptop' :
           window.innerWidth < 2560 ? 'Desktop Monitor' : 'Ultra-wide'}
        </div>
        <div className="text-xs opacity-75">{window.innerWidth} × {window.innerHeight}</div>
      </div>
    </div>
  );

  return (
    <ResponsiveLayout
      sidebar={sidebarContent}
      header={headerContent}
      className="bg-gray-50"
    >
      {mainContent}
    </ResponsiveLayout>
  );
};

export default ResponsiveDemo;
