import React, { useState } from 'react';
import { X, Globe, Shield, Terminal, Brain, Sliders, Layout, Layers, Cpu, Search, Plus, Check, ExternalLink } from 'lucide-react';
import { SettingsState } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsState;
  onUpdateSettings: (newSettings: Partial<SettingsState>) => void;
  initialTab?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  initialTab = 'general',
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [modelSearch, setModelSearch] = useState('');
  const [customProviderUrl, setCustomProviderUrl] = useState('http://localhost:8000/v1');
  const [showAddProvider, setShowAddProvider] = useState(false);

  if (!isOpen) return null;

  const modelsList = [
    {
      id: 'NousResearch/Hermes-3-Llama-3.1-70B',
      name: 'Hermes 3 Llama-3.1 70B',
      provider: 'AlKaitOS Native / vLLM',
      description: 'النموذج المعتمد لمعمارية ReAct والاستدلال البرمجي بدون قيود',
      recommended: true,
    },
    {
      id: 'deepseek-ai/DeepSeek-Coder-V2-Instruct',
      name: 'DeepSeek Coder V2',
      provider: 'OpenAI-Compatible',
      description: 'متخصص في كتابة كود النظم والـ AST Parsing',
      recommended: false,
    },
    {
      id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
      name: 'Qwen 2.5 Coder 32B',
      provider: 'Local Ollama',
      description: 'سريع جداً في توليد ملفات Diff وتعديل الشيفرة المصدرية',
      recommended: false,
    },
    {
      id: 'google/gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      provider: 'Google AI Studio (Server)',
      description: 'فائق السرعة مع نافذة سياق ضخمة واستدعاء أدوات Function Calling دقيق',
      recommended: true,
    }
  ];

  const filteredModels = modelsList.filter(
    (m) =>
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.description.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="bg-[#12141a] border border-[#262a36] w-full max-w-3xl rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="h-12 px-5 border-b border-[#1f232e] flex items-center justify-between text-slate-300">
          <span className="font-semibold text-sm tracking-wide text-slate-200">الإعدادات</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1e222d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Split: Sidebar + Content */}
        <div className="flex-1 flex min-h-[460px] overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-[#0e1015] border-l border-[#1f232e] p-3 flex flex-col justify-between select-none">
            <div className="space-y-4">
              <div>
                <div className="px-2 text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-1">
                  سطح المكتب
                </div>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setActiveTab('general')}
                    className={`w-full text-right px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors ${
                      activeTab === 'general'
                        ? 'bg-[#222735] text-white font-medium shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#171a22]'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>عام</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('shortcuts')}
                    className={`w-full text-right px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors ${
                      activeTab === 'shortcuts'
                        ? 'bg-[#222735] text-white font-medium shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#171a22]'
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5" />
                    <span>اختصارات</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('servers')}
                    className={`w-full text-right px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors ${
                      activeTab === 'servers'
                        ? 'bg-[#222735] text-white font-medium shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#171a22]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>الخوادم</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="px-2 text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-1">
                  الخادم
                </div>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setActiveTab('providers')}
                    className={`w-full text-right px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors ${
                      activeTab === 'providers'
                        ? 'bg-[#222735] text-white font-medium shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#171a22]'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>الموفرون</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('models')}
                    className={`w-full text-right px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors ${
                      activeTab === 'models'
                        ? 'bg-[#222735] text-white font-medium shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#171a22]'
                    }`}
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>النماذج</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Version tag from screenshot */}
            <div className="px-2 pt-2 border-t border-[#1a1e28] text-[10px] text-slate-500 font-mono">
              ALKAITOS Desktop
              <div className="text-slate-400">v1.17.16</div>
            </div>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#13161c]">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-base font-semibold text-white">عام</h3>

                {/* اللغة */}
                <div className="flex items-center justify-between pb-4 border-b border-[#202532]">
                  <div>
                    <div className="text-xs font-medium text-slate-200">اللغة</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">تغيير لغة العرض لـ ALKAITOS</div>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => onUpdateSettings({ language: e.target.value as 'ar' | 'en' })}
                    className="bg-[#1b1f29] border border-[#2b3140] rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* قبول الأذونات تلقائياً */}
                <div className="flex items-center justify-between pb-4 border-b border-[#202532]">
                  <div>
                    <div className="text-xs font-medium text-slate-200">قبول الأذونات تلقائيًا</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">ستتم الموافقة على طلبات الأذونات تلقائيًا (Auto-Approve Safe Actions)</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoApprove}
                      onChange={(e) => onUpdateSettings({ autoApprove: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#252b3a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* المحطة الطرفية Shell */}
                <div className="flex items-center justify-between pb-4 border-b border-[#202532]">
                  <div>
                    <div className="text-xs font-medium text-slate-200">المحطة الطرفية Shell</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 max-w-sm">
                      المتوافقة أيضًا في shell المستخدم في المحطة الطرفية، تُستخدم واجهات shell اختر استدعاءات أدوات الوكيل.
                    </div>
                  </div>
                  <select
                    value={settings.shell}
                    onChange={(e) => onUpdateSettings({ shell: e.target.value })}
                    className="bg-[#1b1f29] border border-[#2b3140] rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="تلقائي (افتراضي)">تلقائي (افتراضي)</option>
                    <option value="bash">bash (/bin/bash)</option>
                    <option value="zsh">zsh</option>
                    <option value="sh">sh</option>
                  </select>
                </div>

                {/* إظهار ملخصات الاستنتاج */}
                <div className="flex items-center justify-between pb-4 border-b border-[#202532]">
                  <div>
                    <div className="text-xs font-medium text-slate-200">إظهار ملخصات الاستنتاج</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">عرض ملخصات استنتاج النموذج في الشريط الزمني (Reasoning & Thought)</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showReasoning}
                      onChange={(e) => onUpdateSettings({ showReasoning: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#252b3a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* shell توسيع أجزاء أداة */}
                <div className="flex items-center justify-between pb-4 border-b border-[#202532]">
                  <div>
                    <div className="text-xs font-medium text-slate-200">shell توسيع أجزاء أداة</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">موسعة بشكل افتراضي في الشريط الزمني إظهار أجزاء أداة shell</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.shellExpand}
                      onChange={(e) => onUpdateSettings({ shellExpand: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#252b3a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* edit توسيع أجزاء أداة */}
                <div className="flex items-center justify-between pb-4 border-b border-[#202532]">
                  <div>
                    <div className="text-xs font-medium text-slate-200">edit توسيع أجزاء أداة</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">موسعة بشكل افتراضي في الشريط الزمني إظهار أجزاء أدوات edit و write و patch</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.editExpand}
                      onChange={(e) => onUpdateSettings({ editExpand: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#252b3a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* التخطيط والتصاميم الجديدة */}
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <div className="text-xs font-medium text-slate-200">التخطيط والتصاميم الجديدة</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">تمكين التخطيط والصفحة الرئيسية ومحرر الرسائل وواجهة الجلسة المعاد تصميمها</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.planningLayout}
                      onChange={(e) => onUpdateSettings({ planningLayout: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#252b3a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'providers' && (
              <div className="space-y-6">
                <h3 className="text-base font-semibold text-white">الموفرون</h3>

                {/* الموفرون المتصلون */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2">الموفرون المتصلون</div>
                  <div className="bg-[#181c25] border border-[#242936] rounded-lg p-4 text-center text-xs text-slate-500">
                    لا يوجد موفرون متصلون حالياً (يتم استخدام خادم AlKaitOS المحلي: localhost:4096)
                  </div>
                </div>

                {/* الموفرون الشائعون */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2">الموفرون الشائعون</div>
                  <div className="space-y-2">
                    {/* موفر مخصص من لقطة الشاشة */}
                    <div className="bg-[#181c25] border border-[#262b39] rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#222735] flex items-center justify-center text-amber-400">
                          ✨
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-200">موفر مخصص</span>
                            <span className="text-[10px] bg-[#222837] text-slate-400 px-1.5 py-0.2 rounded border border-[#2f3547]">
                              مخصص
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            أضف مزود متوافق مع OpenAI بواسطة URL الأساسي
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowAddProvider(!showAddProvider)}
                        className="px-3 py-1 bg-[#232837] hover:bg-[#2e3447] text-slate-200 rounded text-xs font-medium transition-colors border border-[#30374a]"
                      >
                        + اتصال
                      </button>
                    </div>

                    {showAddProvider && (
                      <div className="p-3 bg-[#1e2330] rounded-lg border border-blue-500/30 space-y-2 text-xs">
                        <label className="block text-slate-300">Base URL (مثال: http://localhost:8000/v1):</label>
                        <input
                          type="text"
                          value={customProviderUrl}
                          onChange={(e) => setCustomProviderUrl(e.target.value)}
                          className="w-full bg-[#13161c] border border-[#2d3345] rounded px-3 py-1.5 text-slate-200 font-mono text-xs"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setShowAddProvider(false)}
                            className="px-3 py-1 text-slate-400 hover:text-white"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={() => {
                              onUpdateSettings({ endpointUrl: customProviderUrl });
                              setShowAddProvider(false);
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                          >
                            حفظ وتفعيل
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer pt-2 flex items-center gap-1">
                  <span>عرض المزيد من الموفرين (Local Ollama, Anthropic, Gemini, Mistral)</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            )}

            {activeTab === 'models' && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white">النماذج</h3>

                {/* Search Bar matching screenshot */}
                <div className="relative">
                  <input
                    type="text"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder="البحث عن نماذج..."
                    className="w-full h-8 bg-[#181c25] border border-[#262b39] rounded-md px-8 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#3b4359]"
                  />
                  <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-500" />
                </div>

                {/* Models List */}
                <div className="space-y-2 mt-3">
                  {filteredModels.map((model) => {
                    const isSelected = settings.selectedModel === model.id;
                    return (
                      <div
                        key={model.id}
                        onClick={() => onUpdateSettings({ selectedModel: model.id })}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#1a2336] border-blue-500/60 shadow-sm'
                            : 'bg-[#181c25] border-[#242936] hover:border-[#343b4f]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-200">{model.name}</span>
                              {model.recommended && (
                                <span className="text-[9px] bg-emerald-950/70 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/40">
                                  موصى به
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">{model.id}</div>
                            <div className="text-[11px] text-slate-400 mt-1">{model.description}</div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-500">{model.provider}</span>
                            {isSelected && (
                              <span className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                                <Check className="w-3.5 h-3.5" />
                                نشط
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredModels.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-500">
                      لا توجد نتائج للنماذج المطابقة لـ "{modelSearch}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'servers' && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white">إدارة خوادم AlKaitOS</h3>
                <div className="p-3 bg-[#181c25] border border-[#242936] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs text-emerald-400">localhost:4096</div>
                      <div className="text-[11px] text-slate-400">خادم الوكيل الأساسي (Systemd Service Daemon)</div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-900/50 text-emerald-300 text-[10px] rounded border border-emerald-700/50">
                      يعمل الآن
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#202532] pt-4">
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">أدوات MCP المسجلة في الخادم:</h4>
                  <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
                    <li className="p-2 bg-[#12141a] rounded border border-[#212532] flex items-center justify-between">
                      <span>• Workspace_Bash (Docker MicroVM Execution)</span>
                      <span className="text-emerald-400 font-sans text-[10px]">جاهز</span>
                    </li>
                    <li className="p-2 bg-[#12141a] rounded border border-[#212532] flex items-center justify-between">
                      <span>• File_Patcher (Unified Diff Token Saver)</span>
                      <span className="text-emerald-400 font-sans text-[10px]">جاهز</span>
                    </li>
                    <li className="p-2 bg-[#12141a] rounded border border-[#212532] flex items-center justify-between">
                      <span>• LSP_Analyzer (Language Server Protocol)</span>
                      <span className="text-emerald-400 font-sans text-[10px]">جاهز</span>
                    </li>
                    <li className="p-2 bg-[#12141a] rounded border border-[#212532] flex items-center justify-between">
                      <span>• Codebase_RAG (AST Parser & Vector Memory)</span>
                      <span className="text-emerald-400 font-sans text-[10px]">جاهز</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-white">اختصارات لوحة المفاتيح</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 bg-[#181c25] rounded border border-[#242936]">
                    <span className="text-slate-300">البحث السريع</span>
                    <kbd className="px-2 py-0.5 bg-[#222736] text-slate-200 rounded font-mono text-[10px]">Ctrl + K</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#181c25] rounded border border-[#242936]">
                    <span className="text-slate-300">تشغيل حلقة ReAct فوراً</span>
                    <kbd className="px-2 py-0.5 bg-[#222736] text-slate-200 rounded font-mono text-[10px]">Ctrl + Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#181c25] rounded border border-[#242936]">
                    <span className="text-slate-300">فتح الطرفية المعزولة Bash</span>
                    <kbd className="px-2 py-0.5 bg-[#222736] text-slate-200 rounded font-mono text-[10px]">Ctrl + `</kbd>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
