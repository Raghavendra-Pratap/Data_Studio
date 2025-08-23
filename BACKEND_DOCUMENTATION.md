# Unified Data Studio v2 - Backend Documentation

## 🦀 Rust Backend Service

### Overview
The Unified Data Studio backend is built with Rust and Actix-web, providing high-performance data processing, workflow execution, and API services. The backend is designed for reliability, performance, and extensibility.

## 🏗️ Architecture

### Service Structure
```
Rust Backend Service
├── HTTP Server (Actix-web)
│   ├── Health Check Endpoints
│   ├── API Endpoints
│   ├── WebSocket Support
│   └── Middleware Stack
├── Core Services
│   ├── Workflow Engine
│   ├── Data Processor
│   ├── Formula Evaluator
│   └── File Handler
├── Data Models
│   ├── Project Models
│   ├── Workflow Models
│   ├── Data Models
│   └── Response Models
└── Utilities
    ├── Error Handling
    ├── Logging
    ├── Configuration
    └── Validation
```

### Technology Stack
- **Language**: Rust 1.70+
- **Web Framework**: Actix-web 4.0
- **Async Runtime**: Tokio 1.0
- **Serialization**: Serde + JSON
- **Database**: SQLite (planned), File-based storage (current)
- **Logging**: env_logger + log
- **Configuration**: config + dotenv

## 📡 API Endpoints

### Health & Status
```
GET /health
Response: { "status": "ok", "timestamp": "2024-01-01T00:00:00Z" }

GET /health/detailed
Response: {
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.8",
  "uptime": "3600s",
  "memory_usage": "128MB",
  "active_connections": 5
}
```

### Project Management
```
GET /api/projects
Response: {
  "projects": [
    {
      "id": "uuid",
      "name": "Project Name",
      "description": "Project Description",
      "created": "2024-01-01T00:00:00Z",
      "modified": "2024-01-01T00:00:00Z",
      "status": "idle"
    }
  ]
}

POST /api/projects
Request: {
  "name": "New Project",
  "description": "Project Description"
}
Response: {
  "id": "uuid",
  "name": "New Project",
  "description": "Project Description",
  "created": "2024-01-01T00:00:00Z",
  "status": "idle"
}

PUT /api/projects/{id}
Request: {
  "name": "Updated Name",
  "description": "Updated Description"
}
Response: Updated project object

DELETE /api/projects/{id}
Response: { "success": true, "message": "Project deleted" }
```

### Workflow Management
```
GET /api/workflows
Response: {
  "workflows": [
    {
      "id": "uuid",
      "name": "Workflow Name",
      "description": "Workflow Description",
      "project": "project_id",
      "steps": [],
      "created": "2024-01-01T00:00:00Z",
      "modified": "2024-01-01T00:00:00Z"
    }
  ]
}

POST /api/workflows
Request: {
  "name": "New Workflow",
  "description": "Workflow Description",
  "project": "project_id",
  "steps": []
}
Response: Created workflow object

POST /api/workflows/{id}/execute
Request: {
  "input_data": {},
  "parameters": {}
}
Response: {
  "execution_id": "uuid",
  "status": "running",
  "progress": 0.0,
  "estimated_completion": "2024-01-01T00:05:00Z"
}

GET /api/workflows/{id}/status/{execution_id}
Response: {
  "execution_id": "uuid",
  "status": "completed",
  "progress": 100.0,
  "result": {},
  "execution_time": "5.2s"
}
```

### Data Processing
```
POST /api/data/process
Request: {
  "operation": "filter",
  "data": [],
  "parameters": {
    "column": "name",
    "value": "test"
  }
}
Response: {
  "result": [],
  "processing_time": "0.1s",
  "rows_processed": 1000
}

POST /api/data/formula
Request: {
  "formula": "SUM(A1:A10) * 2",
  "data": [],
  "variables": {}
}
Response: {
  "result": 150.0,
  "execution_time": "0.05s",
  "formula_valid": true
}

POST /api/data/import
Request: FormData with file
Response: {
  "file_id": "uuid",
  "filename": "data.csv",
  "rows": 1000,
  "columns": ["A", "B", "C"],
  "file_size": "50KB",
  "import_time": "0.5s"
}
```

## 🧮 Core Services

### Workflow Engine
**Purpose**: Execute data processing workflows with step-by-step validation

**Features**:
- **Step Execution**: Sequential and parallel step processing
- **Error Handling**: Graceful failure with rollback
- **Progress Tracking**: Real-time execution status
- **Result Caching**: Intermediate result storage
- **Validation**: Step input/output validation

**Workflow Types**:
```rust
enum WorkflowStepType {
    DataImport { source: String, format: FileFormat },
    DataTransform { formula: String, columns: Vec<String> },
    DataFilter { conditions: Vec<FilterCondition> },
    DataAggregate { operation: AggregationOp, group_by: Vec<String> },
    DataExport { destination: String, format: ExportFormat },
    DataAnalysis { analysis_type: AnalysisType, parameters: Value },
}
```

