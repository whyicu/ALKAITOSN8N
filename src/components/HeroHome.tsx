import React from 'react';
import { GitBranch, Clock, Folder, Terminal, Bug, Cpu, FileCode2, Sparkles, BookOpen, Layers } from 'lucide-react';

interface HeroHomeProps {
  onSelectPrompt: (prompt: string) => void;
  onOpenBackend: () => void;
  onStartReAct: (presetKey: string) => void;
}

export const HeroHome: React.FC<HeroHomeProps> = ({
  onSelectPrompt,
  onOpenBackend,
  onStartReAct,
}) => {
  const quickStarters = [
    {
      key: 'fix_division',
      title: 'إصلاح الخلل في calculator.py واختباره ذاتياً',
      badge: 'حلقة ReAct كاملة',
      icon: <Bug className="w-4 h-4 text-rose-400" />,
      desc: 'يراقب الخطأ، يفكر، يطبق File_Patcher، يفحص عبر LSP، ثم يعيد الاختبار في Bash.',
      prompt: 'قم بفحص ملف calculator.py وإصلاح خطأ القسمة على الصفر ثم شغّل اختبارات pytest للتأكد من نجاحها',
    },
    {
      key: 'backend_code',
      title: 'كود الـ Backend وخدمة Systemd لخوادم AlKaitOS',
      badge: 'الطلب الأساسي',
      icon: <FileCode2 className="w-4 h-4 text-blue-400" />,
      desc: 'استعراض وتحميل حزمة Python الكاملة مع react_loop.py وأدوات MCP وملف systemd.',
      action: onOpenBackend,
    },
    {
      key: 'rag_ast',
      title: 'فهرسة الشيفرة المصدرية وتقسيم AST والبحث الدلالي',
      badge: 'Codebase RAG',
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
      desc: 'تفكيك الكود إلى دوال وكلاسات وتخزينها كـ Vectors للبحث دون تجاوز Token limit.',
      prompt: 'استخدم Codebase_RAG لفهرسة كافة الدوال في المشروع والبحث عن دالة القسمة divide',
    },
    {
      key: 'lsp_check',
      title: 'فحص الكود عبر Language Server Protocol (LSP)',
      badge: 'LSP_Analyzer',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      desc: 'كشف الأخطاء الإملائية البرمجية والدوال غير المعرفة في الوقت الفعلي قبل الحفظ.',
      prompt: 'شغّل أداة LSP_Analyzer على ملف calculator.py وافحص الرموز غير المعرفة',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
      {/* Central Visual Icon matching screenshot 2 */}
      <div className="mb-4 relative group">
        <div className="w-16 h-16 rounded-xl bg-[#141720] border-2 border-[#2b3040] flex items-center justify-center shadow-2xl group-hover:border-emerald-500/50 transition-colors">
          <div className="w-7 h-10 border-2 border-slate-300 rounded-sm flex flex-col justify-between p-1 bg-[#1c202d]">
            <div className="w-full h-1 bg-slate-400 rounded-xs" />
            <div className="w-3/4 h-1 bg-slate-500 rounded-xs" />
            <div className="w-1/2 h-1 bg-emerald-400 rounded-xs" />
          </div>
        </div>
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl blur-lg -z-10" />
      </div>

      {/* Main Title matching screenshot 2: ابنِ أي شيء */}
      <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
        ابنِ أي شيء
      </h1>

      {/* Directory and Git branch info matching screenshot 2 */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 font-mono mb-8">
        <div className="flex items-center gap-1 bg-[#14161f] border border-[#232736] px-2.5 py-1 rounded-md text-slate-300">
          <Folder className="w-3 h-3 text-slate-400" />
          <span>/opt/alkaitos/ALKAITOS</span>
        </div>

        <div className="flex items-center gap-1 bg-[#14161f] border border-[#232736] px-2 py-1 rounded-md text-slate-400">
          <GitBranch className="w-3 h-3 text-slate-400" />
          <span>(main) الفرع الرئيسي</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>آخر تعديل قبل 4 ثوان</span>
        </div>
      </div>

      {/* System Blueprint Quick Launchers */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
        {quickStarters.map((item) => (
          <div
            key={item.key}
            onClick={() => {
              if (item.action) {
                item.action();
              } else if (item.prompt) {
                onSelectPrompt(item.prompt);
                onStartReAct(item.key);
              }
            }}
            className="p-3.5 bg-[#12141a]/90 hover:bg-[#181b24] border border-[#212533] hover:border-[#353d52] rounded-xl cursor-pointer transition-all duration-150 group flex flex-col justify-between text-right"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#1a1d28] rounded-md border border-[#2a2f3f] group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="font-semibold text-xs text-slate-200 group-hover:text-white transition-colors">
                    {item.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171b26] text-slate-400 border border-[#262c3d]">
                  {item.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-[#1a1e2a] flex items-center justify-between text-[10px] text-emerald-400 font-mono">
              <span>انقر للبدء الفوري</span>
              <span>←</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
