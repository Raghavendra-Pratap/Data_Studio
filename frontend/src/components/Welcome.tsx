import React, { useState } from 'react';
import { 
  Database, 
  GitBranch, 
  Upload, 
  Play, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface WelcomeProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  features: string[];
  tips: string[];
}

const Welcome: React.FC<WelcomeProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Unified Data Studio v2',
      description: 'Your next-generation data processing and workflow automation platform',
      icon: Sparkles,
      color: 'bg-gradient-to-r from-blue-500 to-purple-600',
      features: [
        'Advanced data processing with Rust backend',
        'Modern React-based user interface',
        'Cross-platform Electron desktop app',
        'Workflow engine for data transformations'
      ],
      tips: [
        'Take your time exploring each feature',
        'Don\'t worry about making mistakes - you can always start over',
        'Use the playground to test formulas and workflows'
      ]
    },
    {
      id: 'data-management',
      title: 'Data Management',
      description: 'Import, organize, and process your data efficiently',
      icon: Database,
      color: 'bg-gradient-to-r from-green-500 to-blue-600',
      features: [
        'Support for multiple file formats (CSV, Excel, JSON)',
        'Smart data type detection and validation',
        'Data preview and exploration tools',
        'Secure local data storage'
      ],
      tips: [
        'Start with small datasets to learn the interface',
        'Use the data preview to understand your data structure',
        'Organize your data into projects for better management'
      ]
    },
    {
      id: 'workflows',
      title: 'Workflow Automation',
      description: 'Create powerful data processing pipelines with visual workflows',
      icon: GitBranch,
      color: 'bg-gradient-to-r from-purple-500 to-pink-600',
      features: [
        'Drag-and-drop workflow builder',
        'Pre-built workflow templates',
        'Real-time workflow execution monitoring',
        'Error handling and recovery'
      ],
      tips: [
        'Start with simple workflows and gradually add complexity',
        'Use the workflow templates as starting points',
        'Test workflows on small datasets first'
      ]
    },
    {
      id: 'formulas',
      title: 'Advanced Formulas',
      description: 'Powerful formula engine for data transformation and analysis',
      icon: Zap,
      color: 'bg-gradient-to-r from-orange-500 to-red-600',
      features: [
        'Mathematical and statistical functions',
        'Text processing and manipulation',
        'Conditional logic and branching',
        'Custom function creation'
      ],
      tips: [
        'Use the formula playground to test expressions',
        'Start with basic functions and build up complexity',
        'Reference the formula documentation for advanced features'
      ]
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      description: 'Work together with your team on data projects',
      icon: Globe,
      color: 'bg-gradient-to-r from-indigo-500 to-cyan-600',
      features: [
        'Project sharing and permissions',
        'Version control for workflows',
        'Real-time collaboration features',
        'Comment and feedback system'
      ],
      tips: [
        'Set up clear project permissions for your team',
        'Use version control to track changes',
        'Communicate with your team through comments'
      ]
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Enterprise-grade security for your sensitive data',
      icon: Shield,
      color: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      features: [
        'Local data processing (no cloud uploads)',
        'Encrypted data storage',
        'Role-based access control',
        'Audit logging and compliance'
      ],
      tips: [
        'Your data never leaves your machine',
        'Use strong passwords for user accounts',
        'Regularly review access permissions'
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Header */}
          <div className={`${currentStepData.color} text-white p-8 text-center`}>
            <div className="flex justify-center mb-4">
              <currentStepData.icon className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-3">{currentStepData.title}</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {currentStepData.description}
            </p>
          </div>

          {/* Content */}
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Key Features
                </h3>
                <ul className="space-y-3">
                  {currentStepData.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                  Pro Tips
                </h3>
                <ul className="space-y-3">
                  {currentStepData.tips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={onSkip}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Skip Tour
                </button>
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="flex items-center space-x-2 px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <span>Get Started</span>
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Step Navigation */}
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-blue-600 scale-125'
                        : completedSteps.has(step.id)
                        ? 'bg-green-500'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Unified Data Studio v2 - Empowering data professionals worldwide</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