**Execution Flow**:
```
Input Data → Step 1 → Step 2 → Step 3 → Output Data
     ↓         ↓        ↓        ↓         ↓
Validation → Execute → Validate → Execute → Validate
```

### Data Processor
**Purpose**: Handle data transformation, filtering, and analysis operations

**Operations**:
- **Filtering**: Row-based and column-based filtering
- **Transformation**: Mathematical operations and formulas
- **Aggregation**: Group by, sum, average, count operations
- **Sorting**: Multi-column sorting with custom comparators
- **Deduplication**: Remove duplicate rows based on criteria

**Performance Features**:
- **Streaming**: Process large files without loading into memory
- **Parallelization**: Multi-threaded processing for CPU-intensive operations
- **Caching**: Result caching for repeated operations
- **Optimization**: Query optimization for complex operations

### Formula Evaluator
**Purpose**: Parse and execute mathematical expressions and formulas

**Supported Operations**:
- **Mathematical**: +, -, *, /, %, ^, sqrt, log, exp
- **Statistical**: SUM, AVG, COUNT, MIN, MAX, STDDEV
- **Logical**: AND, OR, NOT, IF, SWITCH
- **String**: CONCAT, SUBSTRING, REPLACE, UPPER, LOWER
- **Date**: DATE, NOW, DATEDIFF, DATEADD

**Formula Examples**:
```rust
// Basic arithmetic
"SUM(A1:A10) * 2 + 100"

// Conditional logic
"IF(A1 > 100, 'High', 'Low')"

// Statistical functions
"AVG(B1:B20) + STDDEV(C1:C20)"

// String operations
"CONCAT(UPPER(A1), ' - ', LOWER(B1))"

// Date calculations
"DATEDIFF(NOW(), A1, 'days')"
```

**Evaluation Engine**:
- **Parser**: Recursive descent parser for expressions
- **AST**: Abstract syntax tree representation
- **Optimizer**: Expression optimization and simplification
- **Executor**: Tree-walking interpreter
- **Error Handling**: Detailed error messages with context

### File Handler
**Purpose**: Manage file uploads, downloads, and format conversions

**Supported Formats**:
- **Input**: CSV, TSV, Excel (.xlsx, .xls), JSON, XML
- **Output**: CSV, TSV, Excel, JSON, XML, PDF
- **Compression**: GZIP, ZIP, TAR support

**File Operations**:
```rust
enum FileOperation {
    Upload { file: UploadedFile, validation: ValidationRules },
    Download { file_id: String, format: ExportFormat },
    Convert { source: String, target_format: ExportFormat },
    Validate { file_id: String, rules: ValidationRules },
    Delete { file_id: String },
}
```

**Validation Features**:
- **Schema Validation**: Column type and format checking
- **Data Quality**: Missing values, outliers, duplicates detection
- **Size Limits**: File size and row count restrictions
- **Security**: File type and content validation

## 📊 Data Models

### Project Model
```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct Project {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub workflows: Vec<Workflow>,
    pub input_files: Vec<FileData>,
    pub output_files: Vec<FileData>,
    pub created: DateTime<Utc>,
    pub modified: DateTime<Utc>,
    pub status: ProjectStatus,
    pub metadata: HashMap<String, Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ProjectStatus {
    Idle,
    Processing,
    Completed,
    Error { message: String },
}
```

### Workflow Model
```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct Workflow {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub project: Uuid,
    pub steps: Vec<WorkflowStep>,
    pub created: DateTime<Utc>,
    pub modified: DateTime<Utc>,
    pub version: String,
    pub parameters: HashMap<String, Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WorkflowStep {
    pub id: Uuid,
    pub name: String,
    pub step_type: WorkflowStepType,
    pub parameters: HashMap<String, Value>,
    pub order: u32,
    pub dependencies: Vec<Uuid>,
    pub validation_rules: Option<ValidationRules>,
}
```

### Data Models
```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct DataTable {
    pub columns: Vec<Column>,
    pub rows: Vec<DataRow>,
    pub metadata: TableMetadata,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Column {
    pub name: String,
    pub data_type: DataType,
    pub nullable: bool,
    pub default_value: Option<Value>,
    pub validation_rules: Option<ValidationRules>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum DataType {
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Json,
    Custom(String),
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Server Configuration
RUST_LOG=info
SERVER_HOST=127.0.0.1
SERVER_PORT=5002
WORKER_THREADS=4

# Database Configuration
DATABASE_URL=sqlite:///data/uds.db
DATABASE_POOL_SIZE=10

# Security Configuration
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:8080

# Performance Configuration
MAX_FILE_SIZE=100MB
MAX_CONCURRENT_WORKFLOWS=10
CACHE_TTL=3600
```

