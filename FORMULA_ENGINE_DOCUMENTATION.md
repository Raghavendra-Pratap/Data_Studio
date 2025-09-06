# Formula Engine Documentation 🧮

## Overview

The Unified Data Studio Formula Engine is a comprehensive, modular system that provides 20+ built-in formulas with full backend implementation, real-time code editing, and template generation capabilities.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Formula Engine Architecture              │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React)           │  Backend (Rust)              │
│  ┌─────────────────────────┐ │  ┌─────────────────────────┐ │
│  │ Formula Configuration   │ │  │ Dynamic Formula Engine  │ │
│  │ - Visual Status         │ │  │ - Formula Registration  │ │
│  │ - Code Editor           │ │  │ - Parameter Validation  │ │
│  │ - Template Generation   │ │  │ - Execution Engine      │ │
│  └─────────────────────────┘ │  └─────────────────────────┘ │
│  ┌─────────────────────────┐ │  ┌─────────────────────────┐ │
│  │ Playground Integration  │ │  │ Formula Code Manager    │ │
│  │ - Real-time Preview     │ │  │ - Code Storage          │ │
│  │ - Parameter Collection  │ │  │ - Compilation Testing   │ │
│  │ - Result Display        │ │  │ - Template Generation   │ │
│  └─────────────────────────┘ │  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Key Features

### 1. **Modular Design**
- Each formula is a separate Rust executor
- Dynamic registration and execution
- Easy to add new formulas
- Independent parameter validation

### 2. **Real-time Code Editing**
- Full-featured Rust code editor
- Syntax highlighting and validation
- Real-time compilation testing
- Download/upload functionality

### 3. **Template Generation**
- Auto-generated code templates for all formulas
- Parameter-specific implementations
- Best practices built-in
- One-click setup

### 4. **Visual Status Tracking**
- Implementation status indicators
- Compilation status
- Last updated timestamps
- Error reporting

## 📊 Available Formulas

### Text Functions
| Formula | Description | Parameters | Output |
|---------|-------------|------------|---------|
| `TEXT_JOIN` | Join text with delimiters | delimiter, ignore_empty, text_values | joined_text |
| `UPPER` | Convert to uppercase | column | uppercase_text |
| `LOWER` | Convert to lowercase | column | lowercase_text |
| `TRIM` | Remove extra spaces | column | trimmed_text |
| `TEXT_LENGTH` | Get text length | column | length_number |
| `PROPER_CASE` | Title case conversion | column | proper_case_text |

### Mathematical Functions
| Formula | Description | Parameters | Output |
|---------|-------------|------------|---------|
| `ADD` | Addition | number1, number2 | sum |
| `SUBTRACT` | Subtraction | column1, column2 | difference |
| `MULTIPLY` | Multiplication | column1, column2 | product |
| `DIVIDE` | Division | column1, column2 | quotient |
| `SUM` | Sum values | columns | total_sum |

### Statistical Functions
| Formula | Description | Parameters | Output |
|---------|-------------|------------|---------|
| `COUNT` | Count non-null values | column | count |
| `UNIQUE_COUNT` | Count unique values | column | unique_count |
| `SUMIF` | Conditional sum | sum_column, condition_column, condition_value | conditional_sum |
| `COUNTIF` | Conditional count | condition_column, condition_value | conditional_count |

### Conditional Functions
| Formula | Description | Parameters | Output |
|---------|-------------|------------|---------|
| `IF` | Conditional logic | condition_column, true_value, false_value | conditional_result |

### Data Transformation
| Formula | Description | Parameters | Output |
|---------|-------------|------------|---------|
| `PIVOT` | Reorganize by categories | index_column, value_column | pivoted_data |
| `DEPIVOT` | Convert wide to long | id_columns | depivoted_data |
| `REMOVE_DUPLICATES` | Remove duplicate rows | columns | unique_data |
| `FILLNA` | Fill null values | column, value | filled_data |

## 🔧 Backend Implementation

### Formula Executor Trait

```rust
pub trait FormulaExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>>;
    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()>;
    fn get_output_columns(&self, parameters: &HashMap<String, Value>) -> Vec<String>;
}
```

### Example Implementation

```rust
pub struct UpperExecutor;

impl FormulaExecutor for UpperExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        let column = parameters.get("column")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing column parameter"))?;
        
        let result: Vec<HashMap<String, Value>> = data.iter().map(|row| {
            let mut new_row = row.clone();
            if let Some(value) = row.get(column) {
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
        if !parameters.contains_key("column") {
            return Err(anyhow!("Missing required parameter: column"));
        }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["upper_result".to_string()]
    }
}
```

## 🎨 Frontend Integration

### Formula Configuration Page

The Formula Configuration page provides a comprehensive interface for managing formulas:

#### Features:
- **Formula List**: View all available formulas with status indicators
- **Code Editor**: Full-featured Rust code editor with syntax highlighting
- **Template Generation**: One-click code template generation
- **Real-time Testing**: Compile and test code before saving
- **Status Tracking**: Visual indicators for implementation status

#### Status Indicators:
- 🟢 **Implemented**: Formula has working backend code
- 🟡 **Needs Update**: Formula exists but may need updates
- 🔴 **Error**: Formula has compilation or runtime errors
- ⚪ **Not Implemented**: Formula needs backend implementation

### Playground Integration

