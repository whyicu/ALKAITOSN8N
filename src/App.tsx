import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroHome } from './components/HeroHome';
import { PromptInputBar } from './components/PromptInputBar';
import { SettingsModal } from './components/SettingsModal';
import { ReActFeed } from './components/ReActFeed';
import { BackendCodeViewer } from './components/BackendCodeViewer';
import { WorkspaceEditor } from './components/WorkspaceEditor';
import { TerminalView } from './components/TerminalView';
import { RagExplorer } from './components/RagExplorer';
import { LspViewer } from './components/LspViewer';
import { INITIAL_WORKSPACE_FILES } from './data/workspaceFiles';
import { SettingsState, ReActStep, WorkspaceFile } from './types';
import { FileCode, Terminal, Database, Layers, ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';

export function App() {
  // Navigation & View States
  const [activeView, setActiveView] = useState<'home' | 'workspace' | 'backend'>('home');
  const [workspaceRightTab, setWorkspaceRightTab] = useState<'backend' | 'editor' | 'terminal' | 'rag' | 'lsp'>('backend');
  
  // Settings State matching Screenshots 1, 3, 4
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');
  const [settings, setSettings] = useState<SettingsState>({
    language: 'ar',
    autoApprove: true,
    shell: 'تلقائي (افتراضي)',
    showReasoning: true,
    shellExpand: false,
    editExpand: false,
    planningLayout: true,
    selectedModel: 'NousResearch/Hermes-3-Llama-3.1-70B',
    activeProvider: 'AlKaitOS Native / vLLM',
    endpointUrl: 'http://localhost:4096/v1',
    apiKey: '',
  });

  // Prompt input and ReAct Loop execution state
  const [inputPrompt, setInputPrompt] = useState('');
  const [currentTask, setCurrentTask] = useState('إصلاح الخلل في calculator.py واختبار الكود ذاتياً');
  const [isExecuting, setIsExecuting] = useState(false);
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>(INITIAL_WORKSPACE_FILES);
  const [activeFile, setActiveFile] = useState<WorkspaceFile>(INITIAL_WORKSPACE_FILES[0]);
  const [showDiff, setShowDiff] = useState(false);

  // Initial ReAct steps showcasing the full 4 pillars
  const [steps, setSteps] = useState<ReActStep[]>([
    {
      id: 'step-1',
      stepNumber: 1,
      phase: 'observation',
      title: '1. المراقبة: رصد استدعاء الفحص وتحليل الخطأ',
      thought: 'المستخدم يطلب إصلاح دالة divide في calculator.py واختبار النظام ذاتياً.',
      timestamp: '21:14:02',
      toolName: 'Codebase_RAG',
      toolInput: { query: 'divide function definition and tests' },
      toolOutput: {
        success: true,
        stdout: 'Found 2 matching chunks in calculator.py (lines 16-20) and test_calculator.py (lines 7-11)',
      },
      evaluation: {
        passed: true,
        reasoning: 'تم تحديد موقع المشكلة بدقة داخل calculator.py سطر 16.',
        nextAction: 'تشغيل الاختبارات لمعاينة الفشل الفعلي في Terminal.',
      },
    },
    {
      id: 'step-2',
      stepNumber: 2,
      phase: 'action',
      title: '2. الفعل: تشغيل Pytest في الطرفية المعزولة (Workspace_Bash)',
      thought: 'سأقوم بتشغيل pytest tests/ لمعرفة سبب تعطل الدالة ومخرجات الـ Exception.',
      timestamp: '21:14:05',
      toolName: 'Workspace_Bash',
      toolInput: { command: 'pytest tests/test_calculator.py' },
      toolOutput: {
        success: false,
        stderr: 'FAILED tests/test_calculator.py::test_divide - ZeroDivisionError: division by zero',
      },
      evaluation: {
        passed: false,
        reasoning: 'فشل الاختبار: ZeroDivisionError حدث عند استدعاء divide(10, 0).',
        nextAction: 'تجهيز Patch لمعالجة القسمة على الصفر ورفع ValueError مناسب.',
      },
    },
    {
      id: 'step-3',
      stepNumber: 3,
      phase: 'action',
      title: '3. الفعل: تطبيق التعديل عبر File_Patcher (توفير Tokens)',
      thought: 'بدلاً من إعادة كتابة الملف كاملاً، سأقوم بإنشاء Unified Diff patch لتعديل دالة divide فقط.',
      timestamp: '21:14:08',
      toolName: 'File_Patcher',
      toolInput: {
        file_path: 'calculator.py',
        patch: `--- a/calculator.py\n+++ b/calculator.py\n@@ -16,3 +16,5 @@\n def divide(a: float, b: float) -> float:\n-    return a / b\n+    if b == 0:\n+        raise ValueError("Cannot divide by zero in AlKaitOS core engine")\n+    return a / b`,
      },
      toolOutput: {
        success: true,
        stdout: 'Patch applied cleanly to calculator.py. 2 lines added, 1 removed.',
      },
      evaluation: {
        passed: true,
        reasoning: 'تم تطبيق الـ Patch بنجاح دون أخطاء في التنسيق.',
        nextAction: 'فحص الملف عبر بروتوكول خادم اللغة (LSP) قبل الاختبار.',
      },
    },
    {
      id: 'step-4',
      stepNumber: 4,
      phase: 'evaluation',
      title: '4. التحقق والتقييم: فحص LSP وتشغيل الاختبارات النهائية',
      thought: 'التحقق عبر LSP_Analyzer من سلامة الرموز، ثم إعادة تشغيل pytest للتأكد من الإصلاح الذاتي.',
      timestamp: '21:14:12',
      toolName: 'Workspace_Bash',
      toolInput: { command: 'pytest tests/' },
      toolOutput: {
        success: true,
        stdout: '============================== 2 passed in 0.04s ===============================',
      },
      evaluation: {
        passed: true,
        reasoning: 'نجحت جميع الاختبارات وتم حل المشكلة ذاتياً والتحقق بنجاح تام!',
      },
    },
  ]);

  const handleOpenSettings = (tab: string = 'general') => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const handleUpdateSettings = (newVals: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...newVals }));
  };

  const handleNewSession = () => {
    setActiveView('home');
    setInputPrompt('');
  };

  // Run ReAct Loop on a task
  const runReActTask = async (taskText: string) => {
    setCurrentTask(taskText);
    setActiveView('workspace');
    setIsExecuting(true);

    const initialStep: ReActStep = {
      id: String(Date.now()),
      stepNumber: steps.length + 1,
      phase: 'observation',
      title: `المراقبة: استلام طلب "${taskText.slice(0, 30)}..."`,
      thought: `الوكيل يفحص مسار العمل /opt/alkaitos/ALKAITOS ويبدأ في التخطيط لحل المهمة...`,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
      toolName: 'Codebase_RAG',
      toolInput: { query: taskText },
      toolOutput: {
        success: true,
        stdout: 'Codebase RAG scanned 14 AST nodes in local repository.',
      },
    };

    setSteps((prev) => [...prev, initialStep]);

    // Try server ReAct API
    try {
      const response = await fetch('/api/agent/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: taskText, model: settings.selectedModel }),
      });
      const data = await response.json();

      if (data.steps && Array.isArray(data.steps) && data.steps.length > 0) {
        setTimeout(() => {
          setSteps((prev) => {
            // If the server returned a full plan including an observation, replace the temporary placeholder
            const hasObservation = data.steps[0]?.phase === 'observation';
            const baseSteps = hasObservation
              ? prev.filter((s) => s.id !== initialStep.id)
              : prev;

            const formatted = data.steps.map((s: any, idx: number) => ({
              id: String(Date.now() + idx),
              stepNumber: baseSteps.length + idx + 1,
              phase: s.phase || 'action',
              title: s.title || `خطوة ${idx + 1}`,
              thought: s.thought || '',
              timestamp: new Date().toLocaleTimeString('ar-EG'),
              toolName: s.toolName || 'Workspace_Bash',
              toolInput: s.toolInput || {},
              toolOutput: s.toolOutput || { success: true, stdout: 'OK' },
              evaluation: s.evaluation || { passed: true, reasoning: 'تم التنفيذ بنجاح' },
            }));

            return [...baseSteps, ...formatted];
          });
          setIsExecuting(false);
        }, 800);
        return;
      }
    } catch {
      // Graceful local engine simulation
    }

    // Step 2 & 3 Action / Evaluation Fallback
    setTimeout(() => {
      setSteps((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          stepNumber: prev.length + 1,
          phase: 'action',
          title: 'الفعل: تنفيذ التعديل الذاتي عبر File_Patcher',
          thought: 'سأستدعي أداة File_Patcher لتطبيق التعديلات المطلوبة ثم فحص الكود عبر LSP_Analyzer.',
          timestamp: new Date().toLocaleTimeString('ar-EG'),
          toolName: 'File_Patcher',
          toolInput: { file_path: 'calculator.py', operation: 'apply_patch' },
          toolOutput: {
            success: true,
            stdout: 'Patch successfully verified by AST parser. 0 syntax errors.',
          },
          evaluation: {
            passed: true,
            reasoning: 'تم تطبيق التعديل وفحصه بنجاح.',
            nextAction: 'إعادة تشغيل الاختبارات في Terminal.',
          },
        },
        {
          id: String(Date.now() + 2),
          stepNumber: prev.length + 2,
          phase: 'evaluation',
          title: 'التحقق والتقييم: اختبارات pytest واكتمال الإصلاح الذاتي',
          thought: 'إعادة تشغيل الاختبارات للتأكد من نجاحها وعدم وجود أخطاء في الـ Sandbox.',
          timestamp: new Date().toLocaleTimeString('ar-EG'),
          toolName: 'Workspace_Bash',
          toolInput: { command: 'pytest tests/' },
          toolOutput: {
            success: true,
            stdout: '============================== 2 passed in 0.04s ===============================',
          },
          evaluation: {
            passed: true,
            reasoning: 'تم اجتياز جميع الاختبارات بنجاح 100%!',
          },
        },
      ]);
      setIsExecuting(false);
    }, 1000);
  };

  const handleApproveAction = (stepId: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId ? { ...s, approvalStatus: 'approved', requiresApproval: false } : s
      )
    );
  };

  const handleRejectAction = (stepId: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId ? { ...s, approvalStatus: 'rejected', requiresApproval: false } : s
      )
    );
  };

  return (
    <div className="h-screen w-screen bg-[#090a0f] text-slate-100 flex flex-col overflow-hidden select-none font-sans" dir="rtl">
      {/* Top Application Header matching screenshots */}
      <Header
        settings={settings}
        onOpenSettings={handleOpenSettings}
        onNewSession={handleNewSession}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Viewport */}
      <main className="flex-1 flex overflow-hidden">
        {/* VIEW 1: HERO HOME matching Screenshot 2 */}
        {activeView === 'home' && (
          <HeroHome
            onSelectPrompt={(p) => setInputPrompt(p)}
            onOpenBackend={() => setActiveView('backend')}
            onStartReAct={(key) => {
              if (key === 'fix_division') {
                runReActTask('إصلاح الخلل في calculator.py واختبار الكود ذاتياً');
              } else if (key === 'rag_ast') {
                runReActTask('فهرسة دوال المشروع دلالياً وتقسيم الـ AST');
              } else if (key === 'lsp_check') {
                runReActTask('فحص الرموز غير المعرفة في calculator.py عبر LSP');
              }
            }}
          />
        )}

        {/* VIEW 2: FULL REACT & WORKSPACE SPLIT VIEW */}
        {activeView === 'workspace' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Pane: ReAct Feed (State Machine) */}
            <div className="w-full md:w-5/12 h-1/2 md:h-full flex flex-col overflow-hidden">
              <ReActFeed
                steps={steps}
                currentTask={currentTask}
                isExecuting={isExecuting}
                settings={settings}
                onApproveAction={handleApproveAction}
                onRejectAction={handleRejectAction}
              />
            </div>

            {/* Right Pane: Multi-Tab Engineering Tools */}
            <div className="flex-1 h-1/2 md:h-full flex flex-col bg-[#0b0c10] overflow-hidden">
              {/* Right Pane Navigation Bar */}
              <div className="h-10 bg-[#101217] border-b border-[#1f2430] px-3 flex items-center justify-between select-none">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setWorkspaceRightTab('backend')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
                      workspaceRightTab === 'backend'
                        ? 'bg-[#1b2538] text-blue-400 font-semibold border border-blue-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>كود Backend و Systemd</span>
                  </button>

                  <button
                    onClick={() => setWorkspaceRightTab('editor')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
                      workspaceRightTab === 'editor'
                        ? 'bg-[#1e2330] text-white font-medium shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>محرر الكود و Diff Patch</span>
                  </button>

                  <button
                    onClick={() => setWorkspaceRightTab('terminal')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
                      workspaceRightTab === 'terminal'
                        ? 'bg-[#1e2330] text-amber-300 font-medium shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>الطرفية (Bash)</span>
                  </button>

                  <button
                    onClick={() => setWorkspaceRightTab('rag')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
                      workspaceRightTab === 'rag'
                        ? 'bg-[#1e2330] text-purple-300 font-medium shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>فهرس AST (RAG)</span>
                  </button>

                  <button
                    onClick={() => setWorkspaceRightTab('lsp')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
                      workspaceRightTab === 'lsp'
                        ? 'bg-[#1e2330] text-cyan-300 font-medium shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>LSP Diagnostics</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
                  Docker MicroVM / opt / alkaitos
                </div>
              </div>

              {/* Tab Content Rendering */}
              <div className="flex-1 flex overflow-hidden">
                {workspaceRightTab === 'backend' && <BackendCodeViewer />}
                {workspaceRightTab === 'editor' && (
                  <WorkspaceEditor
                    files={workspaceFiles}
                    activeFile={activeFile}
                    setActiveFile={setActiveFile}
                    showDiff={showDiff}
                    setShowDiff={setShowDiff}
                  />
                )}
                {workspaceRightTab === 'terminal' && <TerminalView />}
                {workspaceRightTab === 'rag' && <RagExplorer />}
                {workspaceRightTab === 'lsp' && <LspViewer />}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: DEDICATED BACKEND CODE AND SYSTEMD VIEWER */}
        {activeView === 'backend' && <BackendCodeViewer />}
      </main>

      {/* Bottom Floating Prompt Bar matching Screenshot 2 */}
      <PromptInputBar
        inputPrompt={inputPrompt}
        setInputPrompt={setInputPrompt}
        onSubmit={(prompt) => {
          runReActTask(prompt);
          setInputPrompt('');
        }}
        isExecuting={isExecuting}
        settings={settings}
        onOpenSettings={handleOpenSettings}
      />

      {/* Settings Modal matching Screenshots 1, 3, 4 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        initialTab={settingsTab}
      />
    </div>
  );
}
export default App;
