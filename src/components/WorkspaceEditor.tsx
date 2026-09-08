import React, { useState } from 'react';
import { FileCode, GitCompare, Save, Check, RefreshCw } from 'lucide-react';
import { WorkspaceFile } from '../types';

interface WorkspaceEditorProps {
  files: WorkspaceFile[];
  activeFile: WorkspaceFile;
  setActiveFile: (f: WorkspaceFile) => void;
  showDiff: boolean;
  setShowDiff: (show: boolean) => void;
}

export const WorkspaceEditor: React.FC<WorkspaceEditorProps> = ({
  files,
  activeFile,
  setActiveFile,
  showDiff,
  setShowDiff,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0d12] overflow-hidden select-text">
      {/* File Tabs Bar */}
      <div className="h-10 bg-[#0e1015] border-b border-[#1d212b] px-2 flex items-center justify-between select-none">
        <div className="flex items-center gap-1 overflow-x-auto">
          {files.map((file) => {
            const isActive = activeFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setActiveFile(file)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-xs transition-colors border-t-2 ${
                  isActive
                    ? 'bg-[#141720] text-white border-emerald-500 font-medium'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-[#12141a]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-xs">{file.name}</span>
                {file.diff && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="تم تعديله بالـ Patch" />
                )}
              </button>
            );
          })}
        </div>

        {/* Diff Toggle Button */}
        {activeFile.diff && (
          <button
            onClick={() => setShowDiff(!showDiff)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
              showDiff
                ? 'bg-cyan-950/60 border-cyan-700/60 text-cyan-300'
                : 'bg-[#151922] border-[#252b3b] text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{showDiff ? 'عرض الكود الكامل' : 'عرض الفروقات (Diff Patch)'}</span>
          </button>
        )}
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed">
        {showDiff && activeFile.diff ? (
          <div className="space-y-0.5">
            <div className="text-[11px] text-cyan-400 font-sans mb-2 p-2 bg-cyan-950/30 rounded border border-cyan-800/40">
              ⚡ تم تطبيق هذا التعديل عبر أداة <code className="font-bold">File_Patcher</code> لتوفير استهلاك الـ Tokens وتجنب إعادة كتابة الملف كاملاً.
            </div>
            {activeFile.diff.split('\n').map((line, idx) => {
              const isAdd = line.startsWith('+') && !line.startsWith('+++');
              const isDel = line.startsWith('-') && !line.startsWith('---');
              const isHdr = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');
              return (
                <div
                  key={idx}
                  className={`py-0.5 px-2 rounded font-mono ${
                    isAdd
                      ? 'bg-emerald-950/50 text-emerald-300 border-l-2 border-emerald-500'
                      : isDel
                      ? 'bg-rose-950/50 text-rose-300 border-l-2 border-rose-500'
                      : isHdr
                      ? 'text-cyan-400 font-bold bg-[#141824]'
                      : 'text-slate-400 hover:bg-[#12151f]'
                  }`}
                >
                  <pre className="whitespace-pre">{line || ' '}</pre>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-0.5">
            {activeFile.content?.split('\n').map((line, idx) => (
              <div key={idx} className="flex hover:bg-[#131620] py-0.5 px-1 rounded transition-colors">
                <span className="w-10 text-slate-600 select-none text-right pr-4 text-[11px]">
                  {idx + 1}
                </span>
                <span className="flex-1 text-slate-300 font-mono whitespace-pre">{line || ' '}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="h-6 bg-[#0e1015] border-t border-[#1d212b] px-3 flex items-center justify-between text-[11px] text-slate-500 font-mono select-none">
        <div className="flex items-center gap-3">
          <span>المسار: /opt/alkaitos/ALKAITOS/{activeFile.path}</span>
          <span>الحجم: {activeFile.size}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>UTF-8</span>
          <span>Python / AlKaitOS Core</span>
        </div>
      </div>
    </div>
  );
};
