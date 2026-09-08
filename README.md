# AlKaitOS Autonomous Software Engineer (ALKAITOSN8N)

[![GitHub Repository](https://img.shields.io/badge/GitHub-whyicu%2FALKAITOSN8N-blue.svg?logo=github)](https://github.com/whyicu/ALKAITOSN8N)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An industrial-grade autonomous software engineering agent system built for **AlKaitOS** and integrated with **n8n** automation workflows. Powered by an advanced **ReAct (Reasoning and Acting) loop**, Model Context Protocol (MCP) tool integration, AST-based Codebase RAG, and an automated self-healing test engine.

---

## 🌟 Key Capabilities

- **Autonomous ReAct Loop State Machine**: Iterates continuously through `Observation -> Thought -> Action -> Evaluation -> Self-Correction` to diagnose bugs, formulate plans, execute commands, and repair codebase defects without human intervention.
- **The 4 Pillars of MCP Tooling**:
  1. 🧠 **Codebase_RAG**: AST-level code chunking (functions and classes) combined with vector/token similarity search to navigate large repositories without token context overflow.
  2. ⚡ **Workspace_Bash**: Sandboxed command execution with strict timeouts and pattern security to run tests (e.g., `pytest`), builds, and linters.
  3. ✂️ **File_Patcher**: Surgical Unified Diff patch engine that applies exact line-level changes rather than rewriting entire files, saving up to 80% in token consumption.
  4. 🛡️ **LSP_Analyzer**: Real-time Language Server Protocol and AST diagnostic parser that catches syntax errors, missing imports, and unresolved symbols *before* code is saved or committed.
- **n8n & Webhook Orchestration**: Native endpoints and WebSocket channels allow seamless triggering from **n8n workflows**, CI/CD pipelines, Slack/Telegram bots, or GitHub webhooks.
- **Self-Healing Test Cycles**: Automatically runs unit test suites, detects assertion failures and stack traces, writes surgical patches, verifies syntax through LSP, and re-tests until 100% green.
- **Model Agnostic**: Fully compatible with local LLMs via vLLM/Ollama (e.g., `NousResearch/Hermes-3-Llama-3.1-70B`), Google Gemini models (`gemini-3.8-flash`, `gemini-3.1-flash-lite`), and any OpenAI-compatible API.
- **Production Daemon**: Complete with a Linux `systemd` service unit, automatic restart, sandboxing, and a rich bilingual (Arabic/English) IDE interface.

---

## 📐 System Architecture

```
                                  +---------------------------+
                                  |   User / n8n Automation   |
                                  +-------------+-------------+
                                                |
                                    HTTP / WebSocket (4096)
                                                v
                        +-----------------------------------------------+
                        |        AlKaitOS Daemon API (FastAPI)          |
                        |      (/api/task/run  &  /ws/agent)            |
                        +-----------------------+-----------------------+
                                                |
                                                v
                        +-----------------------------------------------+
                        |          ReAct Loop State Machine             |
                        |                                               |
                        |   [OBSERVE] -> [THINK] -> [ACT] -> [EVALUATE] |
                        |       ^                                 |     |
                        |       +---------- (Auto-Correction) <---+     |
                        +-----------------------+-----------------------+
                                                |
                                  Model Context Protocol (MCP)
                                                |
       +--------------------+-------------------+-------------------+--------------------+
       |                    |                   |                   |                    |
       v                    v                   v                   v                    v
+--------------+   +-----------------+   +---------------+   +---------------+   +---------------+
| Codebase_RAG |   | Workspace_Bash  |   | File_Patcher  |   | LSP_Analyzer  |   | n8n Webhooks  |
| AST Chunks & |   | Sandboxed Shell |   | Unified Diff  |   | Diagnostics & |   | Event Trigger |
| Vector Index |   | & Pytest Runner |   | Token Saver   |   | Syntax Checks |   | & Notification|
+--------------+   +-----------------+   +---------------+   +---------------+   +---------------+
```

---

## 📂 Repository Structure

```plaintext
.
├── alkaitos_agent/                  # Core Python Agent Backend
│   ├── engine/
│   │   └── react_loop.py            # ReAct State Machine & Hermes/Gemini LLM Controller
│   ├── tools/
│   │   ├── codebase_rag.py          # AST Parser, Vector Semantic Search & Code Chunking
│   │   ├── file_patcher.py          # Unified Diff Patch engine (surgical code edits)
│   │   ├── lsp_analyzer.py          # Language Server Protocol & AST diagnostics
│   │   └── workspace_bash.py        # Sandboxed bash execution engine with security filters
│   └── server.py                    # FastAPI & WebSocket server on port 4096
├── systemd/
│   └── alkaitos-agent.service       # Production Systemd unit with crash recovery
├── src/                             # Interactive React / Vite Frontend
│   ├── components/                  # Terminal, Workspace Editor, ReAct Feed, LSP/RAG Viewers
│   ├── data/                        # Embedded source blueprints & workspace files
│   └── types.ts                     # TypeScript schemas and definitions
├── server.ts                        # Full-stack Node/Express bridge server
├── install.sh                       # One-click automated installer for Linux servers
├── requirements.txt                 # Backend Python dependencies
└── package.json                     # Frontend & Node toolchain configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Linux** (Ubuntu 20.04+, Debian 11+, or Arch Linux recommended)
- **Python 3.10+** with `venv` and `pip`
- **Node.js 18+** & `npm` / `bun`
- (Optional) Docker or systemd for sandbox isolation

---

### Option 1: Automated 1-Click Server Installation

Run the provided installation script on your server:

```bash
git clone https://github.com/whyicu/ALKAITOSN8N.git
cd ALKAITOSN8N
chmod +x install.sh
./install.sh
```

The script will:
1. Create `/opt/alkaitos/agent` and the sandboxed workspace `/opt/alkaitos/ALKAITOS`.
2. Provision a dedicated Python virtual environment.
3. Install all dependencies from `requirements.txt`.
4. Register and start the `alkaitos-agent.service` systemd daemon on port `4096`.
5. Verify daemon health via `/health`.

---

### Option 2: Manual Backend Setup

1. **Create virtual environment and install requirements**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Launch the FastAPI agent daemon**:
   ```bash
   python -m uvicorn alkaitos_agent.server:app --host 0.0.0.0 --port 4096
   ```

3. **Verify daemon status**:
   ```bash
   curl http://localhost:4096/health
   ```
   Output:
   ```json
   {
     "status": "healthy",
     "daemon": "AlKaitOS Desktop Backend",
     "version": "1.17.16",
     "port": 4096,
     "tools": ["Workspace_Bash", "File_Patcher", "LSP_Analyzer", "Codebase_RAG"]
   }
   ```

---

### Option 3: Launching the Frontend Interactive Workspace

1. **Install Node dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser to access the AlKaitOS Autonomous Software Engineer IDE with live terminal, ReAct execution feed, diff viewer, and RAG explorer.

---

## 🔗 n8n Workflow Integration

To trigger the agent from **n8n**:

1. Add an **HTTP Request** node in your n8n workflow.
2. Set the method to `POST`.
3. Set URL to `http://<YOUR_AGENT_HOST>:4096/api/task/run`.
4. Set Headers: `Content-Type: application/json`.
5. Provide JSON Body:
   ```json
   {
     "task": "Fix the ZeroDivisionError in calculator.py and verify with pytest",
     "model": "NousResearch/Hermes-3-Llama-3.1-70B"
   }
   ```
6. Receive the full execution trace, applied diffs, and test outcomes as JSON to route into downstream notifications (Slack, Discord, Email, or GitHub PR creation).

---

## ⚙️ Environment Variables

Create or configure your `.env` file based on `.env.example`:

| Variable | Description | Default / Example |
|---|---|---|
| `GEMINI_API_KEY` | Optional Gemini API key for high-speed dynamic generation | `MY_GEMINI_API_KEY` |
| `APP_URL` | Base URL of the hosted application | `http://localhost:3000` |
| `WORKSPACE_ROOT` | Target workspace directory for the agent | `/opt/alkaitos/ALKAITOS` |
| `ALKAITOS_DAEMON_PORT`| Port for the Python backend daemon | `4096` |
| `LLM_API_BASE` | Base endpoint for vLLM, Ollama, or OpenAI-compatible backend | `http://localhost:8000/v1` |

---

## 🛠️ MCP Tools Reference

### 1. `Codebase_RAG`
- **Method**: AST parsing of `.py`, `.ts`, `.js` files.
- **Function**: Extracts functions and class definitions, creating semantic chunk indices.
- **Goal**: Answers queries like *"Where is the database connection configured?"* without ingesting thousands of lines.

### 2. `Workspace_Bash`
- **Security**: Built-in regex blocking destructive patterns (`rm -rf /`, fork bombs, raw device writes).
- **Execution**: Subprocess execution in isolated working directories with standard output, error capture, and configurable timeout limits.

### 3. `File_Patcher`
- **Diff Standard**: Unified Diff (`difflib`).
- **Precision**: Searches for unique target blocks before applying replacements, validating indentation and context to avoid corruption.

### 4. `LSP_Analyzer`
- **Diagnostics**: Real-time syntax tree analysis (`ast.parse`) and scope analysis.
- **Safety Gate**: Verifies code health before test runs or disk writes, alerting on syntax errors, undefined names, and missing dependencies.

---

## 🛡️ Security & Sandboxing

The agent includes multi-tiered safety mechanisms:
- Directory traversal checks prevent operations outside `WORKSPACE_ROOT`.
- Systemd sandboxing directives (`ProtectSystem=full`, `ProtectHome=read-only`, `NoNewPrivileges=true`).
- Execution timeouts ensure rogue infinite loops or stalled tests are terminated cleanly.

---

## 🤝 Contributing

Contributions are welcome!
1. Fork the repository: [https://github.com/whyicu/ALKAITOSN8N](https://github.com/whyicu/ALKAITOSN8N)
2. Create a feature branch: `git checkout -b feature/my-new-tool`
3. Commit your changes: `git commit -am 'Add new MCP tool'`
4. Push to the branch: `git push origin feature/my-new-tool`
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the repository for details.

Developed with ❤️ for **AlKaitOS** & the **n8n Automation Community** by [@whyicu](https://github.com/whyicu).
