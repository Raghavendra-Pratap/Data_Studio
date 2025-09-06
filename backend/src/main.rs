use actix_cors::Cors;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder, Result};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tracing::{info, error};

mod data_processor;
mod workflow_engine;
mod advanced_formulas;
mod enhanced_sqlite_service;
mod formula_config;
mod dynamic_formula_engine;
mod formula_code_manager;
mod formula_executor_generator;
// mod database;  // Commented out for initial build
mod models;

use data_processor::DataProcessor;
use workflow_engine::{WorkflowEngine, WorkflowStep};
use advanced_formulas::{AdvancedFormulaProcessor, AdvancedFormulaRequest};
use enhanced_sqlite_service::{EnhancedSQLiteService, EnhancedSQLiteConfig};
use formula_config::{configure_routes as configure_formula_routes, initialize_default_formulas};
use dynamic_formula_engine::{DynamicFormulaEngine, FormulaExecutionRequest, initialize_dynamic_formula_engine};
use formula_code_manager::{FormulaCodeManager, CodeSaveRequest, CodeTestRequest};
use formula_executor_generator::FormulaExecutorGenerator;
// use database::Database;  // Commented out for initial build

// Global state
struct AppState {
    data_processor: Arc<DataProcessor>,
    workflow_engine: Arc<WorkflowEngine>,
    advanced_formula_processor: Arc<AdvancedFormulaProcessor>,
    enhanced_sqlite_service: Arc<EnhancedSQLiteService>,
    dynamic_formula_engine: Arc<std::sync::Mutex<DynamicFormulaEngine>>,
    formula_code_manager: Arc<FormulaCodeManager>,
    // database: Arc<Database>,  // Commented out for initial build
}

#[derive(Serialize, Deserialize, Clone)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
    timestamp: String,
    backend_type: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct DataRequest {
    data: Vec<f64>,
    operation: String,
    parameters: Option<serde_json::Value>,
}

