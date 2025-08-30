# 🚀 Unified Data Studio - Formula Engine Documentation

## 📋 **Overview**
The Formula Engine provides an intuitive, user-centric interface for data transformation and analysis. Instead of complex syntax, users interact with visual controls like checkboxes and inline inputs, making data manipulation as simple as using a modern calculator app.

---

## 🎯 **Design Philosophy**

### **User-Centric Approach**
- **No Syntax Required**: Users don't need to learn complex formula syntax
- **Visual Controls**: Checkboxes, dropdowns, and inline inputs for all options
- **Progressive Disclosure**: Options appear only when relevant
- **Contextual Help**: Smart defaults and intelligent parameter detection

### **Interface Principles**
- **Clean Cards**: Each formula gets its own intuitive interface
- **Smart Defaults**: Sensible pre-filled values for common use cases
- **Real-time Feedback**: Live preview shows results as you configure
- **Drag & Drop**: Column selection through visual interaction

---

## 🔧 **Formula Categories & Implementations**

### **📝 Text & String Functions**

#### **1. UPPER**
**Purpose**: Converts text to uppercase  
**Current Interface**: Simple column selection  
**New Interface**:
```
┌─ Make Text Uppercase ─┐
│ Source Column: [Dropdown] │
│ Output Column: [Text Input] │
│ [✓] Preserve Formatting │
└───────────────────────┘
```

#### **2. LOWER**
**Purpose**: Converts text to lowercase  
**New Interface**:
```
┌─ Make Text Lowercase ─┐
│ Source Column: [Dropdown] │
│ Output Column: [Text Input] │
│ [✓] Preserve Formatting │
└───────────────────────┘
```

#### **3. TRIM**
**Purpose**: Removes extra spaces  
**New Interface**:
```
┌─ Clean Extra Spaces ─┐
│ Source Column: [Dropdown] │
│ Output Column: [Text Input] │
│ [✓] Remove Leading Spaces │
│ [✓] Remove Trailing Spaces │
│ [✓] Normalize Between Words │
└─────────────────────┘
```

#### **4. TEXT_LENGTH**
**Purpose**: Returns character count  
**New Interface**:
```
┌─ Count Characters ─┐
│ Source Column: [Dropdown] │
│ Output Column: [Text Input] │
│ [✓] Count Spaces │
│ [✓] Count Special Characters │
└─────────────────────┘
```

#### **5. TEXT_JOIN**
**Purpose**: Combines multiple text columns  
**New Interface**:
```
┌─ Join Text Columns ─┐
│ Source Columns: [Multi-Select] │
│ Output Column: [Text Input] │
│ [✓] Delimiter: [", "] │
│ [✓] Ignore Empty Values │
│ [✓] Trim Each Value │
└─────────────────────┘
```

#### **6. CONCATENATE/CONCAT**
**Purpose**: Joins text without delimiter  
**New Interface**:
```
┌─ Combine Text ─┐
│ Source Columns: [Multi-Select] │
│ Output Column: [Text Input] │
│ [✓] Ignore Empty Values │
│ [✓] Trim Each Value │
└─────────────────┘
```

#### **7. SUBSTITUTE**
**Purpose**: Replaces text patterns  
**New Interface**:
```
┌─ Replace Text ─┐
│ Source Column: [Dropdown] │
│ Output Column: [Text Input] │
│ Find: [Text Input] │
│ Replace With: [Text Input] │
│ [✓] Case Sensitive │
│ [✓] Replace All Occurrences │
└─────────────────┘
```

#### **8. LEFT**
**Purpose**: Extracts leftmost characters  
**New Interface**:
```
┌─ Extract Left Characters ─┐
│ Source Column: [Dropdown] │
│ Output Column: [Text Input] │
│ Characters: [Number Input] │
│ [✓] Trim Result │
└─────────────────────────┘
```

#### **9. RIGHT**
**Purpose**: Extracts rightmost characters  
**New Interface**:
```
┌─ Extract Right Characters ─┐
│ Source Column: [Dropdown] │
│ Output Column: [Text Input] │
│ Characters: [Number Input] │
│ [✓] Trim Result │
└──────────────────────────┘
```

