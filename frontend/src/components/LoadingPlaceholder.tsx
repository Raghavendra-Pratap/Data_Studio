import React from 'react';

const LoadingPlaceholder: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      {/* Loading Spinner */}
      <div className="mb-6">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
      
      {/* App Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Unified Data Studio v2</h1>
      
      {/* Loading Message */}
      <p className="text-lg text-gray-600 mb-6">Loading components...</p>
      
      {/* Progress Bar */}
      <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
      
      {/* Status */}
      <p className="text-sm text-gray-500 mt-4">Initializing application</p>
    </div>
  </div>
);

export default LoadingPlaceholder;
