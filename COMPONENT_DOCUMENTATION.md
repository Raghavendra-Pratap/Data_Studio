# Unified Data Studio v2 - Component Documentation

## 🧩 Frontend Component Architecture

### Core Application Structure

#### App.tsx - Main Application Component
**Purpose**: Entry point for the React application, handles routing and global providers
**Location**: `src/App.tsx`
**Dependencies**: React Router, ErrorBoundary, BackendStatusProvider

**Key Features**:
- Application routing with HashRouter
- Global error boundary wrapper
- Backend status provider context
- Database initialization on mount

**State Management**:
```typescript
// Database initialization state
const [databaseInitialized, setDatabaseInitialized] = useState(false);
const [databaseError, setDatabaseError] = useState<string | null>(null);
```

**Routes**:
- `/` → TestDashboard (Landing page)
- `/dashboard` → AppLayout (Main application)
- `/playground` → Playground (Data processing)
- `/test` → TestDashboard (Testing route)

---

#### AppLayout.tsx - Primary Application Layout
**Purpose**: Main application shell with sidebar navigation and content area
**Location**: `src/components/AppLayout.tsx`
**Dependencies**: React Router, Lucide React icons, child components

**Component Structure**:
```
AppLayout
├── Sidebar Navigation
│   ├── Dashboard Tab
│   ├── Workspace Tab
│   ├── Workflows Tab
│   ├── Projects Tab
│   ├── Notifications Tab
│   └── Settings Tab
├── Top Bar
│   ├── Application Title
│   ├── Backend Status Indicator
│   ├── Breadcrumb Navigation
│   └── Action Buttons
└── Main Content Area
    ├── Dashboard Component
    ├── Projects Component
    ├── Workflows Component
    ├── Workspace Component
    ├── Settings Component
    └── Notifications Component
```

**State Management**:
```typescript
// Navigation state
const [activeTab, setActiveTab] = useState('dashboard');
const [selectedProject, setSelectedProject] = useState<Project | null>(null);

// Data state
const [projects, setProjects] = useState<Project[]>([]);
const [workflows, setWorkflows] = useState<Workflow[]>([]);
const [importedFiles, setImportedFiles] = useState<FileData[]>([]);

// UI state
const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
const [workspaceActiveStep, setWorkspaceActiveStep] = useState('import');
```

**Key Functions**:
- `loadDataFromDatabase()` - Load projects and workflows
- `handleSidebarClick(tabId)` - Navigate between tabs
- `handleCreateProject()` - Open project creation dialog
- `handleEditProject(project)` - Edit existing project
- `handleDeleteProject(project)` - Remove project

---

#### Dashboard.tsx - Main Dashboard Component
**Purpose**: Overview dashboard showing project statistics and quick actions
**Location**: `src/components/Dashboard.tsx`
**Dependencies**: UI components, Lucide React icons

**Features**:
- Project count statistics
- Workflow count display
- Data volume metrics
- Quick action buttons
- Recent activity overview

**Props Interface**:
```typescript
interface DashboardProps {
  projects: Project[];
  workflows: Workflow[];
  importedFiles: FileData[];
  getTotalDataVolume: () => number;
  formatDataVolume: (bytes: number) => string;
}
```

**Rendered Elements**:
- Statistics cards (Projects, Workflows, Data Volume)
- Feature highlights
- Navigation shortcuts
- System status indicators

---

#### Playground.tsx - Data Processing Playground
**Purpose**: Interactive environment for testing formulas, workflows, and data processing
**Location**: `src/components/Playground.tsx`
**Size**: ~120KB (2,781 lines) - Most complex component

**Key Features**:
- **Formula Editor**: Advanced mathematical expression builder
- **Workflow Builder**: Visual workflow creation interface
- **Data Preview**: Real-time data visualization
- **Execution Engine**: Workflow testing and validation
- **Template Management**: Save and load workflow templates

**Component Structure**:
```
Playground
├── Formula Editor
│   ├── Expression Builder
│   ├── Function Library
│   ├── Variable Management
│   └── Syntax Validation
├── Workflow Builder
│   ├── Step Configuration
│   ├── Flow Visualization
│   ├── Parameter Settings
│   └── Execution Controls
├── Data Preview
│   ├── Table View
│   ├── Chart Options
│   ├── Filter Controls
│   └── Export Options
└── Template Manager
    ├── Save Dialog
    ├── Load Dialog
    ├── Version Control
    └── Sharing Options
```

