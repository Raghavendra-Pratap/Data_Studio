// Formula Executor Generator
// Generates Rust code templates for formula executors

use anyhow::Result;
use serde_json::Value;
use std::collections::HashMap;

pub struct FormulaExecutorGenerator;

impl FormulaExecutorGenerator {
    pub fn generate_executor_template(formula_name: &str, parameters: &[String]) -> String {
        let struct_name = format!("{}Executor", formula_name);
        let output_column = format!("{}_result", formula_name.to_lowercase());
        
        let parameter_validation = parameters.iter()
            .map(|param| {
                format!(
                    "        if !parameters.contains_key(\"{}\") {{\n            return Err(anyhow!(\"Missing required parameter: {}\"));\n        }}",
                    param, param
                )
            })
            .collect::<Vec<_>>()
            .join("\n");

        let parameter_extraction = parameters.iter()
            .map(|param| {
                format!(
                    "        let {}_param = parameters.get(\"{}\")\n            .and_then(|v| v.as_str())\n            .ok_or_else(|| anyhow!(\"Missing required parameter: {}\"))?;",
                    param, param, param
                )
            })
            .collect::<Vec<_>>()
            .join("\n\n");

        format!(
            r#"use anyhow::{{Result, anyhow}};
use serde_json::Value;
use std::collections::HashMap;

pub struct {};

impl FormulaExecutor for {} {{
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {{
{}

        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {{
            let mut new_row = row.clone();
            
            // TODO: Implement {} logic here
            // Access parameters: {}_param
            // Process data: row.get("column_name")
            // Example implementation:
            // let value = row.get({}_param).and_then(|v| v.as_str()).unwrap_or("");
            // let processed_value = process_value(value);
            // new_row.insert("{}".to_string(), Value::String(processed_value));
            
            new_row
        }}).collect();
        
        Ok(result)
    }}

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {{
{}
        Ok(())
    }}

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {{
        vec!["{}".to_string()]
    }}
}}"#,
            struct_name,
            struct_name,
            parameter_extraction,
            formula_name,
            parameters.first().unwrap_or(&"input".to_string()),
            parameters.first().unwrap_or(&"input".to_string()),
            output_column,
            parameter_validation,
            output_column
        )
    }

    pub fn generate_specific_executor(formula_name: &str) -> Result<String> {
        match formula_name {
            "TEXT_JOIN" => Ok(Self::generate_text_join_executor()),
            "IF" => Ok(Self::generate_if_executor()),
            "SUM" => Ok(Self::generate_sum_executor()),
            "COUNT" => Ok(Self::generate_count_executor()),
            "LOWER" => Ok(Self::generate_lower_executor()),
            "TRIM" => Ok(Self::generate_trim_executor()),
            "TEXT_LENGTH" => Ok(Self::generate_text_length_executor()),
            "PROPER_CASE" => Ok(Self::generate_proper_case_executor()),
            "SUBTRACT" => Ok(Self::generate_subtract_executor()),
            "MULTIPLY" => Ok(Self::generate_multiply_executor()),
            "DIVIDE" => Ok(Self::generate_divide_executor()),
            "UNIQUE_COUNT" => Ok(Self::generate_unique_count_executor()),
            "SUMIF" => Ok(Self::generate_sumif_executor()),
            "COUNTIF" => Ok(Self::generate_countif_executor()),
            "PIVOT" => Ok(Self::generate_pivot_executor()),
            "DEPIVOT" => Ok(Self::generate_depivot_executor()),
            "REMOVE_DUPLICATES" => Ok(Self::generate_remove_duplicates_executor()),
            "FILLNA" => Ok(Self::generate_fillna_executor()),
            _ => Ok(Self::generate_executor_template(formula_name, &["input".to_string()]))
        }
    }

    fn generate_text_join_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct TextJoinExecutor;

