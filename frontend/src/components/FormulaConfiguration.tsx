import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Plus, 
  Save, 
  Edit, 
  Trash2, 
  Settings,
  Code,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
// import { formulaConfigService } from '../services/FormulaConfigService';

// Types for formula configuration
export interface FormulaParameterConfig {
  id: string;
  name: string;
  type: 'text' | 'number' | 'checkbox' | 'single-select' | 'multi-select';
  label: string;
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[]; // For select types
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
  // Card layout customization
  displayOrder?: number; // Order in which parameter appears in the card
  inputSize?: 'small' | 'medium' | 'large'; // Size of the input field
  showInCard?: boolean; // Whether to show this parameter in the card
}

export interface FormulaConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  syntax: string;
  tip: string;
  parameters: FormulaParameterConfig[];
  examples: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Card layout customization
  cardLayout?: {
    customHeading?: string; // Custom heading for the card
    showStepNumber?: boolean; // Whether to show step number
    showStatus?: boolean; // Whether to show status indicator
    cardColor?: 'blue' | 'green' | 'purple' | 'orange' | 'red'; // Card color theme
    parameterLayout?: 'vertical' | 'horizontal' | 'grid'; // How parameters are arranged
  };
}

const FormulaConfiguration: React.FC = () => {
  const [formulas, setFormulas] = useState<FormulaConfig[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<FormulaConfig | null>(null);
  const [originalFormula, setOriginalFormula] = useState<FormulaConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load formulas from backend API
  useEffect(() => {
    loadFormulasFromBackend();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadFormulasFromBackend = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/formulas/config');
      if (response.ok) {
        const data = await response.json();
        const backendFormulas = data.formulas.map((formula: any) => ({
          id: formula.id || `formula_${Date.now()}`,
          name: formula.name,
          category: formula.category,
          description: formula.description,
          syntax: formula.syntax,
          tip: formula.tip || '',
          parameters: formula.parameters.map((param: any, index: number) => ({
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
            inputSize: param.inputSize || 'medium',
            displayOrder: param.displayOrder || 0,
            showInCard: param.showInCard !== false,
          })),
          examples: formula.examples || [],
          isActive: formula.isActive !== false,
          createdAt: formula.createdAt || new Date().toISOString(),
          updatedAt: formula.updatedAt || new Date().toISOString(),
          cardLayout: formula.cardLayout || {
            customHeading: '',
            showStepNumber: true,
            showStatus: true,
            cardColor: 'blue',
            parameterLayout: 'vertical'
          }
        }));
        setFormulas(backendFormulas);
        console.log('Loaded formulas from backend:', backendFormulas.length);
      } else {
        console.error('Failed to load formulas from backend');
        loadDefaultFormulas();
      }
    } catch (error) {
      console.error('Error loading formulas from backend:', error);
      loadDefaultFormulas();
    }
  };

  const loadDefaultFormulas = () => {
    const defaultFormulas: FormulaConfig[] = [
      {
        id: 'text_join',
        name: 'TEXT_JOIN',
        category: 'Text & String',
        description: 'Joins text values together, with optional delimiter and empty handling.',
        syntax: 'TEXT_JOIN [delimiter -> ignore_empty -> text1 -> text2 -> ...]',
        tip: 'Add delimiter (e.g., ", "), then ignore_empty (TRUE/FALSE), then click text columns to join',
        parameters: [
          {
            id: 'delimiter',
            name: 'delimiter',
            type: 'text',
            label: 'Delimiter',
            description: 'Character(s) placed between joined texts',
            required: true,
            defaultValue: ', ',
            placeholder: ', '
          },
          {
            id: 'ignore_empty',
            name: 'ignore_empty',
            type: 'checkbox',
            label: 'Ignore Empty',
            description: 'Skip blank values when joining',
            required: true,
            defaultValue: false
          },
          {
            id: 'text_columns',
            name: 'text_columns',
            type: 'multi-select',
            label: 'Text Columns',
            description: 'Columns to join together',
            required: true,
            options: []
          }
        ],
        examples: ['TEXT_JOIN [", " -> TRUE -> City -> State -> Country]'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'if_conditional',
        name: 'IF',
        category: 'Conditional',
        description: 'Conditional logic with true/false values.',
        syntax: 'IF [condition_column -> condition_value -> true_value -> false_value]',
        tip: 'Click condition column, add comparison value, then true/false values',
        parameters: [
          {
            id: 'condition_column',
            name: 'condition_column',
            type: 'single-select',
            label: 'Condition Column',
            description: 'Column to check condition',
            required: true,
            options: []
          },
          {
            id: 'condition_value',
            name: 'condition_value',
            type: 'text',
            label: 'Compare Value',
            description: 'Value to compare against',
            required: true,
            placeholder: 'Value to compare'
          },
          {
            id: 'true_value',
            name: 'true_value',
            type: 'text',
            label: 'True Value',
            description: 'Value if condition is true',
            required: true,
            placeholder: 'Value if true'
          },
          {
            id: 'false_value',
            name: 'false_value',
            type: 'text',
            label: 'False Value',
            description: 'Value if condition is false',
            required: true,
            placeholder: 'Value if false'
          }
        ],
        examples: ['IF [Status -> "Active" -> "Valid" -> "Invalid"]'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    setFormulas(defaultFormulas);
    localStorage.setItem('formulaConfigurations', JSON.stringify(defaultFormulas));
  };

  const filteredFormulas = formulas.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || formula.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(formulas.map(f => f.category)))];

  const handleCreateFormula = () => {
    const newFormula: FormulaConfig = {
      id: `formula_${Date.now()}`,
      name: '',
      category: 'Custom',
      description: '',
      syntax: '',
      tip: '',
      parameters: [],
      examples: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSelectedFormula(newFormula);
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleEditFormula = (formula: FormulaConfig) => {
    setSelectedFormula(formula);
    setOriginalFormula(JSON.parse(JSON.stringify(formula))); // Deep copy for reset
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSaveFormula = () => {
    if (!selectedFormula) return;

    const updatedFormula = {
      ...selectedFormula,
      updatedAt: new Date().toISOString()
    };

    if (isCreating) {
      setFormulas(prev => [...prev, updatedFormula]);
    } else {
      setFormulas(prev => prev.map(f => f.id === updatedFormula.id ? updatedFormula : f));
    }

    localStorage.setItem('formulaConfigurations', JSON.stringify(formulas));
    setIsEditing(false);
    setIsCreating(false);
    setSelectedFormula(null);
  };

  const handleDeleteFormula = (formulaId: string) => {
    if (window.confirm('Are you sure you want to delete this formula?')) {
      setFormulas(prev => prev.filter(f => f.id !== formulaId));
      if (selectedFormula?.id === formulaId) {
        setSelectedFormula(null);
      }
    }
  };

  const handleAddParameter = () => {
    if (!selectedFormula) return;

    const newParameter: FormulaParameterConfig = {
      id: `param_${Date.now()}`,
      name: '',
      type: 'text',
      label: '',
      description: '',
      required: false,
      placeholder: ''
    };

    setSelectedFormula({
      ...selectedFormula,
      parameters: [...selectedFormula.parameters, newParameter]
    });
  };

  const handleUpdateParameter = (paramId: string, updates: Partial<FormulaParameterConfig>) => {
    if (!selectedFormula) return;

    setSelectedFormula({
      ...selectedFormula,
      parameters: selectedFormula.parameters.map(p => 
        p.id === paramId ? { ...p, ...updates } : p
      )
    });
  };

  const handleRemoveParameter = (paramId: string) => {
    if (!selectedFormula) return;

    setSelectedFormula({
      ...selectedFormula,
      parameters: selectedFormula.parameters.filter(p => p.id !== paramId)
    });
  };

  const handleResetFormula = () => {
    if (originalFormula) {
      setSelectedFormula(JSON.parse(JSON.stringify(originalFormula))); // Deep copy
    }
  };

  const renderParameterEditor = (param: FormulaParameterConfig) => (
    <Card key={param.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Parameter: {param.name || 'New Parameter'}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRemoveParameter(param.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`param-name-${param.id}`}>Parameter Name</Label>
            <Input
              id={`param-name-${param.id}`}
              value={param.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateParameter(param.id, { name: e.target.value })}
              placeholder="parameter_name"
            />
          </div>
          <div>
            <Label htmlFor={`param-type-${param.id}`}>Parameter Type</Label>
            <select
              id={`param-type-${param.id}`}
              value={param.type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateParameter(param.id, { type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="text">Text Input</option>
              <option value="number">Number Input</option>
              <option value="checkbox">Checkbox</option>
              <option value="single-select">Single Select</option>
              <option value="multi-select">Multi Select</option>
            </select>
          </div>
          <div>
            <Label htmlFor={`param-size-${param.id}`}>Input Size</Label>
            <select
              id={`param-size-${param.id}`}
              value={param.inputSize || 'medium'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateParameter(param.id, { inputSize: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`param-label-${param.id}`}>Display Label</Label>
            <Input
              id={`param-label-${param.id}`}
              value={param.label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateParameter(param.id, { label: e.target.value })}
              placeholder="Parameter Label"
            />
          </div>
          <div>
            <Label htmlFor={`param-order-${param.id}`}>Display Order</Label>
            <Input
              id={`param-order-${param.id}`}
              type="number"
              value={param.displayOrder || 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateParameter(param.id, { displayOrder: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`param-required-${param.id}`}
              checked={param.required}
              onChange={(e) => handleUpdateParameter(param.id, { required: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor={`param-required-${param.id}`}>Required</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`param-show-in-card-${param.id}`}
              checked={param.showInCard !== false}
              onChange={(e) => handleUpdateParameter(param.id, { showInCard: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor={`param-show-in-card-${param.id}`}>Show in Card</Label>
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            Order: {param.displayOrder || 0}
          </div>
        </div>

        <div>
          <Label htmlFor={`param-description-${param.id}`}>Description</Label>
          <Textarea
            id={`param-description-${param.id}`}
            value={param.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleUpdateParameter(param.id, { description: e.target.value })}
            placeholder="Parameter description"
            rows={2}
          />
        </div>

        {param.type === 'text' && (
          <div>
            <Label htmlFor={`param-placeholder-${param.id}`}>Placeholder</Label>
            <Input
              id={`param-placeholder-${param.id}`}
              value={param.placeholder || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateParameter(param.id, { placeholder: e.target.value })}
              placeholder="Enter placeholder text"
            />
          </div>
        )}

        {(param.type === 'single-select' || param.type === 'multi-select') && (
          <div>
            <Label htmlFor={`param-options-${param.id}`}>Options (one per line)</Label>
            <Textarea
              id={`param-options-${param.id}`}
              value={param.options?.join('\n') || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleUpdateParameter(param.id, { 
                options: e.target.value.split('\n').filter((opt: string) => opt.trim()) 
              })}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
              rows={3}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Formula Configuration</h1>
              <p className="text-sm text-gray-600">Manage and configure formula definitions</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {selectedFormula && (
              <Button 
                onClick={handleResetFormula} 
                variant="outline"
                className="flex items-center space-x-2"
                title="Reset changes to original values"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </Button>
            )}
            <Button onClick={handleCreateFormula} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Formula</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Formula List */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200">
            <Input
              placeholder="Search formulas..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="mb-3"
            />
            <select
              value={selectedCategory}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Formula List */}
          <div className="flex-1 overflow-y-auto">
            {filteredFormulas.map(formula => (
              <div
                key={formula.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedFormula?.id === formula.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => {
                  setSelectedFormula(formula);
                  setOriginalFormula(JSON.parse(JSON.stringify(formula))); // Deep copy for reset
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{formula.name}</h3>
                    <p className="text-sm text-gray-600">{formula.category}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{formula.description}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        handleEditFormula(formula);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        handleDeleteFormula(formula.id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - Formula Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedFormula ? (
            <div className="flex-1 overflow-y-auto p-6">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="w-5 h-5" />
                    <span>{isEditing ? 'Edit Formula' : 'Formula Details'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="formula-name">Formula Name</Label>
                      <Input
                        id="formula-name"
                        value={selectedFormula.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedFormula({ ...selectedFormula, name: e.target.value })}
                        disabled={!isEditing}
                        placeholder="FORMULA_NAME"
                      />
                    </div>
                    <div>
                      <Label htmlFor="formula-category">Category</Label>
                      <Input
                        id="formula-category"
                        value={selectedFormula.category}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedFormula({ ...selectedFormula, category: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Category"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="formula-description">Description</Label>
                    <Textarea
                      id="formula-description"
                      value={selectedFormula.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSelectedFormula({ ...selectedFormula, description: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Formula description"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="formula-tip">User Tip</Label>
                    <Textarea
                      id="formula-tip"
                      value={selectedFormula.tip}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSelectedFormula({ ...selectedFormula, tip: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Helpful tip for users"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="formula-syntax">Syntax</Label>
                    <Input
                      id="formula-syntax"
                      value={selectedFormula.syntax}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedFormula({ ...selectedFormula, syntax: e.target.value })}
                      disabled={!isEditing}
                      placeholder="FORMULA [param1 -> param2 -> ...]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Card Layout Customization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Card Layout Customization</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="custom-heading">Custom Card Heading</Label>
                      <Input
                        id="custom-heading"
                        value={selectedFormula.cardLayout?.customHeading || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedFormula({ 
                          ...selectedFormula, 
                          cardLayout: { 
                            ...selectedFormula.cardLayout, 
                            customHeading: e.target.value 
                          } 
                        })}
                        disabled={!isEditing}
                        placeholder="Custom heading (e.g., 'Join Text Values')"
                      />
                    </div>
                    <div>
                      <Label htmlFor="card-color">Card Color Theme</Label>
                      <select
                        id="card-color"
                        value={selectedFormula.cardLayout?.cardColor || 'blue'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedFormula({ 
                          ...selectedFormula, 
                          cardLayout: { 
                            ...selectedFormula.cardLayout, 
                            cardColor: e.target.value as any 
                          } 
                        })}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="purple">Purple</option>
                        <option value="orange">Orange</option>
                        <option value="red">Red</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parameter-layout">Parameter Layout</Label>
                      <select
                        id="parameter-layout"
                        value={selectedFormula.cardLayout?.parameterLayout || 'vertical'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedFormula({ 
                          ...selectedFormula, 
                          cardLayout: { 
                            ...selectedFormula.cardLayout, 
                            parameterLayout: e.target.value as any 
                          } 
                        })}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="vertical">Vertical</option>
                        <option value="horizontal">Horizontal</option>
                        <option value="grid">Grid</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="show-step-number"
                          checked={selectedFormula.cardLayout?.showStepNumber !== false}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedFormula({ 
                            ...selectedFormula, 
                            cardLayout: { 
                              ...selectedFormula.cardLayout, 
                              showStepNumber: e.target.checked 
                            } 
                          })}
                          disabled={!isEditing}
                          className="rounded"
                        />
                        <Label htmlFor="show-step-number">Show Step Number</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="show-status"
                          checked={selectedFormula.cardLayout?.showStatus !== false}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedFormula({ 
                            ...selectedFormula, 
                            cardLayout: { 
                              ...selectedFormula.cardLayout, 
                              showStatus: e.target.checked 
                            } 
                          })}
                          disabled={!isEditing}
                          className="rounded"
                        />
                        <Label htmlFor="show-status">Show Status Indicator</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parameters Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Parameters</span>
                    </CardTitle>
                    {isEditing && (
                      <Button onClick={handleAddParameter} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Parameter
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedFormula.parameters.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No parameters defined</p>
                      {isEditing && (
                        <Button onClick={handleAddParameter} className="mt-2">
                          Add First Parameter
                        </Button>
                      )}
                    </div>
                  ) : (
                    selectedFormula.parameters.map(renderParameterEditor)
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 mt-6">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setIsCreating(false);
                        setSelectedFormula(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveFormula}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Formula
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Formula
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Formula Selected</h3>
                <p className="text-gray-600 mb-4">Select a formula from the sidebar to view or edit its configuration</p>
                <Button onClick={handleCreateFormula}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Formula
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormulaConfiguration;