#### **10. MID**
**Purpose**: Extracts characters from middle  
**New Interface**:
```
┌─ Extract Middle Characters ─┐
│ Source Column: [Dropdown] │
│ Output Column: [Text Input] │
│ Start Position: [Number Input] │
│ Characters: [Number Input] │
│ [✓] Trim Result │
└──────────────────────────┘
```

#### **11. FIND/SEARCH**
**Purpose**: Finds text position  
**New Interface**:
```
┌─ Find Text Position ─┐
│ Source Column: [Dropdown] │
│ Output Column: [Text Input] │
│ Search Text: [Text Input] │
│ [✓] Case Sensitive │
│ [✓] Start From Position: [Number Input] │
└──────────────────────┘
```

#### **12. REPLACE**
**Purpose**: Replaces text at specific position  
**New Interface**:
```
┌─ Replace at Position ─┐
│ Source Column: [Dropdown] │
│ Output Column: [Text Input] │
│ Start Position: [Number Input] │
│ Characters to Replace: [Number Input] │
│ New Text: [Text Input] │
└──────────────────────┘
```

---

### **🔢 Mathematical Functions**

#### **13. ADD**
**Purpose**: Adds two numbers  
**New Interface**:
```
┌─ Add Numbers ─┐
│ First Column: [Dropdown] │
│ Second Column: [Dropdown] │
│ Output Column: [Text Input] │
│ [✓] Handle Missing Values │
│ [✓] Round Result: [Number Input] │
└─────────────────┘
```

#### **14. SUBTRACT**
**Purpose**: Subtracts numbers  
**New Interface**:
```
┌─ Subtract Numbers ─┐
│ First Column: [Dropdown] │
│ Second Column: [Dropdown] │
│ Output Column: [Text Input] │
│ [✓] Handle Missing Values │
│ [✓] Round Result: [Number Input] │
└───────────────────┘
```

#### **15. MULTIPLY**
**Purpose**: Multiplies numbers  
**New Interface**:
```
┌─ Multiply Numbers ─┐
│ First Column: [Dropdown] │
│ Second Column: [Dropdown] │
│ Output Column: [Text Input] │
│ [✓] Handle Missing Values │
│ [✓] Round Result: [Number Input] │
└────────────────────┘
```

#### **16. DIVIDE**
**Purpose**: Divides numbers  
**New Interface**:
```
┌─ Divide Numbers ─┐
│ First Column: [Dropdown] │
│ Second Column: [Dropdown] │
│ Output Column: [Text Input] │
│ [✓] Handle Division by Zero │
│ [✓] Round Result: [Number Input] │
└──────────────────┘
```

#### **17. ROUND**
**Purpose**: Rounds numbers  
**New Interface**:
```
┌─ Round Numbers ─┐
│ Source Column: [Dropdown] │
│ Output Column: [Text Input] │
│ Decimal Places: [Number Input] │
│ [✓] Round Up │
│ [✓] Round Down │
└─────────────────┘
```

---

### **🎯 Conditional Functions**

#### **18. IF**
**Purpose**: Conditional logic  
**New Interface**:
```
┌─ Conditional Logic ─┐
│ Condition Column: [Dropdown] │
│ Operator: [Dropdown: >, <, >=, <=, ==, !=] │
│ Value: [Text/Number Input] │
│ If True: [Text/Number Input] │
│ If False: [Text/Number Input] │
│ Output Column: [Text Input] │
└─────────────────────┘
```

#### **19. AND**
**Purpose**: Logical AND  
**New Interface**:
```
┌─ All Conditions Must Be True ─┐
│ Condition Columns: [Multi-Select] │
│ Output Column: [Text Input] │
│ [✓] Show Which Failed │
└────────────────────────────┘
```

#### **20. OR**
**Purpose**: Logical OR  
**New Interface**:
```
┌─ Any Condition Can Be True ─┐
│ Condition Columns: [Multi-Select] │
│ Output Column: [Text Input] │
│ [✓] Show Which Passed │
└───────────────────────────┘
```

