import React, { useState } from 'react';
import { Search, Server, Plus, ChevronDown, Check, Terminal, Cpu, Puzzle, ExternalLink, Settings, HelpCircle } from 'lucide-react';
import { SettingsState } from '../types';

interface HeaderProps {
  settings: SettingsState;
  onOpenSettings: (tab?: string) => void;
  onNewSession: () => void;
  activeView: 'home' | 'workspace' | 'backend';
  setActiveView: (view: 'home' | 'workspace' | 'backend') => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenSettings,
  onNewSession,
  activeView,
  setActiveView,
}) => {
  const [showServersDropdown, setShowServersDropdown] = useState(false);

  return (
    <header className="h-12 bg-[#0b0c0f] border-b border-[#1e222b] flex items-center justify-between px-3 text-xs select-none sticky top-0 z-40">
      {/* Right / Left in RTL: Brand & Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveView('home')}
          className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
          title="AlKaitOS Home"
        >
          A
        </button>

        <button
          onClick={onNewSession}
          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1a1d24] transition-colors"
          title="جلسة جديدة (New Session)"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-[#262a35] mx-0.5" />

        <span className="px-1.5 py-0.5 rounded bg-[#162744] text-[#4ea1ff] font-semibold text-[10px] tracking-wide border border-[#1e3e70]">
          DEV
        </span>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
          <span className="text-slate-200">/opt/alkaitos/ALKAITOS</span>
          <span className="text-slate-600">/</span>
          <span className="text-emerald-400 font-sans">
            {activeView === 'home' ? 'الصفحة الرئيسية' : activeView === 'backend' ? 'كود الـ Backend' : 'مساحة العمل (ReAct)'}
          </span>
        </div>
      </div>

      {/* Center Search Bar matching screenshot: بحث ALKAITOS Ctrl+K */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative group">
          <input
            type="text"
            readOnly
            onClick={() => onOpenSettings('general')}
            placeholder="بحث ALKAITOS"
            className="w-full h-7 bg-[#14161c] border border-[#232733] rounded-md px-8 text-center text-[11px] text-slate-300 placeholder-slate-500 cursor-pointer focus:outline-none group-hover:border-[#353b4d] transition-colors"
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-1.5 text-slate-500" />
          <span className="absolute left-2 top-1.5 text-[10px] font-mono text-slate-500 bg-[#1c202a] px-1 rounded border border-[#2b3140]">
            Ctrl+K
          </span>
        </div>
      </div>

      {/* Left items in RTL: Servers menu, Views switcher, Settings */}
      <div className="flex items-center gap-2">
        {/* Navigation tabs */}
        <div className="hidden md:flex items-center bg-[#13151b] border border-[#202430] p-0.5 rounded-md text-[11px]">
          <button
            onClick={() => setActiveView('home')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeView === 'home' ? 'bg-[#222735] text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            الرئيسية
          </button>
          <button
            onClick={() => setActiveView('workspace')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeView === 'workspace' ? 'bg-[#222735] text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            محرك ReAct الحي
          </button>
          <button
            onClick={() => setActiveView('backend')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeView === 'backend' ? 'bg-[#1b2b48] text-[#60a5fa] font-medium shadow-sm border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            كود Backend و Systemd
          </button>
        </div>

        {/* Servers Dropdown Button matching screenshot: الخوادم 1 */}
        <div className="relative">
          <button
            onClick={() => setShowServersDropdown(!showServersDropdown)}
            className="flex items-center gap-1.5 h-7 px-2 rounded-md bg-[#14161c] border border-[#232733] hover:border-[#353b4d] text-slate-300 text-[11px] transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>الخوادم 1</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showServersDropdown && (
            <div className="absolute left-0 mt-1.5 w-64 bg-[#14161d] border border-[#262b3a] rounded-lg shadow-2xl py-1 text-slate-300 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-[#202533] flex items-center justify-between text-[11px]">
                <span className="text-slate-400">الخوادم المتصلة</span>
                <span className="text-emerald-400 text-[10px] font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                  متصل
                </span>
              </div>

              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between p-1.5 rounded hover:bg-[#1e222e] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <div className="font-mono text-slate-200 text-xs">localhost:4096</div>
                      <div className="text-[10px] text-slate-400">AlKaitOS Daemon v1.0.0</div>
                    </div>
                  </div>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px] text-slate-400 border-t border-[#1e222f]">
                  <span className="p-1 bg-[#191d28] rounded border border-[#232737] text-cyan-300">MCP (4)</span>
                  <span className="p-1 bg-[#191d28] rounded border border-[#232737] text-purple-300">LSP (جاهز)</span>
                  <span className="p-1 bg-[#191d28] rounded border border-[#232737] text-amber-300">Docker VM</span>
                </div>
              </div>

              <div className="px-2 pt-1 border-t border-[#202533]">
                <button
                  onClick={() => {
                    setShowServersDropdown(false);
                    onOpenSettings('servers');
                  }}
                  className="w-full text-center py-1.5 text-slate-300 hover:text-white hover:bg-[#1d2230] rounded text-[11px] transition-colors"
                >
                  إدارة الخوادم والإضافات
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings button */}
        <button
          onClick={() => onOpenSettings('general')}
          className="w-7 h-7 rounded-md bg-[#14161c] border border-[#232733] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#353b4d] transition-colors"
          title="الإعدادات (Settings)"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
