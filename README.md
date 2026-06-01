# 🌊 Coral-Reef: Build any ai agent in minutes

**Visual Node-Based DAG Editor & AI Copilot for Coral SQL Workflows.**

Coral-Reef is a no-code orchestration platform that enables developers to visually design, configure, and deploy complex API integrations and data workflows and hence create AI agents. By combining an interactive React Flow canvas with a Gemini-powered AI Copilot, users can automatically generate Coral SQL YAML manifests and Any ai agent powered by the coral platform.

## 🌄 Demo
[Youtube video](https://www.youtube.com/playlist?list=PLFV2HOHC10xWAd1icPkVuf522od08nDYs)

<img width="1596" height="894" alt="Screenshot from 2026-06-01 22-41-41" src="https://github.com/user-attachments/assets/af59ea1b-bfe4-4f16-b27b-2e700d769022" />
<img width="1596" height="894" alt="Screenshot from 2026-06-01 22-42-00" src="https://github.com/user-attachments/assets/6b1b4ecc-0f93-4126-97fc-f08789f1e300" />
<img width="1596" height="894" alt="Screenshot from 2026-06-01 22-43-01" src="https://github.com/user-attachments/assets/0e3fa691-2dfe-4ec9-baab-04313580f54a" />
<img width="1596" height="894" alt="Screenshot from 2026-06-01 22-43-12" src="https://github.com/user-attachments/assets/6d665142-a6f0-42c8-8fc5-bd1ab7e1c113" />
<img width="1591" height="901" alt="Screenshot from 2026-06-01 22-44-29" src="https://github.com/user-attachments/assets/86a3e684-8fed-4fe6-afe9-300b6c5bc031" />
<img width="1591" height="901" alt="Screenshot from 2026-06-01 22-45-11" src="https://github.com/user-attachments/assets/f9a05b44-2365-4e38-9e1d-a0455fbd4fec" />
<img width="1591" height="901" alt="Screenshot from 2026-06-01 22-45-45" src="https://github.com/user-attachments/assets/f7475279-5012-4da9-a0cd-03e8d12854aa" />
<img width="1591" height="901" alt="Screenshot from 2026-06-01 22-46-20" src="https://github.com/user-attachments/assets/d4360688-03b1-4587-84d4-e166ebabacdd" />
<img width="1591" height="901" alt="Screenshot from 2026-06-01 22-46-35" src="https://github.com/user-attachments/assets/4a17745b-7380-44c2-9744-633f708da226" />
---


## 🧠 The Agent Fleet: What We Built in the demo video
To prove the scalability of **Coral-Reef**, we didn't just stop at one agent. We used our visual orchestrator to instantly generate an entire fleet of enterprise-grade AI agents, mapping complex data sources together in minutes.

| 🤖 Agent Name | 🔌 Coral Integrations (Sources) | ⚡ How It Works (The Execution) |
| :--- | :--- | :--- |
| **Coding Agent Debugger** | `GitHub` + `Sentry` + `Slack` + `Datadog` | Joins failed CI builds with error logs, service metrics, and related team discussions to **diagnose the root cause** in a single AI query. |
| **AI SRE Investigator** | `PagerDuty` + `Datadog` + `GitHub` + `StatusGator` | Correlates high-urgency incidents with recent deploys, metrics, and third-party service status to **auto-generate incident summaries** for on-call engineers. |
| **Sprint Health Dashboard** | `Linear` + `GitHub` + `Slack` + `Confluence` | Joins open issues with PR status, relevant threads, and project docs to provide PMs a real-time view of **what's blocked and what's in review**. |
| **Customer Escalation Agent** | `Intercom` + `Sentry` + `Grafana` + `Slack` | Joins open support tickets with error spikes, service health dashboards, and internal discussions so support crews get **full technical context without pinging engineering**. |
| **Security & Compliance Monitor** | `GitHub` + `Slack` + `Notion` + `OSV` | Surfaces risky access changes and secrets in commits, instantly cross-referencing them with known **CVE databases and internal policy docs**. |
> **💡 The Coral-Reef Advantage:** Building just *one* of these agents manually would require days of writing custom YAML manifests and API wrappers. With Coral-Reef, we generated this entire fleet during a single hackathon sprint.

and more...
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

## 🎯 Quickstart: Try It Yourself

Once you have both the frontend and backend running locally, you can easily reproduce our hackathon demo or start building your own custom enterprise agents.

### 🗄️ 1. Generate a Custom Source (AI Copilot)
Instead of writing a complex Coral `manifest.yaml` by hand, let's use the Generative AI Copilot to connect to a database.

1. Navigate to the **Source Page** in the visual editor.
2. Click the **AI Copilot** button.
3. Paste the following prompt:
   > *"Connect to the Airtable API (base URL: https://api.airtable.com/v0). The endpoint is yourBaseid/Employees, and the rows path is 'records'. Map the 'id' column as Utf8, and the entire 'fields' object as Json."*
4. Watch the canvas auto-layout the nodes. 
5. Fill in your Airtable Bearer token in the side panel and click **Execute**. Coral-Reef will instantly spin up OS subprocesses to lint and deploy your new source.

---

### 🤖 2. Orchestrate an AI Agent
Now that Coral knows about your Airtable data, let's build an automated Slack onboarding bot.

1. Navigate to the **Workflow Page**.
2. Click the **AI Copilot** button and paste this exact prompt:
   > *"Create a 5-node workflow. node_1 is a webhook_trigger. node_2 is a coral_sql node that fetches an engineer from Airtable. node_3 is a vector_search that finds onboarding docs using the role from node_2. node_4 is an llm_reasoner that writes a welcome message using data from node_2 and node_3. node_5 is an action_http node that POSTs the summary to Slack."*
3. Once the DAG renders, click the **Coral SQL Node** and ensure the query looks like this:
   ```sql
   SELECT * FROM airtable."Employees" LIMIT 1;
   ```
4. Click the Action HTTP Node, enter your personal Slack Webhook URL, and ensure the method is POST.
5. Click Execute. The backend will query Coral, hit your Vector DB, pass the context through Gemini, and fire a personalized welcome message directly into your Slack channel!
---

If you read till this a sincere Thank you from ADINATH R :)
