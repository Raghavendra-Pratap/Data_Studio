use anyhow::{Result, anyhow};
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::info;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnhancedSQLiteConfig {
    pub database_path: String,
    pub enable_wal: bool,
    pub cache_size: i32,
    pub temp_store: String,
}

impl Default for EnhancedSQLiteConfig {
    fn default() -> Self {
        Self {
            database_path: ":memory:".to_string(), // Start with in-memory for now
            enable_wal: true,
            cache_size: 10000, // 10MB cache
            temp_store: "memory".to_string(),
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

pub struct EnhancedSQLiteService {
    connection: Arc<Mutex<Connection>>,
    config: EnhancedSQLiteConfig,
}

impl EnhancedSQLiteService {
    pub async fn new(config: Option<EnhancedSQLiteConfig>) -> Result<Self> {
        let config = config.unwrap_or_default();
        
        info!("Initializing Enhanced SQLite service with config: {:?}", config);
        
        // Create connection
        let connection = Connection::open(&config.database_path)
            .map_err(|e| anyhow!("Failed to create SQLite connection: {}", e))?;
        
        // Configure connection for better performance
        connection.execute_batch(&format!(
            "PRAGMA journal_mode = {}; PRAGMA cache_size = {}; PRAGMA temp_store = {};",
            if config.enable_wal { "WAL" } else { "DELETE" },
            config.cache_size,
            config.temp_store
        )).map_err(|e| anyhow!("Failed to configure SQLite: {}", e))?;
        
        // Enable JSON1 extension for better JSON support
        connection.execute_batch("PRAGMA foreign_keys = ON;")
            .map_err(|e| anyhow!("Failed to enable foreign keys: {}", e))?;
        
        info!("✅ Enhanced SQLite service initialized successfully");
        
        Ok(EnhancedSQLiteService {
            connection: Arc::new(Mutex::new(connection)),
            config,
        })
    }
    
    /// Import CSV data into SQLite with automatic schema detection
    pub async fn import_csv(&self, file_path: &str, table_name: &str) -> Result<DataResult> {
        let start_time = std::time::Instant::now();
        
        let conn = self.connection.lock().await;
        
        // Read CSV file and detect schema
        let csv_content = std::fs::read_to_string(file_path)
            .map_err(|e| anyhow!("Failed to read CSV file: {}", e))?;
        
        let lines: Vec<&str> = csv_content.lines().collect();
        if lines.is_empty() {
            return Ok(DataResult {
                success: false,
                data: None,
                error_message: Some("CSV file is empty".to_string()),
                processing_time_ms: start_time.elapsed().as_millis() as u64,
                row_count: None,
            });
        }
        
        let headers: Vec<&str> = lines[0].split(',').collect();
        let data_rows = &lines[1..];
        
        // Create table with detected schema
        let columns_sql = headers.iter()
            .map(|h| format!("`{}` TEXT", h.trim_matches('"')))
            .collect::<Vec<_>>()
            .join(", ");
        
        let create_table_sql = format!(
            "CREATE TABLE IF NOT EXISTS {} ({})",
            table_name, columns_sql
        );
        
        conn.execute_batch(&create_table_sql)
            .map_err(|e| anyhow!("Failed to create table: {}", e))?;
        
        // Insert data
        let placeholders = headers.iter()
            .map(|_| "?")
            .collect::<Vec<_>>()
            .join(", ");
        
        let insert_sql = format!(
            "INSERT INTO {} ({}) VALUES ({})",
            table_name,
            headers.iter().map(|h| format!("`{}`", h.trim_matches('"'))).collect::<Vec<_>>().join(", "),
            placeholders
        );
        
        let mut stmt = conn.prepare(&insert_sql)
            .map_err(|e| anyhow!("Failed to prepare insert statement: {}", e))?;
        
        for line in data_rows {
            let values: Vec<&str> = line.split(',').collect();
            if values.len() == headers.len() {
                let params: Vec<&dyn rusqlite::ToSql> = values.iter()
                    .map(|v| v as &dyn rusqlite::ToSql)
                    .collect();
                
                stmt.execute(params.as_slice())
                    .map_err(|e| anyhow!("Failed to insert row: {}", e))?;
            }
        }
        
        // Get row count
        let row_count = conn.query_row(
            &format!("SELECT COUNT(*) FROM {}", table_name),
            [],
            |row| row.get::<_, i64>(0)
        ).unwrap_or(0) as usize;
        
        let processing_time = start_time.elapsed().as_millis() as u64;
        
        info!("✅ CSV imported successfully: {} rows in {}ms", row_count, processing_time);
        
        Ok(DataResult {
            success: true,
            data: Some(serde_json::json!({
                "table_name": table_name,
                "row_count": row_count,
                "file_path": file_path,
                "columns": headers
            })),
            error_message: None,
            processing_time_ms: processing_time,
            row_count: Some(row_count),
        })
    }
    
    /// Execute SQL query and return results
    pub async fn execute_query(&self, sql: &str) -> Result<DataResult> {
        let start_time = std::time::Instant::now();
        
        let conn = self.connection.lock().await;
        
        let mut stmt = conn.prepare(sql)
            .map_err(|e| anyhow!("Failed to prepare query: {}", e))?;
        
        // Get column names from the statement
        let column_count = stmt.column_count();
        let column_names: Vec<String> = (0..column_count)
            .map(|i| stmt.column_name(i).unwrap_or("column").to_string())
            .collect();
        
        let mut rows = stmt.query([])
            .map_err(|e| anyhow!("Failed to execute query: {}", e))?;
        
        let mut results = Vec::new();
        let mut row_count = 0;
        
        while let Some(row) = rows.next()
            .map_err(|e| anyhow!("Row iteration failed: {}", e))? {
            
            let mut row_data = serde_json::Map::new();
            
            for (i, col_name) in column_names.iter().enumerate() {
                let value = match row.get::<_, rusqlite::types::Value>(i) {
                    Ok(v) => match v {
                        rusqlite::types::Value::Null => serde_json::Value::Null,
                        rusqlite::types::Value::Integer(i) => serde_json::Value::Number(i.into()),
                        rusqlite::types::Value::Real(f) => {
                            if let Some(n) = serde_json::Number::from_f64(f) {
                                serde_json::Value::Number(n)
                            } else {
                                serde_json::Value::Null
                            }
                        }
                        rusqlite::types::Value::Text(s) => serde_json::Value::String(s),
                        rusqlite::types::Value::Blob(_) => serde_json::Value::String("BLOB".to_string()),
                    },
                    Err(_) => serde_json::Value::Null,
                };
                
                row_data.insert(col_name.clone(), value);
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
    
    /// Perform data transformation operations
    pub async fn transform_data(&self, operation: &DataOperation) -> Result<DataResult> {
        let start_time = std::time::Instant::now();
        
        match operation.operation_type.as_str() {
            "filter" => self.apply_filter(operation).await,
            "aggregate" => self.apply_aggregation(operation).await,
            "join" => self.apply_join(operation).await,
            "sort" => self.apply_sort(operation).await,
            "group_by" => self.apply_group_by(operation).await,
            "pivot" => self.apply_pivot(operation).await,
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
    
    /// Apply pivot operation (SQLite doesn't have native PIVOT, so we simulate it)
    async fn apply_pivot(&self, operation: &DataOperation) -> Result<DataResult> {
        let table_name = operation.parameters.get("table_name")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Pivot operation requires 'table_name' parameter"))?;
        
        let pivot_column = operation.parameters.get("pivot_column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Pivot operation requires 'pivot_column' parameter"))?;
        
        let value_column = operation.parameters.get("value_column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Pivot operation requires 'value_column' parameter"))?;
        
        // Get unique values from pivot column
        let pivot_values_sql = format!(
            "SELECT DISTINCT {} FROM {} ORDER BY {}",
            pivot_column, table_name, pivot_column
        );
        
        let pivot_values_result = self.execute_query(&pivot_values_sql).await?;
        
        if let Some(Value::Array(pivot_values)) = pivot_values_result.data {
            // Build dynamic pivot query
            let mut pivot_columns = Vec::new();
            for value in pivot_values {
                if let Value::String(val) = value {
                    pivot_columns.push(format!(
                        "MAX(CASE WHEN {} = '{}' THEN {} END) as `{}`",
                        pivot_column, val, value_column, val
                    ));
                }
            }
            
            let pivot_sql = format!(
                "SELECT {} FROM {} GROUP BY {}",
                pivot_columns.join(", "),
                table_name,
                operation.parameters.get("group_by")
                    .and_then(|v| v.as_str())
                    .unwrap_or("1")
            );
            
            self.execute_query(&pivot_sql).await
        } else {
            Ok(DataResult {
                success: false,
                data: None,
                error_message: Some("Failed to get pivot values".to_string()),
                processing_time_ms: 0,
                row_count: None,
            })
        }
    }
    
    /// Get table schema information
    pub async fn get_table_schema(&self, table_name: &str) -> Result<DataResult> {
        let sql = format!("PRAGMA table_info({})", table_name);
        self.execute_query(&sql).await
    }
    
    /// List all tables in the database
    pub async fn list_tables(&self) -> Result<DataResult> {
        let sql = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'".to_string();
        self.execute_query(&sql).await
    }
    
    /// Export data to CSV
    pub async fn export_to_csv(&self, table_name: &str, file_path: &str) -> Result<DataResult> {
        let start_time = std::time::Instant::now();
        
        // Get all data
        let result = self.execute_query(&format!("SELECT * FROM {}", table_name)).await?;
        
        if let Some(Value::Array(rows)) = result.data {
            let row_count = rows.len();
            if let Some(Value::Object(first_row)) = rows.first() {
                // Write CSV
                let mut csv_content = String::new();
                
                // Headers
                let headers: Vec<String> = first_row.keys().cloned().collect();
                csv_content.push_str(&headers.join(","));
                csv_content.push('\n');
                
                // Data rows
                for row in &rows {
                    if let Value::Object(row_data) = row {
                        let values: Vec<String> = headers.iter()
                            .map(|h| row_data.get(h)
                                .map(|v| v.as_str().unwrap_or("").to_string())
                                .unwrap_or_else(|| "".to_string()))
                            .collect();
                        csv_content.push_str(&values.join(","));
                        csv_content.push('\n');
                    }
                }
                
                // Write to file
                std::fs::write(file_path, csv_content)
                    .map_err(|e| anyhow!("Failed to write CSV file: {}", e))?;
                
                let processing_time = start_time.elapsed().as_millis() as u64;
                
                info!("✅ Data exported to CSV successfully: {} in {}ms", file_path, processing_time);
                
                Ok(DataResult {
                    success: true,
                    data: Some(serde_json::json!({
                        "export_path": file_path,
                        "table_name": table_name,
                        "row_count": row_count
                    })),
                    error_message: None,
                    processing_time_ms: processing_time,
                    row_count: Some(row_count),
                })
            } else {
                Ok(DataResult {
                    success: false,
                    data: None,
                    error_message: Some("No data to export".to_string()),
                    processing_time_ms: start_time.elapsed().as_millis() as u64,
                    row_count: None,
                })
            }
        } else {
            Ok(DataResult {
                success: false,
                data: None,
                error_message: Some("Failed to get data for export".to_string()),
                processing_time_ms: start_time.elapsed().as_millis() as u64,
                row_count: None,
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_enhanced_sqlite_service_creation() {
        let service = EnhancedSQLiteService::new(None).await;
        assert!(service.is_ok());
    }
    
    #[tokio::test]
    async fn test_query_execution() {
        let service = EnhancedSQLiteService::new(None).await.unwrap();
        let result = service.execute_query("SELECT 1 as test").await.unwrap();
        assert!(result.success);
        assert_eq!(result.row_count, Some(1));
    }
}
