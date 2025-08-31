import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, FileText, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate a unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 React Error Boundary Caught Error:', error);
    console.error('🚨 Error Info:', errorInfo);
    console.error('🚨 Error ID:', this.state.errorId);
    
    this.setState({
      error,
      errorInfo
    });

    // Log error to console for debugging
    console.group('🚨 Error Details');
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error ID:', this.state.errorId);
    console.groupEnd();

    // In a production app, you might want to send this to an error tracking service
    // this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Example: Send error to error tracking service
    try {
      // This would be implemented based on your error tracking service
      // Example: Sentry, LogRocket, etc.
      console.log('📊 Error logged to monitoring service');
    } catch (logError) {
      console.error('Failed to log error to service:', logError);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.hash = '/';
  };

  private handleReportBug = () => {
    const errorDetails = `
Error ID: ${this.state.errorId}
Error: ${this.state.error?.message}
Component: ${this.state.errorInfo?.componentStack}
Stack: ${this.state.error?.stack}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim();

    // Copy error details to clipboard
    navigator.clipboard.writeText(errorDetails).then(() => {
      alert('Error details copied to clipboard. Please report this issue to the development team.');
    }).catch(() => {
      // Fallback: show error details in alert
      alert(`Error details:\n\n${errorDetails}`);
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 text-white p-6 text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="w-16 h-16 text-red-200" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Oops! Something went wrong</h1>
              <p className="text-red-100">We're sorry, but the application encountered an unexpected error.</p>
            </div>

            {/* Error Details */}
            <div className="p-6 space-y-6">
              {/* Error Summary */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Bug className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800 mb-1">Error Summary</h3>
                    <p className="text-red-700 text-sm">{this.state.error?.message || 'An unknown error occurred'}</p>
                    {this.state.errorId && (
                      <p className="text-red-600 text-xs mt-2 font-mono">
                        Error ID: {this.state.errorId}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reload App</span>
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <Home className="w-4 h-4" />
                  <span>Go Home</span>
                </button>
                
                <button
                  onClick={this.handleReportBug}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <FileText className="w-4 h-4" />
                  <span>Report Bug</span>
                </button>
              </div>

              {/* Technical Details (Collapsible) */}
              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">Technical Details</span>
                    <span className="text-xs text-gray-400 group-open:hidden">(Click to expand)</span>
                    <span className="text-xs text-gray-400 hidden group-open:inline">(Click to collapse)</span>
                  </div>
                </summary>
                
                <div className="mt-4 space-y-4">
                  {/* Error Stack */}
                  {this.state.error?.stack && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Error Stack:</h4>
                      <pre className="bg-gray-100 p-3 rounded-lg text-xs text-gray-800 overflow-x-auto font-mono">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {/* Component Stack */}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Component Stack:</h4>
                      <pre className="bg-gray-100 p-3 rounded-lg text-xs text-gray-800 overflow-x-auto font-mono">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>

              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Need Help?</h3>
                <p className="text-blue-700 text-sm">
                  If this error persists, please report it to our development team. 
                  Include the Error ID above for faster resolution.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
