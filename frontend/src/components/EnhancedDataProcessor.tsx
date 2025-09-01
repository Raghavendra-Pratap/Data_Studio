import React, { useState, useEffect } from 'react';
import { 
  Database, 
  FileText, 
  Play, 
  Download, 
  Upload, 
  Eye,
  BarChart3,
  Filter,
  SortAsc,
  Group,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { enhancedSQLiteService, DataOperation } from '../services/EnhancedSQLiteService';

interface TableInfo {
  name: string;
  rowCount: number;
  columns: string[];
}

interface ProcessingStatus {
  isLoading: boolean;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export const EnhancedDataProcessor: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>({
    isLoading: false,
    message: 'Ready to process data',
    type: 'info'
  });
  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'transform' | 'import'>('tables');

  // Load tables on component mount
  useEffect(() => {
    loadTables();
  }, []);

  // Load table data when selection changes
  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  }, [selectedTable]);

  const loadTables = async () => {
    setStatus({ isLoading: true, message: 'Loading tables...', type: 'info' });
    
    try {
      const result = await enhancedSQLiteService.listTables();
      if (result.success && result.data) {
        const tablePromises = result.data.map(async (table: any) => {
          const stats = await enhancedSQLiteService.getTableStats(table.name);
          const schema = await enhancedSQLiteService.getTableSchema(table.name);
          
          return {
            name: table.name,
            rowCount: stats.success && stats.data ? stats.data[0]?.row_count || 0 : 0,
            columns: schema.success && schema.data ? schema.data.map((col: any) => col.name) : []
          };
        });

        const tableInfos = await Promise.all(tablePromises);
        setTables(tableInfos);
        setStatus({ isLoading: false, message: `Loaded ${tableInfos.length} tables`, type: 'success' });
      } else {
        setStatus({ isLoading: false, message: 'No tables found', type: 'info' });
      }
    } catch (error) {
      setStatus({ 
        isLoading: false, 
        message: `Failed to load tables: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        type: 'error' 
      });
    }
  };

  const loadTableData = async (tableName: string) => {
    setStatus({ isLoading: true, message: `Loading data from ${tableName}...`, type: 'info' });
    
    try {
      const result = await enhancedSQLiteService.getSampleData(tableName, 100);
      if (result.success && result.data) {
        setTableData(result.data);
        setStatus({ isLoading: false, message: `Loaded ${result.data.length} rows from ${tableName}`, type: 'success' });
      } else {
        setStatus({ isLoading: false, message: `Failed to load data from ${tableName}`, type: 'error' });
      }
    } catch (error) {
      setStatus({ 
        isLoading: false, 
        message: `Error loading table data: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        type: 'error' 
      });
    }
  };

  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      setStatus({ isLoading: false, message: 'Please enter a SQL query', type: 'warning' });
      return;
    }

    setStatus({ isLoading: true, message: 'Executing query...', type: 'info' });
    
    try {
      const result = await enhancedSQLiteService.executeQuery({ sql: sqlQuery });
      if (result.success && result.data) {
        setQueryResult(result.data);
        setStatus({ 
          isLoading: false, 
          message: `Query executed successfully in ${result.processing_time_ms}ms. Returned ${result.row_count || 0} rows.`, 
          type: 'success' 
        });
      } else {
        setStatus({ 
          isLoading: false, 
          message: `Query failed: ${result.error_message}`, 
          type: 'error' 
        });
      }
    } catch (error) {
      setStatus({ 
        isLoading: false, 
        message: `Query execution error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        type: 'error' 
      });
    }
  };

  const performTransformation = async (operationType: string, parameters: Record<string, any>) => {
    if (!selectedTable) {
      setStatus({ isLoading: false, message: 'Please select a table first', type: 'warning' });
      return;
    }

    setStatus({ isLoading: true, message: `Performing ${operationType} operation...`, type: 'info' });
    
    try {
      const operation: DataOperation = {
        operation_type: operationType,
        parameters: { table_name: selectedTable, ...parameters }
      };

      const result = await enhancedSQLiteService.transformData(operation);
      if (result.success && result.data) {
        setQueryResult(result.data);
        setStatus({ 
          isLoading: false, 
          message: `${operationType} operation completed in ${result.processing_time_ms}ms. Returned ${result.row_count || 0} rows.`, 
          type: 'success' 
        });
      } else {
        setStatus({ 
          isLoading: false, 
          message: `${operationType} operation failed: ${result.error_message}`, 
          type: 'error' 
        });
      }
    } catch (error) {
      setStatus({ 
        isLoading: false, 
        message: `${operationType} operation error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        type: 'error' 
      });
    }
  };

  const exportTableData = async () => {
    if (!selectedTable) {
      setStatus({ isLoading: false, message: 'Please select a table first', type: 'warning' });
      return;
    }

    setStatus({ isLoading: true, message: 'Exporting data to CSV...', type: 'info' });
    
    try {
      const result = await enhancedSQLiteService.exportToCSV(selectedTable);
      if (result.success) {
        setStatus({ 
          isLoading: false, 
          message: `Data exported successfully: ${result.data?.filename}`, 
          type: 'success' 
        });
      } else {
        setStatus({ 
          isLoading: false, 
          message: `Export failed: ${result.error_message}`, 
          type: 'error' 
        });
      }
    } catch (error) {
      setStatus({ 
        isLoading: false, 
        message: `Export error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        type: 'error' 
      });
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const renderTableData = (data: any[]) => {
    if (data.length === 0) return <p className="text-gray-500">No data available</p>;

    const headers = Object.keys(data[0]);
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.slice(0, 10).map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-4 py-2 text-sm text-gray-900 border-b">
                    {String(row[header] || '').substring(0, 50)}
                    {String(row[header] || '').length > 50 ? '...' : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 10 && (
          <p className="text-sm text-gray-500 mt-2">Showing first 10 rows of {data.length} total rows</p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Database className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Enhanced Data Processor</h2>
            <p className="text-gray-600">Powerful data processing with Enhanced SQLite</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadTables}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-3">
          {getStatusIcon(status.type)}
          <span className={`text-sm font-medium ${
            status.type === 'success' ? 'text-green-700' :
            status.type === 'error' ? 'text-red-700' :
            status.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'
          }`}>
            {status.message}
          </span>
          {status.isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'tables', label: 'Tables', icon: Database },
            { id: 'query', label: 'SQL Query', icon: FileText },
            { id: 'transform', label: 'Transform', icon: BarChart3 },
            { id: 'import', label: 'Import', icon: Upload }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tables Tab */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <div
                key={table.name}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedTable === table.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => setSelectedTable(table.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{table.name}</h3>
                  <span className="text-sm text-gray-500">{table.rowCount} rows</span>
                </div>
                <p className="text-sm text-gray-600">
                  {table.columns.length} columns: {table.columns.slice(0, 3).join(', ')}
                  {table.columns.length > 3 && '...'}
                </p>
              </div>
            ))}
          </div>

          {selectedTable && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Data from {selectedTable}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => loadTableData(selectedTable)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Data</span>
                  </button>
                  <button
                    onClick={exportTableData}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
              {tableData.length > 0 && renderTableData(tableData)}
            </div>
          )}
        </div>
      )}

      {/* SQL Query Tab */}
      {activeTab === 'query' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SQL Query
            </label>
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="SELECT * FROM table_name WHERE condition..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={executeQuery}
              disabled={status.isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Execute Query</span>
            </button>
            <button
              onClick={() => setSqlQuery('')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>
          {queryResult.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Query Results</h4>
              {renderTableData(queryResult)}
            </div>
          )}
        </div>
      )}

      {/* Transform Tab */}
      {activeTab === 'transform' && (
        <div className="space-y-6">
          {!selectedTable ? (
            <div className="text-center py-8">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Please select a table from the Tables tab to perform transformations</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>Selected Table:</strong> {selectedTable}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Filter Operation */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter Data
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="WHERE condition (e.g., age > 25)"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      id="filter-condition"
                    />
                    <button
                      onClick={() => {
                        const condition = (document.getElementById('filter-condition') as HTMLInputElement).value;
                        if (condition) {
                          performTransformation('filter', { condition });
                        }
                      }}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>

                {/* Sort Operation */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <SortAsc className="w-4 h-4 mr-2" />
                    Sort Data
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="ORDER BY column (e.g., name ASC)"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      id="sort-column"
                    />
                    <button
                      onClick={() => {
                        const orderBy = (document.getElementById('sort-column') as HTMLInputElement).value;
                        if (orderBy) {
                          performTransformation('sort', { order_by: orderBy });
                        }
                      }}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Apply Sort
                    </button>
                  </div>
                </div>

                {/* Group By Operation */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Group className="w-4 h-4 mr-2" />
                    Group By
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Group by columns (e.g., department, role)"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      id="group-columns"
                    />
                    <button
                      onClick={() => {
                        const columns = (document.getElementById('group-columns') as HTMLInputElement).value;
                        if (columns) {
                          const columnArray = columns.split(',').map(c => c.trim());
                          performTransformation('group_by', { group_columns: columnArray });
                        }
                      }}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Apply Group By
                    </button>
                  </div>
                </div>

                {/* Aggregate Operation */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Aggregation
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Aggregations (e.g., COUNT(*), AVG(salary))"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      id="aggregations"
                    />
                    <input
                      type="text"
                      placeholder="Group by column (optional)"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      id="group-by-agg"
                    />
                    <button
                      onClick={() => {
                        const aggregations = (document.getElementById('aggregations') as HTMLInputElement).value;
                        const groupBy = (document.getElementById('group-by-agg') as HTMLInputElement).value;
                        if (aggregations) {
                          const aggArray = aggregations.split(',').map(a => a.trim());
                          performTransformation('aggregate', { 
                            aggregations: aggArray,
                            group_by: groupBy || undefined
                          });
                        }
                      }}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Apply Aggregation
                    </button>
                  </div>
                </div>
              </div>

              {queryResult.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Transformation Results</h4>
                  {renderTableData(queryResult)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <strong>Note:</strong> CSV import functionality requires the backend to have access to the file system. 
              In a production environment, this would typically be handled through file upload endpoints.
            </p>
          </div>
          
          <div className="text-center py-8">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">File upload functionality will be implemented in the next phase</p>
          </div>
        </div>
      )}
    </div>
  );
};
