import React from 'react';
import { Eye, Brain, Play, CheckCircle2, AlertTriangle, ShieldCheck, Terminal, FileEdit, Search, Check, X, ArrowRight, ShieldAlert } from 'lucide-react';
import { ReActStep, SettingsState } from '../types';

interface ReActFeedProps {
  steps: ReActStep[];
  currentTask: string;
  isExecuting: boolean;
  settings: SettingsState;
  onApproveAction: (stepId: string) => void;
  onRejectAction: (stepId: string) => void;
}

export const ReActFeed: React.FC<ReActFeedProps> = ({
  steps,
  currentTask,
  isExecuting,
  settings,
  onApproveAction,
  onRejectAction,
}) => {
  const getToolIcon = (toolName?: string) => {
    switch (toolName) {
      case 'Workspace_Bash':
        return <Terminal className="w-3.5 h-3.5 text-amber-400" />;
      case 'File_Patcher':
        return <FileEdit className="w-3.5 h-3.5 text-cyan-400" />;
      case 'LSP_Analyzer':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Codebase_RAG':
        return <Search className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Play className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0f14] overflow-hidden select-text border-l border-[#1f232e]">
      {/* Top Banner: Active Task Status */}
      <div className="px-4 py-2.5 bg-[#12141a] border-b border-[#1f232e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold text-slate-200">حلقة ReAct (State Machine)</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1b202c] text-slate-300 border border-[#272e40]">
          {isExecuting ? 'جاري الاستدلال والتنفيذ...' : 'مكتمل'}
        </span>
      </div>

      {/* Task description */}
      <div className="px-4 py-2 bg-[#101217] border-b border-[#1c1f28] text-xs text-slate-300 flex items-center gap-2">
        <span className="text-slate-500 text-[11px]">المهمة الحالية:</span>
        <span className="font-medium text-slate-200 truncate">{currentTask || 'انتظار المهمة...'}</span>
      </div>

      {/* Feed Steps Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans">
        {steps.map((step) => (
          <div
            key={step.id}
            className="p-3.5 rounded-xl bg-[#13161d] border border-[#232734] shadow-sm space-y-3 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            {/* Step Header */}
            <div className="flex items-center justify-between border-b border-[#1c202a] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#1d222e] text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold">
                  {step.stepNumber}
                </span>
                <span className="text-xs font-semibold text-slate-200">{step.title}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{step.timestamp}</span>
            </div>

            {/* 1. المراقبة (Observation) */}
            <div className="bg-[#0e1015] rounded-lg p-2.5 border border-[#1d212b]">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 mb-1">
                <Eye className="w-3.5 h-3.5" />
                <span>1. المراقبة (Observation)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono text-[11px]">
                {step.phase === 'observation' || step.thought ? step.thought : 'تحليل مخرجات البيئة ومسار العمل...'}
              </p>
            </div>

            {/* 2. التفكير (Thought) */}
            {settings.showReasoning && step.thought && (
              <div className="bg-[#11141c] rounded-lg p-2.5 border border-[#1e2330]">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400 mb-1">
                  <Brain className="w-3.5 h-3.5" />
                  <span>2. التفكير والاستدلال (Thought)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {step.thought}
                </p>
              </div>
            )}

            {/* 3. الفعل (Action / Tool Call) */}
            {step.toolName && (
              <div className="bg-[#141720] rounded-lg p-2.5 border border-[#252b3b] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-400">
                    {getToolIcon(step.toolName)}
                    <span>3. الفعل واستدعاء الأداة (Action: {step.toolName})</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#1b202c] text-purple-300 px-1.5 py-0.5 rounded border border-[#2b3346]">
                    MCP Function Call
                  </span>
                </div>

                {/* Input Arguments */}
                <div className="bg-[#0b0c10] rounded p-2 text-[11px] font-mono text-slate-300 overflow-x-auto border border-[#1b1f2b]">
                  <span className="text-slate-500">المدخلات: </span>
                  {JSON.stringify(step.toolInput, null, 2)}
                </div>

                {/* Human-in-the-loop Approval Card if risky */}
                {step.requiresApproval && step.approvalStatus === 'pending' && (
                  <div className="p-3 bg-amber-950/40 border border-amber-600/50 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-amber-200">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-semibold">طلب تصريح أمني (Human-in-the-Loop)</div>
                        <div className="text-[10px] text-amber-300/80">
                          الوكيل يطلب تنفيذ أمر قد يؤثر على النظام. هل توافق على التنفيذ؟
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRejectAction(step.id)}
                        className="px-2.5 py-1 bg-[#251a1a] hover:bg-[#382222] text-rose-300 rounded border border-rose-800/60 text-xs font-medium"
                      >
                        رفض (Reject)
                      </button>
                      <button
                        onClick={() => onApproveAction(step.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
                      >
                        موافقة (Approve)
                      </button>
                    </div>
                  </div>
                )}

                {/* Tool Output / Execution Result */}
                {step.toolOutput && (
                  <div className="mt-2 pt-2 border-t border-[#1f2430]">
                    <div className="text-[10px] text-slate-500 mb-1 flex items-center justify-between">
                      <span>المخرجات (Standard Output):</span>
                      <span className={step.toolOutput.success ? 'text-emerald-400' : 'text-rose-400 font-mono'}>
                        {step.toolOutput.success ? 'نجاح (Exit 0)' : 'تنبيه خطأ (Exit Non-Zero)'}
                      </span>
                    </div>
                    <pre className="bg-[#0b0c10] text-slate-300 p-2 rounded text-[10px] font-mono whitespace-pre-wrap max-h-36 overflow-y-auto border border-[#1b1f2a]">
                      {step.toolOutput.stdout || step.toolOutput.stderr || JSON.stringify(step.toolOutput.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* 4. التقييم والتصحيح (Evaluation) */}
            {step.evaluation && (
              <div className={`rounded-lg p-2.5 border ${
                step.evaluation.passed
                  ? 'bg-emerald-950/20 border-emerald-800/40'
                  : 'bg-rose-950/20 border-rose-800/40'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>4. التقييم والتحقق الذاتي (Evaluation)</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    step.evaluation.passed
                      ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50'
                      : 'bg-rose-900/40 text-rose-300 border border-rose-700/50'
                  }`}>
                    {step.evaluation.passed ? 'تم التحقق بنجاح' : 'إعادة التفكير والتصحيح'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {step.evaluation.reasoning}
                </p>
                {step.evaluation.nextAction && (
                  <div className="mt-1 text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <span>الإجراء التالي:</span>
                    <span className="text-slate-200">{step.evaluation.nextAction}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isExecuting && (
          <div className="p-3 bg-[#13161e] border border-[#232734] rounded-xl flex items-center gap-3 text-xs text-slate-300 animate-pulse">
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span>الوكيل يفكر ويستدعي أدوات الـ MCP داخل الحاوية المعزولة...</span>
          </div>
        )}
      </div>
    </div>
  );
};
