# Unified Data Studio v2 - API Reference

## 🌐 API Overview

### Base URL
- **Development**: `http://localhost:5002`
- **Staging**: `https://staging-api.uds.com`
- **Production**: `https://api.uds.com`

### Authentication
Currently, the API uses simple API key authentication. Future versions will implement JWT-based authentication.

```bash
# API Key Header
Authorization: Bearer YOUR_API_KEY

# Or as query parameter
?api_key=YOUR_API_KEY
```

### Response Format
All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

### Error Responses
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "name",
      "issue": "Name is required"
    }
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

## 📡 Health & Status Endpoints

### GET /health
**Purpose**: Basic health check endpoint

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00Z"
  },
  "message": "Service is healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

**Status Codes**:
- `200 OK`: Service is healthy
- `503 Service Unavailable`: Service is unhealthy

---

### GET /health/detailed
**Purpose**: Detailed health check with system information

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.8",
    "uptime": "3600s",
    "memory_usage": "128MB",
    "active_connections": 5,
    "database": {
      "status": "connected",
      "response_time": "2ms"
    },
    "system": {
      "cpu_usage": "15%",
      "disk_usage": "45%",
      "load_average": [1.2, 1.1, 0.9]
    }
  },
  "message": "Detailed health check completed",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

## 📁 Project Management Endpoints

### GET /api/projects
**Purpose**: Retrieve all projects

**Query Parameters**:
- `limit` (optional): Number of projects to return (default: 50, max: 100)
- `offset` (optional): Number of projects to skip (default: 0)
- `status` (optional): Filter by project status
- `search` (optional): Search projects by name or description
- `sort_by` (optional): Sort field (name, created, modified)
- `sort_order` (optional): Sort direction (asc, desc)

**Response**:
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Sales Analysis 2024",
        "description": "Analysis of Q1 2024 sales data",
        "status": "completed",
        "created": "2024-01-01T00:00:00Z",
        "modified": "2024-01-15T12:00:00Z",
        "workflow_count": 3,
        "file_count": 5,
        "data_volume": "2.5MB"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 50,
      "offset": 0,
      "has_more": false
    }
  },
  "message": "Projects retrieved successfully",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

### GET /api/projects/{id}
**Purpose**: Retrieve a specific project by ID

**Path Parameters**:
- `id`: Project UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Sales Analysis 2024",
    "description": "Analysis of Q1 2024 sales data",
    "status": "completed",
    "created": "2024-01-01T00:00:00Z",
    "modified": "2024-01-15T12:00:00Z",
    "workflows": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Data Import",
        "status": "completed",
        "created": "2024-01-01T00:00:00Z"
      }
    ],
    "files": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "name": "sales_data.csv",
        "size": "1.2MB",
        "type": "csv",
        "uploaded": "2024-01-01T00:00:00Z"
      }
    ],
    "metadata": {
      "department": "Sales",
      "quarter": "Q1",
      "year": "2024"
    }
  },
  "message": "Project retrieved successfully",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

### POST /api/projects
**Purpose**: Create a new project

**Request Body**:
```json
{
  "name": "New Project",
  "description": "Project description",
  "metadata": {
    "department": "Marketing",
    "priority": "high"
  }
}
```

**Validation Rules**:
- `name`: Required, string, 1-100 characters
- `description`: Optional, string, max 500 characters
- `metadata`: Optional, object, max 10 key-value pairs

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "New Project",
    "description": "Project description",
    "status": "idle",
    "created": "2024-01-01T00:00:00Z",
    "modified": "2024-01-01T00:00:00Z",
    "workflows": [],
    "files": [],
    "metadata": {
      "department": "Marketing",
      "priority": "high"
    }
  },
  "message": "Project created successfully",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

### PUT /api/projects/{id}
**Purpose**: Update an existing project

**Path Parameters**:
- `id`: Project UUID