#### **21. NOT**
**Purpose**: Logical NOT  
**New Interface**:
```
┌─ Invert Condition ─┐
│ Condition Column: [Dropdown] │
│ Output Column: [Text Input] │
│ [✓] Show Original Value │
└────────────────────┘
```

---

### **📊 Statistical Functions**

#### **22. SUM**
**Purpose**: Sums multiple columns  
**New Interface**:
```
┌─ Sum Columns ─┐
│ Source Columns: [Multi-Select] │
│ Output Column: [Text Input] │
│ [✓] Handle Missing Values │
│ [✓] Round Result: [Number Input] │
└─────────────────┘
```

#### **23. COUNT**
**Purpose**: Counts non-null values  
**New Interface**:
```
┌─ Count Values ─┐
│ Source Column: [Dropdown] │
│ Output Column: [Text Input] │
│ [✓] Count Only Non-Empty │
│ [✓] Count Only Numbers │
└─────────────────┘
```

#### **24. UNIQUE_COUNT**
**Purpose**: Counts unique values  
**New Interface**:
```
┌─ Count Unique Values ─┐
│ Source Column: [Dropdown] │
│ Output Column: [Text Input] │
│ [✓] Case Sensitive │
│ [✓] Ignore Empty Values │
└──────────────────────┘
```

---

### **🔄 Data Transformation Functions**

#### **25. PIVOT**
**Purpose**: Reorganizes data by categories  
**New Interface**:
```
┌─ Pivot Data ─┐
│ Index Column: [Dropdown] │
│ Value Column: [Dropdown] │
│ Output Format: [Dropdown: Wide/Long] │
│ [✓] Fill Missing Values │
│ [✓] Aggregate Duplicates │
└─────────────────┘
```

#### **26. DEPIVOT**
**Purpose**: Converts wide to long format  
**New Interface**:
```
┌─ Unpivot Data ─┐
│ ID Columns: [Multi-Select] │
│ Value Columns: [Multi-Select] │
│ [✓] Preserve Column Names │
│ [✓] Handle Missing Values │
└─────────────────┘
```

---

### **🧹 Data Cleaning Functions**

#### **27. REMOVE_DUPLICATES**
**Purpose**: Removes duplicate rows  
**New Interface**:
```
┌─ Remove Duplicates ─┐
│ Check Columns: [Multi-Select] │
│ [✓] Keep First Occurrence │
│ [✓] Keep Last Occurrence │
│ [✓] Show Count Removed │
└────────────────────┘
```

#### **28. FILLNA**
**Purpose**: Fills null values  
**New Interface**:
```
┌─ Fill Missing Values ─┐
│ Target Column: [Dropdown] │
│ Fill Value: [Text/Number Input] │
│ [✓] Fill Only Nulls │
│ [✓] Fill Empty Strings │
│ [✓] Fill Zeros │
└────────────────────┘
```

---

## 🎨 **Interface Implementation Details**

### **Smart Parameter Controls**
Each formula card dynamically shows only relevant options:

1. **Checkbox Triggers**: Options appear when checkboxes are checked
2. **Inline Inputs**: Text/number inputs appear next to relevant checkboxes
3. **Smart Defaults**: Common values pre-filled (e.g., ", " for delimiters)
4. **Contextual Help**: Tooltips explain each option

### **Column Selection**
- **Dropdown Lists**: Shows available columns from imported data
- **Multi-Select**: For functions requiring multiple columns
- **Smart Filtering**: Only shows compatible column types
- **Visual Feedback**: Selected columns highlighted in Data Preview

### **Real-Time Validation**
- **Parameter Checking**: Validates inputs as user types
- **Error Prevention**: Prevents invalid configurations
- **Smart Suggestions**: Recommends values based on data

---

## 🚀 **Implementation Roadmap**

### **Phase 1: Core Interface (Current)**
- ✅ Remove redundant text and tips
- ✅ Add basic checkbox controls
- ✅ Implement inline text inputs

