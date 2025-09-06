// @ts-ignore
import Papa from 'papaparse';
import * as tf from '@tensorflow/tfjs';

export interface ProcessedData {
  data: any[];
  columns: string[];
  rowCount: number;
  executionTime: number;
  memoryUsage: number;
  sampleSize: number;
  stepIndex: number;
}

export interface WorkflowStep {
  id: string;
  type: 'column' | 'function' | 'break' | 'custom' | 'sheet';
  source: string;
  target?: string;
  sheet?: string;
  parameters?: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  columnReference?: { fileName: string; columnName: string };
}

export interface FileData {
  name: string;
  type: string;
  data: any[];
  columns: string[];
  sheets?: { [sheetName: string]: any[] };
  currentSheet?: string;
}

class DataProcessor {
  private isInitialized = false;

  constructor() {
    this.initializeProcessor();
  }

  private async initializeProcessor() {
    try {
      // Initialize TensorFlow.js
      await tf.ready();
      this.isInitialized = true;
      console.log('Data processor initialized successfully with TensorFlow.js');
    } catch (error) {
      console.error('Failed to initialize data processor:', error);
      this.isInitialized = false;
    }
  }

  private async ensureInitialized(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initializeProcessor();
    }
    return this.isInitialized;
  }

  // Parse CSV data using PapaParse
  parseCSVData(csvText: string): { data: any[], columns: string[] } {
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false
    });

    if (result.errors.length > 0) {
      console.warn('CSV parsing warnings:', result.errors);
    }

    return {
      data: result.data as any[],
      columns: result.meta.fields || []
    };
  }

  // Process workflow step and return preview data
  async processWorkflowStep(
    step: WorkflowStep,
    fileData: FileData[],
    sampleSize: number
  ): Promise<ProcessedData> {
    if (!(await this.ensureInitialized())) {
      throw new Error('Data processor not initialized');
    }

    const startTime = performance.now();
    
    try {
      // Validate input data
      if (!fileData || fileData.length === 0) {
        throw new Error('No file data provided');
      }

      if (!fileData[0].data || fileData[0].data.length === 0) {
        throw new Error('No data available in files');
      }

      let resultData: any[] = [];
      let resultColumns: string[] = [];

      console.log(`Processing workflow step: ${step.type}`, { step, fileDataLength: fileData.length });

      switch (step.type) {
        case 'column':
          // Select specific columns
          resultData = await this.processColumnSelection(step, fileData, sampleSize);
          resultColumns = step.target ? [step.source, step.target] : [step.source];
          break;

        case 'function':
          // Apply function transformation
          resultData = await this.processFunctionApplication(step, fileData, sampleSize);
          resultColumns = this.getFunctionOutputColumns(step);
          break;

        case 'custom':
          // Custom value operation
          resultData = await this.processCustomOperation(step, sampleSize);
          resultColumns = ['Custom_Value', 'Row_Index'];
          break;

        case 'sheet':
          // Handle sheet selection
          resultData = await this.processSheetSelection(step, fileData, sampleSize);
          resultColumns = fileData[0]?.columns || [];
          break;

        default:
          // Default to showing source data
          resultData = await this.processDefaultView(step, fileData, sampleSize);
          resultColumns = fileData[0]?.columns || [];
      }

      const executionTime = performance.now() - startTime;
      const memoryUsage = this.estimateMemoryUsage(resultData);

      console.log(`Step processed successfully: ${resultData.length} rows, ${resultColumns.length} columns`);

      return {
        data: resultData,
        columns: resultColumns,
        rowCount: resultData.length,
        executionTime,
        memoryUsage,
        sampleSize: Math.min(sampleSize, resultData.length),
        stepIndex: 0 // Will be set by caller
      };

    } catch (error) {
      console.error('Error processing workflow step:', error);
      throw error;
    }
  }

  // Process column selection step
  private async processColumnSelection(
    step: WorkflowStep,
    fileData: FileData[],
    sampleSize: number
  ): Promise<any[]> {
    if (fileData.length === 0) return [];
    
    console.log(`Processing column selection: ${step.source} -> ${step.target || 'same'}`);
    console.log(`Step details:`, step);
    
    // Find the source file using columnReference if available
    let sourceFile: FileData | null = null;
    let actualColumnName = step.source;
    
    if (step.columnReference) {
      // Use the column reference to find the correct file
      sourceFile = fileData.find(file => file.name === step.columnReference!.fileName) || null;
      actualColumnName = step.columnReference.columnName;
      console.log(`Using column reference:`, step.columnReference);
      console.log(`Found source file:`, sourceFile?.name);
    } else {
      // Fallback: use first file (old behavior)
      sourceFile = fileData[0];
      console.log(`No column reference, using first file:`, sourceFile?.name);
    }
    
    if (!sourceFile || !sourceFile.data || sourceFile.data.length === 0) {
      console.warn(`No data found for source file: ${sourceFile?.name}`);
      return [];
    }
    
    const sourceData = sourceFile.data;
    const sampleData = sourceData.slice(0, sampleSize);
    
    console.log(`Processing ${sampleData.length} rows from file ${sourceFile.name}, column: ${actualColumnName}`);
    console.log(`Sample data keys:`, Object.keys(sampleData[0] || {}));
    
    return sampleData.map(row => {
      const newRow: any = {};
      
      if (actualColumnName in row) {
        newRow[step.source] = row[actualColumnName];
        if (step.target && step.target !== step.source) {
          newRow[step.target] = row[actualColumnName]; // Copy source to target
        }
        console.log(`Row data: ${actualColumnName} = ${row[actualColumnName]}`);
      } else {
        // Handle missing column gracefully
        console.warn(`Column "${actualColumnName}" not found in row:`, Object.keys(row));
        newRow[step.source] = `[Column not found: ${actualColumnName}]`;
        if (step.target) {
          newRow[step.target] = `[Column not found: ${actualColumnName}]`;
        }
      }
      return newRow;
    });
  }

  // Get output columns for function steps
  private getFunctionOutputColumns(step: WorkflowStep): string[] {
    const functionName = step.source.toUpperCase();
    const parameters = step.parameters || [];
    
    // If no parameters, return empty array
    if (parameters.length === 0) {
      return [];
    }
    
    // Return appropriate column names based on function type
    switch (functionName) {
      case 'UPPER':
      case 'LOWER':
      case 'TRIM':
      case 'TEXT_LENGTH':
      case 'PROPER_CASE':
      case 'REVERSE':
      case 'CAPITALIZE':
        return [parameters[0] || 'input_column', `${functionName.toLowerCase()}_result`];
        
      case 'ADD':
      case 'SUBTRACT':
      case 'MULTIPLY':
      case 'DIVIDE':
        return [parameters[0] || 'column1', parameters[1] || 'column2', `${functionName.toLowerCase()}_result`];
        
      case 'TEXT_JOIN':
        return ['joined_text'];
        
      case 'IF':
        return [parameters[0] || 'condition', 'if_result'];
        
      case 'SUM':
        return ['sum_result'];
        
      case 'COUNT':
      case 'UNIQUE_COUNT':
        return [`${functionName.toLowerCase()}_result`];
        
      default:
        return ['input_column', 'output_column'];
    }
  }

  // Process function application step with enhanced formula support
  private async processFunctionApplication(
    step: WorkflowStep,
    fileData: FileData[],
    sampleSize: number
  ): Promise<any[]> {
    if (fileData.length === 0) return [];
    
    console.log(`Processing function application: ${step.source} with parameters:`, step.parameters);
    console.log(`Input file data:`, fileData[0]);
    
    // Get the function name and parameters
    const functionName = step.source.toUpperCase();
    const parameters = step.parameters || [];
    
    // If no parameters are provided, return empty result
    if (parameters.length === 0) {
      console.warn(`Function ${functionName} has no parameters - returning empty result`);
      return [];
    }
    
    // Get the input data - this should be from the previous step
    const sourceData = fileData[0].data;
    const sampleData = sourceData.slice(0, sampleSize);
    
    console.log(`Function ${functionName} processing ${sampleData.length} rows with parameters:`, parameters);
    console.log(`Sample input data:`, sampleData.slice(0, 2));
    
    return sampleData.map((row, rowIndex) => {
      const result: any = {};
      
      try {
        // Apply transformations based on function name
        switch (functionName) {
          case 'UPPER':
          case 'UPPERCASE':
            const inputColumn = parameters[0] || Object.keys(row)[0];
            result[inputColumn] = row[inputColumn];
            result[`${functionName.toLowerCase()}_result`] = String(row[inputColumn] || '').toUpperCase();
            break;
            
          case 'LOWER':
          case 'LOWERCASE':
            const lowerColumn = parameters[0] || Object.keys(row)[0];
            result[lowerColumn] = row[lowerColumn];
            result[`${functionName.toLowerCase()}_result`] = String(row[lowerColumn] || '').toLowerCase();
            break;
            
          case 'TRIM':
            const trimColumn = parameters[0] || Object.keys(row)[0];
            result[trimColumn] = row[trimColumn];
            result[`${functionName.toLowerCase()}_result`] = String(row[trimColumn] || '').trim();
            break;
            
          case 'TEXT_LENGTH':
          case 'LEN':
            const lenColumn = parameters[0] || Object.keys(row)[0];
            result[lenColumn] = row[lenColumn];
            result[`${functionName.toLowerCase()}_result`] = String(row[lenColumn] || '').length;
            break;
            
          case 'TITLE_CASE':
          case 'PROPER':
          case 'PROPER_CASE':
            const properColumn = parameters[0] || Object.keys(row)[0];
            result[properColumn] = row[properColumn];
            result[`${functionName.toLowerCase()}_result`] = String(row[properColumn] || '').replace(/\w\S*/g, (txt) => 
              txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
            break;
            
          case 'REVERSE':
            const reverseColumn = parameters[0] || Object.keys(row)[0];
            result[reverseColumn] = row[reverseColumn];
            result[`${functionName.toLowerCase()}_result`] = String(row[reverseColumn] || '').split('').reverse().join('');
            break;
            
          case 'CAPITALIZE':
            const capColumn = parameters[0] || Object.keys(row)[0];
            result[capColumn] = row[capColumn];
            result[`${functionName.toLowerCase()}_result`] = String(row[capColumn] || '').charAt(0).toUpperCase() + String(row[capColumn] || '').slice(1);
            break;
            
          case 'ADD':
          case 'ADD_VALUES':
            if (parameters.length >= 2) {
              const val1 = parseFloat(row[parameters[0]] || 0);
              const val2 = parseFloat(row[parameters[1]] || 0);
              result[parameters[0]] = val1;
              result[parameters[1]] = val2;
              result[`${functionName.toLowerCase()}_result`] = val1 + val2;
            }
            break;
            
          case 'SUBTRACT':
            if (parameters.length >= 2) {
              const val1 = parseFloat(row[parameters[0]] || 0);
              const val2 = parseFloat(row[parameters[1]] || 0);
              result[parameters[0]] = val1;
              result[parameters[1]] = val2;
              result[`${functionName.toLowerCase()}_result`] = val1 - val2;
            }
            break;
            
          case 'MULTIPLY':
            if (parameters.length >= 2) {
              const val1 = parseFloat(row[parameters[0]] || 0);
              const val2 = parseFloat(row[parameters[1]] || 0);
              result[parameters[0]] = val1;
              result[parameters[1]] = val2;
              result[`${functionName.toLowerCase()}_result`] = val1 * val2;
            }
            break;
            
          case 'DIVIDE':
            if (parameters.length >= 2) {
              const val1 = parseFloat(row[parameters[0]] || 0);
              const val2 = parseFloat(row[parameters[1]] || 0);
              result[parameters[0]] = val1;
              result[parameters[1]] = val2;
              result[`${functionName.toLowerCase()}_result`] = val2 !== 0 ? val1 / val2 : 0;
            }
            break;
            
          case 'TEXT_JOIN':
            if (parameters.length >= 3) {
              const delimiter = parameters[0];
              const ignoreEmpty = parameters[1] === 'TRUE' || parameters[1] === 'true';
              const textColumns = parameters.slice(2);
              const values = textColumns.map(col => row[col]).filter(val => !ignoreEmpty || val !== '');
              result['joined_text'] = values.join(delimiter);
            }
            break;
            
          case 'IF':
            if (parameters.length >= 4) {
              const conditionColumn = parameters[0];
              const conditionValue = parameters[1];
              const trueValue = parameters[2];
              const falseValue = parameters[3];
              result[conditionColumn] = row[conditionColumn];
              result['if_result'] = row[conditionColumn] === conditionValue ? trueValue : falseValue;
            }
            break;
            
          case 'SUM':
            const sumColumns = parameters.length > 0 ? parameters : Object.keys(row).filter(key => !isNaN(parseFloat(row[key])));
            const sumValue = sumColumns.reduce((sum, col) => sum + parseFloat(row[col] || 0), 0);
            result['sum_result'] = sumValue;
            break;
            
          case 'COUNT':
            const countColumn = parameters[0] || Object.keys(row)[0];
            result[countColumn] = row[countColumn];
            result['count_result'] = row[countColumn] !== null && row[countColumn] !== undefined && row[countColumn] !== '' ? 1 : 0;
            break;
            
          case 'UNIQUE_COUNT':
            const uniqueColumn = parameters[0] || Object.keys(row)[0];
            result[uniqueColumn] = row[uniqueColumn];
            result['unique_count_result'] = 1; // This would need to be calculated across all rows
            break;
            
          default:
            result['input_column'] = row[Object.keys(row)[0]];
            result['output_column'] = `[Unknown function: ${functionName}]`;
        }
        
        console.log(`Row ${rowIndex}: ${functionName} result:`, result);
        return result;
        
      } catch (error) {
        console.error(`Error processing row ${rowIndex} with function ${functionName}:`, error);
        return {
          'input_column': row[Object.keys(row)[0]],
          'output_column': `[Error: ${error}]`
        };
      }
    });
  }

  // Process custom operation step
  private async processCustomOperation(
    step: WorkflowStep,
    sampleSize: number
  ): Promise<any[]> {
    console.log(`Processing custom operation: ${step.source}`);
    
    const result = [];
    for (let i = 0; i < sampleSize; i++) {
      result.push({
        'Custom_Value': step.source,
        'Row_Index': i + 1
      });
    }
    return result;
  }

  // Process sheet selection step
  private async processSheetSelection(
    step: WorkflowStep,
    fileData: FileData[],
    sampleSize: number
  ): Promise<any[]> {
    if (fileData.length === 0) return [];
    
    const file = fileData[0];
    if (step.sheet && file.sheets && file.sheets[step.sheet]) {
      const sheetData = file.sheets[step.sheet];
      return sheetData.slice(0, sampleSize);
    }
    
    // Fallback to current sheet or main data
    return file.data.slice(0, sampleSize);
  }

  // Process default view (show source data)
  private async processDefaultView(
    step: WorkflowStep,
    fileData: FileData[],
    sampleSize: number
  ): Promise<any[]> {
    if (fileData.length === 0) return [];
    
    const sourceData = fileData[0].data;
    console.log(`Processing default view: showing ${Math.min(sampleSize, sourceData.length)} rows`);
    return sourceData.slice(0, sampleSize);
  }

  // Estimate memory usage of data
  private estimateMemoryUsage(data: any[]): number {
    if (data.length === 0) return 0;
    
    try {
      // Rough estimation: each row ~100 bytes + overhead
      const rowSize = JSON.stringify(data[0]).length;
      const totalSize = data.length * rowSize;
      return Math.round(totalSize / (1024 * 1024) * 100) / 100; // MB
    } catch (error) {
      console.warn('Could not estimate memory usage:', error);
      return 0;
    }
  }

  // Execute full workflow on complete dataset
  async executeFullWorkflow(
    workflowSteps: WorkflowStep[],
    fileData: FileData[]
  ): Promise<ProcessedData> {
    if (!(await this.ensureInitialized())) {
      throw new Error('Data processor not initialized');
    }

    const startTime = performance.now();
    
    try {
      console.log(`Executing full workflow with ${workflowSteps.length} steps`);
      
      // Process all steps sequentially
      let currentData = fileData[0]?.data || [];
      let currentColumns = fileData[0]?.columns || [];

      for (let i = 0; i < workflowSteps.length; i++) {
        const step = workflowSteps[i];
        console.log(`Processing step ${i + 1}/${workflowSteps.length}: ${step.type}`);
        
        // Process each step and update current data
        const stepResult = await this.processWorkflowStep(step, fileData, currentData.length);
        currentData = stepResult.data;
        currentColumns = stepResult.columns;
        
        // Update step status
        step.status = 'completed';
      }

      const executionTime = performance.now() - startTime;
      const memoryUsage = this.estimateMemoryUsage(currentData);

      console.log(`Full workflow completed: ${currentData.length} rows, ${executionTime.toFixed(2)}ms`);

      return {
        data: currentData,
        columns: currentColumns,
        rowCount: currentData.length,
        executionTime,
        memoryUsage,
        sampleSize: currentData.length,
        stepIndex: workflowSteps.length - 1
      };

    } catch (error) {
      console.error('Error executing full workflow:', error);
      throw error;
    }
  }

  // Clean up resources
  async cleanup() {
    try {
      // Clean up TensorFlow.js tensors if any
      tf.engine().endScope();
      this.isInitialized = false;
      console.log('Data processor cleaned up successfully');
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  }
}

// Export singleton instance
export const dataProcessor = new DataProcessor();
