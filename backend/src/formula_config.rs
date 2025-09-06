// Formula Configuration API endpoints
// Handles CRUD operations for formula definitions

use actix_web::{web, HttpResponse, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormulaParameter {
    pub name: String,
    pub r#type: String, // text, number, checkbox, single-select, multi-select
    pub label: String,
    pub description: String,
    pub required: bool,
    pub default_value: Option<serde_json::Value>,
    pub options: Option<Vec<String>>,
    pub placeholder: Option<String>,
    pub validation: Option<ParameterValidation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParameterValidation {
    pub min: Option<f64>,
    pub max: Option<f64>,
    pub pattern: Option<String>,
    pub custom: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormulaConfig {
    pub id: Option<String>,
    pub name: String,
    pub category: String,
    pub description: String,
    pub syntax: String,
    pub tip: Option<String>,
    pub parameters: Vec<FormulaParameter>,
    pub examples: Vec<String>,
    pub is_active: bool,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    // New toggle switches
    pub is_enabled: Option<bool>, // Enable/disable formula entirely
    pub show_in_engine: Option<bool>, // Show/hide in formula engine page
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FormulaConfigRequest {
    pub formulas: Vec<FormulaConfig>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FormulaConfigResponse {
    pub success: bool,
    pub message: String,
    pub formulas: Option<Vec<FormulaConfig>>,
    pub errors: Option<Vec<String>>,
}

// In-memory storage for formula configurations
// In production, this would be stored in a database
lazy_static::lazy_static! {
    static ref FORMULA_CONFIGS: Mutex<HashMap<String, FormulaConfig>> = Mutex::new(HashMap::new());
}

// Initialize with default formulas
pub fn initialize_default_formulas() {
    let mut configs = FORMULA_CONFIGS.lock().unwrap();
    
    // TEXT_JOIN formula
    let text_join = FormulaConfig {
        id: Some("text_join".to_string()),
        name: "TEXT_JOIN".to_string(),
        category: "Text & String".to_string(),
        description: "Joins text values together, with optional delimiter and empty handling.".to_string(),
        syntax: "TEXT_JOIN [delimiter -> ignore_empty -> text1 -> text2 -> ...]".to_string(),
        tip: Some("Add delimiter (e.g., \", \"), then ignore_empty (TRUE/FALSE), then click text columns to join".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "delimiter".to_string(),
                r#type: "text".to_string(),
                label: "Delimiter".to_string(),
                description: "Character(s) placed between joined texts".to_string(),
                required: true,
                default_value: Some(serde_json::Value::String(", ".to_string())),
                options: None,
                placeholder: Some(", ".to_string()),
                validation: None,
            },
            FormulaParameter {
                name: "ignore_empty".to_string(),
                r#type: "checkbox".to_string(),
                label: "Ignore Empty".to_string(),
                description: "Skip blank values when joining".to_string(),
                required: true,
                default_value: Some(serde_json::Value::Bool(false)),
                options: None,
                placeholder: None,
                validation: None,
            },
            FormulaParameter {
                name: "text_columns".to_string(),
                r#type: "multi-select".to_string(),
                label: "Text Columns".to_string(),
                description: "Columns to join together".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["TEXT_JOIN [\", \" -> TRUE -> City -> State -> Country]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // IF formula
    let if_formula = FormulaConfig {
        id: Some("if_conditional".to_string()),
        name: "IF".to_string(),
        category: "Conditional".to_string(),
        description: "Conditional logic with true/false values.".to_string(),
        syntax: "IF [condition_column -> condition_value -> true_value -> false_value]".to_string(),
        tip: Some("Click condition column, add comparison value, then true/false values".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "condition_column".to_string(),
                r#type: "single-select".to_string(),
                label: "Condition Column".to_string(),
                description: "Column to check condition".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
            FormulaParameter {
                name: "condition_value".to_string(),
                r#type: "text".to_string(),
                label: "Compare Value".to_string(),
                description: "Value to compare against".to_string(),
                required: true,
                default_value: None,
                options: None,
                placeholder: Some("Value to compare".to_string()),
                validation: None,
            },
            FormulaParameter {
                name: "true_value".to_string(),
                r#type: "text".to_string(),
                label: "True Value".to_string(),
                description: "Value if condition is true".to_string(),
                required: true,
                default_value: None,
                options: None,
                placeholder: Some("Value if true".to_string()),
                validation: None,
            },
            FormulaParameter {
                name: "false_value".to_string(),
                r#type: "text".to_string(),
                label: "False Value".to_string(),
                description: "Value if condition is false".to_string(),
                required: true,
                default_value: None,
                options: None,
                placeholder: Some("Value if false".to_string()),
                validation: None,
            },
        ],
        examples: vec!["IF [Status -> \"Active\" -> \"Valid\" -> \"Invalid\"]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // ADD formula
    let add_formula = FormulaConfig {
        id: Some("add".to_string()),
        name: "ADD".to_string(),
        category: "Mathematical".to_string(),
        description: "Adds two numeric values together.".to_string(),
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
                options: Some(vec![]),
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
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["ADD [Price -> Tax]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // UPPER formula
    let upper_formula = FormulaConfig {
        id: Some("upper".to_string()),
        name: "UPPER".to_string(),
        category: "Text & String".to_string(),
        description: "Converts text to uppercase.".to_string(),
        syntax: "UPPER [text_column]".to_string(),
        tip: Some("Select a text column to convert to uppercase".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "text_column".to_string(),
                r#type: "single-select".to_string(),
                label: "Text Column".to_string(),
                description: "Column containing text to convert".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["UPPER [Name]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // SUM formula
    let sum_formula = FormulaConfig {
        id: Some("sum".to_string()),
        name: "SUM".to_string(),
        category: "Mathematical".to_string(),
        description: "Calculates the sum of numeric values in a column.".to_string(),
        syntax: "SUM [numeric_column]".to_string(),
        tip: Some("Select a numeric column to calculate the sum".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "numeric_column".to_string(),
                r#type: "single-select".to_string(),
                label: "Numeric Column".to_string(),
                description: "Column containing numbers to sum".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["SUM [Sales]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // COUNT formula
    let count_formula = FormulaConfig {
        id: Some("count".to_string()),
        name: "COUNT".to_string(),
        category: "Statistical".to_string(),
        description: "Counts the number of non-empty values in a column.".to_string(),
        syntax: "COUNT [column]".to_string(),
        tip: Some("Select any column to count non-empty values".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "column".to_string(),
                r#type: "single-select".to_string(),
                label: "Column to Count".to_string(),
                description: "Column to count non-empty values".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["COUNT [ID]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // LOWER formula
    let lower_formula = FormulaConfig {
        id: Some("lower".to_string()),
        name: "LOWER".to_string(),
        category: "Text & String".to_string(),
        description: "Converts text to lowercase.".to_string(),
        syntax: "LOWER [text_column]".to_string(),
        tip: Some("Select a text column to convert to lowercase".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "text_column".to_string(),
                r#type: "single-select".to_string(),
                label: "Text Column".to_string(),
                description: "Column containing text to convert".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["LOWER [Name]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // TRIM formula
    let trim_formula = FormulaConfig {
        id: Some("trim".to_string()),
        name: "TRIM".to_string(),
        category: "Text & String".to_string(),
        description: "Removes extra spaces from text, leaving single spaces between words.".to_string(),
        syntax: "TRIM [text_column]".to_string(),
        tip: Some("Select a text column to clean up extra spaces".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "text_column".to_string(),
                r#type: "single-select".to_string(),
                label: "Text Column".to_string(),
                description: "Column containing text to clean".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["TRIM [Comments]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // TEXT_LENGTH formula
    let text_length_formula = FormulaConfig {
        id: Some("text_length".to_string()),
        name: "TEXT_LENGTH".to_string(),
        category: "Text & String".to_string(),
        description: "Returns the length of a text string.".to_string(),
        syntax: "TEXT_LENGTH [text_column]".to_string(),
        tip: Some("Select a text column to measure its length".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "text_column".to_string(),
                r#type: "single-select".to_string(),
                label: "Text Column".to_string(),
                description: "Column containing text to measure".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["TEXT_LENGTH [Name]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // PROPER_CASE formula
    let proper_case_formula = FormulaConfig {
        id: Some("proper_case".to_string()),
        name: "PROPER_CASE".to_string(),
        category: "Text & String".to_string(),
        description: "Converts text to proper case (capitalize each word).".to_string(),
        syntax: "PROPER_CASE [text_column]".to_string(),
        tip: Some("Select a text column to convert to proper case".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "text_column".to_string(),
                r#type: "single-select".to_string(),
                label: "Text Column".to_string(),
                description: "Column containing text to convert".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["PROPER_CASE [Name]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // SUBTRACT formula
    let subtract_formula = FormulaConfig {
        id: Some("subtract".to_string()),
        name: "SUBTRACT".to_string(),
        category: "Mathematical".to_string(),
        description: "Subtracts one number from another.".to_string(),
        syntax: "SUBTRACT [number1 -> number2]".to_string(),
        tip: Some("Select two numeric columns to subtract".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "number1".to_string(),
                r#type: "single-select".to_string(),
                label: "First Number".to_string(),
                description: "First numeric column".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
            FormulaParameter {
                name: "number2".to_string(),
                r#type: "single-select".to_string(),
                label: "Second Number".to_string(),
                description: "Second numeric column to subtract".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["SUBTRACT [Total -> Discount]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // MULTIPLY formula
    let multiply_formula = FormulaConfig {
        id: Some("multiply".to_string()),
        name: "MULTIPLY".to_string(),
        category: "Mathematical".to_string(),
        description: "Multiplies two numbers.".to_string(),
        syntax: "MULTIPLY [number1 -> number2]".to_string(),
        tip: Some("Select two numeric columns to multiply".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "number1".to_string(),
                r#type: "single-select".to_string(),
                label: "First Number".to_string(),
                description: "First numeric column".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
            FormulaParameter {
                name: "number2".to_string(),
                r#type: "single-select".to_string(),
                label: "Second Number".to_string(),
                description: "Second numeric column to multiply".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["MULTIPLY [Price -> Quantity]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // DIVIDE formula
    let divide_formula = FormulaConfig {
        id: Some("divide".to_string()),
        name: "DIVIDE".to_string(),
        category: "Mathematical".to_string(),
        description: "Divides one number by another.".to_string(),
        syntax: "DIVIDE [number1 -> number2]".to_string(),
        tip: Some("Select two numeric columns to divide".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "number1".to_string(),
                r#type: "single-select".to_string(),
                label: "First Number".to_string(),
                description: "First numeric column (dividend)".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
            FormulaParameter {
                name: "number2".to_string(),
                r#type: "single-select".to_string(),
                label: "Second Number".to_string(),
                description: "Second numeric column (divisor)".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["DIVIDE [Total -> Quantity]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // UNIQUE_COUNT formula
    let unique_count_formula = FormulaConfig {
        id: Some("unique_count".to_string()),
        name: "UNIQUE_COUNT".to_string(),
        category: "Statistical".to_string(),
        description: "Counts unique values in a column.".to_string(),
        syntax: "UNIQUE_COUNT [column]".to_string(),
        tip: Some("Select a column to count unique values".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "column".to_string(),
                r#type: "single-select".to_string(),
                label: "Column to Count".to_string(),
                description: "Column to count unique values".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["UNIQUE_COUNT [Customer_ID]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // SUMIF formula
    let sumif_formula = FormulaConfig {
        id: Some("sumif".to_string()),
        name: "SUMIF".to_string(),
        category: "Conditional".to_string(),
        description: "Sums values when condition is met.".to_string(),
        syntax: "SUMIF [condition_column -> condition_value -> target_column]".to_string(),
        tip: Some("Select condition column, enter value, then target column to sum".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "condition_column".to_string(),
                r#type: "single-select".to_string(),
                label: "Condition Column".to_string(),
                description: "Column to check condition".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
            FormulaParameter {
                name: "condition_value".to_string(),
                r#type: "text".to_string(),
                label: "Condition Value".to_string(),
                description: "Value to compare against".to_string(),
                required: true,
                default_value: None,
                options: None,
                placeholder: Some("Enter comparison value".to_string()),
                validation: None,
            },
            FormulaParameter {
                name: "target_column".to_string(),
                r#type: "single-select".to_string(),
                label: "Target Column".to_string(),
                description: "Column to sum when condition is met".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["SUMIF [Status -> Active -> Amount]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // COUNTIF formula
    let countif_formula = FormulaConfig {
        id: Some("countif".to_string()),
        name: "COUNTIF".to_string(),
        category: "Conditional".to_string(),
        description: "Counts rows when condition is met.".to_string(),
        syntax: "COUNTIF [condition_column -> condition_value]".to_string(),
        tip: Some("Select condition column and enter value to count matching rows".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "condition_column".to_string(),
                r#type: "single-select".to_string(),
                label: "Condition Column".to_string(),
                description: "Column to check condition".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
            FormulaParameter {
                name: "condition_value".to_string(),
                r#type: "text".to_string(),
                label: "Condition Value".to_string(),
                description: "Value to compare against".to_string(),
                required: true,
                default_value: None,
                options: None,
                placeholder: Some("Enter comparison value".to_string()),
                validation: None,
            },
        ],
        examples: vec!["COUNTIF [Status -> Active]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // PIVOT formula
    let pivot_formula = FormulaConfig {
        id: Some("pivot".to_string()),
        name: "PIVOT".to_string(),
        category: "Data Transformation".to_string(),
        description: "Reorganizes data by categories.".to_string(),
        syntax: "PIVOT [index_column -> value_column]".to_string(),
        tip: Some("Select index column and value column to pivot data".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "index_column".to_string(),
                r#type: "single-select".to_string(),
                label: "Index Column".to_string(),
                description: "Column to use as index".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
            FormulaParameter {
                name: "value_column".to_string(),
                r#type: "single-select".to_string(),
                label: "Value Column".to_string(),
                description: "Column to use as values".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["PIVOT [Category -> Sales]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // DEPIVOT formula
    let depivot_formula = FormulaConfig {
        id: Some("depivot".to_string()),
        name: "DEPIVOT".to_string(),
        category: "Data Transformation".to_string(),
        description: "Converts wide data to long format.".to_string(),
        syntax: "DEPIVOT [id_columns]".to_string(),
        tip: Some("Select columns to keep as identifiers when unpivoting".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "id_columns".to_string(),
                r#type: "multi-select".to_string(),
                label: "ID Columns".to_string(),
                description: "Columns to keep as identifiers".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["DEPIVOT [ID -> Name]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // REMOVE_DUPLICATES formula
    let remove_duplicates_formula = FormulaConfig {
        id: Some("remove_duplicates".to_string()),
        name: "REMOVE_DUPLICATES".to_string(),
        category: "Data Cleaning".to_string(),
        description: "Removes duplicate rows based on selected columns.".to_string(),
        syntax: "REMOVE_DUPLICATES [columns]".to_string(),
        tip: Some("Select columns to check for duplicates".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "columns".to_string(),
                r#type: "multi-select".to_string(),
                label: "Columns to Check".to_string(),
                description: "Columns to check for duplicates".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
        ],
        examples: vec!["REMOVE_DUPLICATES [Email]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // FILLNA formula
    let fillna_formula = FormulaConfig {
        id: Some("fillna".to_string()),
        name: "FILLNA".to_string(),
        category: "Data Cleaning".to_string(),
        description: "Fills null values with specified value.".to_string(),
        syntax: "FILLNA [column -> value]".to_string(),
        tip: Some("Select column and enter value to fill null values".to_string()),
        parameters: vec![
            FormulaParameter {
                name: "column".to_string(),
                r#type: "single-select".to_string(),
                label: "Column to Fill".to_string(),
                description: "Column to fill null values".to_string(),
                required: true,
                default_value: None,
                options: Some(vec![]),
                placeholder: None,
                validation: None,
            },
            FormulaParameter {
                name: "value".to_string(),
                r#type: "text".to_string(),
                label: "Fill Value".to_string(),
                description: "Value to use for null values".to_string(),
                required: true,
                default_value: None,
                options: None,
                placeholder: Some("Enter fill value".to_string()),
                validation: None,
            },
        ],
        examples: vec!["FILLNA [Phone -> N/A]".to_string()],
        is_active: true,
        created_at: Some(get_current_timestamp()),
        updated_at: Some(get_current_timestamp()),
        is_enabled: Some(true),
        show_in_engine: Some(true),
    };

    // Insert all formulas
    configs.insert("text_join".to_string(), text_join);
    configs.insert("if_conditional".to_string(), if_formula);
    configs.insert("add".to_string(), add_formula);
    configs.insert("upper".to_string(), upper_formula);
    configs.insert("sum".to_string(), sum_formula);
    configs.insert("count".to_string(), count_formula);
    configs.insert("lower".to_string(), lower_formula);
    configs.insert("trim".to_string(), trim_formula);
    configs.insert("text_length".to_string(), text_length_formula);
    configs.insert("proper_case".to_string(), proper_case_formula);
    configs.insert("subtract".to_string(), subtract_formula);
    configs.insert("multiply".to_string(), multiply_formula);
    configs.insert("divide".to_string(), divide_formula);
    configs.insert("unique_count".to_string(), unique_count_formula);
    configs.insert("sumif".to_string(), sumif_formula);
    configs.insert("countif".to_string(), countif_formula);
    configs.insert("pivot".to_string(), pivot_formula);
    configs.insert("depivot".to_string(), depivot_formula);
    configs.insert("remove_duplicates".to_string(), remove_duplicates_formula);
    configs.insert("fillna".to_string(), fillna_formula);
}

fn get_current_timestamp() -> String {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        .to_string()
}

// Get all formula configurations
pub async fn get_formula_configs() -> Result<HttpResponse> {
    let configs = FORMULA_CONFIGS.lock().unwrap();
    let formulas: Vec<FormulaConfig> = configs.values().cloned().collect();
    
    let response = FormulaConfigResponse {
        success: true,
        message: "Formula configurations retrieved successfully".to_string(),
        formulas: Some(formulas),
        errors: None,
    };
    
    Ok(HttpResponse::Ok().json(response))
}

// Sync formula configurations from frontend
pub async fn sync_formula_configs(req: web::Json<FormulaConfigRequest>) -> Result<HttpResponse> {
    let mut configs = FORMULA_CONFIGS.lock().unwrap();
    let mut errors = Vec::new();
    
    // Validate and store each formula
    for formula in &req.formulas {
        // Basic validation
        if formula.name.is_empty() {
            errors.push(format!("Formula '{}' has empty name", formula.name));
            continue;
        }
        
        if formula.category.is_empty() {
            errors.push(format!("Formula '{}' has empty category", formula.name));
            continue;
        }
        
        if formula.description.is_empty() {
            errors.push(format!("Formula '{}' has empty description", formula.name));
            continue;
        }
        
        // Validate parameters
        for (index, param) in formula.parameters.iter().enumerate() {
            if param.name.is_empty() {
                errors.push(format!("Formula '{}' parameter {} has empty name", formula.name, index + 1));
            }
            
            if param.label.is_empty() {
                errors.push(format!("Formula '{}' parameter {} has empty label", formula.name, index + 1));
            }
            
            if param.description.is_empty() {
                errors.push(format!("Formula '{}' parameter {} has empty description", formula.name, index + 1));
            }
        }
        
        // Generate ID if not provided
        let formula_id = formula.id.clone().unwrap_or_else(|| {
            format!("formula_{}", SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs())
        });
        
        // Create formula with generated ID and timestamps
        let mut formula_with_id = formula.clone();
        formula_with_id.id = Some(formula_id.clone());
        formula_with_id.created_at = formula.created_at.clone().or_else(|| Some(get_current_timestamp()));
        formula_with_id.updated_at = Some(get_current_timestamp());
        
        configs.insert(formula_id, formula_with_id);
    }
    
    let response = if errors.is_empty() {
        FormulaConfigResponse {
            success: true,
            message: "Formula configurations synced successfully".to_string(),
            formulas: Some(configs.values().cloned().collect()),
            errors: None,
        }
    } else {
        FormulaConfigResponse {
            success: false,
            message: "Some formula configurations had validation errors".to_string(),
            formulas: Some(configs.values().cloned().collect()),
            errors: Some(errors),
        }
    };
    
    Ok(HttpResponse::Ok().json(response))
}

// Get a specific formula configuration
pub async fn get_formula_config(path: web::Path<String>) -> Result<HttpResponse> {
    let configs = FORMULA_CONFIGS.lock().unwrap();
    let formula_id = path.into_inner();
    
    match configs.get(&formula_id) {
        Some(formula) => {
            let response = FormulaConfigResponse {
                success: true,
                message: "Formula configuration retrieved successfully".to_string(),
                formulas: Some(vec![formula.clone()]),
                errors: None,
            };
            Ok(HttpResponse::Ok().json(response))
        }
        None => {
            let response = FormulaConfigResponse {
                success: false,
                message: "Formula configuration not found".to_string(),
                formulas: None,
                errors: Some(vec!["Formula not found".to_string()]),
            };
            Ok(HttpResponse::NotFound().json(response))
        }
    }
}

// Delete a formula configuration
pub async fn delete_formula_config(path: web::Path<String>) -> Result<HttpResponse> {
    let mut configs = FORMULA_CONFIGS.lock().unwrap();
    let formula_id = path.into_inner();
    
    match configs.remove(&formula_id) {
        Some(_) => {
            let response = FormulaConfigResponse {
                success: true,
                message: "Formula configuration deleted successfully".to_string(),
                formulas: None,
                errors: None,
            };
            Ok(HttpResponse::Ok().json(response))
        }
        None => {
            let response = FormulaConfigResponse {
                success: false,
                message: "Formula configuration not found".to_string(),
                formulas: None,
                errors: Some(vec!["Formula not found".to_string()]),
            };
            Ok(HttpResponse::NotFound().json(response))
        }
    }
}

// Configure routes
pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/formulas")
            .route("/config", web::get().to(get_formula_configs))
            .route("/config", web::post().to(sync_formula_configs))
            .route("/config/{id}", web::get().to(get_formula_config))
            .route("/config/{id}", web::delete().to(delete_formula_config))
    );
}