Formulas are seamlessly integrated into the Playground:

1. **Parameter Collection**: Interactive UI for collecting formula parameters
2. **Real-time Preview**: Live preview of formula results
3. **Error Handling**: Clear error messages for invalid parameters
4. **Result Display**: Formatted display of formula outputs

## 🚀 API Endpoints

### Formula Management
- `GET /api/formulas/config` - Get all formula configurations
- `POST /api/formulas/config` - Create/update formula configuration
- `DELETE /api/formulas/{name}` - Delete formula configuration

### Code Management
- `POST /api/formulas/{name}/code` - Save formula code
- `GET /api/formulas/{name}/code` - Get formula code
- `POST /api/formulas/{name}/test` - Test code compilation
- `GET /api/formulas/{name}/generate` - Generate code template
- `GET /api/formulas/code` - List all formula codes

### Execution
- `POST /api/formulas/execute` - Execute formula with data
- `GET /api/formulas/registered` - Get registered formulas
- `GET /api/formulas/active` - Get active formulas
- `POST /api/formulas/{name}/status` - Enable/disable formula

## 📝 Usage Examples

### 1. Using TEXT_JOIN Formula

```javascript
// Frontend parameter collection
const parameters = {
  delimiter: ", ",
  ignore_empty: true,
  text_values: ["City", "State", "Country"]
};

// Backend execution
const result = await fetch('/api/formulas/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formula_name: 'TEXT_JOIN',
    data: inputData,
    parameters: parameters
  })
});
```

### 2. Using SUM Formula

```javascript
// Frontend parameter collection
const parameters = {
  columns: ["Q1", "Q2", "Q3", "Q4"]
};

// Backend execution
const result = await fetch('/api/formulas/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formula_name: 'SUM',
    data: inputData,
    parameters: parameters
  })
});
```

### 3. Using IF Formula

```javascript
// Frontend parameter collection
const parameters = {
  condition_column: "Score",
  true_value: "Pass",
  false_value: "Fail"
};

// Backend execution
const result = await fetch('/api/formulas/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formula_name: 'IF',
    data: inputData,
    parameters: parameters
  })
});
```

## 🔧 Development Workflow

### Adding a New Formula

1. **Generate Template**:
   ```bash
   curl -X GET "http://localhost:5002/api/formulas/NEW_FORMULA/generate"
   ```

2. **Edit Code**: Use the Formula Configuration page to edit the generated template

3. **Test Compilation**: Use the "Test Code" button to validate syntax

4. **Save Code**: Save the implementation to make it available

5. **Register Formula**: The formula is automatically registered and available in the playground

### Modifying Existing Formula

1. **Open Formula Configuration**: Navigate to the formula in the configuration page

2. **Edit Code**: Modify the existing implementation

3. **Test Changes**: Use the "Test Code" button to validate

4. **Save Changes**: Save the updated implementation

5. **Verify in Playground**: Test the formula in the playground

## 🐛 Troubleshooting

### Common Issues

#### 1. Compilation Errors
- **Issue**: Code fails to compile
- **Solution**: Check syntax, imports, and trait implementations
- **Debug**: Use the "Test Code" button for detailed error messages

#### 2. Parameter Validation Errors
- **Issue**: Formula reports missing parameters
- **Solution**: Ensure all required parameters are provided
- **Debug**: Check the `validate_parameters` implementation

#### 3. Runtime Errors
- **Issue**: Formula executes but produces errors
- **Solution**: Check data types and null handling
- **Debug**: Review the `execute` implementation

#### 4. Output Column Issues
- **Issue**: Expected output columns not found
- **Solution**: Verify `get_output_columns` implementation
- **Debug**: Check column naming consistency

### Debug Tips

1. **Use Test Code**: Always test compilation before saving
2. **Check Logs**: Review backend logs for detailed error messages
3. **Validate Parameters**: Ensure parameter validation is correct
4. **Test with Sample Data**: Use small datasets for initial testing
5. **Check Output Format**: Verify output column names and types

## 📚 Best Practices

### Code Organization
- Keep executors focused on single responsibilities
- Use descriptive parameter names
- Implement proper error handling
- Add comprehensive parameter validation

### Performance
- Minimize data copying
- Use efficient data structures
- Handle large datasets appropriately
- Implement proper memory management

### Error Handling
- Provide clear error messages
- Validate all inputs
- Handle edge cases gracefully
- Log errors appropriately

### Testing
- Test with various data types
- Test edge cases (empty data, null values)
- Test parameter validation
- Test output format consistency

## 🔮 Future Enhancements

### Planned Features
- **Formula Dependencies**: Support for formula chaining
- **Custom Functions**: User-defined formula functions
- **Performance Metrics**: Execution time and memory usage tracking
- **Formula Versioning**: Version control for formula implementations
- **Batch Processing**: Optimized processing for large datasets
- **Formula Marketplace**: Community-shared formula implementations

### Advanced Capabilities
- **Machine Learning Integration**: ML-based formula suggestions
- **Auto-optimization**: Automatic performance optimization
- **Formula Analytics**: Usage statistics and performance metrics
- **Collaborative Editing**: Multi-user formula development
- **Formula Testing Suite**: Comprehensive testing framework

---

**The Formula Engine provides a powerful, flexible foundation for data processing with the ability to extend and customize functionality as needed.**
