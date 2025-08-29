import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { FileText, Upload, File, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface FileData {
  name: string;
  type: string;
  size: number;
  columns: string[];
  path: string;
  lastModified: Date;
  sheets?: { [sheetName: string]: string[] };
  headerConfig?: {
    row: number;
    merged: boolean;
    customHeaders?: string[];
    autoDetected: boolean;
  };
  currentSheet?: string;
}

interface DataSourcesProps {
  importedFiles: FileData[];
  onBrowseFiles: () => void;
  onDragDropImport: (files: FileList) => void;
  onDeleteFile?: (fileName: string) => void;
  height: number;
  showDeleteButton?: boolean;
  showHeaderConfig?: boolean;
  className?: string;
}

const DataSources: React.FC<DataSourcesProps> = ({
  importedFiles,
  onBrowseFiles,
  onDragDropImport,
  onDeleteFile,
  height,
  showDeleteButton = false,
  showHeaderConfig = false,
  className = ""
}) => {
  // State for tracking which files are expanded
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const toggleFileExpansion = (fileName: string) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileName)) {
        newSet.delete(fileName);
      } else {
        newSet.add(fileName);
      }
      return newSet;
    });
  };

  const triggerBrowse = () => {
    console.log('DataSources: Browse button clicked');
    // Only call the parent's browse function, don't create our own file input
    if (onBrowseFiles) {
      console.log('DataSources: Calling onBrowseFiles');
      onBrowseFiles();
    } else {
      console.warn('DataSources: onBrowseFiles function not provided');
    }
  };

  return (
    <Card className={`h-full ${className}`}>
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="font-semibold flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Data Sources
            {importedFiles.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                {importedFiles.length} file{importedFiles.length !== 1 ? 's' : ''} loaded
              </span>
            )}
          </h3>
          <button
            onClick={triggerBrowse}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Import Files"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
        
        {/* File Import Area - Only show when no files are imported */}
        {importedFiles.length === 0 ? (
          <div 
            className="text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col justify-center flex-1 data-source-drop-area"
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
              console.log('DataSources: Files dropped:', e.dataTransfer.files);
              if (e.dataTransfer.files.length > 0) {
                console.log('DataSources: Calling onDragDropImport with', e.dataTransfer.files.length, 'files');
                onDragDropImport(e.dataTransfer.files);
              }
            }}
          >
            <div>
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold mb-2">Drop Files Here</h4>
              <p className="text-sm text-gray-500 mb-4">Support for CSV, Excel files</p>
              <p className="text-xs text-blue-600 mb-4">💡 Tip: Drag & drop files here or use the upload button above!</p>
              <button 
                onClick={triggerBrowse}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Files
              </button>
            </div>
          </div>
        ) : (
          /* Scrollable content area - Only when files are imported */
          <div 
            className="overflow-y-auto overflow-x-hidden data-sources-scrollbar flex-1" 
            style={{ 
              maxHeight: `${Math.max(height - 80, 150)}px` // Reduced padding, more efficient space usage
            }}
          >
            <div className="space-y-1">
              {/* File count indicator - more compact */}
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded text-center mb-2">
                {importedFiles.length} file{importedFiles.length !== 1 ? 's' : ''} loaded
              </div>
              
              {/* File list with compact spacing */}
              <div className="space-y-1">
                {importedFiles.map((file, index) => {
                  const isExpanded = expandedFiles.has(file.name);
                  const fileName = file.name;
                  const displayName = isExpanded ? fileName : 
                    (fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName);
                  
                  return (
                    <div key={file.name} className="border rounded-lg p-2 bg-white overflow-hidden">
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1 min-w-0 mr-2 overflow-hidden">
                          {/* File Header with Expand/Collapse */}
                          <div className="flex items-center space-x-2 mb-1">
                            <button
                              onClick={() => toggleFileExpansion(file.name)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                              title={isExpanded ? "Collapse file name" : "Expand file name"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                            <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span 
                              className="text-sm font-medium text-gray-900 leading-tight cursor-pointer hover:text-blue-600 transition-colors break-all"
                              onClick={() => toggleFileExpansion(file.name)}
                              title={isExpanded ? "Click to collapse" : "Click to expand"}
                            >
                              {displayName}
                            </span>
                          </div>
                          
                          {/* File Details - compact layout */}
                          <div className="text-xs text-gray-500 break-words mb-0.5">
                            {file.type} • {Math.round(file.size / 1024)} KB
                          </div>
                          <div className="text-xs text-gray-600 break-words mb-0.5">
                            {file.columns.length} column{file.columns.length !== 1 ? 's' : ''}
                          </div>
                          
                          {/* Sheets info if available */}
                          {file.sheets && Object.keys(file.sheets).length > 0 && (
                            <div className="text-xs text-blue-600 break-words">
                              {Object.keys(file.sheets).length} sheet{Object.keys(file.sheets).length !== 1 ? 's' : ''} available
                            </div>
                          )}
                        </div>
                        
                        {/* Delete Button */}
                        {showDeleteButton && onDeleteFile && (
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                              onClick={() => onDeleteFile(file.name)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors p-1 rounded-md"
                              title="Delete file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataSources;
