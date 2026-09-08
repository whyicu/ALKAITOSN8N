import { WorkspaceFile, RAGChunk, LSPDiagnostic } from '../types';

export const INITIAL_WORKSPACE_FILES: WorkspaceFile[] = [
  {
    path: 'calculator.py',
    name: 'calculator.py',
    type: 'file',
    language: 'python',
    size: '1.2 KB',
    modified: 'منذ 15 ثانية',
    content: `"""
AlKaitOS Mathematical Service Engine
"""

def add(a: float, b: float) -> float:
    """Returns the sum of a and b."""
    return a + b

def subtract(a: float, b: float) -> float:
    """Returns the difference of a and b."""
    return a - b

def multiply(a: float, b: float) -> float:
    """Returns the product of a and b."""
    return a * b

def divide(a: float, b: float) -> float:
    """
    BUG: Division by zero is unhandled and crashes the microservice!
    """
    return a / b

def power(base: float, exponent: float) -> float:
    """Calculates power."""
    return base ** exponent
`,
    diff: `--- a/calculator.py
+++ b/calculator.py
@@ -15,5 +15,7 @@
 def divide(a: float, b: float) -> float:
-    return a / b
+    if b == 0:
+        raise ValueError("Cannot divide by zero in AlKaitOS core engine")
+    return a / b
`
  },
  {
    path: 'tests/test_calculator.py',
    name: 'test_calculator.py',
    type: 'file',
    language: 'python',
    size: '850 B',
    modified: 'منذ دقيقة',
    content: `import pytest
from calculator import add, subtract, multiply, divide

def test_add():
    assert add(10, 5) == 15

def test_divide():
    assert divide(10, 2) == 5
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        divide(10, 0)
`
  },
  {
    path: 'alkaitos_config.json',
    name: 'alkaitos_config.json',
    type: 'file',
    language: 'json',
    size: '420 B',
    modified: 'منذ 5 دقائق',
    content: `{
  "system": "AlKaitOS Core",
  "version": "1.17.16",
  "node_id": "alkaitos-srv-alpha",
  "mcp_enabled": true,
  "sandbox": {
    "type": "docker_microvm",
    "cpu_limit": "2.0",
    "memory_limit": "4GiB"
  }
}`
  },
  {
    path: 'README.md',
    name: 'README.md',
    type: 'file',
    language: 'markdown',
    size: '640 B',
    modified: 'منذ 10 دقائق',
    content: `# مستودع AlKaitOS الأساسي
هذا المشروع يتم تطويره وصيانته عبر الوكيل البرمجي المستقل (Autonomous Software Engineer).
- **حلقة الاستدلال**: ReAct Loop Engine
- **الخادم الداخلي**: localhost:4096 (Systemd Service)
- **بروتوكولات الفحص**: LSP + AST Chunking RAG
`
  }
];

export const MOCK_RAG_CHUNKS: RAGChunk[] = [
  {
    id: 'calculator.py:divide',
    file: 'calculator.py',
    type: 'function',
    name: 'divide(a, b)',
    lines: '16-20',
    similarity: 0.942,
    snippet: 'def divide(a: float, b: float) -> float:\n    """BUG: Division by zero unhandled"""\n    return a / b'
  },
  {
    id: 'calculator.py:multiply',
    file: 'calculator.py',
    type: 'function',
    name: 'multiply(a, b)',
    lines: '12-15',
    similarity: 0.612,
    snippet: 'def multiply(a: float, b: float) -> float:\n    return a * b'
  },
  {
    id: 'tests/test_calculator.py:test_divide',
    file: 'tests/test_calculator.py',
    type: 'function',
    name: 'test_divide()',
    lines: '7-11',
    similarity: 0.884,
    snippet: 'def test_divide():\n    assert divide(10, 2) == 5\n    with pytest.raises(ValueError):\n        divide(10, 0)'
  },
  {
    id: 'alkaitos_agent/engine/react_loop.py:ReActLoopEngine',
    file: 'alkaitos_agent/engine/react_loop.py',
    type: 'class',
    name: 'ReActLoopEngine',
    lines: '45-120',
    similarity: 0.795,
    snippet: 'class ReActLoopEngine:\n    def __init__(self, model_name="NousResearch/Hermes-3-Llama-3.1-70B"):\n        self.state = AgentState.IDLE'
  }
];

export const MOCK_LSP_DIAGNOSTICS: LSPDiagnostic[] = [
  {
    file: 'calculator.py',
    line: 19,
    col: 5,
    severity: 'error',
    message: 'Unhandled Exception: ZeroDivisionError possible when b == 0',
    source: 'Pyright LSP'
  },
  {
    file: 'calculator.py',
    line: 23,
    col: 1,
    severity: 'info',
    message: 'Function power has docstring and type hints',
    source: 'Ruff linter'
  }
];