**Request Body**:
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "metadata": {
    "department": "Marketing",
    "priority": "medium"
  }
}
```

**Response**: Updated project object

---

### DELETE /api/projects/{id}
**Purpose**: Delete a project

**Path Parameters**:
- `id`: Project UUID

**Response**:
```json
{
  "success": true,
  "data": null,
  "message": "Project deleted successfully",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

## 🔄 Workflow Management Endpoints

### GET /api/workflows
**Purpose**: Retrieve all workflows

**Query Parameters**:
- `project_id` (optional): Filter by project
- `status` (optional): Filter by workflow status
- `limit` (optional): Number of workflows to return
- `offset` (optional): Number of workflows to skip

**Response**:
```json
{
  "success": true,
  "data": {
    "workflows": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Data Import",
        "description": "Import and validate data",
        "project": "550e8400-e29b-41d4-a716-446655440000",
        "status": "completed",
        "step_count": 5,
        "created": "2024-01-01T00:00:00Z",
        "modified": "2024-01-01T00:00:00Z",
        "last_executed": "2024-01-15T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 50,
      "offset": 0,
      "has_more": false
    }
  },
  "message": "Workflows retrieved successfully",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

### GET /api/workflows/{id}
**Purpose**: Retrieve a specific workflow by ID

**Path Parameters**:
- `id`: Workflow UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Data Import",
    "description": "Import and validate data",
    "project": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "version": "1.0.0",
    "created": "2024-01-01T00:00:00Z",
    "modified": "2024-01-01T00:00:00Z",
    "steps": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440004",
        "name": "File Upload",
        "type": "data_import",
        "order": 1,
        "parameters": {
          "file_type": "csv",
          "delimiter": ",",
          "has_header": true
        },
        "status": "completed"
      }
    ],
    "parameters": {
      "timeout": 300,
      "retry_count": 3
    },
    "execution_history": [
      {
        "execution_id": "aa0e8400-e29b-41d4-a716-446655440005",
        "status": "completed",
        "started": "2024-01-15T12:00:00Z",
        "completed": "2024-01-15T12:05:00Z",
        "duration": "5m 0s"
      }
    ]
  },
  "message": "Workflow retrieved successfully",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

### POST /api/workflows
**Purpose**: Create a new workflow

**Request Body**:
```json
{
  "name": "Data Processing",
  "description": "Process and transform data",
  "project": "550e8400-e29b-41d4-a716-446655440000",
  "steps": [
    {
      "name": "Data Import",
      "type": "data_import",
      "order": 1,
      "parameters": {
        "file_type": "csv",
        "delimiter": ",",
        "has_header": true
      }
    },
    {
      "name": "Data Transform",
      "type": "data_transform",
      "order": 2,
      "parameters": {
        "formula": "A1 * 1.1",
        "columns": ["price"]
      }
    }
  ],
  "parameters": {
    "timeout": 300,
    "retry_count": 3
  }
}
```

**Response**: Created workflow object

---

### POST /api/workflows/{id}/execute
**Purpose**: Execute a workflow

**Path Parameters**:
- `id`: Workflow UUID

**Request Body**:
```json
{
  "input_data": {
    "files": ["file_id_1", "file_id_2"],
    "parameters": {
      "custom_param": "value"
    }
  },
  "execution_options": {
    "timeout": 600,
    "parallel": true,
    "notify_on_completion": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "execution_id": "bb0e8400-e29b-41d4-a716-446655440006",
    "workflow_id": "660e8400-e29b-41d4-a716-446655440001",
    "status": "running",
    "progress": 0.0,
    "current_step": "Data Import",
    "started": "2024-01-01T00:00:00Z",
    "estimated_completion": "2024-01-01T00:10:00Z",
    "message": "Workflow execution started"
  },
  "message": "Workflow execution initiated",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

### GET /api/workflows/{id}/status/{execution_id}
**Purpose**: Get workflow execution status

**Path Parameters**:
- `id`: Workflow UUID
- `execution_id`: Execution UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "execution_id": "bb0e8400-e29b-41d4-a716-446655440006",
    "workflow_id": "660e8400-e29b-41d4-a716-446655440001",
    "status": "completed",
    "progress": 100.0,
    "current_step": null,
    "started": "2024-01-01T00:00:00Z",
    "completed": "2024-01-01T00:08:00Z",
    "duration": "8m 0s",
    "result": {
      "output_files": ["output_file_id"],
      "processed_rows": 10000,
      "errors": []
    },
    "step_results": [
      {
        "step_name": "Data Import",
        "status": "completed",
        "duration": "2m 30s",
        "rows_processed": 10000
      }
    ]
  },
  "message": "Execution status retrieved",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

## 📊 Data Processing Endpoints

### POST /api/data/process
**Purpose**: Process data with various operations

**Request Body**:
```json
{
  "operation": "filter",
  "data": [
    {"id": 1, "name": "John", "age": 30},
    {"id": 2, "name": "Jane", "age": 25}
  ],
  "parameters": {
    "column": "age",
    "operator": ">",
    "value": 25
  }
}
```

**Supported Operations**:
- `filter`: Filter rows based on conditions
- `sort`: Sort data by columns
- `aggregate`: Group and aggregate data
- `transform`: Apply formulas to data
- `deduplicate`: Remove duplicate rows
- `sample`: Take random sample of data

**Response**:
```json
{
  "success": true,
  "data": {
    "result": [
      {"id": 1, "name": "John", "age": 30}
    ],
    "processing_time": "0.1s",
    "rows_processed": 2,
    "rows_returned": 1,
    "operation": "filter",
    "parameters": {
      "column": "age",
      "operator": ">",
      "value": 25
    }
  },
  "message": "Data processing completed",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

### POST /api/data/formula
**Purpose**: Evaluate mathematical formulas

**Request Body**:
```json
{
  "formula": "SUM(A1:A10) * 2 + 100",
  "data": [
    {"A1": 10, "A2": 20, "A3": 30},
    {"A1": 15, "A2": 25, "A3": 35}
  ],
  "variables": {
    "multiplier": 2,
    "offset": 100
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "result": 270,
    "execution_time": "0.05s",
    "formula_valid": true,
    "formula": "SUM(A1:A10) * 2 + 100",
    "variables_used": ["multiplier", "offset"],
    "calculation_steps": [
      "SUM(A1:A10) = 135",
      "135 * 2 = 270",
      "270 + 100 = 370"
    ]
  },
  "message": "Formula evaluation completed",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

### POST /api/data/import
**Purpose**: Import data files

**Request**: Multipart form data

**Form Fields**:
- `file`: File to upload
- `project_id`: Target project ID
- `file_type`: File type (auto-detected if not specified)
- `options`: JSON string with import options

**Import Options**:
```json
{
  "delimiter": ",",
  "has_header": true,
  "encoding": "utf-8",
  "skip_rows": 0,
  "max_rows": 10000,
  "column_mapping": {
    "A": "name",
    "B": "age",
    "C": "email"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "file_id": "cc0e8400-e29b-41d4-a716-446655440007",
    "filename": "data.csv",
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "file_type": "csv",
    "size": "50KB",
    "rows": 1000,
    "columns": [
      {
        "name": "name",
        "type": "string",
        "sample_values": ["John", "Jane", "Bob"]
      },
      {
        "name": "age",
        "type": "number",
        "sample_values": [30, 25, 35]
      }
    ],
    "import_time": "0.5s",
    "validation": {
      "errors": [],
      "warnings": ["Column 'age' contains some non-numeric values"]
    }
  },
  "message": "File imported successfully",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

### GET /api/data/files/{file_id}
**Purpose**: Retrieve file information and preview

**Path Parameters**:
- `file_id`: File UUID

**Query Parameters**:
- `preview` (optional): Include data preview (default: false)
- `rows` (optional): Number of preview rows (default: 10, max: 100)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440007",
    "filename": "data.csv",
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "file_type": "csv",
    "size": "50KB",
    "rows": 1000,
    "columns": [
      {
        "name": "name",
        "type": "string",
        "nullable": false,
        "unique_values": 950
      },
      {
        "name": "age",
        "type": "number",
        "nullable": true,
        "unique_values": 45,
        "min": 18,
        "max": 65,
        "average": 32.5
      }
    ],
    "uploaded": "2024-01-01T00:00:00Z",
    "last_accessed": "2024-01-15T12:00:00Z",
    "preview": [
      {"name": "John", "age": 30},
      {"name": "Jane", "age": 25},
      {"name": "Bob", "age": 35}
    ]
  },
  "message": "File information retrieved",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

## 📈 Analytics Endpoints

### POST /api/analytics/summary
**Purpose**: Generate data summary statistics

**Request Body**:
```json
{
  "file_id": "cc0e8400-e29b-41d4-a716-446655440007",
  "columns": ["age", "salary"],
  "group_by": ["department"],
  "metrics": ["count", "average", "sum", "min", "max"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_rows": 1000,
      "columns": {
        "age": {
          "type": "number",
          "count": 1000,
          "null_count": 0,
          "min": 18,
          "max": 65,
          "average": 32.5,
          "median": 31,
          "std_dev": 8.2,
          "quartiles": [25, 31, 40]
        },
        "salary": {
          "type": "number",
          "count": 1000,
          "null_count": 0,
          "min": 30000,
          "max": 150000,
          "average": 75000,
          "median": 72000,
          "std_dev": 25000,
          "quartiles": [55000, 72000, 90000]
        }
      },
      "grouped_summary": {
        "Engineering": {
          "count": 400,
          "age": {"average": 29, "salary": {"average": 85000}},
          "salary": {"average": 85000}
        },
        "Sales": {
          "count": 300,
          "age": {"average": 35, "salary": {"average": 65000}},
          "salary": {"average": 65000}
        }
      }
    },
    "processing_time": "0.8s"
  },
  "message": "Summary statistics generated",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

### POST /api/analytics/correlation
**Purpose**: Calculate correlation between numeric columns

**Request Body**:
```json
{
  "file_id": "cc0e8400-e29b-41d4-a716-446655440007",
  "columns": ["age", "salary", "experience"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "correlation_matrix": {
      "age": {
        "age": 1.0,
        "salary": 0.65,
        "experience": 0.78
      },
      "salary": {
        "age": 0.65,
        "salary": 1.0,
        "experience": 0.82
      },
      "experience": {
        "age": 0.78,
        "salary": 0.82,
        "experience": 1.0
      }
    },
    "insights": [
      "Strong positive correlation between experience and salary (0.82)",
      "Moderate correlation between age and salary (0.65)",
      "Age and experience show strong correlation (0.78)"
    ],
    "processing_time": "1.2s"
  },
  "message": "Correlation analysis completed",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

## 🔐 Authentication Endpoints

### POST /api/auth/login
**Purpose**: Authenticate user and get access token

**Request Body**:
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "dd0e8400-e29b-41d4-a716-446655440008",
      "username": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "permissions": ["read", "write"]
    }
  },
  "message": "Authentication successful",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

### POST /api/auth/refresh
**Purpose**: Refresh access token using refresh token

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**: New access token

---

### POST /api/auth/logout
**Purpose**: Logout user and invalidate tokens

**Request Body**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8"
}
```

---

## 📊 Data Models

### Project Model
```typescript
interface Project {
  id: string;                    // UUID
  name: string;                  // Project name
  description?: string;          // Optional description
  status: ProjectStatus;         // Current status
  created: string;               // ISO 8601 timestamp
  modified: string;              // ISO 8601 timestamp
  workflows: Workflow[];         // Associated workflows
  files: FileData[];             // Associated files
  metadata: Record<string, any>; // Custom metadata
}

enum ProjectStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}
```

### Workflow Model
```typescript
interface Workflow {
  id: string;                    // UUID
  name: string;                  // Workflow name
  description?: string;          // Optional description
  project: string;               // Project ID
  status: WorkflowStatus;        // Current status
  version: string;               // Version string
  created: string;               // ISO 8601 timestamp
  modified: string;              // ISO 8601 timestamp
  steps: WorkflowStep[];         // Workflow steps
  parameters: Record<string, any>; // Execution parameters
}

enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

interface WorkflowStep {
  id: string;                    // UUID
  name: string;                  // Step name
  type: WorkflowStepType;        // Step type
  order: number;                 // Execution order
  parameters: Record<string, any>; // Step parameters
  dependencies: string[];        // Step dependencies
  validation_rules?: ValidationRules; // Validation rules
}

enum WorkflowStepType {
  DATA_IMPORT = 'data_import',
  DATA_TRANSFORM = 'data_transform',
  DATA_FILTER = 'data_filter',
  DATA_AGGREGATE = 'data_aggregate',
  DATA_EXPORT = 'data_export',
  DATA_ANALYSIS = 'data_analysis'
}
```

### File Data Model
```typescript
interface FileData {
  id: string;                    // UUID
  filename: string;              // Original filename
  project: string;               // Project ID
  type: FileType;                // File type
  size: number;                  // File size in bytes
  rows: number;                  // Number of data rows
  columns: Column[];             // Column definitions
  uploaded: string;              // Upload timestamp
  last_accessed: string;         // Last access timestamp
  metadata: FileMetadata;        // File metadata
}

enum FileType {
  CSV = 'csv',
  TSV = 'tsv',
  EXCEL = 'excel',
  JSON = 'json',
  XML = 'xml',
  PARQUET = 'parquet'
}

interface Column {
  name: string;                  // Column name
  type: DataType;                // Data type
  nullable: boolean;             // Nullable flag
  unique_values: number;         // Number of unique values
  min?: number;                  // Minimum value (numeric)
  max?: number;                  // Maximum value (numeric)
  average?: number;              // Average value (numeric)
  sample_values: any[];          // Sample values
}

enum DataType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  JSON = 'json'
}
```

### Execution Model
```typescript
interface Execution {
  id: string;                    // UUID
  workflow_id: string;           // Workflow ID
  status: ExecutionStatus;       // Execution status
  progress: number;              // Progress percentage (0-100)
  current_step?: string;         // Current step name
  started: string;               // Start timestamp
  completed?: string;            // Completion timestamp
  duration?: string;             // Duration string
  result?: ExecutionResult;      // Execution result
  step_results: StepResult[];    // Individual step results
  error?: ExecutionError;        // Error details
}

enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

interface ExecutionResult {
  output_files: string[];        // Output file IDs
  processed_rows: number;        // Total rows processed
  errors: string[];              // Error messages
  warnings: string[];            // Warning messages
  metadata: Record<string, any>; // Result metadata
}

interface StepResult {
  step_name: string;             // Step name
  status: StepStatus;            // Step status
  duration: string;              // Duration string
  rows_processed: number;        // Rows processed
  output_size: number;           // Output size in bytes
  error?: string;                // Error message
}

enum StepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}
```

## 🚨 Error Codes

### HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service unavailable

### Error Codes
```typescript
enum ErrorCode {
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  VALUE_TOO_LONG = 'VALUE_TOO_LONG',
  VALUE_TOO_SHORT = 'VALUE_TOO_SHORT',
  
  // Authentication Errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Resource Errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_IN_USE = 'RESOURCE_IN_USE',
  
  // Processing Errors
  WORKFLOW_EXECUTION_FAILED = 'WORKFLOW_EXECUTION_FAILED',
  FORMULA_EVALUATION_ERROR = 'FORMULA_EVALUATION_ERROR',
  FILE_PROCESSING_ERROR = 'FILE_PROCESSING_ERROR',
  
  // System Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}
```

## 📚 Rate Limiting

### Rate Limits
- **Authentication endpoints**: 5 requests per minute
- **Data processing endpoints**: 100 requests per hour
- **File upload endpoints**: 10 requests per hour
- **Other endpoints**: 1000 requests per hour

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🔄 WebSocket Events

### Connection
```javascript
const ws = new WebSocket('ws://localhost:5002/ws');

ws.onopen = () => {
  console.log('WebSocket connected');
  
  // Subscribe to workflow updates
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'workflow_updates',
    workflow_id: 'workflow-uuid'
  }));
};
```

### Event Types
```typescript
interface WebSocketMessage {
  type: 'workflow_update' | 'execution_progress' | 'error' | 'notification';
  data: any;
  timestamp: string;
}

interface WorkflowUpdate {
  workflow_id: string;
  status: WorkflowStatus;
  progress: number;
  current_step: string;
  message: string;
}

interface ExecutionProgress {
  execution_id: string;
  workflow_id: string;
  progress: number;
  current_step: string;
  estimated_completion: string;
}
```

---

*This API reference is maintained by the Unified Data Studio development team and should be updated with each major release.*