**State Management**:
```typescript
// Formula state
const [formula, setFormula] = useState('');
const [variables, setVariables] = useState<Variable[]>([]);
const [functions, setFunctions] = useState<Function[]>([]);

// Workflow state
const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
const [results, setResults] = useState<any[]>([]);

// UI state
const [activeTab, setActiveTab] = useState<'formula' | 'workflow' | 'preview'>('formula');
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
```

**Key Functions**:
- `evaluateFormula(formula, data)` - Execute mathematical expressions
- `executeWorkflow(steps)` - Run workflow steps
- `saveTemplate(name, workflow)` - Save workflow template
- `loadTemplate(id)` - Load saved template
- `exportResults(format)` - Export processed data

---

#### Projects.tsx - Project Management Interface
**Purpose**: Comprehensive project creation, editing, and management
**Location**: `src/components/Projects.tsx`
**Size**: ~29KB (761 lines)

**Features**:
- Project creation and editing
- File import and management
- Workflow assignment
- Project status tracking
- Export and sharing options

**Component Structure**:
```
Projects
├── Project List
│   ├── Project Cards
│   ├── Status Indicators
│   ├── Quick Actions
│   └── Search/Filter
├── Project Details
│   ├── Information Panel
│   ├── File Management
│   ├── Workflow List
│   └── Activity Log
└── Project Actions
    ├── Create New
    ├── Edit Existing
    ├── Delete Project
    └── Export Data
```

**State Management**:
```typescript
// Project state
const [projects, setProjects] = useState<Project[]>([]);
const [selectedProject, setSelectedProject] = useState<Project | null>(null);
const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

// UI state
const [showCreateDialog, setShowCreateDialog] = useState(false);
const [showEditDialog, setShowEditDialog] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [sortBy, setSortBy] = useState<'name' | 'created' | 'modified'>('modified');
```

---

#### Workflows.tsx - Workflow Management
**Purpose**: Create, edit, and manage data processing workflows
**Location**: `src/components/Workflows.tsx`
**Size**: ~15KB (405 lines)

**Features**:
- Workflow creation wizard
- Step configuration
- Parameter management
- Execution scheduling
- Performance monitoring

**Workflow Types**:
- **Data Import**: File parsing and validation
- **Data Transformation**: Formula application and filtering
- **Data Export**: Format conversion and delivery
- **Data Analysis**: Statistical processing and insights

---

#### Workspace.tsx - Data Workspace
**Purpose**: Interactive data workspace for file management and processing
**Location**: `src/components/Workspace.tsx`
**Size**: ~34KB (753 lines)

**Features**:
- File drag-and-drop import
- Data preview and editing
- Column management
- Sheet handling (Excel)
- Real-time data processing

**Workspace Modes**:
- **Import Mode**: File upload and validation
- **Edit Mode**: Data modification and cleaning
- **Process Mode**: Workflow execution
- **Export Mode**: Data output and delivery

---

#### Settings.tsx - Application Configuration
**Purpose**: User preferences and application settings
**Location**: `src/components/Settings.tsx`
**Size**: ~29KB (683 lines)

**Configuration Categories**:
- **General**: App appearance and behavior
- **Data**: Processing preferences and limits
- **Backend**: Connection and performance settings
- **Security**: Authentication and encryption
- **Advanced**: Developer options and debugging

---

### Service Layer Components

#### BackendService.ts - API Communication
**Purpose**: HTTP communication with Rust backend service
**Location**: `src/services/BackendService.ts`

**API Endpoints**:
- `GET /health` - Backend health check
- `GET /api/projects` - Retrieve projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Remove project
- `GET /api/workflows` - Retrieve workflows
- `POST /api/workflows` - Create workflow
- `POST /api/workflows/:id/execute` - Execute workflow

**Error Handling**:
- Network error detection
- Response validation
- Retry logic for failed requests
- User-friendly error messages

---

#### BackendStatusService.ts - Health Monitoring
**Purpose**: Monitor backend service health and connectivity
**Location**: `src/services/BackendStatusService.ts`

**Monitoring Features**:
- Health check polling
- Connection status tracking
- Performance metrics
- Error reporting
- Auto-reconnection

**Status States**:
- `connected` - Backend responding normally
- `connecting` - Attempting to establish connection
- `disconnected` - No backend connection
- `error` - Connection or service error

---

#### DatabaseManager.ts - Data Persistence
**Purpose**: Local data storage and management
**Location**: `src/utils/database.ts`

**Storage Engines**:
- **Primary**: IndexedDB (modern browsers)
- **Fallback**: localStorage (compatibility)

