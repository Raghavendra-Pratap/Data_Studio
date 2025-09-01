import { API_BASE_URL } from '../config/constants';

export interface DataOperation {
  operation_type: string;
  parameters: Record<string, any>;
  input_data?: any;
}

export interface DataResult {
  success: boolean;
  data?: any;
  error_message?: string;
  processing_time_ms: number;
  row_count?: number;
}

export interface CSVImportRequest {
  file_path: string;
  table_name?: string;
}

export interface SQLQueryRequest {
  sql: string;
}

export class EnhancedSQLiteService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/sqlite`;
  }

  /**
   * Import CSV data into SQLite with automatic schema detection
   */
  async importCSV(request: CSVImportRequest): Promise<DataResult> {
    try {
      const response = await fetch(`${this.baseUrl}/import-csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('CSV import failed:', error);
      return {
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        processing_time_ms: 0,
      };
    }
  }

  /**
   * Execute SQL query and return results
   */
  async executeQuery(request: SQLQueryRequest): Promise<DataResult> {
    try {
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('SQL query execution failed:', error);
      return {
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        processing_time_ms: 0,
      };
    }
  }

  /**
   * Perform data transformation operations
   */
  async transformData(operation: DataOperation): Promise<DataResult> {
    try {
      const response = await fetch(`${this.baseUrl}/transform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(operation),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Data transformation failed:', error);
      return {
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        processing_time_ms: 0,
      };
    }
  }

  /**
   * Get table schema information
   */
  async getTableSchema(tableName: string): Promise<DataResult> {
    const sql = `PRAGMA table_info(${tableName})`;
    return this.executeQuery({ sql });
  }

  /**
   * List all tables in the database
   */
  async listTables(): Promise<DataResult> {
    const sql = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
    return this.executeQuery({ sql });
  }

  /**
   * Get sample data from a table
   */
  async getSampleData(tableName: string, limit: number = 10): Promise<DataResult> {
    const sql = `SELECT * FROM ${tableName} LIMIT ${limit}`;
    return this.executeQuery({ sql });
  }

  /**
   * Get table statistics
   */
  async getTableStats(tableName: string): Promise<DataResult> {
    const sql = `SELECT COUNT(*) as row_count FROM ${tableName}`;
    return this.executeQuery({ sql });
  }

  /**
   * Create a new table with specified schema
   */
  async createTable(tableName: string, columns: Array<{ name: string; type: string; nullable?: boolean }>): Promise<DataResult> {
    const columnDefs = columns.map(col => {
      const nullable = col.nullable === false ? ' NOT NULL' : '';
      return `"${col.name}" ${col.type}${nullable}`;
    }).join(', ');

    const sql = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefs})`;
    return this.executeQuery({ sql });
  }

  /**
   * Drop a table
   */
  async dropTable(tableName: string): Promise<DataResult> {
    const sql = `DROP TABLE IF EXISTS "${tableName}"`;
    return this.executeQuery({ sql });
  }

  /**
   * Insert data into a table
   */
  async insertData(tableName: string, data: Record<string, any>[]): Promise<DataResult> {
    if (data.length === 0) {
      return {
        success: false,
        error_message: 'No data to insert',
        processing_time_ms: 0,
      };
    }

    const columns = Object.keys(data[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`;

    // For now, we'll use the transform endpoint with a custom operation
    // In a real implementation, we'd need a dedicated insert endpoint
    const operation: DataOperation = {
      operation_type: 'custom_insert',
      parameters: {
        table_name: tableName,
        columns,
        data,
        sql,
      },
    };

    return this.transformData(operation);
  }

  /**
   * Update data in a table
   */
  async updateData(tableName: string, setValues: Record<string, any>, whereCondition: string): Promise<DataResult> {
    const setClause = Object.keys(setValues).map(key => `"${key}" = ?`).join(', ');
    const sql = `UPDATE "${tableName}" SET ${setClause} WHERE ${whereCondition}`;

    const operation: DataOperation = {
      operation_type: 'custom_update',
      parameters: {
        table_name: tableName,
        set_values: setValues,
        where_condition: whereCondition,
        sql,
      },
    };

    return this.transformData(operation);
  }

  /**
   * Delete data from a table
   */
  async deleteData(tableName: string, whereCondition: string): Promise<DataResult> {
    const sql = `DELETE FROM "${tableName}" WHERE ${whereCondition}`;

    const operation: DataOperation = {
      operation_type: 'custom_delete',
      parameters: {
        table_name: tableName,
        where_condition: whereCondition,
        sql,
      },
    };

    return this.transformData(operation);
  }

  /**
   * Export table data to CSV format
   */
  async exportToCSV(tableName: string): Promise<DataResult> {
    const sql = `SELECT * FROM "${tableName}"`;
    const result = await this.executeQuery({ sql });
    
    if (!result.success || !result.data) {
      return result;
    }

    // Convert to CSV format
    try {
      const rows = result.data;
      if (rows.length === 0) {
        return {
          success: false,
          error_message: 'No data to export',
          processing_time_ms: result.processing_time_ms,
        };
      }

      const headers = Object.keys(rows[0]);
      const csvContent = [
        headers.join(','),
        ...rows.map((row: Record<string, any>) => 
          headers.map(header => {
            const value = row[header];
            // Escape CSV values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        )
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}_export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        data: { exported_rows: rows.length, filename: `${tableName}_export.csv` },
        processing_time_ms: result.processing_time_ms,
        row_count: rows.length,
      };
    } catch (error) {
      return {
        success: false,
        error_message: `CSV export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        processing_time_ms: result.processing_time_ms,
      };
    }
  }
}

// Export singleton instance
export const enhancedSQLiteService = new EnhancedSQLiteService();
