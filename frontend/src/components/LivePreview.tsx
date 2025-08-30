import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Eye, Loader2, Info, AlertCircle } from 'lucide-react';
import { dataProcessor, ProcessedData, WorkflowStep, FileData } from '../utils/dataProcessor';

interface LivePreviewProps {
  workflowSteps: WorkflowStep[];
  importedFiles: any[];
  sampleSize: number;
  isExecuting: boolean;
  previewResultMode: 'step' | 'final';
  onPreviewResultModeChange: (mode: 'step' | 'final') => void;
  currentStepIndex: number;
  selectedColumnsPreview?: {
    columns: string[];
    data: any[];
    sourceFile: string;
    rowCount: number;
  } | null;
}

const LivePreview: React.FC<LivePreviewProps> = ({
  workflowSteps,
  importedFiles,
  sampleSize,
  isExecuting,
  previewResultMode,
  onPreviewResultModeChange,
  currentStepIndex,
  selectedColumnsPreview
}) => {
  // Helper function to filter columns intelligently based on preview mode
  const getFilteredColumns = (columns: string[], data: any[]): { filteredColumns: string[], filteredData: any[] } => {
    if (previewResultMode === 'final') {
      // In final results mode, show only output columns (transformed columns)
      const filteredColumns = columns.filter(col => 
        col.includes('_upper') || 
        col.includes('_lower') || 
        col.includes('_trim') || 
        col.includes('_text_length') || 
        col.includes('_title_case') || 
        col.includes('_proper') || 
        col.includes('_reverse') || 
        col.includes('_capitalize') ||
        col.includes('_add') ||
        col.includes('_subtract') ||
        col.includes('_multiply') ||
        col.includes('_divide') ||
        col.includes('_round') ||
        col.includes('_if') ||
        col.includes('_and') ||
        col.includes('_or') ||
        col.includes('_not') ||
        col.includes('_sum') ||
        col.includes('_count') ||
        col.includes('_unique_count') ||
        col.includes('_average') ||
        col.includes('_median') ||
        col.includes('_min') ||
        col.includes('_max') ||
        col.includes('_std_dev') ||
        col.includes('_variance') ||
        col.includes('_pivot') ||
        col.includes('_unpivot') ||
        col.includes('_group_by') ||
        col.includes('_sort') ||
        col.includes('_filter') ||
        col.includes('_remove_duplicates') ||
        col.includes('_fill_na') ||
        col.includes('_remove_na') ||
        col.includes('_normalize') ||
        col.includes('_standardize') ||
        col.includes('_bin') ||
        col.includes('_selected') ||  // Include selected columns from column selection steps
        col.includes('_exact')  // Include exact columns from EXACT formula
      );
      
      // Filter data to only include filtered columns
      const filteredData = data.map(row => {
        const filteredRow: any = {};
        filteredColumns.forEach(col => {
          if (row.hasOwnProperty(col)) {
            filteredRow[col] = row[col];
          }
        });
        return filteredRow;
      });
      
      return { filteredColumns, filteredData };
    }
    
    // In step results mode, show all columns (input + output)
    return { filteredColumns: columns, filteredData: data };
  };
  const [previewResults, setPreviewResults] = useState<ProcessedData[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Generate preview data for a specific step using data processor
  const generateStepPreview = useCallback(async (stepIndex: number, previousStepData?: any[]): Promise<ProcessedData> => {
    try {
      const step = workflowSteps[stepIndex];
      
      // Convert importedFiles to FileData format for data processor
      // IMPORTANT: For CSV files, we need to ensure data is loaded before processing
      const fileData: FileData[] = importedFiles.map(file => {
        // If this is a CSV file and data is empty, we need to load it on-demand
        if (file.type === 'text/csv' && (!file.data || file.data.length === 0)) {
          // Load CSV data on-demand (this is a simplified version - in real app, use the actual loadFileDataOnDemand function)
          try {
            const rawText = (file as any).rawText;
            if (rawText) {
              // Use Papa Parse to load the data
              const Papa = (window as any).Papa;
              if (Papa) {
                const parsed = Papa.parse(rawText, {
                  header: true,
                  skipEmptyLines: true,
                  dynamicTyping: false,
                  preview: 100 // Load up to 100 rows for preview
                });
                
                // Update the file data
                file.data = parsed.data as any[];
                console.log(`CSV data loaded on-demand for preview: ${parsed.data.length} rows`);
              }
            }
          } catch (error) {
            console.error('Error loading CSV data on-demand:', error);
          }
        }
        
        return {
          name: file.name,
          type: file.type,
          data: file.data || [],
          columns: file.columns || [],
          sheets: file.sheets,
          currentSheet: file.currentSheet
        };
      });
      
      console.log(`Generating preview for step ${stepIndex + 1}:`, { 
        step, 
        fileDataLength: fileData.length, 
        hasPreviousData: !!previousStepData,
        stepType: step.type,
        stepSource: step.source,
        stepTarget: step.target,
        columnReference: step.columnReference
      });
      
      // Log detailed file data for debugging
      fileData.forEach((file, index) => {
        console.log(`File ${index}:`, {
          name: file.name,
          type: file.type,
          dataLength: file.data.length,
          columns: file.columns,
          firstRowKeys: file.data.length > 0 ? Object.keys(file.data[0]) : []
        });
      });
      
      // Determine input data for this step
      let inputData: FileData[] = fileData;
      
      if (step.type === 'function') {
        // SPECIAL HANDLING FOR EXACT FORMULA - it needs original file data
        if (step.source === 'EXACT') {
          inputData = fileData;
          console.log(`EXACT formula step using original file data:`, inputData);
        } else if (previousStepData && previousStepData.length > 0) {
          // Other function steps can use previous step data if available
          inputData = [{
            name: `step_${stepIndex - 1}_output`,
            type: 'workflow_step',
            data: previousStepData,
            columns: Object.keys(previousStepData[0] || {}),
            sheets: {},
            currentSheet: undefined
          }];
          console.log(`Function step using previous step data:`, inputData);
        } else {
          // Function step with no previous data, use original file data
          inputData = fileData;
          console.log(`Function step using original file data (no previous data):`, inputData);
        }
      } else if (step.type === 'column') {
        // Column selection steps should always use original file data
        inputData = fileData;
        console.log(`Column selection step using original file data:`, inputData);
        
        // For column steps, also log what we're looking for
        if (step.columnReference) {
          console.log(`Looking for column: "${step.columnReference.columnName}" in file: "${step.columnReference.fileName}"`);
        } else {
          console.log(`Looking for column: "${step.source}" in any file`);
        }
      } else {
        // Other step types use original file data
        inputData = fileData;
        console.log(`Other step type using original file data:`, inputData);
      }
      
      // Process the step using data processor
      const result = await dataProcessor.processWorkflowStep(step, inputData, sampleSize);
      
      // Update the step index
      result.stepIndex = stepIndex;
      
      return result;
    } catch (error) {
      console.error(`Error generating preview for step ${stepIndex + 1}:`, error);
      throw new Error(`Failed to generate preview for step ${stepIndex + 1}: ${error}`);
    }
  }, [workflowSteps, importedFiles, sampleSize]);

  // Generate preview for all steps up to a specific point
  const generateWorkflowPreview = useCallback(async () => {
    if (workflowSteps.length === 0) return;
    
    setIsPreviewLoading(true);
    setPreviewError(null);
    
    try {
      console.log('Generating workflow preview...', { 
        workflowSteps, 
        sampleSize, 
        importedFilesCount: importedFiles.length,
        importedFilesData: importedFiles.map(f => ({ name: f.name, hasData: !!f.data, dataLength: f.data?.length || 0 }))
      });
      
      const results: ProcessedData[] = [];
      let previousStepData: any[] = [];
      
      // Generate preview for each step, passing previous step's output
      for (let i = 0; i < workflowSteps.length; i++) {
        console.log(`Processing step ${i + 1}/${workflowSteps.length}:`, workflowSteps[i]);
        
        try {
          const result = await generateStepPreview(i, previousStepData);
          results.push(result);
          
          // Store this step's output for the next step
          previousStepData = result.data;
          console.log(`Step ${i + 1} completed successfully:`, {
            outputRows: result.data.length,
            outputColumns: result.columns.length,
            sampleData: result.data.slice(0, 2)
          });
        } catch (stepError) {
          console.error(`Step ${i + 1} failed:`, stepError);
          // Add error result but continue processing
          results.push({
            data: [],
            columns: ['Error'],
            rowCount: 0,
            executionTime: 0,
            memoryUsage: 0,
            sampleSize: 0,
            stepIndex: i
          });
          // Don't pass error data to next step
          previousStepData = [];
        }
      }
      
      setPreviewResults(results);
      console.log('Workflow preview generated successfully:', results);
    } catch (error) {
      console.error('Error generating workflow preview:', error);
      setPreviewError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsPreviewLoading(false);
    }
  }, [workflowSteps, sampleSize, generateStepPreview, importedFiles]);

  // Auto-generate preview when workflow steps change
  useEffect(() => {
    if (workflowSteps.length > 0) {
      generateWorkflowPreview();
    } else {
      setPreviewResults([]);
    }
  }, [workflowSteps, sampleSize, generateWorkflowPreview]);

  // Get current preview result
  const currentPreview = currentStepIndex >= 0 && currentStepIndex < previewResults.length 
    ? previewResults[currentStepIndex] 
    : null;



  // Refresh preview
  const handleRefresh = useCallback(() => {
    generateWorkflowPreview();
  }, [generateWorkflowPreview]);

  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Simple Header - Controls are in main Playground header */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {previewResultMode === 'step' ? 'Step-by-step results' : 'Final workflow results'}
          </p>
        </div>

        {/* Error Display */}
        {previewError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Preview Error:</span>
              <span>{previewError}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {workflowSteps.length === 0 ? (
            // Empty State
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <Eye className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No Workflow to Preview</h3>
              <p className="text-sm text-center">
                Build a workflow in the Workflow Builder to see live previews here
              </p>
            </div>
          ) : isPreviewLoading ? (
            // Loading State
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-600">Generating preview...</p>
            </div>
          ) : (
            // Preview Content
            <div className="h-full flex flex-col">

              {/* Data Preview Table */}
              {selectedColumnsPreview && selectedColumnsPreview.data && selectedColumnsPreview.data.length > 0 ? (
                // Selected Columns Live Preview
                <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                  <div className="bg-blue-50 p-3 border-b border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-blue-800">
                          Live Preview - Selected Columns
                        </h3>
                        <p className="text-xs text-blue-600 mt-1">
                          Source: {selectedColumnsPreview.sourceFile} | 
                          Columns: {selectedColumnsPreview.columns.join(', ')} | 
                          Showing first {sampleSize} rows
                        </p>
                        {/* Debug info for column mapping */}
                        <div className="text-xs text-blue-500 mt-1">
                          Debug: {selectedColumnsPreview.data.length > 0 ? 
                            `First row keys: ${Object.keys(selectedColumnsPreview.data[0]).join(', ')}` : 
                            'No data available'
                          }
                        </div>
                      </div>
                      <div className="text-xs text-blue-600">
                        Total: {selectedColumnsPreview.rowCount} rows
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          {selectedColumnsPreview.columns.map((column: string, index: number) => (
                            <th
                              key={index}
                              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedColumnsPreview.data.map((row: any, rowIndex: number) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            {selectedColumnsPreview.columns.map((column: string, colIndex: number) => {
                              const cellValue = row[column];
                              const displayValue = cellValue !== undefined && cellValue !== null 
                                ? String(cellValue) 
                                : '';
                              
                              return (
                                <td
                                  key={colIndex}
                                  className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate"
                                  title={displayValue}
                                >
                                  {displayValue}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : currentPreview && currentPreview.data && currentPreview.data.length > 0 ? (
                // Workflow Step Preview (existing functionality)
                <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                  {/* Debug Info */}
                  <div className="bg-yellow-50 p-2 text-xs text-yellow-800 border-b border-yellow-200">
                    <strong>Debug:</strong> Columns: {JSON.stringify(currentPreview.columns)} | 
                    First row: {JSON.stringify(currentPreview.data[0])} | 
                    Note: This is workflow step preview, not live column preview
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          {(() => {
                            const { filteredColumns } = getFilteredColumns(currentPreview.columns, currentPreview.data);
                            return filteredColumns.map((column: string, index: number) => (
                              <th
                                key={index}
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {column}
                              </th>
                            ));
                          })()}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(() => {
                          const { filteredColumns, filteredData } = getFilteredColumns(currentPreview.columns, currentPreview.data);
                          return filteredData.map((row: any, rowIndex: number) => {
                            try {
                              return (
                                <tr key={rowIndex} className="hover:bg-gray-50">
                                  {filteredColumns.map((column: string, colIndex: number) => {
                                    try {
                                      const cellValue = row[column];
                                      const displayValue = cellValue !== undefined && cellValue !== null 
                                        ? String(cellValue) 
                                        : '';
                                      
                                      return (
                                        <td
                                          key={colIndex}
                                          className="px-2 py-2 text-sm text-gray-900 max-w-xs truncate"
                                          title={displayValue}
                                        >
                                          {displayValue}
                                        </td>
                                      );
                                    } catch (cellError) {
                                      console.error(`Error rendering cell at row ${rowIndex}, col ${colIndex}:`, cellError, { row, column });
                                      return (
                                        <td
                                          key={colIndex}
                                          className="px-2 py-2 text-sm text-red-600 max-w-xs"
                                          title="Error rendering cell"
                                        >
                                          [Error]
                                        </td>
                                      );
                                    }
                                  })}
                                </tr>
                              );
                            } catch (rowError) {
                              console.error(`Error rendering row ${rowIndex}:`, rowError, { row: filteredData[rowIndex] });
                              return (
                                <tr key={rowIndex} className="hover:bg-gray-50 bg-red-50">
                                  <td colSpan={filteredColumns.length} className="px-2 py-2 text-sm text-red-600">
                                    Error rendering row: {rowError instanceof Error ? rowError.message : 'Unknown error'}
                                  </td>
                                </tr>
                              );
                            }
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Preview Info */}
                  <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>
                        Showing {currentPreview.data.length} of {currentPreview.rowCount} rows 
                        (Sample size: {currentPreview.sampleSize})
                      </span>
                      <span>
                        {currentPreview.executionTime.toFixed(2)}ms • {currentPreview.memoryUsage.toFixed(2)}MB
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // No Data State
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <Info className="w-16 h-16 mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No Preview Data</h3>
                  <p className="text-sm text-center">
                    {previewError 
                      ? 'Error occurred while generating preview'
                      : selectedColumnsPreview 
                        ? 'Select columns from Data Sources to see live preview'
                        : 'No data available for the selected step'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LivePreview;
