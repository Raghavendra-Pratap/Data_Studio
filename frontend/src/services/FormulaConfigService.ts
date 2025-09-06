// Formula Configuration Service
// Handles synchronization between frontend and backend formula definitions

import { FormulaConfig, FormulaParameterConfig } from '../components/FormulaConfiguration';

export interface FormulaSyncResult {
  success: boolean;
  message: string;
  syncedFormulas?: FormulaConfig[];
  errors?: string[];
}

class FormulaConfigService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002';
  }

  // Get all formula configurations from backend
  async getFormulasFromBackend(): Promise<FormulaConfig[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/formulas/config`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.formulas || [];
    } catch (error) {
      console.error('Error fetching formulas from backend:', error);
      return [];
    }
  }

  // Sync formula configurations to backend
  async syncFormulasToBackend(formulas: FormulaConfig[]): Promise<FormulaSyncResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/formulas/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formulas }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Formulas synced successfully',
        syncedFormulas: data.formulas,
      };
    } catch (error) {
      console.error('Error syncing formulas to backend:', error);
      return {
        success: false,
        message: `Failed to sync formulas: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // Validate formula configuration
  validateFormulaConfig(formula: FormulaConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!formula.name || formula.name.trim() === '') {
      errors.push('Formula name is required');
    }

    if (!formula.category || formula.category.trim() === '') {
      errors.push('Category is required');
    }

    if (!formula.description || formula.description.trim() === '') {
      errors.push('Description is required');
    }

    if (!formula.tip || formula.tip.trim() === '') {
      errors.push('User tip is required');
    }

    if (!formula.syntax || formula.syntax.trim() === '') {
      errors.push('Syntax is required');
    }

    // Validate parameters
    formula.parameters.forEach((param, index) => {
      if (!param.name || param.name.trim() === '') {
        errors.push(`Parameter ${index + 1}: Name is required`);
      }

      if (!param.label || param.label.trim() === '') {
        errors.push(`Parameter ${index + 1}: Label is required`);
      }

      if (!param.description || param.description.trim() === '') {
        errors.push(`Parameter ${index + 1}: Description is required`);
      }

      if (param.required && !param.defaultValue && (param.type === 'text' || param.type === 'number')) {
        errors.push(`Parameter ${index + 1}: Default value is required for required parameters`);
      }

      if ((param.type === 'single-select' || param.type === 'multi-select') && (!param.options || param.options.length === 0)) {
        errors.push(`Parameter ${index + 1}: Options are required for select types`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Convert formula config to backend format
  convertToBackendFormat(formula: FormulaConfig): any {
    return {
      name: formula.name,
      category: formula.category,
      description: formula.description,
      syntax: formula.syntax,
      parameters: formula.parameters.map(param => ({
        name: param.name,
        type: param.type,
        label: param.label,
        description: param.description,
        required: param.required,
        defaultValue: param.defaultValue,
        options: param.options,
        placeholder: param.placeholder,
        validation: param.validation,
      })),
      examples: formula.examples,
      isActive: formula.isActive,
    };
  }

  // Convert from backend format to frontend format
  convertFromBackendFormat(backendFormula: any): FormulaConfig {
    return {
      id: backendFormula.id || `formula_${Date.now()}`,
      name: backendFormula.name,
      category: backendFormula.category,
      description: backendFormula.description,
      syntax: backendFormula.syntax,
      tip: backendFormula.tip || '',
      parameters: backendFormula.parameters.map((param: any, index: number) => ({
        id: param.id || `param_${Date.now()}_${index}`,
        name: param.name,
        type: param.type,
        label: param.label,
        description: param.description,
        required: param.required || false,
        defaultValue: param.defaultValue,
        options: param.options || [],
        placeholder: param.placeholder,
        validation: param.validation,
      })),
      examples: backendFormula.examples || [],
      isActive: backendFormula.isActive !== false,
      createdAt: backendFormula.createdAt || new Date().toISOString(),
      updatedAt: backendFormula.updatedAt || new Date().toISOString(),
    };
  }

  // Generate formula code for backend
  generateBackendFormulaCode(formula: FormulaConfig): string {
    const functionName = formula.name.toUpperCase();
    const parameters = formula.parameters.map(p => p.name).join(', ');
    
    return `
// Generated formula: ${formula.name}
pub async fn ${functionName.toLowerCase()}_formula(
    ${parameters}
) -> Result<FormulaResult> {
    // TODO: Implement ${formula.name} formula logic
    // Parameters: ${formula.parameters.map(p => `${p.name} (${p.type})`).join(', ')}
    
    Ok(FormulaResult {
        success: true,
        data: vec![],
        message: "${formula.name} formula executed successfully".to_string(),
    })
}`;
  }

  // Export formulas to file
  exportFormulas(formulas: FormulaConfig[]): void {
    const dataStr = JSON.stringify(formulas, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `formula-configurations-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Import formulas from file
  async importFormulas(file: File): Promise<{ success: boolean; formulas: FormulaConfig[]; errors: string[] }> {
    try {
      const text = await file.text();
      const importedFormulas = JSON.parse(text);
      
      if (!Array.isArray(importedFormulas)) {
        return {
          success: false,
          formulas: [],
          errors: ['Invalid file format: Expected array of formulas'],
        };
      }

      const errors: string[] = [];
      const validFormulas: FormulaConfig[] = [];

      importedFormulas.forEach((formula, index) => {
        const validation = this.validateFormulaConfig(formula);
        if (validation.isValid) {
          validFormulas.push(formula);
        } else {
          errors.push(`Formula ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });

      return {
        success: errors.length === 0,
        formulas: validFormulas,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        formulas: [],
        errors: [`Failed to import file: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  }
}

export const formulaConfigService = new FormulaConfigService();
