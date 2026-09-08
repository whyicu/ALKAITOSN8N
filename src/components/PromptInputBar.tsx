import React, { useState } from 'react';
import { ArrowUp, Plus, ChevronDown, Sparkles, Terminal, ShieldAlert } from 'lucide-react';
import { SettingsState } from '../types';

interface PromptInputBarProps {
  inputPrompt: string;
  setInputPrompt: (val: string) => void;
  onSubmit: (prompt: string) => void;
  isExecuting: boolean;
  settings: SettingsState;
  onOpenSettings: (tab?: string) => void;
}

export const PromptInputBar: React.FC<PromptInputBarProps> = ({
  inputPrompt,
  setInputPrompt,
  onSubmit,
  isExecuting,
  settings,
  onOpenSettings,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputPrompt.trim() && !isExecuting) {
        onSubmit(inputPrompt);
      }
    }
  };

  return (
    <div className="p-3 bg-[#0a0c10] border-t border-[#1d212b] select-none sticky bottom-0 z-30">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#12141a] border border-[#232734] hover:border-[#32384a] focus-within:border-emerald-500/50 rounded-xl transition-all shadow-xl p-2.5 flex flex-col gap-2">
          {/* Textarea */}
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='اسأل أي شيء... "مراجعة الكود الخاص بي لأفضل الممارسات أو إصلاح خطأ"'
            rows={2}
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed px-1"
            disabled={isExecuting}
          />

          {/* Bottom Bar matching screenshot 2 */}
          <div className="flex items-center justify-between pt-1 border-t border-[#1a1e28]">
            {/* Action Tools & Model Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => onOpenSettings('servers')}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1d212c] transition-colors"
                title="إضافة سياق أو ملف (Attach context)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              {/* Client-1-Prompt-E pill matching screenshot */}
              <div
                onClick={() => onOpenSettings('models')}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#161a23] border border-[#252a39] text-[11px] text-slate-300 hover:border-slate-500 cursor-pointer transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="font-mono text-[10px] text-slate-300">
                  {settings.selectedModel.split('/').pop()?.slice(0, 16) || 'Hermes-3-70B'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </div>

              {/* تحديد نموذج button matching screenshot */}
              <button
                type="button"
                onClick={() => onOpenSettings('models')}
                className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded hover:bg-[#181c26] transition-colors flex items-center gap-1"
              >
                <span>تحديد نموذج</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
            </div>

            {/* Submit Arrow Button */}
            <button
              type="button"
              onClick={() => {
                if (inputPrompt.trim() && !isExecuting) {
                  onSubmit(inputPrompt);
                }
              }}
              disabled={!inputPrompt.trim() || isExecuting}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                inputPrompt.trim() && !isExecuting
                  ? 'bg-slate-200 text-slate-900 hover:bg-white hover:scale-105 shadow-md'
                  : 'bg-[#1b1e27] text-slate-600 cursor-not-allowed'
              }`}
              title="إرسال المهمة للوكيل"
            >
              {isExecuting ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Status notice */}
        <div className="mt-1 px-2 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>محرك ReAct:</span>
            <span className="text-emerald-400 font-mono">Hermes FSM + MCP Tools (Bash, Patcher, LSP, RAG)</span>
          </div>
          <div className="font-mono">localhost:4096</div>
        </div>
      </div>
    </div>
  );
};
