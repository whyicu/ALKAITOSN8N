import React, { useState } from 'react';
import { Search, Database, FileCode, Layers, ArrowUpRight, Cpu } from 'lucide-react';
import { MOCK_RAG_CHUNKS } from '../data/workspaceFiles';
import { RAGChunk } from '../types';

export const RagExplorer: React.FC = () => {
  const [query, setQuery] = useState('divide division zero');
  const [chunks, setChunks] = useState<RAGChunk[]>(MOCK_RAG_CHUNKS);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      const q = query.toLowerCase();
      const filtered = MOCK_RAG_CHUNKS.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.file.toLowerCase().includes(q) ||
          c.snippet.toLowerCase().includes(q)
      );
      setChunks(filtered.length > 0 ? filtered : MOCK_RAG_CHUNKS);
      setIsSearching(false);
    }, 200);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0d12] overflow-hidden select-text">
      {/* Top Search Bar */}
      <div className="p-3 bg-[#0e1016] border-b border-[#1f2430]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-xs text-slate-200">
              فهرس الشيفرة المصدرية (Codebase Indexing & Vector RAG)
            </span>
          </div>
          <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
            AST Functions & Classes
          </span>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث دلالياً في شيفرة المشروع (مثال: دالة القسمة, معالجة الأخطاء, اختبارات)..."
            className="w-full h-8 bg-[#151821] border border-[#262c3d] rounded-md px-8 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-500" />
          <button
            type="submit"
            className="absolute left-1.5 top-1 px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-medium"
          >
            بحث دلالي
          </button>
        </form>
      </div>

      {/* RAG Architecture Explanation banner */}
      <div className="px-4 py-2 bg-[#12151e] border-b border-[#1e2330] text-[11px] text-slate-400 flex items-center justify-between">
        <span>
          💡 يتم تقطيع الملفات عبر <code className="text-cyan-300">ast.parse()</code> إلى وحدات Functions و Classes لمنع تجاوز الـ Token Limit.
        </span>
        <span className="font-mono text-[10px] text-slate-500">تم فهرسة 14 دالة وكلاس</span>
      </div>

      {/* Chunks List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
        {chunks.map((chunk) => (
          <div
            key={chunk.id}
            className="p-3 bg-[#13161f] border border-[#232838] rounded-xl space-y-2 hover:border-[#353d54] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-[#1b202c] text-purple-300 font-mono text-[10px] rounded border border-[#2c3447]">
                  {chunk.type}
                </span>
                <span className="font-mono font-semibold text-xs text-slate-200">{chunk.name}</span>
                <span className="text-[10px] font-mono text-slate-500">{chunk.file} : الأسطر {chunk.lines}</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">التطابق الدلالي:</span>
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  {(chunk.similarity * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Snippet */}
            <pre className="bg-[#0b0c10] text-slate-300 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto border border-[#1b1f2b]">
              {chunk.snippet}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