### Configuration File (config.toml)
```toml
[server]
host = "127.0.0.1"
port = 5002
workers = 4
max_connections = 1000

[database]
url = "sqlite:///data/uds.db"
pool_size = 10
migration_dir = "migrations"

[security]
jwt_secret = "your-secret-key"
cors_origins = ["http://localhost:3000"]
rate_limit = 1000

[performance]
max_file_size = "100MB"
max_concurrent_workflows = 10
cache_ttl = 3600
```

## 🚀 Performance Optimization

### Caching Strategy
- **Result Cache**: Cache workflow execution results
- **Formula Cache**: Cache parsed and optimized formulas
- **File Cache**: Cache frequently accessed file metadata
- **Connection Pool**: Database connection pooling

### Memory Management
- **Streaming**: Process large files without loading into memory
- **Garbage Collection**: Efficient memory cleanup
- **Memory Limits**: Configurable memory usage limits
- **Resource Monitoring**: Real-time memory and CPU monitoring

### Concurrency
- **Async/Await**: Non-blocking I/O operations
- **Worker Threads**: Configurable thread pool
- **Task Scheduling**: Intelligent task queuing
- **Load Balancing**: Distribute work across workers

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: User role and permission management
- **API Keys**: Optional API key authentication
- **Session Management**: Secure session handling

### Data Protection
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Parameterized queries
- **File Upload Security**: File type and content validation
- **Rate Limiting**: API request throttling

### Network Security
- **HTTPS**: TLS encryption for all communications
- **CORS**: Configurable cross-origin restrictions
- **Headers**: Security headers (HSTS, CSP, etc.)
- **IP Filtering**: Optional IP address restrictions

## 📝 Logging & Monitoring

### Logging Configuration
```rust
use log::{info, warn, error, debug};

// Structured logging
info!(
    "Workflow execution started",
    workflow_id = %workflow.id,
    project_id = %workflow.project,
    steps = workflow.steps.len()
);

// Error logging with context
error!(
    "Formula evaluation failed",
    formula = %formula,
    error = %err,
    context = "data_processing"
);
```

### Metrics Collection
- **Request Count**: API endpoint usage statistics
- **Response Times**: Performance monitoring
- **Error Rates**: Error tracking and alerting
- **Resource Usage**: Memory, CPU, and disk monitoring

### Health Checks
- **Liveness**: Service availability check
- **Readiness**: Service readiness for requests
- **Dependencies**: Database and external service health
- **Custom Metrics**: Application-specific health indicators

## 🧪 Testing Strategy

### Unit Tests
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_formula_evaluation() {
        let formula = "2 + 2 * 3";
        let result = evaluate_formula(formula, &HashMap::new());
        assert_eq!(result, Ok(Value::Number(8.0)));
    }

    #[test]
    fn test_workflow_execution() {
        let workflow = create_test_workflow();
        let result = execute_workflow(workflow, &test_data).await;
        assert!(result.is_ok());
    }
}
```

### Integration Tests
- **API Endpoint Testing**: Full request/response cycle testing
- **Database Integration**: Data persistence and retrieval testing
- **Workflow Execution**: End-to-end workflow testing
- **Performance Testing**: Load and stress testing

### Test Data Management
- **Fixtures**: Predefined test data sets
- **Factories**: Test data generation utilities
- **Cleanup**: Automatic test data cleanup
- **Isolation**: Test isolation and parallel execution

## 🚀 Deployment

### Build Process
```bash
# Development build
cargo build

# Release build
cargo build --release

# Cross-compilation
cargo build --target x86_64-unknown-linux-gnu
cargo build --target x86_64-pc-windows-gnu
cargo build --target x86_64-apple-darwin
```

### Docker Support
```dockerfile
FROM rust:1.70 as builder
WORKDIR /usr/src/app
COPY . .
RUN cargo build --release

FROM debian:bullseye-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/src/app/target/release/uds-backend /usr/local/bin/uds-backend
EXPOSE 5002
CMD ["uds-backend"]
```

### Systemd Service
```ini
[Unit]
Description=Unified Data Studio Backend
After=network.target

[Service]
Type=simple
User=uds
WorkingDirectory=/opt/uds
ExecStart=/usr/local/bin/uds-backend
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## 🔮 Future Enhancements

### Planned Features
- **GraphQL API**: Modern API query language
- **Real-time Streaming**: WebSocket-based data streaming
- **Plugin System**: Extensible architecture for custom processors
- **Machine Learning**: TensorFlow integration for ML workflows
- **Cloud Integration**: AWS, Azure, and GCP connectors

### Performance Improvements
- **WASM Support**: WebAssembly for client-side processing
- **GPU Acceleration**: CUDA/OpenCL support for heavy computations
- **Distributed Processing**: Multi-node workflow execution
- **Caching Layer**: Redis-based distributed caching

### Security Enhancements
- **OAuth 2.0**: Industry-standard authentication
- **Audit Logging**: Comprehensive activity tracking
- **Encryption**: End-to-end data encryption
- **Compliance**: GDPR, HIPAA, and SOC2 compliance

---

*This backend documentation is maintained by the Unified Data Studio development team and should be updated with each major release.*
