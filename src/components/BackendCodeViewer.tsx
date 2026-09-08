import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Terminal, Server, Shield, Sparkles, Folder, ExternalLink } from 'lucide-react';
import JSZip from 'jszip';
import { BACKEND_FILES } from '../data/backendFiles';
import { BackendSourceFile } from '../types';

export const BackendCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<BackendSourceFile>(BACKEND_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      const zip = new JSZip();

      // Add each file into zip
      BACKEND_FILES.forEach((f) => {
        zip.file(f.relativePath, f.code);
      });

      // Add README quickstart
      zip.file(
        'README_ALKAITOS.md',
        `# AlKaitOS Autonomous Software Engineer Daemon
Built for AlKaitOS Servers according to DeepMind ReAct Loop Architecture.

## 1. Quick Installation
\`\`\`bash
chmod +x install.sh
sudo ./install.sh
\`\`\`

## 2. Check Systemd Service Status
\`\`\`bash
systemctl status alkaitos-agent.service
journalctl -u alkaitos-agent.service -f
\`\`\`

## 3. Verify Daemon API
\`\`\`bash
curl http://localhost:4096/health
\`\`\`
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'alkaitos-agent-backend.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0f14] overflow-hidden select-text">
      {/* Top action bar */}
      <div className="h-12 bg-[#12141a] border-b border-[#1f232e] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-xs text-slate-200">
            كود الـ Backend وخدمة Systemd لخوادم AlKaitOS
          </span>
          <span className="text-[10px] bg-[#1a2130] text-blue-400 px-2 py-0.5 rounded border border-blue-800/40 font-mono">
            Python 3.11+ / Systemd Ready
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1c202a] hover:bg-[#252b39] text-slate-300 text-xs font-medium border border-[#2b3140] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ' : 'نسخ الملف الحالي'}</span>
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={downloadingZip}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadingZip ? 'جاري تجهيز ZIP...' : 'تحميل الحزمة كاملة (ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Main split: File selector list + Code display */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Right Files Menu */}
        <div className="w-64 bg-[#0e1015] border-l border-[#1f232e] p-3 overflow-y-auto space-y-1 select-none">
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2 px-2">
            ملفات بنية النظام (System Files)
          </div>

          {BACKEND_FILES.map((f) => {
            const isSelected = selectedFile.filename === f.filename;
            return (
              <button
                key={f.filename}
                onClick={() => setSelectedFile(f)}
                className={`w-full text-right p-2 rounded-lg text-xs transition-all flex flex-col gap-0.5 ${
                  isSelected
                    ? 'bg-[#1b2232] text-white border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151820]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-200">{f.filename}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#12141a] text-slate-400 border border-[#232734]">
                    {f.category}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono truncate">{f.relativePath}</span>
              </button>
            );
          })}

          <div className="mt-4 p-3 rounded-lg bg-[#141822] border border-[#222938] text-[11px] text-slate-300 space-y-2">
            <div className="font-semibold text-emerald-400 flex items-center gap-1">
              <Server className="w-3.5 h-3.5" />
              <span>جاهز للتشغيل كخدمة Systemd</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              يتم تثبيت الخدمة داخل <code className="text-cyan-300">/opt/alkaitos/agent</code> ويتم التحكم بها عبر:
            </p>
            <div className="bg-[#0b0d12] p-1.5 rounded font-mono text-[10px] text-slate-300 border border-[#1d2330]">
              systemctl enable --now alkaitos-agent
            </div>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 flex flex-col bg-[#0b0c10] overflow-hidden">
          {/* File header bar */}
          <div className="px-4 py-2 bg-[#101217] border-b border-[#1c1f28] flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-200">{selectedFile.relativePath}</span>
              <span className="text-[10px] text-slate-500">|</span>
              <span className="text-[11px] text-slate-400">{selectedFile.description}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">{selectedFile.language}</span>
          </div>

          {/* Code content with line numbers */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-200">
            <pre className="whitespace-pre">
              {selectedFile.code.split('\n').map((line, idx) => (
                <div key={idx} className="flex hover:bg-[#131722] py-0.5 px-1 rounded transition-colors">
                  <span className="w-10 text-slate-600 select-none text-right pr-4 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="flex-1 font-mono text-slate-300">{line || ' '}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
