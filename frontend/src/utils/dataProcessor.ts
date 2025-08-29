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
          
          // Determine columns based on function type and parameters
          if (step.parameters && step.parameters.length > 1 && 
              ['UPPER', 'LOWER', 'TRIM', 'TEXT_LENGTH', 'TITLE_CASE', 'PROPER', 'PROPER_CASE', 'REVERSE', 'CAPITALIZE'].includes(step.source.toUpperCase())) {
            // Multi-column function - include all original columns plus transformed columns
            const originalColumns = fileData[0]?.columns || [];
            const transformedColumns = step.parameters.map(param => {
              const columnName = param.split(' ▸ ').pop() || param;
              return `${columnName}_${step.source.toLowerCase()}`;
            });
            resultColumns = [...originalColumns, ...transformedColumns];
          } else {
            // Single column function - use standard format
            resultColumns = ['Input_Column', 'Output_Column'];
          }
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

  // Process function application step with enhanced formula support
  private async processFunctionApplication(
    step: WorkflowStep,
    fileData: FileData[],
    sampleSize: number
  ): Promise<any[]> {
    if (fileData.length === 0) return [];
    
    console.log(`Processing function application: ${step.source} with parameters:`, step.parameters);
    console.log(`Input file data:`, fileData[0]);
    console.log(`Step column reference:`, step.columnReference);
    
    // Get the function name and parameters
    const functionName = step.source.toUpperCase();
    const parameters = step.parameters || [];
    
    // Get the input data - this should be from the previous step
    const sourceData = fileData[0].data;
    const sampleData = sourceData.slice(0, sampleSize);
    
    console.log(`Function ${functionName} processing ${sampleData.length} rows with parameters:`, parameters);
    console.log(`Sample input data:`, sampleData.slice(0, 2));
    
    return sampleData.map((row, rowIndex) => {
      // For function steps, we need to determine which column to process
      // Priority: 1. columnReference, 2. parameters, 3. first available column
      let inputColumn = '';
      
      if (step.columnReference && step.columnReference.columnName) {
        // Use the column reference from the step
        inputColumn = step.columnReference.columnName;
        console.log(`Using column reference: ${inputColumn}`);
      } else if (parameters.length > 0) {
        // Use the first parameter as column name
        inputColumn = parameters[0];
        console.log(`Using parameter as column: ${inputColumn}`);
      } else {
        // Fallback: use the first available column
        const availableColumns = Object.keys(row);
        inputColumn = availableColumns[0] || 'unknown';
        console.log(`No parameter specified, using first available column: ${inputColumn}`);
      }
      
      const inputValue = row[inputColumn] || '';
      let outputValue = inputValue;
      
      console.log(`Row ${rowIndex}: processing column "${inputColumn}" with value "${inputValue}"`);
      
      try {
        // Apply transformations based on function name
        switch (functionName) {
          case 'UPPER':
          case 'UPPERCASE':
            outputValue = String(inputValue).toUpperCase();
            break;
            
          case 'LOWER':
          case 'LOWERCASE':
            outputValue = String(inputValue).toLowerCase();
            break;
            
          case 'TRIM':
            outputValue = String(inputValue).trim();
            break;
            
          case 'TEXT_LENGTH':
          case 'LEN':
            outputValue = String(inputValue).length;
            break;
            
          case 'TITLE_CASE':
          case 'PROPER':
          case 'PROPER_CASE':
            outputValue = String(inputValue).replace(/\w\S*/g, (txt) => 
              txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
            break;
            
          case 'REVERSE':
            outputValue = String(inputValue).split('').reverse().join('');
            break;
            
          case 'CAPITALIZE':
            outputValue = String(inputValue).charAt(0).toUpperCase() + String(inputValue).slice(1);
            break;
            
          case 'TEXT_JOIN':
            outputValue = this.processTextJoin(row, parameters);
            break;
            
          case 'CONCATENATE':
          case 'CONCAT':
            outputValue = this.processConcatenate(row, parameters);
            break;
            
          case 'SUBSTITUTE':
            outputValue = this.processSubstitute(inputValue, parameters);
            break;
            
          case 'LEFT':
            outputValue = this.processLeft(inputValue, parameters);
            break;
            
          case 'RIGHT':
            outputValue = this.processRight(inputValue, parameters);
            break;
            
          case 'MID':
            outputValue = this.processMid(inputValue, parameters);
            break;
            
          case 'FIND':
          case 'SEARCH':
            outputValue = this.processFind(inputValue, parameters);
            break;
            
          case 'REPLACE':
            outputValue = this.processReplace(inputValue, parameters);
            break;
            
          case 'ADD':
          case 'ADD_VALUES':
            if (parameters.length >= 2) {
              const val1 = parseFloat(row[parameters[0]] || 0);
              const val2 = parseFloat(row[parameters[1]] || 0);
              outputValue = val1 + val2;
            }
            break;
            
          case 'SUBTRACT':
          case 'SUB':
            if (parameters.length >= 2) {
              const val1 = parseFloat(row[parameters[0]] || 0);
              const val2 = parseFloat(row[parameters[1]] || 0);
              outputValue = val1 - val2;
            }
            break;
            
          case 'MULTIPLY':
          case 'MUL':
            if (parameters.length >= 2) {
              const val1 = parseFloat(row[parameters[0]] || 0);
              const val2 = parseFloat(row[parameters[1]] || 0);
              outputValue = val1 * val2;
            }
            break;
            
          case 'DIVIDE':
          case 'DIV':
            if (parameters.length >= 2) {
              const val1 = parseFloat(row[parameters[0]] || 0);
              const val2 = parseFloat(row[parameters[1]] || 0);
              outputValue = val2 !== 0 ? val1 / val2 : '[DIVIDE: Division by zero]';
            }
            break;
            
          case 'ROUND':
            if (parameters.length >= 1) {
              const value = parseFloat(row[parameters[0]] || 0);
              const decimals = parameters[1] ? parseInt(parameters[1]) : 0;
              outputValue = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
            }
            break;
            
          case 'IF':
            if (parameters.length >= 3) {
              const condition = this.evaluateCondition(row, parameters[0]);
              outputValue = condition ? row[parameters[1]] : row[parameters[2]];
            }
            break;
            
          case 'AND':
            if (parameters.length >= 2) {
              outputValue = parameters.every(param => this.evaluateCondition(row, param));
            }
            break;
            
          case 'OR':
            if (parameters.length >= 2) {
              outputValue = parameters.some(param => this.evaluateCondition(row, param));
            }
            break;
            
          case 'NOT':
            if (parameters.length >= 1) {
              outputValue = !this.evaluateCondition(row, parameters[0]);
            }
            break;
            
          default:
            outputValue = `[Unknown function: ${functionName}]`;
        }
        
        console.log(`Row ${rowIndex}: ${functionName}("${inputValue}") = "${outputValue}"`);
        
        return {
          'Input_Column': inputValue,
          'Output_Column': outputValue
        };
        
      } catch (error) {
        console.error(`Error processing row ${rowIndex} with function ${functionName}:`, error);
        return {
          'Input_Column': inputValue,
          'Output_Column': `[Error: ${error}]`
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

  // Formula helper methods
  private processTextJoin(row: any, parameters: string[]): string {
    try {
      if (parameters.length < 3) {
        return '[TEXT_JOIN: Insufficient parameters]';
      }
      
      const delimiter = parameters[0] || ', ';
      const ignoreEmpty = parameters[1] === 'TRUE' || parameters[1] === 'true';
      const textColumns = parameters.slice(2);
      
      const values = textColumns
        .map(col => row[col])
        .filter(val => !ignoreEmpty || (val !== null && val !== undefined && val !== ''));
      
      return values.join(delimiter);
    } catch (error) {
      console.error('Error in TEXT_JOIN:', error);
      return '[TEXT_JOIN: Error]';
    }
  }

  private processConcatenate(row: any, parameters: string[]): string {
    try {
      if (parameters.length === 0) {
        return '[CONCATENATE: No parameters]';
      }
      
      return parameters
        .map(col => String(row[col] || ''))
        .join('');
    } catch (error) {
      console.error('Error in CONCATENATE:', error);
      return '[CONCATENATE: Error]';
    }
  }

  private processSubstitute(inputValue: string, parameters: string[]): string {
    try {
      if (parameters.length < 2) {
        return '[SUBSTITUTE: Insufficient parameters]';
      }
      
      const searchText = parameters[0];
      const replaceText = parameters[1];
      const instanceNum = parameters[2] ? parseInt(parameters[2]) : 1;
      
      if (instanceNum === 1) {
        return inputValue.replace(searchText, replaceText);
      } else {
        // Handle specific instance replacement
        let result = inputValue;
        let count = 0;
        const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        result = result.replace(regex, (match) => {
          count++;
          return count === instanceNum ? replaceText : match;
        });
        return result;
      }
    } catch (error) {
      console.error('Error in SUBSTITUTE:', error);
      return '[SUBSTITUTE: Error]';
    }
  }

  private processLeft(inputValue: string, parameters: string[]): string {
    try {
      if (parameters.length === 0) {
        return '[LEFT: No parameters]';
      }
      
      const numChars = parseInt(parameters[0]) || 1;
      return inputValue.substring(0, Math.min(numChars, inputValue.length));
    } catch (error) {
      console.error('Error in LEFT:', error);
      return '[LEFT: Error]';
    }
  }

  private processRight(inputValue: string, parameters: string[]): string {
    try {
      if (parameters.length === 0) {
        return '[RIGHT: No parameters]';
      }
      
      const numChars = parseInt(parameters[0]) || 1;
      return inputValue.substring(Math.max(0, inputValue.length - numChars));
    } catch (error) {
      console.error('Error in RIGHT:', error);
      return '[RIGHT: Error]';
    }
  }

  private processMid(inputValue: string, parameters: string[]): string {
    try {
      if (parameters.length < 2) {
        return '[MID: Insufficient parameters]';
      }
      
      const startPos = parseInt(parameters[0]) || 1;
      const numChars = parseInt(parameters[1]) || 1;
      
      // Convert to 0-based indexing
      const startIndex = Math.max(0, startPos - 1);
      const endIndex = Math.min(inputValue.length, startIndex + numChars);
      
      return inputValue.substring(startIndex, endIndex);
    } catch (error) {
      console.error('Error in MID:', error);
      return '[MID: Error]';
    }
  }

  private processFind(inputValue: string, parameters: string[]): number {
    try {
      if (parameters.length === 0) {
        return -1;
      }
      
      const searchText = parameters[0];
      const startPos = parameters[1] ? parseInt(parameters[1]) : 1;
      
      // Convert to 0-based indexing
      const startIndex = Math.max(0, startPos - 1);
      const foundIndex = inputValue.indexOf(searchText, startIndex);
      
      // Convert back to 1-based indexing for Excel compatibility
      return foundIndex >= 0 ? foundIndex + 1 : -1;
    } catch (error) {
      console.error('Error in FIND:', error);
      return -1;
    }
  }

  private processReplace(inputValue: string, parameters: string[]): string {
    try {
      if (parameters.length < 3) {
        return '[REPLACE: Insufficient parameters]';
      }
      
      const startPos = parseInt(parameters[0]) || 1;
      const numChars = parseInt(parameters[1]) || 0;
      const newText = parameters[2] || '';
      
      // Convert to 0-based indexing
      const startIndex = Math.max(0, startPos - 1);
      const endIndex = startIndex + numChars;
      
      return inputValue.substring(0, startIndex) + newText + inputValue.substring(endIndex);
    } catch (error) {
      console.error('Error in REPLACE:', error);
      return '[REPLACE: Error]';
    }
  }

  // Helper method to evaluate conditions for logical functions
  private evaluateCondition(row: any, condition: string): boolean {
    try {
      // Simple condition evaluation - can be enhanced for complex expressions
      if (condition.includes('>')) {
        const parts = condition.split('>').map(s => s.trim());
        const col = parts[0] || '';
        const val = parts[1] || '0';
        return parseFloat(String(row[col] || 0)) > parseFloat(val || '0');
      } else if (condition.includes('<')) {
        const parts = condition.split('<').map(s => s.trim());
        const col = parts[0] || '';
        const val = parts[1] || '0';
        return parseFloat(String(row[col] || 0)) < parseFloat(val || '0');
      } else if (condition.includes('>=')) {
        const parts = condition.split('>=').map(s => s.trim());
        const col = parts[0] || '';
        const val = parts[1] || '0';
        return parseFloat(String(row[col] || 0)) >= parseFloat(val || '0');
      } else if (condition.includes('<=')) {
        const parts = condition.split('<=').map(s => s.trim());
        const col = parts[0] || '';
        const val = parts[1] || '0';
        return parseFloat(String(row[col] || 0)) <= parseFloat(val || '0');
      } else if (condition.includes('==') || condition.includes('=')) {
        const parts = condition.split(/==?/).map(s => s.trim());
        const col = parts[0] || '';
        const val = parts[1] || '';
        return String(row[col] || '') === String(val || '');
      } else if (condition.includes('!=')) {
        const parts = condition.split('!=').map(s => s.trim());
        const col = parts[0] || '';
        const val = parts[1] || '';
        return String(row[col] || '') !== String(val || '');
      } else {
        // Simple truthy check
        return Boolean(row[condition]);
      }
    } catch (error) {
      console.error('Error evaluating condition:', condition, error);
      return false;
    }
  }

  // Process multiple columns simultaneously for functions like UPPER, LOWER, etc.
  private async processMultiColumnFunction(
    step: WorkflowStep,
    fileData: FileData[],
    sampleSize: number
  ): Promise<any[]> {
    const functionName = step.source.toUpperCase();
    const parameters = step.parameters || [];
    
    console.log(`Processing multi-column function: ${functionName} for ${parameters.length} columns`);
    
    // Get the input data
    const sourceData = fileData[0].data;
    const sampleData = sourceData.slice(0, sampleSize);
    
    return sampleData.map((row, rowIndex) => {
      // Create a new row with all original columns plus transformed columns
      const newRow = { ...row };
      
      // Process each input column and create corresponding output columns
      parameters.forEach((param, paramIndex) => {
        const inputColumn = param;
        const inputValue = row[inputColumn] || '';
        let outputValue = inputValue;
        
        // Apply the transformation based on function name
        try {
          switch (functionName) {
            case 'UPPER':
            case 'UPPERCASE':
              outputValue = String(inputValue).toUpperCase();
              break;
              
            case 'LOWER':
            case 'LOWERCASE':
              outputValue = String(inputValue).toLowerCase();
              break;
              
            case 'TRIM':
              outputValue = String(inputValue).trim();
              break;
              
            case 'TEXT_LENGTH':
            case 'LEN':
              outputValue = String(inputValue).length;
              break;
              
            case 'TITLE_CASE':
            case 'PROPER':
            case 'PROPER_CASE':
              outputValue = String(inputValue).replace(/\w\S*/g, (txt) => 
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
              );
              break;
              
            case 'REVERSE':
              outputValue = String(inputValue).split('').reverse().join('');
              break;
              
            case 'CAPITALIZE':
              outputValue = String(inputValue).charAt(0).toUpperCase() + String(inputValue).slice(1);
              break;
              
            default:
              outputValue = inputValue;
          }
          
          // Create output column name: original_column_functionname
          const columnName = inputColumn.split(' ▸ ').pop() || inputColumn;
          const outputColumnName = `${columnName}_${functionName.toLowerCase()}`;
          
          // Add the transformed value to the new row
          newRow[outputColumnName] = outputValue;
          
          console.log(`Row ${rowIndex}: ${inputColumn} -> ${outputColumnName} = "${outputValue}"`);
          
        } catch (error) {
          console.error(`Error processing column ${inputColumn} in row ${rowIndex}:`, error);
          const columnName = inputColumn.split(' ▸ ').pop() || inputColumn;
          const outputColumnName = `${columnName}_${functionName.toLowerCase()}`;
          newRow[outputColumnName] = '[Error]';
        }
      });
      
      return newRow;
    });
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
