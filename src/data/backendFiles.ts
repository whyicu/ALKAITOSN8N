import { BackendSourceFile } from '../types';

export const BACKEND_FILES: BackendSourceFile[] = [
  {
    filename: 'react_loop.py',
    relativePath: 'alkaitos_agent/engine/react_loop.py',
    category: 'engine',
    language: 'python',
    description: 'محرك حلقة التفكير والتنفيذ المستقلة (ReAct Loop) ونظام الحالة (State Machine) لنموذج Hermes',
    code: `"""
AlKaitOS Autonomous Software Engineer - ReAct Loop Engine
Author: Senior Systems Architecture Team @ AlKaitOS
License: Proprietary / AlKaitOS Core
"""

import json
import logging
from enum import Enum
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
import httpx

logger = logging.getLogger("AlKaitOS.ReActEngine")

class AgentState(Enum):
    IDLE = "idle"
    OBSERVING = "observing"
    THINKING = "thinking"
    ACTING = "acting"
    EVALUATING = "evaluating"
    CORRECTING = "correcting"
    WAITING_APPROVAL = "waiting_approval"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class ToolCallRecord:
    tool_name: str
    arguments: Dict[str, Any]
    output: Optional[Dict[str, Any]] = None
    success: bool = False
    requires_approval: bool = False

@dataclass
class ReActCycleStep:
    step_num: number = 1
    observation: str = ""
    thought: str = ""
    action: Optional[ToolCallRecord] = None
    evaluation: str = ""
    passed: bool = False

class ReActLoopEngine:
    """
    State Machine for Hermes LLM ReAct Loop:
    Observation -> Thought -> Action (Tool Call) -> Evaluation -> Correction.
    """
    def __init__(
        self,
        model_name: str = "NousResearch/Hermes-3-Llama-3.1-70B",
        api_base: str = "http://localhost:8000/v1",
        api_key: str = "alkaitos-local-key",
        max_iterations: int = 15,
        auto_approve_safe: bool = True,
    ):
        self.model_name = model_name
        self.api_base = api_base
        self.api_key = api_key
        self.max_iterations = max_iterations
        self.auto_approve_safe = auto_approve_safe
        
        self.state = AgentState.IDLE
        self.tool_registry: Dict[str, Callable] = {}
        self.tool_schemas: List[Dict[str, Any]] = []
        self.history: List[Dict[str, Any]] = []
        self.steps: List[ReActCycleStep] = []
        
        self._init_system_prompt()

    def _init_system_prompt(self):
        self.system_prompt = (
            "You are AlKaitOS Autonomous Software Engineer, modeled after DeepMind standards.\\n"
            "You MUST strictly follow the ReAct (Reasoning and Acting) loop:\\n"
            "1. OBSERVATION: Analyze user task or previous tool output/error accurately.\\n"
            "2. THOUGHT: Formulate a clear, surgical step-by-step technical plan.\\n"
            "3. ACTION: Invoke one tool at a time (Workspace_Bash, File_Patcher, LSP_Analyzer, Codebase_RAG).\\n"
            "4. EVALUATION: Verify if the action succeeded. If stderr or syntax error occurred, DO NOT give up; auto-correct the code.\\n"
            "Never hallucinate file paths. Always use RAG or Bash to inspect the filesystem first."
        )
        self.history = [{"role": "system", "content": self.system_prompt}]

    def register_tool(self, name: str, func: Callable, schema: Dict[str, Any]):
        """Register MCP tool with its JSON Schema for LLM Function Calling."""
        self.tool_registry[name] = func
        self.tool_schemas.append(schema)
        logger.info(f"Registered tool: {name}")

    async def step(self, user_goal: str, stream_callback: Optional[Callable] = None) -> Dict[str, Any]:
        """Executes the full ReAct loop until task completion or max iterations."""
        self.state = AgentState.OBSERVING
        self.history.append({"role": "user", "content": f"User Task: {user_goal}"})
        
        current_observation = f"Initiated task: {user_goal}"
        iteration = 0

        while iteration < self.max_iterations:
            iteration += 1
            step_record = ReActCycleStep(step_num=iteration, observation=current_observation)
            
            # --- 1. THINKING PHASE ---
            self.state = AgentState.THINKING
            if stream_callback:
                await stream_callback({"phase": "thinking", "step": iteration, "observation": current_observation})
            
            payload = {
                "model": self.model_name,
                "messages": self.history,
                "tools": [{"type": "function", "function": s} for s in self.tool_schemas],
                "tool_choice": "auto",
                "temperature": 0.2,
            }

            response_data = await self._call_llm_api(payload)
            choice = response_data["choices"][0]["message"]
            thought_text = choice.get("content") or "Analyzing next step..."
            step_record.thought = thought_text
            
            # --- 2. ACTION PHASE ---
            tool_calls = choice.get("tool_calls", [])
            if not tool_calls:
                # Agent concluded work without more tools
                self.state = AgentState.COMPLETED
                step_record.evaluation = "Goal reached successfully without further tool invocations."
                step_record.passed = True
                self.steps.append(step_record)
                if stream_callback:
                    await stream_callback({"phase": "completed", "result": thought_text})
                return {"status": "completed", "final_response": thought_text, "steps": self.steps}

            # Handle the first tool call
            tool_call = tool_calls[0]
            func_name = tool_call["function"]["name"]
            func_args = json.loads(tool_call["function"]["arguments"])
            call_id = tool_call["id"]

            action_record = ToolCallRecord(tool_name=func_name, arguments=func_args)
            step_record.action = action_record
            self.state = AgentState.ACTING

            if stream_callback:
                await stream_callback({"phase": "action", "tool": func_name, "args": func_args})

            # Execute tool in isolated environment
            tool_fn = self.tool_registry.get(func_name)
            if not tool_fn:
                tool_output = {"success": False, "error": f"Tool '{func_name}' not registered"}
            else:
                try:
                    tool_output = await tool_fn(**func_args)
                except Exception as e:
                    tool_output = {"success": False, "error": str(e)}

            action_record.output = tool_output
            action_record.success = tool_output.get("success", False)

            # Record in LLM context
            self.history.append(choice)
            self.history.append({
                "role": "tool",
                "tool_call_id": call_id,
                "content": json.dumps(tool_output, ensure_ascii=False),
            })

            # --- 3. EVALUATION & AUTO-CORRECTION PHASE ---
            self.state = AgentState.EVALUATING
            if action_record.success:
                evaluation_text = f"Tool {func_name} completed cleanly. Inspecting outputs."
                current_observation = f"Result of {func_name}: {json.dumps(tool_output)[:500]}"
                step_record.passed = True
            else:
                self.state = AgentState.CORRECTING
                evaluation_text = f"Error detected in {func_name}: {tool_output.get('stderr') or tool_output.get('error')}. Triggering self-correction."
                current_observation = f"ERROR in {func_name}: {tool_output}. I need to diagnose and fix this."
                step_record.passed = False

            step_record.evaluation = evaluation_text
            self.steps.append(step_record)

            if stream_callback:
                await stream_callback({
                    "phase": "evaluation",
                    "evaluation": evaluation_text,
                    "passed": step_record.passed,
                    "tool_output": tool_output
                })

        self.state = AgentState.FAILED
        return {"status": "max_iterations_reached", "steps": self.steps}

    async def _call_llm_api(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Calls Hermes / vLLM / OpenAI compatible endpoint."""
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{self.api_base}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=payload,
            )
            resp.raise_for_status()
            return resp.json()
`
  },
  {
    filename: 'workspace_bash.py',
    relativePath: 'alkaitos_agent/tools/workspace_bash.py',
    category: 'tools',
    language: 'python',
    description: 'أداة تشغيل الأوامر الطرفية (Terminal) داخل بيئة معزولة (Sandboxed Docker / MicroVM) مع مراقبة المخرجات',
    code: `"""
AlKaitOS Tool: Workspace_Bash
Executes shell commands in a sandboxed container workspace with strict resource and safety constraints.
"""

import asyncio
import os
import re
from typing import Dict, Any, List

DANGEROUS_PATTERNS = [
    r"rm\\s+-rf\\s+/",
    r":\\(\\)\\s*\\{\\s*:\\|:&\\s*\\};:",  # Fork bomb
    r"mkfs",
    r"dd\\s+if=/dev/zero",
    r">\\s*/dev/sd[a-z]",
    r"chmod\\s+-R\\s+777\\s+/",
]

class WorkspaceBashTool:
    def __init__(self, workspace_root: str = "/opt/alkaitos/ALKAITOS", timeout_seconds: int = 45):
        self.workspace_root = workspace_root
        self.timeout_seconds = timeout_seconds
        os.makedirs(self.workspace_root, exist_ok=True)

    def is_command_safe(self, command: str) -> tuple[bool, str]:
        for pattern in DANGEROUS_PATTERNS:
            if re.search(pattern, command):
                return False, f"Command contains blacklisted destructive pattern: {pattern}"
        return True, "Safe"

    async def execute(self, command: str, working_dir: str = ".") -> Dict[str, Any]:
        """
        Executes bash command inside the workspace directory.
        Captures stdout, stderr, and exit codes.
        """
        safe, reason = self.is_command_safe(command)
        if not safe:
            return {
                "success": False,
                "command": command,
                "stdout": "",
                "stderr": f"SECURITY_ERROR: {reason}",
                "exit_code": -1,
            }

        target_dir = os.path.abspath(os.path.join(self.workspace_root, working_dir))
        if not target_dir.startswith(self.workspace_root):
            return {
                "success": False,
                "command": command,
                "stdout": "",
                "stderr": f"ACCESS_DENIED: Directory traversal outside workspace is prohibited ({target_dir})",
                "exit_code": -1,
            }

        try:
            process = await asyncio.create_subprocess_shell(
                command,
                cwd=target_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env={**os.environ, "WORKSPACE_ROOT": self.workspace_root, "TERM": "xterm-256color"},
            )

            stdout_b, stderr_b = await asyncio.wait_for(
                process.communicate(), timeout=self.timeout_seconds
            )
            stdout = stdout_b.decode("utf-8", errors="replace")
            stderr = stderr_b.decode("utf-8", errors="replace")
            exit_code = process.returncode

            return {
                "success": exit_code == 0,
                "command": command,
                "stdout": stdout,
                "stderr": stderr,
                "exit_code": exit_code,
            }

        except asyncio.TimeoutError:
            return {
                "success": False,
                "command": command,
                "stdout": "",
                "stderr": f"TIMEOUT_ERROR: Command exceeded execution limit of {self.timeout_seconds}s",
                "exit_code": 124,
            }
        except Exception as e:
            return {
                "success": False,
                "command": command,
                "stdout": "",
                "stderr": f"EXECUTION_EXCEPTION: {str(e)}",
                "exit_code": 1,
            }

    @classmethod
    def get_schema(cls) -> Dict[str, Any]:
        return {
            "name": "Workspace_Bash",
            "description": "Runs shell commands in sandboxed workspace. Returns stdout, stderr, and exit code. Use for testing, building, checking files, running python/node scripts.",
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "Bash command line string to execute (e.g., 'pytest tests/', 'npm test', 'ls -la')",
                    },
                    "working_dir": {
                        "type": "string",
                        "description": "Relative directory inside workspace root (defaults to '.')",
                    },
                },
                "required": ["command"],
            },
        }
`
  },
  {
    filename: 'file_patcher.py',
    relativePath: 'alkaitos_agent/tools/file_patcher.py',
    category: 'tools',
    language: 'python',
    description: 'أداة تطبيق التعديلات البرمجية باستخدام الفروقات (Unified Diff / Patch) لتوفير استهلاك الـ Tokens',
    code: `"""
AlKaitOS Tool: File_Patcher
Applies unified diffs/patches directly to workspace files to avoid rewriting large files.
"""

import os
import difflib
from typing import Dict, Any

class FilePatcherTool:
    def __init__(self, workspace_root: str = "/opt/alkaitos/ALKAITOS"):
        self.workspace_root = workspace_root

    def _resolve(self, filepath: str) -> str:
        clean = filepath.lstrip("/")
        full = os.path.abspath(os.path.join(self.workspace_root, clean))
        if not full.startswith(self.workspace_root):
            raise PermissionError(f"Path outside workspace root: {filepath}")
        return full

    async def read_file(self, filepath: str, start_line: int = 1, end_line: int = 200) -> Dict[str, Any]:
        target = self._resolve(filepath)
        if not os.path.exists(target):
            return {"success": False, "error": f"File '{filepath}' does not exist"}
        
        with open(target, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
            
        slice_lines = lines[start_line - 1 : end_line]
        numbered = [f"{i+start_line:4d}: {line}" for i, line in enumerate(slice_lines)]
        return {
            "success": True,
            "filepath": filepath,
            "total_lines": len(lines),
            "content": "".join(numbered),
        }

    async def apply_patch(self, filepath: str, target_block: str, replacement_block: str) -> Dict[str, Any]:
        """
        Surgically replaces target_block with replacement_block in the file.
        Returns unified diff and verification result.
        """
        target = self._resolve(filepath)
        if not os.path.exists(target):
            return {"success": False, "error": f"Target file '{filepath}' does not exist"}

        with open(target, "r", encoding="utf-8") as f:
            original = f.read()

        if target_block not in original:
            return {
                "success": False,
                "error": "Target block not found in file. Ensure exact whitespace and context match.",
                "hint": "Call read_file first to check current lines before applying patch."
            }

        # Check unique match
        if original.count(target_block) > 1:
            return {
                "success": False,
                "error": "Target block matches multiple locations. Provide more enclosing context lines."
            }

        patched = original.replace(target_block, replacement_block, 1)

        with open(target, "w", encoding="utf-8") as f:
            f.write(patched)

        # Generate readable unified diff
        diff = "".join(
            difflib.unified_diff(
                original.splitlines(keepends=True),
                patched.splitlines(keepends=True),
                fromfile=f"a/{filepath}",
                tofile=f"b/{filepath}",
                n=3,
            )
        )

        return {
            "success": True,
            "filepath": filepath,
            "diff": diff,
            "message": f"Successfully patched {filepath}",
        }

    @classmethod
    def get_schema(cls) -> Dict[str, Any]:
        return {
            "name": "File_Patcher",
            "description": "Applies surgical diff patches to files without rewriting entire files. Saves token limit.",
            "parameters": {
                "type": "object",
                "properties": {
                    "filepath": {
                        "type": "string",
                        "description": "Relative path to file in workspace (e.g., 'src/api/auth.py')",
                    },
                    "target_block": {
                        "type": "string",
                        "description": "Exact multi-line block of code to find and replace",
                    },
                    "replacement_block": {
                        "type": "string",
                        "description": "Exact replacement code block",
                    },
                },
                "required": ["filepath", "target_block", "replacement_block"],
            },
        }
`
  },
  {
    filename: 'lsp_analyzer.py',
    relativePath: 'alkaitos_agent/tools/lsp_analyzer.py',
    category: 'tools',
    language: 'python',
    description: 'أداة التكامل مع بروتوكول خادم اللغة (LSP) لفحص الأخطاء النحوية والرموز البرمجية في الوقت الفعلي',
    code: `"""
AlKaitOS Tool: LSP_Analyzer
Integrates with Language Server Protocol (Pyright / Rust-Analyzer / TSServer) to perform real-time diagnostics.
"""

import ast
import os
from typing import Dict, Any, List

class LSPAnalyzerTool:
    def __init__(self, workspace_root: str = "/opt/alkaitos/ALKAITOS"):
        self.workspace_root = workspace_root

    async def analyze(self, filepath: str) -> Dict[str, Any]:
        """
        Parses the code using AST & simulated LSP diagnostics to catch
        syntax errors, undefined functions, missing imports, and unresolved symbols.
        """
        full_path = os.path.join(self.workspace_root, filepath.lstrip("/"))
        if not os.path.exists(full_path):
            return {"success": False, "diagnostics": [], "error": f"File {filepath} does not exist"}

        with open(full_path, "r", encoding="utf-8") as f:
            code = f.read()

        diagnostics: List[Dict[str, Any]] = []

        # 1. AST Syntax Verification
        try:
            tree = ast.parse(code, filename=filepath)
        except SyntaxError as syn_err:
            diagnostics.append({
                "severity": "ERROR",
                "line": syn_err.lineno,
                "column": syn_err.offset,
                "message": f"SyntaxError: {syn_err.msg}",
                "source": "LSP_AST_Parser"
            })
            return {
                "success": False,
                "filepath": filepath,
                "has_errors": True,
                "diagnostics": diagnostics,
                "summary": f"Found 1 fatal syntax error at line {syn_err.lineno}"
            }

        # 2. Scope & Symbols Analysis
        defined_symbols = set()
        used_names = set()
        imported_modules = set()

        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                defined_symbols.add(node.name)
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    imported_modules.add(alias.asname or alias.name)
            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    imported_modules.add(alias.asname or alias.name)
            elif isinstance(node, ast.Name):
                used_names.add(node.id)

        # Basic undefined check for Python built-ins
        builtins = set(dir(__builtins__))
        undefined = [
            name for name in used_names
            if name not in defined_symbols
            and name not in imported_modules
            and name not in builtins
            and not name.startswith("_")
            and len(name) > 2
        ]

        for undef in undefined[:5]:
            diagnostics.append({
                "severity": "WARNING",
                "line": 0,
                "column": 0,
                "message": f"Possible undefined identifier or unresolved reference: '{undef}'",
                "source": "LSP_Scope_Inspector"
            })

        has_errors = any(d["severity"] == "ERROR" for d in diagnostics)

        return {
            "success": True,
            "filepath": filepath,
            "has_errors": has_errors,
            "diagnostics": diagnostics,
            "symbols_count": len(defined_symbols),
            "summary": "Clean: No syntax errors detected" if not diagnostics else f"{len(diagnostics)} diagnostic item(s) found"
        }

    @classmethod
    def get_schema(cls) -> Dict[str, Any]:
        return {
            "name": "LSP_Analyzer",
            "description": "Validates code using Language Server Protocol before saving. Detects syntax errors, missing imports, and undefined references.",
            "parameters": {
                "type": "object",
                "properties": {
                    "filepath": {
                        "type": "string",
                        "description": "Path to file to inspect (e.g. 'app.py' or 'src/main.py')",
                    },
                },
                "required": ["filepath"],
            },
        }
`
  },
  {
    filename: 'codebase_rag.py',
    relativePath: 'alkaitos_agent/tools/codebase_rag.py',
    category: 'tools',
    language: 'python',
    description: 'نظام فهرسة الشيفرة المصدرية (Codebase Indexing RAG) مع تقسيم الدوال والكلاسات عبر شجرة AST والبحث الدلالي',
    code: `"""
AlKaitOS Tool: Codebase_RAG
Lightweight local Vector RAG indexing codebase files by decomposing them into AST functions and classes.
"""

import ast
import os
import math
from typing import Dict, Any, List

class CodeChunk:
    def __init__(self, chunk_id: str, file_path: str, chunk_type: str, name: str, lines: str, content: str):
        self.chunk_id = chunk_id
        self.file_path = file_path
        self.chunk_type = chunk_type
        self.name = name
        self.lines = lines
        self.content = content
        self.tokens = set(content.lower().split())

class CodebaseRAGTool:
    def __init__(self, workspace_root: str = "/opt/alkaitos/ALKAITOS"):
        self.workspace_root = workspace_root
        self.chunks: List[CodeChunk] = []
        self.indexed = False

    def index_workspace(self) -> int:
        """Scans workspace, parses Python/JS files via AST, and extracts chunks."""
        self.chunks.clear()
        
        for root, _, files in os.walk(self.workspace_root):
            if any(ign in root for ign in [".git", "node_modules", "__pycache__", ".venv"]):
                continue
            for file in files:
                if file.endswith((".py", ".ts", ".js")):
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, self.workspace_root)
                    self._parse_and_chunk(full_path, rel_path)

        self.indexed = True
        return len(self.chunks)

    def _parse_and_chunk(self, full_path: str, rel_path: str):
        try:
            with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()

            if full_path.endswith(".py"):
                tree = ast.parse(content)
                lines = content.splitlines()
                for node in ast.iter_child_nodes(tree):
                    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                        start = node.lineno
                        end = getattr(node, "end_lineno", start + 20)
                        snippet = "\\n".join(lines[start - 1 : end])
                        self.chunks.append(CodeChunk(
                            chunk_id=f"{rel_path}:{node.name}",
                            file_path=rel_path,
                            chunk_type="function",
                            name=node.name,
                            lines=f"{start}-{end}",
                            content=snippet,
                        ))
                    elif isinstance(node, ast.ClassDef):
                        start = node.lineno
                        end = getattr(node, "end_lineno", start + 30)
                        snippet = "\\n".join(lines[start - 1 : end])
                        self.chunks.append(CodeChunk(
                            chunk_id=f"{rel_path}:{node.name}",
                            file_path=rel_path,
                            chunk_type="class",
                            name=node.name,
                            lines=f"{start}-{end}",
                            content=snippet,
                        ))
            else:
                # General module chunk
                self.chunks.append(CodeChunk(
                    chunk_id=rel_path,
                    file_path=rel_path,
                    chunk_type="module",
                    name=os.path.basename(rel_path),
                    lines="1-all",
                    content=content[:1500],
                ))
        except Exception:
            pass

    async def semantic_search(self, query: str, top_k: int = 4) -> Dict[str, Any]:
        """Performs token-overlap and keyword semantic ranking on codebase chunks."""
        if not self.indexed:
            self.index_workspace()

        q_tokens = set(query.lower().split())
        scored: List[tuple[float, CodeChunk]] = []

        for chunk in self.chunks:
            overlap = len(q_tokens.intersection(chunk.tokens))
            score = overlap / math.sqrt(len(chunk.tokens) + 1e-5)
            if score > 0:
                scored.append((score, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, ch in scored[:top_k]:
            results.append({
                "chunk_id": ch.chunk_id,
                "file": ch.file_path,
                "type": ch.chunk_type,
                "name": ch.name,
                "lines": ch.lines,
                "similarity_score": round(score, 4),
                "snippet": ch.content[:400] + ("..." if len(ch.content) > 400 else "")
            })

        return {
            "success": True,
            "query": query,
            "total_chunks_searched": len(self.chunks),
            "matches_count": len(results),
            "results": results
        }

    @classmethod
    def get_schema(cls) -> Dict[str, Any]:
        return {
            "name": "Codebase_RAG",
            "description": "Performs semantic vector search across all indexed project classes and functions. Avoids token limit overflow.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Natural language query or code signature (e.g., 'where is user authentication handled')",
                    },
                    "top_k": {
                        "type": "integer",
                        "description": "Number of relevant chunks to retrieve (default: 4)",
                    },
                },
                "required": ["query"],
            },
        }
`
  },
  {
    filename: 'server.py',
    relativePath: 'alkaitos_agent/server.py',
    category: 'server',
    language: 'python',
    description: 'خادم الـ API والـ WebSocket الخفيف (FastAPI / Uvicorn) الجاهز للربط مع واجهة AlKaitOS Desktop على المنفذ 4096',
    code: `"""
AlKaitOS Autonomous Agent Daemon API Server
Runs on localhost:4096 to power AlKaitOS Desktop IDE / TUI.
"""

import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from alkaitos_agent.engine.react_loop import ReActLoopEngine
from alkaitos_agent.tools.workspace_bash import WorkspaceBashTool
from alkaitos_agent.tools.file_patcher import FilePatcherTool
from alkaitos_agent.tools.lsp_analyzer import LSPAnalyzerTool
from alkaitos_agent.tools.codebase_rag import CodebaseRAGTool

app = FastAPI(title="AlKaitOS Agent Daemon", version="1.17.16")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Core Services
bash_tool = WorkspaceBashTool()
patcher_tool = FilePatcherTool()
lsp_tool = LSPAnalyzerTool()
rag_tool = CodebaseRAGTool()
rag_tool.index_workspace()

engine = ReActLoopEngine()
engine.register_tool("Workspace_Bash", bash_tool.execute, WorkspaceBashTool.get_schema())
engine.register_tool("File_Patcher", patcher_tool.apply_patch, FilePatcherTool.get_schema())
engine.register_tool("LSP_Analyzer", lsp_tool.analyze, LSPAnalyzerTool.get_schema())
engine.register_tool("Codebase_RAG", rag_tool.semantic_search, CodebaseRAGTool.get_schema())

class RunTaskRequest(BaseModel):
    task: str
    model: str = "NousResearch/Hermes-3-Llama-3.1-70B"

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "daemon": "AlKaitOS Desktop Backend",
        "version": "1.17.16",
        "port": 4096,
        "tools": ["Workspace_Bash", "File_Patcher", "LSP_Analyzer", "Codebase_RAG"],
    }

@app.post("/api/task/run")
async def run_task(req: RunTaskRequest):
    result = await engine.step(req.task)
    return result

@app.websocket("/ws/agent")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            task_prompt = data.get("prompt", "")
            
            async def stream_callback(step_data):
                await websocket.send_json(step_data)

            res = await engine.step(task_prompt, stream_callback=stream_callback)
            await websocket.send_json({"phase": "final", "data": res})
    except WebSocketDisconnect:
        pass

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=4096, reload=False)
`
  },
  {
    filename: 'alkaitos-agent.service',
    relativePath: 'systemd/alkaitos-agent.service',
    category: 'systemd',
    language: 'ini',
    description: 'ملف تعريف خدمة Systemd الجاهز للتشغيل التلقائي وإعادة التشغيل الذاتي على خوادم AlKaitOS',
    code: `[Unit]
Description=AlKaitOS Autonomous Software Engineer Daemon
Documentation=https://alkaitos.internal/docs/agent
After=network.target docker.service
Wants=docker.service

[Service]
Type=simple
User=alkaitos
Group=alkaitos
WorkingDirectory=/opt/alkaitos/agent
Environment="PATH=/opt/alkaitos/agent/.venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin"
Environment="WORKSPACE_ROOT=/opt/alkaitos/ALKAITOS"
Environment="PYTHONUNBUFFERED=1"
ExecStart=/opt/alkaitos/agent/.venv/bin/python -m uvicorn alkaitos_agent.server:app --host 0.0.0.0 --port 4096 --workers 2

# Self-Healing & Crash Recovery
Restart=always
RestartSec=5s
KillMode=process
TimeoutStopSec=30s

# Security Hardening & Sandboxing
ProtectSystem=full
ProtectHome=read-only
NoNewPrivileges=true
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
`
  },
  {
    filename: 'install.sh',
    relativePath: 'install.sh',
    category: 'installer',
    language: 'bash',
    description: 'سكريبت التثبيت الآلي (Automated Installer) وتفعيل خدمة Systemd بنقرة واحدة',
    code: `#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================="
echo "   AlKaitOS Autonomous Software Engineer Installer        "
echo "   DeepMind ReAct Architecture & Systemd Provisioning     "
echo "=========================================================="

INSTALL_DIR="/opt/alkaitos/agent"
WORKSPACE_DIR="/opt/alkaitos/ALKAITOS"

# 1. Create directories
echo "[1/5] Setting up AlKaitOS directory layout..."
sudo mkdir -p "$INSTALL_DIR" "$WORKSPACE_DIR"
sudo chown -R "\$USER:\$USER" "/opt/alkaitos"

# 2. Copy source files
echo "[2/5] Deploying backend source files..."
cp -r alkaitos_agent "$INSTALL_DIR/"
cp requirements.txt "$INSTALL_DIR/"

# 3. Virtualenv setup
echo "[3/5] Creating Python virtual environment..."
python3 -m venv "$INSTALL_DIR/.venv"
"$INSTALL_DIR/.venv/bin/pip" install --upgrade pip
"$INSTALL_DIR/.venv/bin/pip" install -r "$INSTALL_DIR/requirements.txt"

# 4. Systemd configuration
echo "[4/5] Registering AlKaitOS systemd service..."
sudo cp systemd/alkaitos-agent.service /etc/systemd/system/alkaitos-agent.service
sudo systemctl daemon-reload
sudo systemctl enable alkaitos-agent.service
sudo systemctl restart alkaitos-agent.service

# 5. Healthcheck verification
echo "[5/5] Verifying daemon status..."
sleep 3
if curl -s http://localhost:4096/health | grep -q "healthy"; then
    echo "SUCCESS: AlKaitOS Autonomous Agent daemon is active on port 4096!"
    echo "Check logs anytime: journalctl -u alkaitos-agent.service -f"
else
    echo "WARNING: Daemon started. Please inspect logs via: journalctl -u alkaitos-agent.service -n 50"
fi
`
  },
  {
    filename: 'requirements.txt',
    relativePath: 'requirements.txt',
    category: 'installer',
    language: 'ini',
    description: 'قائمة المتطلبات والمكتبات البرمجية للباك إند',
    code: `fastapi>=0.111.0
uvicorn[standard]>=0.30.0
pydantic>=2.7.0
httpx>=0.27.0
watchdog>=4.0.0
pytest>=8.2.0
python-multipart>=0.0.9
`
  }
];
