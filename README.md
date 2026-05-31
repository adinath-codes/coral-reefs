# 🌊 Coral-Reef

**Visual Node-Based DAG Editor & AI Copilot for Coral SQL Workflows.**

Coral-Reef is a low-code/no-code orchestration platform that enables developers to visually design, configure, and deploy complex API integrations and data workflows. By combining an interactive React Flow canvas with a Gemini-powered AI Copilot, users can automatically generate Coral SQL YAML manifests and backend execution graphs simply by describing their desired outcomes.

## 🌄 Demo

[Youtube video](https://www.youtube.com/playlist?list=PLFV2HOHC10xWAd1icPkVuf522od08nDYs)

---

## 🚀 Key Features

* **🎨 Node-Based Workflow:** Visually design API source connections and background execution pipelines using **React Flow**. Drag-and-drop nodes to create robust Directed Acyclic Graphs (DAGs).
* **✨ Gemini AI Copilot:** A built-in AI assistant that translates natural language prompts (e.g., *"Connect to the Airtable Employees database"*) into fully structured, visually rendered node setups and backend YAML configurations.
* **🔌 Dynamic State Management:** An intuitive, context-aware side panel that dynamically updates UI inputs based on the selected node, eliminating manual JSON writing.
* **🚀 FastAPI Execution Engine:** Compiles visual nodes into strict Pydantic schemas, safely passing data to a high-throughput async Python backend for execution and testing.
* **🗄️ Coral SQL Integration:** Automatically lints, builds, and deploys `manifest.yaml` files for custom HTTP sources directly into the Coral environment.

---

## 🛠️ Tech Stack

### Frontend

* **ReactJS** + **Vite**: High-performance UI rendering.
* **React Flow**: For the interactive node-based graph editor and custom edge logic.
* **Tailwind CSS**: For modern, responsive, glassmorphic styling.
* **Lucide React**: Crisp, lightweight iconography.

### Backend & AI Infrastructure

* **FastAPI**: Asynchronous API gateway for catching webhooks and orchestrating workflows.
* **Google GenAI (Gemini 2.5 Flash)**: Powers the AI Copilot for structured JSON generation.
* **Pydantic**: Strict schema validation for node payloads and AI outputs.
* **PyYAML**: For generating dynamic configuration files.
* **Uv**: Lightning-fast Python package manager.

---

## 💻 Local Installation Guide

Follow these steps to run the Coral-Reef architecture locally on your machine.

### Prerequisites

* **Python:** Version 3.10 or higher.
* **Node.js:** Version 18+.
* **Package Managers:** `npm` (Frontend) and `uv` (Backend).

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/coral-reef.git
cd coral-reef

```

## 📂 Project Structure

Here is an overview of the repository's architecture:

```text
coral-reef/
├── coral-reefs/             # 🎨 Frontend Source Code (React + Vite)
│   ├── src/                 
│   │   ├── components/      # UI components (AIModal, NodeSidePanel)
│   │   ├── Node/            # React Flow custom nodes (Webhook, LLM, etc.)
│   │   ├── pages/           # Canvas logic (SourcePage, WorkflowPage)
│   │   ├── utils/           # Constants and helpers
│   │   ├── App.tsx          # Main routing
│   │   └── main.tsx         # React DOM entry
│   ├── package.json         # Frontend dependencies 
│   └── vite.config.ts       # Vite configuration
│
├── coral-reef-bk/           # 🧠 Backend Infrastructure (FastAPI)
│   ├── models/              # Pydantic Schemas (SourceModels.py, WorkflowModel.py)
│   ├── sources/             # Auto-generated Coral YAML environments (e.g., airtable)
│   ├── utils/               # Helper scripts (helper.py)
│   ├── CustomSrc.py         # Custom source generation & AI logic
│   ├── Workflow.py          # DAG execution logic & Webhook handlers
│   ├── main.py              # API Gateway
│   ├── pyproject.toml       # Python project configuration
│   └── uv.lock              # Fast dependency lockfile
│
└── README.md                # Project Documentation

```

## ⚙️ Setup Guidelines

### 1. Environment Setup (Backend)

The backend utilizes FastAPI and `uv` for lightning-fast dependency resolution.

```bash
# Navigate to backend
cd coral-reef-bk

# Install dependencies using uv
uv sync

# Set up your environment variables
# Create a .env file and add your GEMINI_API_KEY
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Run the FastAPI server
uv run uvicorn main:app --reload --port 8000

```

### 2. Environment Setup (Frontend)

The frontend utilizes React, Vite, and React Flow.

```bash
# Navigate to frontend
cd ../coral-reefs

# Install Dependencies
npm install

# Run the development server
npm run dev

```

*Your backend will run on `http://localhost:8000` and your visual builder will be accessible via the Vite localhost port (typically `http://localhost:5173`).*
