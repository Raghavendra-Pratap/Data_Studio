import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Folder, GitBranch, Upload, Play, TrendingUp, Activity, Database, Zap } from 'lucide-react';

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

interface ProjectWorkflow {
  id: string;
  name: string;
  description: string;
  steps: any[];
  status: 'draft' | 'ready' | 'running' | 'completed' | 'error';
  lastExecuted?: Date;
}

interface Project {
  id: string;
  name: string;
  description: string;
  workflows: ProjectWorkflow[];
  inputFiles: ProjectFile[];
  outputFiles: ProjectFile[];
  created: Date;
  lastModified: Date;
  status: 'in_progress' | 'completed' | 'idle';
  storagePath: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  created: Date;
  lastModified: Date;
  project: string;
}

interface WorkflowStep {
  id: string;
  operation: string;
  parameters: Record<string, any>;
  order: number;
}

interface FileData {
  name: string;
  type: string;
  size: number;
  columns: string[];
  path: string;
  lastModified: Date;
  sheets?: { [sheetName: string]: string[] };
  headerConfig?: {
    row: number;
    merged: boolean;
    customHeaders?: string[];
    autoDetected: boolean;
  };
  currentSheet?: string;
}

interface DashboardProps {
  projects: Project[];
  workflows: Workflow[];
  importedFiles: FileData[];
  getTotalDataVolume: () => number;
  formatDataVolume: (bytes: number) => string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  projects, 
  workflows, 
  importedFiles, 
  getTotalDataVolume, 
  formatDataVolume 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'workflows'>('overview');

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '🔄';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto bg-gray-50">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h1>
        <p className="text-gray-600">Here's what's happening with your data projects today.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg shadow-sm">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'projects', label: 'Projects', icon: Folder },
          { id: 'workflows', label: 'Workflows', icon: GitBranch }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { 
                label: 'Active Projects', 
                value: projects.length.toString(), 
                icon: Folder,
                color: 'bg-blue-500',
                change: '+2 this week'
              },
              { 
                label: 'Total Workflows', 
                value: workflows.length.toString(), 
                icon: GitBranch,
                color: 'bg-green-500',
                change: '+5 this week'
              },
              { 
                label: 'Data Volume', 
                value: formatDataVolume(getTotalDataVolume()), 
                icon: Database,
                color: 'bg-purple-500',
                change: '+1.2 GB today'
              },
              { 
                label: 'Processing Jobs', 
                value: workflows.filter(w => w.status === 'running').length.toString(), 
                icon: Zap,
                color: 'bg-orange-500',
                change: '2 active'
              }
            ].map((stat) => (
              <Card key={stat.label} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold mt-2 text-gray-900">{stat.value}</p>
                      <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                      <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Projects */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Folder className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-500">{project.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 font-medium">
                          {project.workflows.length} workflows
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(project.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No projects yet</p>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2">
                        Create your first project
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Workflows */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Workflows</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {workflows.slice(0, 3).map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <GitBranch className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                          <p className="text-sm text-gray-500">{workflow.project}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 font-medium">
                          {workflow.steps.length} steps
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(workflow.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {workflows.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <GitBranch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No workflows yet</p>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2">
                        Create your first workflow
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-8 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-6 text-gray-900">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Upload, label: 'Import Data', color: 'bg-blue-500', description: 'Upload files' },
                  { icon: GitBranch, label: 'New Workflow', color: 'bg-green-500', description: 'Create pipeline' },
                  { icon: Folder, label: 'New Project', color: 'bg-purple-500', description: 'Start project' },
                  { icon: Play, label: 'Run Workflow', color: 'bg-orange-500', description: 'Execute jobs' }
                ].map((action) => (
                  <button
                    key={action.label}
                    className="group p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all hover:scale-105"
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{action.label}</h3>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">All Projects</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              + New Project
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Folder className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">{project.description}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Workflows:</span>
                      <span className="font-medium">{project.workflows.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)} {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Modified:</span>
                      <span className="text-gray-700">{new Date(project.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'workflows' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">All Workflows</h2>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              + New Workflow
            </button>
          </div>
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <GitBranch className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                        <p className="text-sm text-gray-500">{workflow.description}</p>
                        <p className="text-xs text-gray-400 mt-1">Project: {workflow.project}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 font-medium">
                        {workflow.steps.length} steps
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(workflow.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
