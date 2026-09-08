import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Layers, RefreshCw } from 'lucide-react';
import { MOCK_LSP_DIAGNOSTICS } from '../data/workspaceFiles';

export const LspViewer: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0d12] overflow-hidden select-text">
      {/* Header */}
      <div className="h-10 bg-[#0e1016] border-b border-[#1f2430] px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-xs text-slate-200">
            بروتوكول خادم اللغة (LSP_Analyzer Protocol Diagnostics)
          </span>
          <span className="text-[10px] bg-cyan-950/50 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800/40 font-mono">
            Pyright / AST Real-Time
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="text-emerald-400">● LSP Server Active</span>
        </div>
      </div>

      {/* Blueprint Info Banner */}
      <div className="p-3 bg-[#131620] border-b border-[#1e2330] text-[11px] text-slate-300 leading-relaxed">
        <span className="font-semibold text-cyan-400">دور LSP في معمارية AlKaitOS:</span>{' '}
        يقوم النموذج باستدعاء أداة <code className="text-white font-mono bg-[#1c212e] px-1 rounded">LSP_Analyzer</code>{' '}
        لفحص الملفات بعد تطبيق التعديلات (Patch) وقبل حفظها أو تشغيلها، للتحقق من الدوال غير المعرفة، الأخطاء النحوية، والمراجع في الوقت الفعلي.
      </div>

      {/* Diagnostics List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
        {MOCK_LSP_DIAGNOSTICS.map((diag, index) => (
          <div
            key={index}
            className={`p-3 rounded-xl border flex items-start gap-3 ${
              diag.severity === 'error'
                ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                : diag.severity === 'warning'
                ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                : 'bg-blue-950/20 border-blue-800/40 text-blue-200'
            }`}
          >
            <div className="mt-0.5">
              {diag.severity === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              ) : diag.severity === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <Info className="w-4 h-4 text-blue-400" />
              )}
            </div>

            <div className="flex-1 space-y-1 font-sans">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {diag.file}:{diag.line}:{diag.col}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#101217] text-slate-400 border border-[#232734]">
                  {diag.source}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono text-[11px]">
                {diag.message}
              </p>
            </div>
          </div>
        ))}

        <div className="p-3 bg-[#11141c] rounded-xl border border-[#202534] text-xs text-slate-400 space-y-2">
          <div className="font-semibold text-slate-300">الرموز البرمجية المكتشفة في النطاق (Scope Symbols):</div>
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            <span className="px-2 py-0.5 bg-[#171b26] rounded text-emerald-300 border border-[#262c3e]">
              def add(a, b)
            </span>
            <span className="px-2 py-0.5 bg-[#171b26] rounded text-emerald-300 border border-[#262c3e]">
              def subtract(a, b)
            </span>
            <span className="px-2 py-0.5 bg-[#171b26] rounded text-emerald-300 border border-[#262c3e]">
              def multiply(a, b)
            </span>
            <span className="px-2 py-0.5 bg-[#171b26] rounded text-emerald-300 border border-[#262c3e]">
              def divide(a, b)
            </span>
            <span className="px-2 py-0.5 bg-[#171b26] rounded text-emerald-300 border border-[#262c3e]">
              def power(base, exponent)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
