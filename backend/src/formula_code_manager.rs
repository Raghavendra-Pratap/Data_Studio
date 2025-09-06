// Formula Code Manager
// Handles backend code storage, compilation, and testing for formulas

use anyhow::{Result, anyhow};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};
use tracing::{info, error, warn};

#[derive(Debug, Serialize, Deserialize)]
pub struct CodeSaveRequest {
    pub code: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CodeTestRequest {
    pub code: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CodeTestResponse {
    pub success: bool,
    pub message: String,
    pub compilation_time_ms: Option<u64>,
    pub errors: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CodeSaveResponse {
    pub success: bool,
    pub message: String,
    pub formula_name: String,
    pub saved_at: String,
}

pub struct FormulaCodeManager {
    code_directory: String,
}

impl FormulaCodeManager {
    pub fn new() -> Self {
        let code_dir = "formula_code".to_string();
        
        // Create directory if it doesn't exist
        if !Path::new(&code_dir).exists() {
            if let Err(e) = fs::create_dir_all(&code_dir) {
                error!("Failed to create formula code directory: {}", e);
            }
        }
        
        Self {
            code_directory: code_dir,
        }
    }

    pub fn save_formula_code(&self, formula_name: &str, code: &str) -> Result<CodeSaveResponse> {
        let file_path = format!("{}/{}.rs", self.code_directory, formula_name.to_lowercase());
        
        // Validate the code before saving
        self.validate_rust_code(code)?;
        
        // Save the code to file
        fs::write(&file_path, code)?;
        
        let saved_at = get_current_timestamp();
        info!("Saved formula code for {} to {}", formula_name, file_path);
        
        Ok(CodeSaveResponse {
            success: true,
            message: format!("Code saved successfully for formula: {}", formula_name),
            formula_name: formula_name.to_string(),
            saved_at,
        })
    }

    pub fn test_formula_code(&self, formula_name: &str, code: &str) -> Result<CodeTestResponse> {
        let start_time = std::time::Instant::now();
        
        // Create a temporary file for testing
        let temp_file = format!("{}/test_{}.rs", self.code_directory, formula_name.to_lowercase());
        fs::write(&temp_file, code)?;
        
        // Try to compile the code
        let compilation_result = Command::new("rustc")
            .args(&["--crate-type", "lib", &temp_file])
            .output();
        
        let compilation_time = start_time.elapsed().as_millis() as u64;
        
        // Clean up temporary file
        let _ = fs::remove_file(&temp_file);
        
        match compilation_result {
            Ok(output) => {
                if output.status.success() {
                    // Also clean up the compiled artifact
                    let _ = fs::remove_file(format!("{}/libtest_{}.rlib", self.code_directory, formula_name.to_lowercase()));
                    
                    Ok(CodeTestResponse {
                        success: true,
                        message: "Code compiled successfully".to_string(),
                        compilation_time_ms: Some(compilation_time),
                        errors: vec![],
                    })
                } else {
                    let error_output = String::from_utf8_lossy(&output.stderr);
                    let errors: Vec<String> = error_output
                        .lines()
                        .filter(|line| !line.is_empty())
                        .map(|line| line.to_string())
                        .collect();
                    
                    Ok(CodeTestResponse {
                        success: false,
                        message: "Compilation failed".to_string(),
                        compilation_time_ms: Some(compilation_time),
                        errors,
                    })
                }
            }
            Err(e) => {
                error!("Failed to run rustc: {}", e);
                Ok(CodeTestResponse {
                    success: false,
                    message: format!("Failed to run compiler: {}", e),
                    compilation_time_ms: Some(compilation_time),
                    errors: vec![e.to_string()],
                })
            }
        }
    }

    pub fn get_formula_code(&self, formula_name: &str) -> Result<String> {
        let file_path = format!("{}/{}.rs", self.code_directory, formula_name.to_lowercase());
        
        if !Path::new(&file_path).exists() {
            return Err(anyhow!("No code found for formula: {}", formula_name));
        }
        
        let code = fs::read_to_string(&file_path)?;
        Ok(code)
    }

    pub fn delete_formula_code(&self, formula_name: &str) -> Result<()> {
        let file_path = format!("{}/{}.rs", self.code_directory, formula_name.to_lowercase());
        
        if Path::new(&file_path).exists() {
            fs::remove_file(&file_path)?;
            info!("Deleted formula code for: {}", formula_name);
        }
        
        Ok(())
    }

    pub fn list_formula_codes(&self) -> Result<Vec<String>> {
        let mut formulas = Vec::new();
        
        if let Ok(entries) = fs::read_dir(&self.code_directory) {
            for entry in entries {
                if let Ok(entry) = entry {
                    if let Some(file_name) = entry.file_name().to_str() {
                        if file_name.ends_with(".rs") {
                            let formula_name = file_name.trim_end_matches(".rs").to_uppercase();
                            formulas.push(formula_name);
                        }
                    }
                }
            }
        }
        
        Ok(formulas)
    }

    fn validate_rust_code(&self, code: &str) -> Result<()> {
        // Basic validation - check for required traits and methods
        if !code.contains("impl FormulaExecutor") {
            return Err(anyhow!("Code must implement FormulaExecutor trait"));
        }
        
        if !code.contains("fn execute") {
            return Err(anyhow!("Code must implement execute method"));
        }
        
        if !code.contains("fn validate_parameters") {
            return Err(anyhow!("Code must implement validate_parameters method"));
        }
        
        if !code.contains("fn get_output_columns") {
            return Err(anyhow!("Code must implement get_output_columns method"));
        }
        
        Ok(())
    }
}

fn get_current_timestamp() -> String {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_rust_code() {
        let manager = FormulaCodeManager::new();
        
        let valid_code = r#"
        impl FormulaExecutor for TestExecutor {
            fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
                Ok(data.to_vec())
            }
            
            fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
                Ok(())
            }
            
            fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
                vec!["test_result".to_string()]
            }
        }
        "#;
        
        assert!(manager.validate_rust_code(valid_code).is_ok());
        
        let invalid_code = "just some random text";
        assert!(manager.validate_rust_code(invalid_code).is_err());
    }
}