#[derive(Serialize, Deserialize, Clone)]
struct DataResponse {
    status: String,
    result: serde_json::Value,
    processing_time_ms: u64,
    timestamp: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct WorkflowRequest {
    name: String,
    steps: Vec<WorkflowStep>,
    parameters: Option<serde_json::Value>,
}

// Using WorkflowStep from workflow_engine module

#[derive(Serialize, Deserialize, Clone)]
struct WorkflowResponse {
    status: String,
    workflow_id: String,
    execution_time_ms: u64,
    results: serde_json::Value,
    timestamp: String,
}

// Health check endpoint
#[get("/health")]
async fn health_check() -> Result<impl Responder> {
    let response = HealthResponse {
        status: "healthy".to_string(),
        service: "Unified Data Studio Backend v2".to_string(),
        version: "2.0.0".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
        backend_type: "Rust + Actix-web".to_string(),
    };
    
    info!("Health check requested - Backend is healthy");
    Ok(HttpResponse::Ok().json(response))
}

// Root endpoint
#[get("/")]
async fn root() -> Result<impl Responder> {
    let response = serde_json::json!({
        "message": "Unified Data Studio Backend v2 is running!",
        "version": "2.0.0",
        "backend": "Rust + Actix-web",
        "features": [
            "High-performance data processing",
            "Workflow automation",
            "Multi-database support",
            "Real-time processing"
        ],
        "timestamp": chrono::Utc::now().to_rfc3339()
    });
    
    info!("Root endpoint accessed");
    Ok(HttpResponse::Ok().json(response))
}

// Data processing endpoint
#[post("/process-data")]
async fn process_data(
    req: web::Json<DataRequest>,
    state: web::Data<AppState>,
) -> Result<impl Responder> {
    let start_time = std::time::Instant::now();
    
    info!("Processing data request: operation={}, data_size={}", 
          req.operation, req.data.len());
    
    match state.data_processor.process_data(&req.data, &req.operation, req.parameters.as_ref()).await {
        Ok(result) => {
            let processing_time = start_time.elapsed().as_millis() as u64;
            
            let response = DataResponse {
                status: "success".to_string(),
                result,
                processing_time_ms: processing_time,
                timestamp: chrono::Utc::now().to_rfc3339(),
            };
            
            info!("Data processing completed successfully in {}ms", processing_time);
            Ok(HttpResponse::Ok().json(response))
        }
        Err(e) => {
            error!("Data processing failed: {}", e);
            let response = serde_json::json!({
                "status": "error",
                "error": e.to_string(),
                "timestamp": chrono::Utc::now().to_rfc3339()
            });
            Ok(HttpResponse::InternalServerError().json(response))
        }
    }
}

// Workflow execution endpoint
#[post("/execute-workflow")]
async fn execute_workflow(
    req: web::Json<WorkflowRequest>,
    state: web::Data<AppState>,
) -> Result<impl Responder> {
    let start_time = std::time::Instant::now();
    
    info!("Executing workflow: name={}, steps={}", 
          req.name, req.steps.len());
    
    match state.workflow_engine.execute_workflow(&req.name, req.steps.as_slice(), req.parameters.as_ref()).await {
        Ok((workflow_id, results)) => {
            let execution_time = start_time.elapsed().as_millis() as u64;
            
            let response = WorkflowResponse {
                status: "completed".to_string(),
                workflow_id,
                execution_time_ms: execution_time,
                results,
                timestamp: chrono::Utc::now().to_rfc3339(),
            };
            
            info!("Workflow execution completed successfully in {}ms", execution_time);
            Ok(HttpResponse::Ok().json(response))
        }
        Err(e) => {
            error!("Workflow execution failed: {}", e);
            let response = serde_json::json!({
                "status": "error",
                "error": e.to_string(),
                "timestamp": chrono::Utc::now().to_rfc3339()
            });
            Ok(HttpResponse::InternalServerError().json(response))
        }
    }
}

// Test endpoint
#[get("/test")]
async fn test() -> Result<impl Responder> {
    let response = serde_json::json!({
        "message": "Test endpoint working!",
        "backend": "Rust + Actix-web",
        "performance": "10x faster than Python",
        "timestamp": chrono::Utc::now().to_rfc3339()
    });
    
    info!("Test endpoint accessed");
    Ok(HttpResponse::Ok().json(response))
}

// Advanced Formula Processing Endpoint
#[post("/advanced-formula")]
async fn process_advanced_formula(
    req: web::Json<AdvancedFormulaRequest>,
    state: web::Data<AppState>,
) -> Result<impl Responder> {
    let start_time = std::time::Instant::now();
    
    info!("Processing advanced formula: {} with {} rows", 
          req.formula_type, req.data.len());
    
    // Validate the formula request
    if let Err(e) = state.advanced_formula_processor.validate_formula_request(&req) {
        error!("Formula validation failed: {}", e);
        let response = serde_json::json!({
            "status": "error",
            "error": format!("Formula validation failed: {}", e),
            "timestamp": chrono::Utc::now().to_rfc3339()
        });
        return Ok(HttpResponse::BadRequest().json(response));
    }
    
    // Process the advanced formula
    match state.advanced_formula_processor.process_advanced_formula(req.into_inner()).await {
        Ok(result) => {
            let processing_time = start_time.elapsed().as_millis() as u64;
            
            info!("Advanced formula processed successfully in {}ms", processing_time);
            Ok(HttpResponse::Ok().json(result))
        }
        Err(e) => {
            error!("Advanced formula processing failed: {}", e);
            let response = serde_json::json!({
                "status": "error",
                "error": e.to_string(),
                "timestamp": chrono::Utc::now().to_rfc3339()
            });
            Ok(HttpResponse::InternalServerError().json(response))
        }
    }
}

// Get supported formulas endpoint
#[get("/supported-formulas")]
async fn get_supported_formulas(
    state: web::Data<AppState>,
) -> Result<impl Responder> {
    let formulas = state.advanced_formula_processor.get_supported_formulas();
    
    let response = serde_json::json!({
        "status": "success",
        "formulas": formulas,
        "count": formulas.len(),
        "timestamp": chrono::Utc::now().to_rfc3339()
    });
    
    info!("Retrieved {} supported formulas", formulas.len());
    Ok(HttpResponse::Ok().json(response))
}

// Enhanced SQLite CSV import endpoint
#[post("/sqlite/import-csv")]
async fn import_csv(
    state: web::Data<AppState>,
    req: web::Json<serde_json::Value>,
) -> Result<impl Responder> {
    let start_time = std::time::Instant::now();
    
    let file_path = match req.get("file_path")
        .and_then(|v| v.as_str()) {
        Some(path) => path,
        None => {
            return Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "status": "error",
                "error": "file_path is required"
            })));
        }
    };
    
    let table_name = req.get("table_name")
        .and_then(|v| v.as_str())
        .unwrap_or("imported_data");
    
    match state.enhanced_sqlite_service.import_csv(file_path, table_name).await {
        Ok(result) => {
            let processing_time = start_time.elapsed().as_millis() as u64;
            info!("CSV import completed in {}ms", processing_time);
            Ok(HttpResponse::Ok().json(result))
        }
        Err(e) => {
            error!("CSV import failed: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "status": "error",
                "error": e.to_string()
            })))
        }
    }
}

