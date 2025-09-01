// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

// App Configuration
export const APP_NAME = 'Unified Data Studio v2';
export const APP_VERSION = '2.0.2-beta.2';

// Feature Flags
export const FEATURES = {
  ENHANCED_SQLITE: true,
  WORKFLOW_ENGINE: true,
  ADVANCED_FORMULAS: true,
  REAL_TIME_PREVIEW: true,
  BATCH_PROCESSING: true,
};

// Data Processing Limits
export const LIMITS = {
  MAX_TABLE_ROWS_PREVIEW: 100,
  MAX_QUERY_RESULTS: 1000,
  MAX_FILE_SIZE_MB: 100,
  MAX_CONCURRENT_OPERATIONS: 5,
};

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  REFRESH_INTERVAL: 30000,
  MAX_VISIBLE_COLUMNS: 10,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PERMISSION_ERROR: 'You do not have permission to perform this action.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  DATA_IMPORTED: 'Data imported successfully!',
  QUERY_EXECUTED: 'Query executed successfully!',
  TRANSFORMATION_COMPLETED: 'Transformation completed successfully!',
  DATA_EXPORTED: 'Data exported successfully!',
  TABLE_CREATED: 'Table created successfully!',
  TABLE_DELETED: 'Table deleted successfully!',
};

// Data Types
export const DATA_TYPES = {
  TEXT: 'TEXT',
  INTEGER: 'INTEGER',
  REAL: 'REAL',
  BLOB: 'BLOB',
  NULL: 'NULL',
};

// Operation Types
export const OPERATION_TYPES = {
  FILTER: 'filter',
  SORT: 'sort',
  GROUP_BY: 'group_by',
  AGGREGATE: 'aggregate',
  JOIN: 'join',
  PIVOT: 'pivot',
  CUSTOM_INSERT: 'custom_insert',
  CUSTOM_UPDATE: 'custom_update',
  CUSTOM_DELETE: 'custom_delete',
};

// File Extensions
export const SUPPORTED_FILE_EXTENSIONS = {
  CSV: '.csv',
  JSON: '.json',
  PARQUET: '.parquet',
  EXCEL: ['.xlsx', '.xls'],
};

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  SLOW_QUERY_MS: 5000,
  MEMORY_WARNING_MB: 512,
  CPU_WARNING_PERCENT: 80,
};

// Development Configuration
export const DEV_CONFIG = {
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  ENABLE_DEBUG_PANEL: process.env.NODE_ENV === 'development',
  MOCK_DATA_ENABLED: process.env.REACT_APP_MOCK_DATA === 'true',
};