### **Phase 2: Smart Controls**
- 🔄 Dynamic option display
- 🔄 Contextual parameter inputs
- 🔄 Smart defaults and validation

### **Phase 3: Formula-Specific UIs**
- 📋 Custom interfaces for each formula
- 📋 Progressive disclosure of options
- 📋 Visual parameter builders

### **Phase 4: Advanced Features**
- 🎯 Drag-and-drop column selection
- 🎯 Formula templates and presets
- 🎯 Batch operations and workflows

---

## 💡 **User Experience Benefits**

### **For Beginners**
- **No Syntax Learning**: Visual interface eliminates formula syntax
- **Intuitive Controls**: Checkboxes and dropdowns are familiar
- **Smart Guidance**: Contextual help and validation

### **For Power Users**
- **Faster Workflow**: Visual selection vs typing
- **Error Prevention**: Validation prevents invalid formulas
- **Batch Operations**: Multiple formulas in sequence

### **For Teams**
- **Consistent Interface**: Standardized across all formulas
- **Easy Sharing**: Visual formulas are easier to explain
- **Reduced Training**: Intuitive interface reduces onboarding time

---

## 🔧 **Technical Implementation**

### **Component Structure**
```typescript
interface FormulaCardProps {
  formula: FormulaDefinition;
  parameters: string[];
  onParameterChange: (params: string[]) => void;
  availableColumns: ColumnReference[];
}

interface SmartControlProps {
  type: 'checkbox' | 'text' | 'number' | 'dropdown';
  label: string;
  value: any;
  onChange: (value: any) => void;
  options?: string[];
  placeholder?: string;
}
```

### **State Management**
- **Formula State**: Current configuration and parameters
- **Control State**: Which options are visible/active
- **Validation State**: Real-time error checking
- **Preview State**: Live results display

### **Event Handling**
- **Checkbox Changes**: Show/hide related controls
- **Input Changes**: Update parameters and validate
- **Column Selection**: Update available options
- **Formula Completion**: Process and display results

---

## 📚 **Best Practices**

### **Design Principles**
1. **Progressive Disclosure**: Show options only when relevant
2. **Smart Defaults**: Pre-fill common values
3. **Visual Hierarchy**: Clear organization of controls
4. **Consistent Patterns**: Same interaction model across formulas

### **User Experience**
1. **Immediate Feedback**: Show results as user configures
2. **Error Prevention**: Validate inputs in real-time
3. **Contextual Help**: Explain options when needed
4. **Keyboard Shortcuts**: Support for power users

### **Performance**
1. **Lazy Loading**: Load formula options on demand
2. **Debounced Updates**: Prevent excessive re-renders
3. **Cached Results**: Store computed values temporarily
4. **Background Processing**: Handle large datasets efficiently

---

## 🎯 **Success Metrics**

### **User Adoption**
- **Time to First Formula**: How quickly users create their first formula
- **Formula Completion Rate**: Percentage of started formulas that get completed
- **Error Reduction**: Fewer validation errors and failed executions

### **User Satisfaction**
- **Ease of Use**: User ratings for formula creation
- **Learning Curve**: Time to become proficient
- **Feature Discovery**: How easily users find advanced options

### **Performance**
- **Formula Creation Speed**: Time to configure and execute
- **Preview Response Time**: How quickly live preview updates
- **Memory Usage**: Efficient handling of large datasets

---

## 🔮 **Future Enhancements**

### **Advanced Features**
- **Formula Templates**: Pre-built configurations for common tasks
- **Formula Library**: Save and share custom formulas
- **Batch Processing**: Apply formulas to multiple datasets
- **Formula Chaining**: Visual workflow builder

### **Integration**
- **API Support**: REST endpoints for formula execution
- **Plugin System**: Third-party formula extensions
- **Cloud Processing**: Handle datasets too large for local processing
- **Collaboration**: Real-time formula editing with team members

---

*This documentation will be updated as the Formula Engine evolves to provide an even more intuitive and powerful user experience.*