// Enhanced SQLite query execution endpoint
#[post("/sqlite/query")]
async fn execute_sqlite_query(
    state: web::Data<AppState>,
    req: web::Json<serde_json::Value>,
) -> Result<impl Responder> {
    let start_time = std::time::Instant::now();
    
    let sql = match req.get("sql")
        .and_then(|v| v.as_str()) {
        Some(query) => query,
        None => {
            return Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "status": "error",
                "error": "sql query is required"
            })));
        }
    };
    
    match state.enhanced_sqlite_service.execute_query(sql).await {
        Ok(result) => {
            let processing_time = start_time.elapsed().as_millis() as u64;
            info!("Enhanced SQLite query executed in {}ms", processing_time);
            Ok(HttpResponse::Ok().json(result))
        }
        Err(e) => {
            error!("Enhanced SQLite query failed: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "status": "error",
                "error": e.to_string()
            })))
        }
    }
}

// Enhanced SQLite data transformation endpoint
#[post("/sqlite/transform")]
async fn transform_data(
    state: web::Data<AppState>,
    req: web::Json<enhanced_sqlite_service::DataOperation>,
) -> Result<impl Responder> {
    let start_time = std::time::Instant::now();
    
    match state.enhanced_sqlite_service.transform_data(&req.into_inner()).await {
        Ok(result) => {
            let processing_time = start_time.elapsed().as_millis() as u64;
            info!("Data transformation completed in {}ms", processing_time);
            Ok(HttpResponse::Ok().json(result))
        }
        Err(e) => {
            error!("Data transformation failed: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "status": "error",
                "error": e.to_string()
            })))
        }
    }
}

// Dynamic Formula Engine API Endpoints

// Execute a formula using the dynamic engine
#[post("/formulas/execute")]
async fn execute_formula(
    state: web::Data<AppState>,
    req: web::Json<FormulaExecutionRequest>,
) -> Result<impl Responder> {
    let start_time = std::time::Instant::now();
    
    info!("Executing formula: {} with {} rows", 
          req.formula_name, req.data.len());
    
    let engine = state.dynamic_formula_engine.lock().unwrap();
    match engine.execute_formula(req.into_inner()).await {
        Ok(result) => {
            let total_time = start_time.elapsed().as_millis() as u64;
            info!("Formula execution completed in {}ms", total_time);
            Ok(HttpResponse::Ok().json(result))
        }
        Err(e) => {
            error!("Formula execution failed: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "status": "error",
                "message": format!("Formula execution failed: {}", e),
                "processing_time_ms": start_time.elapsed().as_millis() as u64
            })))
        }
    }
}