impl FormulaExecutor for TextJoinExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let delimiter = parameters.get("delimiter")
            .and_then(|v| v.as_str())
            .unwrap_or(",");
        
        let ignore_empty = parameters.get("ignore_empty")
            .and_then(|v| v.as_bool())
            .unwrap_or(true);
        
        let text_columns = parameters.get("text_values")
            .and_then(|v| v.as_array())
            .ok_or_else(|| anyhow!("Missing text_values parameter"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            
            let mut values = Vec::new();
            for col in text_columns {
                if let Some(col_name) = col.as_str() {
                    if let Some(value) = row.get(col_name) {
                        let str_value = value.as_str().unwrap_or(&value.to_string());
                        if !ignore_empty || !str_value.is_empty() {
                            values.push(str_value.to_string());
                        }
                    }
                }
            }
            
            let joined = values.join(delimiter);
            new_row.insert("text_join_result".to_string(), Value::String(joined));
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("delimiter") {
            return Err(anyhow!("Missing required parameter: delimiter"));
        }
        if !parameters.contains_key("ignore_empty") {
            return Err(anyhow!("Missing required parameter: ignore_empty"));
        }
        if !parameters.contains_key("text_values") {
            return Err(anyhow!("Missing required parameter: text_values"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["text_join_result".to_string()]
    }
}"#.to_string()
    }

    fn generate_if_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct IfExecutor;

impl FormulaExecutor for IfExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let condition_column = parameters.get("condition_column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing condition_column parameter"))?;
        
        let true_value = parameters.get("true_value")
            .and_then(|v| v.as_str())
            .unwrap_or("TRUE");
        
        let false_value = parameters.get("false_value")
            .and_then(|v| v.as_str())
            .unwrap_or("FALSE");
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            
            let condition = row.get(condition_column)
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
            
            let result_value = if condition { true_value } else { false_value };
            new_row.insert("if_result".to_string(), Value::String(result_value.to_string()));
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("condition_column") {
            return Err(anyhow!("Missing required parameter: condition_column"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["if_result".to_string()]
    }
}"#.to_string()
    }

    fn generate_sum_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct SumExecutor;

impl FormulaExecutor for SumExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let columns = parameters.get("columns")
            .and_then(|v| v.as_array())
            .ok_or_else(|| anyhow!("Missing columns parameter"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            
            let mut sum = 0.0;
            for col in columns {
                if let Some(col_name) = col.as_str() {
                    if let Some(value) = row.get(col_name) {
                        if let Some(num) = value.as_f64() {
                            sum += num;
                        }
                    }
                }
            }
            
            new_row.insert("sum_result".to_string(), Value::Number(serde_json::Number::from_f64(sum).unwrap_or(serde_json::Number::from(0))));
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("columns") {
            return Err(anyhow!("Missing required parameter: columns"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["sum_result".to_string()]
    }
}"#.to_string()
    }

    fn generate_count_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct CountExecutor;

impl FormulaExecutor for CountExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let column = parameters.get("column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing column parameter"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            
            let count = if row.get(column).is_some() { 1 } else { 0 };
            new_row.insert("count_result".to_string(), Value::Number(serde_json::Number::from(count)));
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("column") {
            return Err(anyhow!("Missing required parameter: column"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["count_result".to_string()]
    }
}"#.to_string()
    }

    fn generate_lower_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct LowerExecutor;

impl FormulaExecutor for LowerExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let column = parameters.get("column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing column parameter"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            
            if let Some(value) = row.get(column) {
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
        if !parameters.contains_key("column") {
            return Err(anyhow!("Missing required parameter: column"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["lower_result".to_string()]
    }
}"#.to_string()
    }

    fn generate_trim_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct TrimExecutor;

impl FormulaExecutor for TrimExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let column = parameters.get("column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing column parameter"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            
            if let Some(value) = row.get(column) {
                let trimmed = value.as_str()
                    .map(|s| s.trim().to_string())
                    .unwrap_or_else(|| value.to_string().trim().to_string());
                new_row.insert("trim_result".to_string(), Value::String(trimmed));
            }
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("column") {
            return Err(anyhow!("Missing required parameter: column"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["trim_result".to_string()]
    }
}"#.to_string()
    }

    fn generate_text_length_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct TextLengthExecutor;

impl FormulaExecutor for TextLengthExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let column = parameters.get("column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing column parameter"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            
            if let Some(value) = row.get(column) {
                let length = value.as_str()
                    .map(|s| s.len())
                    .unwrap_or_else(|| value.to_string().len());
                new_row.insert("text_length_result".to_string(), Value::Number(serde_json::Number::from(length)));
            }
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("column") {
            return Err(anyhow!("Missing required parameter: column"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["text_length_result".to_string()]
    }
}"#.to_string()
    }

    fn generate_proper_case_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct ProperCaseExecutor;

impl FormulaExecutor for ProperCaseExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let column = parameters.get("column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing column parameter"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            
            if let Some(value) = row.get(column) {
                let proper_case = value.as_str()
                    .map(|s| Self::to_proper_case(s))
                    .unwrap_or_else(|| Self::to_proper_case(&value.to_string()));
                new_row.insert("proper_case_result".to_string(), Value::String(proper_case));
            }
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("column") {
            return Err(anyhow!("Missing required parameter: column"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["proper_case_result".to_string()]
    }

    fn to_proper_case(s: &str) -> String {
        s.split_whitespace()
            .map(|word| {
                let mut chars = word.chars();
                match chars.next() {
                    None => String::new(),
                    Some(first) => first.to_uppercase().collect::<String>() + &chars.as_str().to_lowercase(),
                }
            })
            .collect::<Vec<_>>()
            .join(" ")
    }
}"#.to_string()
    }

    fn generate_subtract_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct SubtractExecutor;

impl FormulaExecutor for SubtractExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let column1 = parameters.get("column1")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing column1 parameter"))?;
        
        let column2 = parameters.get("column2")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing column2 parameter"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            
            let num1 = row.get(column1)
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            
            let num2 = row.get(column2)
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            
            let difference = num1 - num2;
            new_row.insert("subtract_result".to_string(), Value::Number(serde_json::Number::from_f64(difference).unwrap_or(serde_json::Number::from(0))));
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("column1") {
            return Err(anyhow!("Missing required parameter: column1"));
        }
        if !parameters.contains_key("column2") {
            return Err(anyhow!("Missing required parameter: column2"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["subtract_result".to_string()]
    }
}"#.to_string()
    }

    fn generate_multiply_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct MultiplyExecutor;

impl FormulaExecutor for MultiplyExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let column1 = parameters.get("column1")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing column1 parameter"))?;
        
        let column2 = parameters.get("column2")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing column2 parameter"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            
            let num1 = row.get(column1)
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            
            let num2 = row.get(column2)
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            
            let product = num1 * num2;
            new_row.insert("multiply_result".to_string(), Value::Number(serde_json::Number::from_f64(product).unwrap_or(serde_json::Number::from(0))));
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("column1") {
            return Err(anyhow!("Missing required parameter: column1"));
        }
        if !parameters.contains_key("column2") {
            return Err(anyhow!("Missing required parameter: column2"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["multiply_result".to_string()]
    }
}"#.to_string()
    }

    fn generate_divide_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct DivideExecutor;

impl FormulaExecutor for DivideExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let column1 = parameters.get("column1")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing column1 parameter"))?;
        
        let column2 = parameters.get("column2")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing column2 parameter"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            
            let num1 = row.get(column1)
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            
            let num2 = row.get(column2)
                .and_then(|v| v.as_f64())
                .unwrap_or(1.0);
            
            let quotient = if num2 != 0.0 { num1 / num2 } else { 0.0 };
            new_row.insert("divide_result".to_string(), Value::Number(serde_json::Number::from_f64(quotient).unwrap_or(serde_json::Number::from(0))));
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("column1") {
            return Err(anyhow!("Missing required parameter: column1"));
        }
        if !parameters.contains_key("column2") {
            return Err(anyhow!("Missing required parameter: column2"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["divide_result".to_string()]
    }
}"#.to_string()
    }

    fn generate_unique_count_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::{HashMap, HashSet};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

pub struct UniqueCountExecutor;

impl FormulaExecutor for UniqueCountExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let column = parameters.get("column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing column parameter"))?;
        
        // Collect unique values
        let mut unique_values = HashSet::new();
        for row in data {
            if let Some(value) = row.get(column) {
                let mut hasher = DefaultHasher::new();
                value.hash(&mut hasher);
                unique_values.insert(hasher.finish());
            }
        }
        
        let unique_count = unique_values.len();
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            new_row.insert("unique_count_result".to_string(), Value::Number(serde_json::Number::from(unique_count)));
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("column") {
            return Err(anyhow!("Missing required parameter: column"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["unique_count_result".to_string()]
    }
}"#.to_string()
    }

    fn generate_sumif_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct SumIfExecutor;

impl FormulaExecutor for SumIfExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let sum_column = parameters.get("sum_column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing sum_column parameter"))?;
        
        let condition_column = parameters.get("condition_column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing condition_column parameter"))?;
        
        let condition_value = parameters.get("condition_value")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing condition_value parameter"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            
            let condition_met = row.get(condition_column)
                .and_then(|v| v.as_str())
                .map(|v| v == condition_value)
                .unwrap_or(false);
            
            let sum_value = if condition_met {
                row.get(sum_column)
                    .and_then(|v| v.as_f64())
                    .unwrap_or(0.0)
            } else {
                0.0
            };
            
            new_row.insert("sumif_result".to_string(), Value::Number(serde_json::Number::from_f64(sum_value).unwrap_or(serde_json::Number::from(0))));
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("sum_column") {
            return Err(anyhow!("Missing required parameter: sum_column"));
        }
        if !parameters.contains_key("condition_column") {
            return Err(anyhow!("Missing required parameter: condition_column"));
        }
        if !parameters.contains_key("condition_value") {
            return Err(anyhow!("Missing required parameter: condition_value"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["sumif_result".to_string()]
    }
}"#.to_string()
    }

    fn generate_countif_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct CountIfExecutor;

impl FormulaExecutor for CountIfExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let condition_column = parameters.get("condition_column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing condition_column parameter"))?;
        
        let condition_value = parameters.get("condition_value")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing condition_value parameter"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            
            let condition_met = row.get(condition_column)
                .and_then(|v| v.as_str())
                .map(|v| v == condition_value)
                .unwrap_or(false);
            
            let count = if condition_met { 1 } else { 0 };
            new_row.insert("countif_result".to_string(), Value::Number(serde_json::Number::from(count)));
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("condition_column") {
            return Err(anyhow!("Missing required parameter: condition_column"));
        }
        if !parameters.contains_key("condition_value") {
            return Err(anyhow!("Missing required parameter: condition_value"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["countif_result".to_string()]
    }
}"#.to_string()
    }

    fn generate_pivot_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct PivotExecutor;

impl FormulaExecutor for PivotExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let index_column = parameters.get("index_column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing index_column parameter"))?;
        
        let value_column = parameters.get("value_column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing value_column parameter"))?;
        
        // Group by index column and aggregate values
        let mut grouped: HashMap<String, Vec<f64>> = HashMap::new();
        
        for row in data {
            if let (Some(index_val), Some(value_val)) = (row.get(index_column), row.get(value_column)) {
                let index_str = index_val.as_str().unwrap_or(&index_val.to_string());
                if let Some(num_val) = value_val.as_f64() {
                    grouped.entry(index_str.to_string()).or_insert_with(Vec::new).push(num_val);
                }
            }
        }
        
        // Create pivot result
        let mut result = Vec::new();
        for (index, values) in grouped {
            let mut new_row = HashMap::new();
            new_row.insert("index".to_string(), Value::String(index));
            new_row.insert("count".to_string(), Value::Number(serde_json::Number::from(values.len())));
            new_row.insert("sum".to_string(), Value::Number(serde_json::Number::from_f64(values.iter().sum()).unwrap_or(serde_json::Number::from(0))));
            new_row.insert("avg".to_string(), Value::Number(serde_json::Number::from_f64(values.iter().sum::<f64>() / values.len() as f64).unwrap_or(serde_json::Number::from(0))));
            result.push(new_row);
        }
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("index_column") {
            return Err(anyhow!("Missing required parameter: index_column"));
        }
        if !parameters.contains_key("value_column") {
            return Err(anyhow!("Missing required parameter: value_column"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["index".to_string(), "count".to_string(), "sum".to_string(), "avg".to_string()]
    }
}"#.to_string()
    }

    fn generate_depivot_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct DepivotExecutor;

impl FormulaExecutor for DepivotExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let id_columns = parameters.get("id_columns")
            .and_then(|v| v.as_array())
            .ok_or_else(|| anyhow!("Missing id_columns parameter"))?;
        
        let mut result = Vec::new();
        
        for row in data {
            // Get ID values
            let mut id_values = HashMap::new();
            for id_col in id_columns {
                if let Some(col_name) = id_col.as_str() {
                    if let Some(value) = row.get(col_name) {
                        id_values.insert(col_name.to_string(), value.clone());
                    }
                }
            }
            
            // Create depivoted rows for each non-ID column
            for (key, value) in row {
                if !id_columns.iter().any(|col| col.as_str() == Some(&key)) {
                    let mut new_row = id_values.clone();
                    new_row.insert("variable".to_string(), Value::String(key));
                    new_row.insert("value".to_string(), value);
                    result.push(new_row);
                }
            }
        }
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("id_columns") {
            return Err(anyhow!("Missing required parameter: id_columns"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["variable".to_string(), "value".to_string()]
    }
}"#.to_string()
    }

    fn generate_remove_duplicates_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::{HashMap, HashSet};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

pub struct RemoveDuplicatesExecutor;

impl FormulaExecutor for RemoveDuplicatesExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let columns = parameters.get("columns")
            .and_then(|v| v.as_array())
            .ok_or_else(|| anyhow!("Missing columns parameter"))?;
        
        let mut seen = HashSet::new();
        let mut result = Vec::new();
        
        for row in data {
            // Create a key from the specified columns
            let mut key_parts = Vec::new();
            for col in columns {
                if let Some(col_name) = col.as_str() {
                    if let Some(value) = row.get(col_name) {
                        let mut hasher = DefaultHasher::new();
                        value.hash(&mut hasher);
                        key_parts.push(hasher.finish());
                    }
                }
            }
            
            let key = key_parts.iter().fold(0, |acc, &x| acc ^ x);
            
            if seen.insert(key) {
                result.push(row.clone());
            }
        }
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("columns") {
            return Err(anyhow!("Missing required parameter: columns"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec![] // Output columns are the same as input
    }
}"#.to_string()
    }

    fn generate_fillna_executor() -> String {
        r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct FillNaExecutor;

impl FormulaExecutor for FillNaExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let column = parameters.get("column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing column parameter"))?;
        
        let fill_value = parameters.get("value")
            .ok_or_else(|| anyhow!("Missing value parameter"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            
            if let Some(value) = row.get(column) {
                // Check if value is null/empty
                let is_null = match value {
                    Value::Null => true,
                    Value::String(s) => s.is_empty(),
                    Value::Number(n) => n.as_f64().map(|f| f.is_nan()).unwrap_or(false),
                    _ => false,
                };
                
                if is_null {
                    new_row.insert(column.to_string(), fill_value.clone());
                }
            }
            
            new_row
        }).collect();
        
        Ok(result)
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        if !parameters.contains_key("column") {
            return Err(anyhow!("Missing required parameter: column"));
        }
        if !parameters.contains_key("value") {
            return Err(anyhow!("Missing required parameter: value"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec![] // Output columns are the same as input
    }
}"#.to_string()
    }
}
