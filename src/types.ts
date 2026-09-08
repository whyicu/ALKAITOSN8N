export type ReActPhase = 'observation' | 'thought' | 'action' | 'evaluation' | 'completed' | 'failed';

export interface ReActStep {
  id: string;
  stepNumber: number;
  phase: ReActPhase;
  title: string;
  thought?: string;
  toolName?: 'Workspace_Bash' | 'File_Patcher' | 'LSP_Analyzer' | 'Codebase_RAG' | 'System_Notice';
  toolInput?: Record<string, any>;
  toolOutput?: {
    success: boolean;
    stdout?: string;
    stderr?: string;
    details?: any;
  };
  evaluation?: {
    passed: boolean;
    reasoning: string;
    nextAction: string;
  };
  requiresApproval?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface WorkspaceFile {
  path: string;
  name: string;
  type: 'file' | 'dir';
  content?: string;
  language: string;
  diff?: string;
  size?: string;
  modified?: string;
}

export interface BackendSourceFile {
  filename: string;
  relativePath: string;
  category: 'engine' | 'tools' | 'server' | 'systemd' | 'installer';
  description: string;
  code: string;
  language: 'python' | 'ini' | 'bash' | 'markdown';
}

export interface SettingsState {
  language: 'ar' | 'en';
  autoApprove: boolean;
  shell: string;
  showReasoning: boolean;
  shellExpand: boolean;
  editExpand: boolean;
  planningLayout: boolean;
  selectedModel: string;
  activeProvider: string;
  endpointUrl: string;
  apiKey: string;
}

export interface RAGChunk {
  id: string;
  file: string;
  type: 'function' | 'class' | 'module';
  name: string;
  lines: string;
  similarity: number;
  snippet: string;
}

export interface LSPDiagnostic {
  file: string;
  line: number;
  col: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  source: string;
}
