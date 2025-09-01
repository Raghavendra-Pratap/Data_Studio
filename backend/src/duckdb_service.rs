use anyhow::{Result, anyhow};
use duckdb::{Connection, Result as DuckDBResult};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{info, warn, error};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuckDBConfig {
    pub database_path: String,
    pub memory_limit_mb: usize,
    pub thread_count: usize,
}

impl Default for DuckDBConfig {
    fn default() -> Self {
        Self {
            database_path: ":memory:".to_string(), // Start with in-memory for now
            memory_limit_mb: 1024, // 1GB memory limit
            thread_count: 4, // Use 4 threads by default
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataOperation {
    pub operation_type: String,
    pub parameters: Value,
    pub input_data: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataResult {
    pub success: bool,
    pub data: Option<Value>,
    pub error_message: Option<String>,
    pub processing_time_ms: u64,
    pub row_count: Option<usize>,
}

pub struct DuckDBService {
    connection: Arc<Mutex<Connection>>,
    config: DuckDBConfig,
}

impl DuckDBService {
    pub async fn new(config: Option<DuckDBConfig>) -> Result<Self> {
        let config = config.unwrap_or_default();
        
        info!("Initializing DuckDB service with config: {:?}", config);
        
        // Create connection
        let connection = Connection::open(&config.database_path)
            .map_err(|e| anyhow!("Failed to create DuckDB connection: {}", e))?;
        
        // Configure connection
        connection.execute_batch(&format!(
            "SET memory_limit='{}MB'; SET threads={};",
            config.memory_limit_mb, config.thread_count
        )).map_err(|e| anyhow!("Failed to configure DuckDB: {}", e))?;
        
        info!("✅ DuckDB service initialized successfully");
        
        Ok(DuckDBService {
            connection: Arc::new(Mutex::new(connection)),
            config,
        })
    }
    
    /// Import CSV data into DuckDB
    pub async fn import_csv(&self, file_path: &str, table_name: &str) -> Result<DataResult> {
        let start_time = std::time::Instant::now();
        
        let conn = self.connection.lock().await;
        
        // Create table from CSV
        let create_table_sql = format!(
            "CREATE TABLE IF NOT EXISTS {} AS SELECT * FROM read_csv_auto('{}')",
            table_name, file_path
        );
        
        match conn.execute_batch(&create_table_sql) {
            Ok(_) => {
                // Get row count
                let count_sql = format!("SELECT COUNT(*) as count FROM {}", table_name);
                let row_count = conn.query_row(&count_sql, [], |row| row.get::<_, i64>(0))
                    .unwrap_or(0) as usize;
                
                let processing_time = start_time.elapsed().as_millis() as u64;
                
                info!("✅ CSV imported successfully: {} rows in {}ms", row_count, processing_time);
                
                Ok(DataResult {
                    success: true,
                    data: Some(serde_json::json!({
                        "table_name": table_name,
                        "row_count": row_count,
                        "file_path": file_path
                    })),
                    error_message: None,
                    processing_time_ms: processing_time,
                    row_count: Some(row_count),
                })
            }
            Err(e) => {
                let processing_time = start_time.elapsed().as_millis() as u64;
                error!("❌ CSV import failed: {}", e);
                
                Ok(DataResult {
                    success: false,
                    data: None,
                    error_message: Some(format!("CSV import failed: {}", e)),
                    processing_time_ms: processing_time,
                    row_count: None,
                })
            }
        }
    }
    
    /// Execute SQL query and return results
    pub async fn execute_query(&self, sql: &str) -> Result<DataResult> {
        let start_time = std::time::Instant::now();
        
        let conn = self.connection.lock().await;
        
        match conn.query(sql) {
            Ok(mut rows) => {
                let mut results = Vec::new();
                let mut row_count = 0;
                
                while let Some(row) = rows.next().map_err(|e| anyhow!("Row iteration failed: {}", e))? {
                    let mut row_data = serde_json::Map::new();
                    
                    for (i, col) in row.columns().iter().enumerate() {
                        let value = match row.get::<_, serde_json::Value>(i) {
                            Ok(v) => v,
                            Err(_) => serde_json::Value::Null,
                        };
                        row_data.insert(col.name().to_string(), value);
                    }
                    
                    results.push(serde_json::Value::Object(row_data));
                    row_count += 1;
                }
                
                let processing_time = start_time.elapsed().as_millis() as u64;
                
                info!("✅ Query executed successfully: {} rows in {}ms", row_count, processing_time);
                
                Ok(DataResult {
                    success: true,
                    data: Some(serde_json::Value::Array(results)),
                    error_message: None,
                    processing_time_ms: processing_time,
                    row_count: Some(row_count),
                })
            }
            Err(e) => {
                let processing_time = start_time.elapsed().as_millis() as u64;
                error!("❌ Query execution failed: {}", e);
                
                Ok(DataResult {
                    success: false,
                    data: None,
                    error_message: Some(format!("Query execution failed: {}", e)),
                    processing_time_ms: processing_time,
                    row_count: None,
                })
            }
        }
    }
    
    /// Perform data transformation operations
    pub async fn transform_data(&self, operation: &DataOperation) -> Result<DataResult> {
        let start_time = std::time::Instant::now();
        
        match operation.operation_type.as_str() {
            "filter" => self.apply_filter(operation).await,
            "aggregate" => self.apply_aggregation(operation).await,
            "join" => self.apply_join(operation).await,
            "sort" => self.apply_sort(operation).await,
            "group_by" => self.apply_group_by(operation).await,
            _ => {
                let processing_time = start_time.elapsed().as_millis() as u64;
                Ok(DataResult {
                    success: false,
                    data: None,
                    error_message: Some(format!("Unknown operation type: {}", operation.operation_type)),
                    processing_time_ms: processing_time,
                    row_count: None,
                })
            }
        }
    }
    
    /// Apply filter operation
    async fn apply_filter(&self, operation: &DataOperation) -> Result<DataResult> {
        let start_time = std::time::Instant::now();
        
        let table_name = operation.parameters.get("table_name")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Filter operation requires 'table_name' parameter"))?;
        
        let condition = operation.parameters.get("condition")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Filter operation requires 'condition' parameter"))?;
        
        let sql = format!("SELECT * FROM {} WHERE {}", table_name, condition);
        
        self.execute_query(&sql).await
    }
    
    /// Apply aggregation operation
    async fn apply_aggregation(&self, operation: &DataOperation) -> Result<DataResult> {
        let start_time = std::time::Instant::now();
        
        let table_name = operation.parameters.get("table_name")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Aggregation operation requires 'table_name' parameter"))?;
        
        let group_by = operation.parameters.get("group_by")
            .and_then(|v| v.as_str());
        
        let aggregations = operation.parameters.get("aggregations")
            .and_then(|v| v.as_array())
            .ok_or_else(|| anyhow!("Aggregation operation requires 'aggregations' parameter"))?;
        
        let agg_clause = aggregations.iter()
            .filter_map(|v| v.as_str())
            .collect::<Vec<_>>()
            .join(", ");
        
        let sql = if let Some(group_col) = group_by {
            format!("SELECT {}, {} FROM {} GROUP BY {}", group_col, agg_clause, table_name, group_col)
        } else {
            format!("SELECT {} FROM {}", agg_clause, table_name)
        };
        
        self.execute_query(&sql).await
    }
    
    /// Apply join operation
    async fn apply_join(&self, operation: &DataOperation) -> Result<DataResult> {
        let start_time = std::time::Instant::now();
        
        let left_table = operation.parameters.get("left_table")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Join operation requires 'left_table' parameter"))?;
        
        let right_table = operation.parameters.get("right_table")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Join operation requires 'right_table' parameter"))?;
        
        let join_condition = operation.parameters.get("join_condition")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Join operation requires 'join_condition' parameter"))?;
        
        let join_type = operation.parameters.get("join_type")
            .and_then(|v| v.as_str())
            .unwrap_or("INNER");
        
        let sql = format!(
            "SELECT * FROM {} {} JOIN {} ON {}",
            left_table, join_type, right_table, join_condition
        );
        
        self.execute_query(&sql).await
    }
    
    /// Apply sort operation
    async fn apply_sort(&self, operation: &DataOperation) -> Result<DataResult> {
        let start_time = std::time::Instant::now();
        
        let table_name = operation.parameters.get("table_name")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Sort operation requires 'table_name' parameter"))?;
        
        let order_by = operation.parameters.get("order_by")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Sort operation requires 'order_by' parameter"))?;
        
        let limit = operation.parameters.get("limit")
            .and_then(|v| v.as_u64());
        
        let mut sql = format!("SELECT * FROM {} ORDER BY {}", table_name, order_by);
        
        if let Some(limit_val) = limit {
            sql.push_str(&format!(" LIMIT {}", limit_val));
        }
        
        self.execute_query(&sql).await
    }
    
    /// Apply group by operation
    async fn apply_group_by(&self, operation: &DataOperation) -> Result<DataResult> {
        let start_time = std::time::Instant::now();
        
        let table_name = operation.parameters.get("table_name")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Group by operation requires 'table_name' parameter"))?;
        
        let group_columns = operation.parameters.get("group_columns")
            .and_then(|v| v.as_array())
            .ok_or_else(|| anyhow!("Group by operation requires 'group_columns' parameter"))?;
        
        let group_clause = group_columns.iter()
            .filter_map(|v| v.as_str())
            .collect::<Vec<_>>()
            .join(", ");
        
        let sql = format!("SELECT {} FROM {} GROUP BY {}", group_clause, table_name, group_clause);
        
        self.execute_query(&sql).await
    }
    
    /// Get table schema information
    pub async fn get_table_schema(&self, table_name: &str) -> Result<DataResult> {
        let sql = format!("DESCRIBE {}", table_name);
        self.execute_query(&sql).await
    }
    
    /// List all tables in the database
    pub async fn list_tables(&self) -> Result<DataResult> {
        let sql = "SHOW TABLES".to_string();
        self.execute_query(&sql).await
    }
    
    /// Export data to CSV
    pub async fn export_to_csv(&self, table_name: &str, file_path: &str) -> Result<DataResult> {
        let start_time = std::time::Instant::now();
        
        let conn = self.connection.lock().await;
        
        let sql = format!(
            "COPY {} TO '{}' (FORMAT CSV, HEADER TRUE)",
            table_name, file_path
        );
        
        match conn.execute_batch(&sql) {
            Ok(_) => {
                let processing_time = start_time.elapsed().as_millis() as u64;
                
                info!("✅ Data exported to CSV successfully: {} in {}ms", file_path, processing_time);
                
                Ok(DataResult {
                    success: true,
                    data: Some(serde_json::json!({
                        "export_path": file_path,
                        "table_name": table_name
                    })),
                    error_message: None,
                    processing_time_ms: processing_time,
                    row_count: None,
                })
            }
            Err(e) => {
                let processing_time = start_time.elapsed().as_millis() as u64;
                error!("❌ CSV export failed: {}", e);
                
                Ok(DataResult {
                    success: false,
                    data: None,
                    error_message: Some(format!("CSV export failed: {}", e)),
                    processing_time_ms: processing_time,
                    row_count: None,
                })
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_duckdb_service_creation() {
        let service = DuckDBService::new(None).await;
        assert!(service.is_ok());
    }
    
    #[tokio::test]
    async fn test_query_execution() {
        let service = DuckDBService::new(None).await.unwrap();
        let result = service.execute_query("SELECT 1 as test").await.unwrap();
        assert!(result.success);
        assert_eq!(result.row_count, Some(1));
    }
}
