import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  Code, 
  Save, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react';

interface FormulaCodeEditorProps {
  formulaName: string;
  initialCode?: string;
  onSave: (code: string) => void;
  onTest: (code: string) => Promise<{ success: boolean; message: string }>;
  onReset: () => void;
  onGenerateTemplate?: () => Promise<string>;
  isReadOnly?: boolean;
}

const FormulaCodeEditor: React.FC<FormulaCodeEditorProps> = ({
  formulaName,
  initialCode = '',
  onSave,
  onTest,
  onReset,
  onGenerateTemplate,
  isReadOnly = false
}) => {
  const [code, setCode] = useState(initialCode);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setCode(initialCode);
    setHasUnsavedChanges(false);
  }, [initialCode]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setHasUnsavedChanges(newCode !== initialCode);
    setTestResult(null);
  };

  const handleSave = () => {
    onSave(code);
    setHasUnsavedChanges(false);
    setTestResult(null);
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const result = await onTest(code);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setHasUnsavedChanges(false);
    setTestResult(null);
    onReset();
  };

  const handleGenerateTemplate = async () => {
    if (onGenerateTemplate) {
      try {
        const template = await onGenerateTemplate();
        setCode(template);
        setHasUnsavedChanges(true);
        setTestResult(null);
      } catch (error) {
        setTestResult({
          success: false,
          message: `Failed to generate template: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/rust' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formulaName.toLowerCase()}_executor.rs`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
        setHasUnsavedChanges(true);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Code className="w-5 h-5" />
            <span>Backend Code Editor - {formulaName}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Unsaved changes</span>
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="flex items-center space-x-1"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".rs"
              onChange={handleUpload}
              className="hidden"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code-editor">Rust Executor Implementation</Label>
          <Textarea
            id="code-editor"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder={`// Implement the ${formulaName} formula executor
// This code will be compiled and executed in the backend

use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct ${formulaName}Executor;

impl FormulaExecutor for ${formulaName}Executor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        // TODO: Implement your formula logic here
        // Access parameters: parameters.get("param_name")
        // Process data: data.iter().map(|row| { ... })
        // Return result: Ok(result_data)
        
        Ok(data.to_vec())
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        // TODO: Validate required parameters
        // Example: if !parameters.contains_key("required_param") {
        //     return Err(anyhow!("Missing required parameter: required_param"));
        // }
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        // TODO: Return output column names
        vec!["${formulaName.toLowerCase()}_result".to_string()]
    }
}`}
            className="font-mono text-sm min-h-[400px]"
            readOnly={isReadOnly}
          />
        </div>

        {testResult && (
          <div className={`p-3 rounded-lg flex items-center space-x-2 ${
            testResult.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {testResult.success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
              {testResult.success ? 'Test Passed' : 'Test Failed'}
            </span>
            <span className="text-sm">{testResult.message}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            {onGenerateTemplate && (
              <Button
                variant="outline"
                onClick={handleGenerateTemplate}
                disabled={isReadOnly}
                className="flex items-center space-x-2"
              >
                <Code className="w-4 h-4" />
                <span>Generate Template</span>
              </Button>
            )}
            <Button
              onClick={handleTest}
              disabled={isTesting || !code.trim()}
              className="flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>{isTesting ? 'Testing...' : 'Test Code'}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasUnsavedChanges}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </Button>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isReadOnly}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Code</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormulaCodeEditor;
