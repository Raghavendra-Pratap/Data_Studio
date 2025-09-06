// Dynamic Formula Engine
// Handles registration, validation, and execution of formulas based on configuration

use anyhow::{Result, anyhow};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};
use tracing::{info, error, warn};

use crate::formula_config::{FormulaConfig, FormulaParameter};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormulaExecutionRequest {
    pub formula_name: String,
    pub data: Vec<HashMap<String, Value>>,
    pub parameters: HashMap<String, Value>,
    pub output_config: OutputConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutputConfig {
    pub output_column: String,
    pub include_metadata: bool,
    pub sample_size: Option<usize>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FormulaExecutionResult {
    pub status: String,
    pub data: Vec<HashMap<String, Value>>,
    pub metadata: HashMap<String, Value>,
    pub processing_time_ms: u64,
    pub formula_name: String,
    pub error_message: Option<String>,
}

pub struct RegisteredFormula {
    pub config: FormulaConfig,
    pub executor: Box<dyn FormulaExecutor + Send + Sync>,
}

pub trait FormulaExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>>;
    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()>;
    fn get_output_columns(&self, parameters: &HashMap<String, Value>) -> Vec<String>;
}

pub struct DynamicFormulaEngine {
    formulas: HashMap<String, RegisteredFormula>,
    formula_configs: HashMap<String, FormulaConfig>,
}

impl DynamicFormulaEngine {
    pub fn new() -> Self {
        Self {
            formulas: HashMap::new(),
            formula_configs: HashMap::new(),
        }
    }

    // Register a formula configuration and its executor
    pub fn register_formula(&mut self, config: FormulaConfig, executor: Box<dyn FormulaExecutor + Send + Sync>) -> Result<()> {
        let formula_name = config.name.clone();
        
        // Validate the formula configuration
        self.validate_formula_config(&config)?;
        
        // Store the configuration
        self.formula_configs.insert(formula_name.clone(), config.clone());
        
        // Register the executor
        self.formulas.insert(formula_name.clone(), RegisteredFormula {
            config,
            executor,
        });
        
        info!("Registered formula: {}", formula_name);
        Ok(())
    }

    // Update a formula configuration
    pub fn update_formula(&mut self, config: FormulaConfig) -> Result<()> {
        let formula_name = config.name.clone();
        
        if !self.formula_configs.contains_key(&formula_name) {
            return Err(anyhow!("Formula '{}' not found", formula_name));
        }
        
        // Validate the updated configuration
        self.validate_formula_config(&config)?;
        
        // Update the configuration
        self.formula_configs.insert(formula_name.clone(), config);
        
        info!("Updated formula: {}", formula_name);
        Ok(())
    }

    // Remove a formula
    pub fn remove_formula(&mut self, formula_name: &str) -> Result<()> {
        if self.formula_configs.remove(formula_name).is_none() {
            return Err(anyhow!("Formula '{}' not found", formula_name));
        }
        
        if self.formulas.remove(formula_name).is_none() {
            warn!("Formula '{}' was not registered for execution", formula_name);
        }
        
        info!("Removed formula: {}", formula_name);
        Ok(())
    }

    // Enable/disable a formula
    pub fn set_formula_status(&mut self, formula_name: &str, is_active: bool) -> Result<()> {
        if let Some(config) = self.formula_configs.get_mut(formula_name) {
            config.is_active = is_active;
            info!("Set formula '{}' status to: {}", formula_name, is_active);
            Ok(())
        } else {
            Err(anyhow!("Formula '{}' not found", formula_name))
        }
    }

    // Execute a formula
    pub async fn execute_formula(&self, request: FormulaExecutionRequest) -> Result<FormulaExecutionResult> {
        let start_time = std::time::Instant::now();
        
        // Check if formula exists and is active
        let config = self.formula_configs.get(&request.formula_name)
            .ok_or_else(|| anyhow!("Formula '{}' not found", request.formula_name))?;
        
        if !config.is_active {
            return Err(anyhow!("Formula '{}' is disabled", request.formula_name));
        }
        
        // Get the executor
        let registered_formula = self.formulas.get(&request.formula_name)
            .ok_or_else(|| anyhow!("Formula '{}' executor not found", request.formula_name))?;
        
        // Validate parameters
        if let Err(e) = registered_formula.executor.validate_parameters(&request.parameters) {
            return Ok(FormulaExecutionResult {
                status: "error".to_string(),
                data: vec![],
                metadata: HashMap::new(),
                processing_time_ms: start_time.elapsed().as_millis() as u64,
                formula_name: request.formula_name.clone(),
                error_message: Some(format!("Parameter validation failed: {}", e)),
            });
        }
        
        // Execute the formula
        match registered_formula.executor.execute(&request.data, &request.parameters) {
            Ok(result_data) => {
                let processing_time = start_time.elapsed().as_millis() as u64;
                
                let mut metadata = HashMap::new();
                metadata.insert("formula_name".to_string(), Value::String(request.formula_name.clone()));
                metadata.insert("processing_time_ms".to_string(), Value::Number(processing_time.into()));
                metadata.insert("input_rows".to_string(), Value::Number(request.data.len().into()));
                metadata.insert("output_rows".to_string(), Value::Number(result_data.len().into()));
                
                Ok(FormulaExecutionResult {
                    status: "success".to_string(),
                    data: result_data,
                    metadata,
                    processing_time_ms: processing_time,
                    formula_name: request.formula_name,
                    error_message: None,
                })
            }
            Err(e) => {
                Ok(FormulaExecutionResult {
                    status: "error".to_string(),
                    data: vec![],
                    metadata: HashMap::new(),
                    processing_time_ms: start_time.elapsed().as_millis() as u64,
                    formula_name: request.formula_name,
                    error_message: Some(e.to_string()),
                })
            }
        }
    }

    // Get all registered formulas
    pub fn get_formulas(&self) -> Vec<FormulaConfig> {
        self.formula_configs.values().cloned().collect()
    }

    // Get active formulas only
    pub fn get_active_formulas(&self) -> Vec<FormulaConfig> {
        self.formula_configs.values()
            .filter(|config| config.is_active)
            .cloned()
            .collect()
    }

    // Get formula by name
    pub fn get_formula(&self, name: &str) -> Option<FormulaConfig> {
        self.formula_configs.get(name).cloned()
    }

    // Validate formula configuration
    fn validate_formula_config(&self, config: &FormulaConfig) -> Result<()> {
        if config.name.is_empty() {
            return Err(anyhow!("Formula name cannot be empty"));
        }
        
        if config.category.is_empty() {
            return Err(anyhow!("Formula category cannot be empty"));
        }
        
        if config.description.is_empty() {
            return Err(anyhow!("Formula description cannot be empty"));
        }
        
        // Validate parameters
        for param in &config.parameters {
            if param.name.is_empty() {
                return Err(anyhow!("Parameter name cannot be empty"));
            }
            
            if param.label.is_empty() {
                return Err(anyhow!("Parameter label cannot be empty"));
            }
            
            // Validate parameter type
            match param.r#type.as_str() {
                "text" | "number" | "checkbox" | "single-select" | "multi-select" => {},
                _ => return Err(anyhow!("Invalid parameter type: {}", param.r#type)),
            }
        }
        
        Ok(())
    }
}

// Built-in formula executors
pub struct UpperFormulaExecutor;

impl FormulaExecutor for UpperFormulaExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let input_column = parameters.get("text_column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing required parameter: text_column"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            if let Some(value) = row.get(input_column) {
                let upper_value = value.as_str()
                    .map(|s| s.to_uppercase())
                    .unwrap_or_else(|| value.to_string().to_uppercase());
                new_row.insert("upper_result".to_string(), Value::String(upper_value));
            }
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("text_column") {
            return Err(anyhow!("Missing required parameter: text_column"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["upper_result".to_string()]
    }
}

pub struct LowerFormulaExecutor;

impl FormulaExecutor for LowerFormulaExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let input_column = parameters.get("text_column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing required parameter: text_column"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            if let Some(value) = row.get(input_column) {
                let lower_value = value.as_str()
                    .map(|s| s.to_lowercase())
                    .unwrap_or_else(|| value.to_string().to_lowercase());
                new_row.insert("lower_result".to_string(), Value::String(lower_value));
            }
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("text_column") {
            return Err(anyhow!("Missing required parameter: text_column"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["lower_result".to_string()]
    }
}

pub struct AddFormulaExecutor;

impl FormulaExecutor for AddFormulaExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let number1_column = parameters.get("number1")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing required parameter: number1"))?;
        
        let number2_column = parameters.get("number2")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing required parameter: number2"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            
            let num1 = row.get(number1_column)
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            
            let num2 = row.get(number2_column)
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            
            let sum = num1 + num2;
            new_row.insert("add_result".to_string(), Value::Number(serde_json::Number::from_f64(sum).unwrap_or(serde_json::Number::from(0))));
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("number1") {
            return Err(anyhow!("Missing required parameter: number1"));
        }
        if !parameters.contains_key("number2") {
            return Err(anyhow!("Missing required parameter: number2"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["add_result".to_string()]
    }
}

// Initialize the dynamic formula engine with built-in formulas
pub fn initialize_dynamic_formula_engine() -> DynamicFormulaEngine {
    let mut engine = DynamicFormulaEngine::new();
    
    // Register built-in formulas
    let upper_config = FormulaConfig {
        id: Some("upper".to_string()),
        name: "UPPER".to_string(),
        category: "Text & String".to_string(),
        description: "Converts text to uppercase".to_string(),
        syntax: "UPPER [text_column]".to_string(),
        tip: Some("Select a text column to convert to uppercase".to_string()),
        parameters: vec![FormulaParameter {
            name: "text_column".to_string(),
            r#type: "single-select".to_string(),
            label: "Text Column".to_string(),
            description: "Column containing text to convert".to_string(),
            required: true,
            default_value: None,
            options: None,
            placeholder: None,
            validation: None,
        }],
        examples: vec!["UPPER [Name]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
    };
    
    let lower_config = FormulaConfig {
        id: Some("lower".to_string()),
        name: "LOWER".to_string(),
        category: "Text & String".to_string(),
        description: "Converts text to lowercase".to_string(),
        syntax: "LOWER [text_column]".to_string(),
        tip: Some("Select a text column to convert to lowercase".to_string()),
        parameters: vec![FormulaParameter {
            name: "text_column".to_string(),
            r#type: "single-select".to_string(),
            label: "Text Column".to_string(),
            description: "Column containing text to convert".to_string(),
            required: true,
            default_value: None,
            options: None,
            placeholder: None,
            validation: None,
        }],
        examples: vec!["LOWER [Name]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
    };
    
    let add_config = FormulaConfig {
        id: Some("add".to_string()),
        name: "ADD".to_string(),
        category: "Mathematical".to_string(),
        description: "Adds two numeric values together".to_string(),
        syntax: "ADD [number1 -> number2]".to_string(),
        tip: Some("Select two numeric columns to add together".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "number1".to_string(),
                r#type: "single-select".to_string(),
                label: "First Number".to_string(),
                description: "First numeric column to add".to_string(),
                required: true,
                default_value: None,
                options: None,
                placeholder: None,
                validation: None,
            },
            FormulaParameter {
                name: "number2".to_string(),
                r#type: "single-select".to_string(),
                label: "Second Number".to_string(),
                description: "Second numeric column to add".to_string(),
                required: true,
                default_value: None,
                options: None,
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["ADD [Price -> Tax]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
    };
    
    // Register the formulas
    if let Err(e) = engine.register_formula(upper_config, Box::new(UpperFormulaExecutor)) {
        error!("Failed to register UPPER formula: {}", e);
    }
    
    if let Err(e) = engine.register_formula(lower_config, Box::new(LowerFormulaExecutor)) {
        error!("Failed to register LOWER formula: {}", e);
    }
    
    if let Err(e) = engine.register_formula(add_config, Box::new(AddFormulaExecutor)) {
        error!("Failed to register ADD formula: {}", e);
    }
    
    engine
}

fn get_current_timestamp() -> String {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        .to_string()
}