**Data Models**:
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  workflows: Workflow[];
  inputFiles: FileData[];
  outputFiles: FileData[];
  created: Date;
  lastModified: Date;
  status: 'idle' | 'processing' | 'completed' | 'error';
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  project: string;
  created: Date;
  lastModified: Date;
  version: string;
}
```

**Key Functions**:
- `initializeDatabase()` - Setup storage system
- `getProjects()` - Retrieve all projects
- `saveProject(project)` - Store project data
- `deleteProject(id)` - Remove project
- `getWorkflows()` - Retrieve workflows
- `saveWorkflow(workflow)` - Store workflow

---

### Context Providers

#### BackendContext.tsx - Backend State Management
**Purpose**: Global backend status and connectivity state
**Location**: `src/contexts/BackendContext.tsx`

**Context State**:
```typescript
interface BackendStatus {
  connected: boolean;
  port: number;
  processRunning: boolean;
  lastHeartbeat?: string;
}

interface BackendContextType {
  status: BackendStatus;
  updateStatus: (status: BackendStatus) => void;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  restartBackend: () => Promise<void>;
}
```

**Features**:
- Real-time status updates
- Connection management
- Error handling
- Auto-reconnection
- Browser/Electron mode detection

---

#### ProjectContext.tsx - Project State Management
**Purpose**: Global project state and operations
**Location**: `src/contexts/ProjectContext.tsx`

**Context State**:
```typescript
interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectProject: (project: Project | null) => void;
}
```

---

### Utility Components

#### ErrorBoundary.tsx - Error Handling
**Purpose**: Catch and handle React component errors
**Location**: `src/components/ErrorBoundary.tsx`

**Features**:
- Error detection and logging
- User-friendly error display
- Recovery options
- Error reporting
- Graceful degradation

**Error Display**:
- Error message and details
- Component stack trace
- Recovery suggestions
- Reload application option

---

#### BackendStatusIndicator.tsx - Status Display
**Purpose**: Visual indicator of backend connection status
**Location**: `src/components/BackendStatusIndicator.tsx`

**Status Indicators**:
- 🟢 **Connected** - Backend running normally
- 🟡 **Connecting** - Establishing connection
- 🔴 **Disconnected** - No backend connection
- ⚠️ **Error** - Connection or service error

**Features**:
- Real-time status updates
- Click to reconnect
- Tooltip with details
- Animated transitions

---

## 🔄 Component Interactions

### Data Flow Patterns

#### State Management Flow
```
User Action → Component → Context → Service → Backend → Database
     ↑                                                      ↓
     └─────────────── Response ← Update ← State ←──────────┘
```

#### Error Handling Flow
```
Error → ErrorBoundary → Context → Service → User Notification
  ↑                                                      ↓
  └─────────────── Recovery ← Retry ← Logging ←──────────┘
```

#### Backend Communication Flow
```
Component → BackendContext → BackendService → HTTP Request
     ↑                                                      ↓
     └─────────────── Response ← Update ← State ←──────────┘
```

### Component Dependencies

#### Core Dependencies
- **React 18.2.0** - All components
- **TypeScript 4.9.5** - Type definitions
- **Tailwind CSS 3.4.0** - Styling
- **Lucide React 0.469.0** - Icons

#### Internal Dependencies
- **ErrorBoundary** → Wraps all major components
- **BackendStatusProvider** → Provides backend context
- **Router** → Enables navigation
- **DatabaseManager** → Data persistence

#### External Dependencies
- **TensorFlow.js** - Machine learning
- **PapaParse** - CSV parsing
- **XLSX** - Excel handling
- **Axios** - HTTP requests

## 📱 Responsive Design

### Breakpoint Strategy
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1440px

### Component Adaptations
- **Sidebar**: Collapsible on mobile
- **Navigation**: Horizontal on mobile, vertical on desktop
- **Content**: Single column on mobile, multi-column on desktop
- **Actions**: Dropdown menus on mobile, button bars on desktop

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#007bff)
- **Secondary**: Green (#28a745)
- **Warning**: Yellow (#ffc107)
- **Error**: Red (#dc3545)
- **Success**: Green (#28a745)
- **Info**: Blue (#17a2b8)

### Typography
- **Headings**: Inter, system fonts
- **Body**: Inter, system fonts
- **Monospace**: JetBrains Mono, Consolas
- **Sizes**: 12px - 48px scale

### Spacing System
- **Base Unit**: 4px
- **Scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px

### Component Variants
- **Buttons**: Primary, Secondary, Outline, Ghost
- **Cards**: Default, Elevated, Interactive
- **Inputs**: Text, Number, Select, Textarea
- **Modals**: Small, Medium, Large, Fullscreen

---

*This component documentation is maintained by the Unified Data Studio development team and should be updated with each component modification.*