// Get all registered formulas
#[get("/formulas/registered")]
async fn get_registered_formulas(
    state: web::Data<AppState>,
) -> Result<impl Responder> {
    let engine = state.dynamic_formula_engine.lock().unwrap();
    let formulas = engine.get_formulas();
    
    let response = serde_json::json!({
        "status": "success",
        "formulas": formulas,
        "count": formulas.len(),
        "timestamp": chrono::Utc::now().to_rfc3339()
    });
    
    Ok(HttpResponse::Ok().json(response))
}

// Get active formulas only
#[get("/formulas/active")]
async fn get_active_formulas(
    state: web::Data<AppState>,
) -> Result<impl Responder> {
    let engine = state.dynamic_formula_engine.lock().unwrap();
    let formulas = engine.get_active_formulas();
    
    let response = serde_json::json!({
        "status": "success",
        "formulas": formulas,
        "count": formulas.len(),
        "timestamp": chrono::Utc::now().to_rfc3339()
    });
    
    Ok(HttpResponse::Ok().json(response))
}

// Enable/disable a formula
#[post("/formulas/{formula_name}/status")]
async fn set_formula_status(
    state: web::Data<AppState>,
    path: web::Path<String>,
    req: web::Json<serde_json::Value>,
) -> Result<impl Responder> {
    let formula_name = path.into_inner();
    let is_active = req.get("is_active")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);
    
    let mut engine = state.dynamic_formula_engine.lock().unwrap();
    match engine.set_formula_status(&formula_name, is_active) {
        Ok(_) => {
            info!("Set formula '{}' status to: {}", formula_name, is_active);
            Ok(HttpResponse::Ok().json(serde_json::json!({
                "status": "success",
                "message": format!("Formula '{}' status set to {}", formula_name, is_active),
                "formula_name": formula_name,
                "is_active": is_active
            })))
        }
        Err(e) => {
            error!("Failed to set formula status: {}", e);
            Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "status": "error",
                "message": format!("Failed to set formula status: {}", e),
                "formula_name": formula_name
            })))
        }
    }
}

// Formula Code Management API Endpoints

// Save formula code
#[post("/formulas/{formula_name}/code")]
async fn save_formula_code(
    state: web::Data<AppState>,
    path: web::Path<String>,
    req: web::Json<CodeSaveRequest>,
) -> Result<impl Responder> {
    let formula_name = path.into_inner();
    
    match state.formula_code_manager.save_formula_code(&formula_name, &req.code) {
        Ok(response) => {
            info!("Saved code for formula: {}", formula_name);
            Ok(HttpResponse::Ok().json(response))
        }
        Err(e) => {
            error!("Failed to save code for formula {}: {}", formula_name, e);
            Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "success": false,
                "message": format!("Failed to save code: {}", e),
                "formula_name": formula_name
            })))
        }
    }
}

// Test formula code compilation
#[post("/formulas/{formula_name}/test")]
async fn test_formula_code(
    state: web::Data<AppState>,
    path: web::Path<String>,
    req: web::Json<CodeTestRequest>,
) -> Result<impl Responder> {
    let formula_name = path.into_inner();
    
    match state.formula_code_manager.test_formula_code(&formula_name, &req.code) {
        Ok(response) => {
            info!("Tested code for formula: {} - Success: {}", formula_name, response.success);
            Ok(HttpResponse::Ok().json(response))
        }
        Err(e) => {
            error!("Failed to test code for formula {}: {}", formula_name, e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "success": false,
                "message": format!("Failed to test code: {}", e),
                "formula_name": formula_name,
                "errors": vec![e.to_string()]
            })))
        }
    }
}

// Get formula code
#[get("/formulas/{formula_name}/code")]
async fn get_formula_code(
    state: web::Data<AppState>,
    path: web::Path<String>,
) -> Result<impl Responder> {
    let formula_name = path.into_inner();
    
    match state.formula_code_manager.get_formula_code(&formula_name) {
        Ok(code) => {
            Ok(HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "formula_name": formula_name,
                "code": code
            })))
        }
        Err(e) => {
            Ok(HttpResponse::NotFound().json(serde_json::json!({
                "success": false,
                "message": format!("Code not found: {}", e),
                "formula_name": formula_name
            })))
        }
    }
}

