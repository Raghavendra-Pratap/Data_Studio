import React, { useState, useEffect } from 'react';
import { Info, Download, RefreshCw, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface VersionInfo {
  version: string;
  name: string;
  buildDate: string;
  environment: string;
}

interface VersionInfoProps {
  showDetails?: boolean;
  className?: string;
}

const VersionInfo: React.FC<VersionInfoProps> = ({ 
  showDetails = true, 
  className = '' 
}) => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVersionInfo = async () => {
      try {
        setLoading(true);
        
        // Try to load from version.ts first
        try {
          const versionModule = await import('../version');
          setVersionInfo({
            version: versionModule.APP_VERSION,
            name: versionModule.APP_NAME,
            buildDate: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
          });
        } catch (importError) {
          // Fallback to hardcoded version
          setVersionInfo({
            version: '2.0.0',
            name: 'Unified Data Studio v2',
            buildDate: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
          });
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load version information');
        console.error('Error loading version info:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVersionInfo();
  }, []);

  const handleCheckForUpdates = () => {
    // Dispatch custom event for update checking
    const event = new CustomEvent('checkForUpdates');
    window.dispatchEvent(event);
  };

  const handleDownloadUpdate = () => {
    // Open GitHub releases page
    window.open('https://github.com/Raghavendra-Pratap/Data_Studio/releases', '_blank');
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>Loading version info...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        <Info className="h-4 w-4 inline mr-1" />
        {error}
      </div>
    );
  }

  if (!versionInfo) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Info className="h-5 w-5 mr-2 text-blue-600" />
          Version Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Version */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Current Version</span>
          <span className="text-lg font-bold text-blue-600">
            v{versionInfo.version}
          </span>
        </div>

        {/* App Name */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Application</span>
          <span className="text-sm text-gray-800">{versionInfo.name}</span>
        </div>

        {/* Build Date */}
        {showDetails && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Build Date</span>
            <span className="text-sm text-gray-800">
              {new Date(versionInfo.buildDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Environment */}
        {showDetails && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Environment</span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              versionInfo.environment === 'production' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {versionInfo.environment}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={handleCheckForUpdates}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Check for Updates</span>
          </button>
          
          <button
            onClick={handleDownloadUpdate}
            className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>

        {/* GitHub Link */}
        <div className="text-center">
          <a
            href="https://github.com/Raghavendra-Pratap/Data_Studio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            <span>View on GitHub</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default VersionInfo;