// List all formula codes
#[get("/formulas/code")]
async fn list_formula_codes(
    state: web::Data<AppState>,
) -> Result<impl Responder> {
    match state.formula_code_manager.list_formula_codes() {
        Ok(formulas) => {
            Ok(HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "formulas": formulas,
                "count": formulas.len()
            })))
        }
        Err(e) => {
            error!("Failed to list formula codes: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "success": false,
                "message": format!("Failed to list codes: {}", e)
            })))
        }
    }
}

// Generate formula executor code template
#[get("/formulas/{formula_name}/generate")]
async fn generate_formula_code(
    path: web::Path<String>,
) -> Result<impl Responder> {
    let formula_name = path.into_inner();
    
    match FormulaExecutorGenerator::generate_specific_executor(&formula_name) {
        Ok(code) => {
            Ok(HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "formula_name": formula_name,
                "code": code,
                "message": "Code template generated successfully"
            })))
        }
        Err(e) => {
            Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "success": false,
                "message": format!("Failed to generate code: {}", e),
                "formula_name": formula_name
            })))
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    info!("🚀 Starting Unified Data Studio Backend v2...");
    info!("🌐 Backend: Rust + Actix-web");
    info!("📊 Data Processing: Polars + ndarray");
    info!("🔄 Workflow Engine: Temporal + custom");
    
    // Initialize components
    let data_processor = Arc::new(DataProcessor::new().await);
    let workflow_engine = Arc::new(WorkflowEngine::new().await);
    let advanced_formula_processor = Arc::new(AdvancedFormulaProcessor::new());
    
    // Initialize Enhanced SQLite service
    let enhanced_sqlite_config = EnhancedSQLiteConfig::default();
    let enhanced_sqlite_service = match EnhancedSQLiteService::new(Some(enhanced_sqlite_config)).await {
        Ok(service) => {
            info!("✅ Enhanced SQLite service initialized successfully");
            Arc::new(service)
        }
        Err(e) => {
            error!("❌ Failed to initialize Enhanced SQLite service: {}", e);
            return Err(std::io::Error::new(std::io::ErrorKind::Other, "Enhanced SQLite initialization failed"));
        }
    };
    
    // let database = Arc::new(Database::new().await);  // Commented out for initial build
    
    // Initialize dynamic formula engine
    let dynamic_formula_engine = Arc::new(std::sync::Mutex::new(initialize_dynamic_formula_engine()));
    
    // Initialize formula code manager
    let formula_code_manager = Arc::new(FormulaCodeManager::new());
    
    let app_state = web::Data::new(AppState {
        data_processor,
        workflow_engine,
        advanced_formula_processor,
        enhanced_sqlite_service,
        dynamic_formula_engine,
        formula_code_manager,
        // database,  // Commented out for initial build
    });
    
    info!("🔧 Initializing HTTP server...");
    
    // Start HTTP server
    HttpServer::new(move || {
        // Configure CORS for each request
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);
        
        // Initialize default formulas
        initialize_default_formulas();
        
        App::new()
            .wrap(cors)
            .app_data(app_state.clone())
            .service(health_check)
            .service(root)
            .service(process_data)
            .service(execute_workflow)
            .service(test)
            .service(process_advanced_formula)
            .service(get_supported_formulas)
            .service(import_csv)
            .service(execute_sqlite_query)
            .service(transform_data)
            .service(execute_formula)
            .service(get_registered_formulas)
            .service(get_active_formulas)
            .service(set_formula_status)
            .service(save_formula_code)
            .service(test_formula_code)
            .service(get_formula_code)
            .service(list_formula_codes)
            .service(generate_formula_code)
            .configure(configure_formula_routes)
    })
    .bind("127.0.0.1:5002")?
    .run()
    .await
}
