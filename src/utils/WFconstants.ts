import DeleteButtonEdge from "../components/DelButtonEdge";
import WebhookNode from "../Node/WebhookNode";
import CoralSQLNode from "../Node/CoralSQLNode";
import LLMNode from "../Node/LLMNode";
import ConditionNode from "../Node/ConditionNode";
import HTTPNode from "../Node/HTTPNode";
import VectorNode from "../Node/VectorNode";
import IteratorNode from "../Node/IteratorNode";

import {
  Zap,
  Database,
  BrainCircuit,
  GitBranch,
  Send,
  Search,
  Repeat,
} from "lucide-react";
import type { Node, NodeTypes, Edge } from "@xyflow/react";

// 1. Map your Backend Literals to the React Components
export const nodeTypes: NodeTypes = {
  webhook_trigger: WebhookNode,
  coral_sql: CoralSQLNode,
  llm_reasoner: LLMNode,
  if_condition: ConditionNode,
  action_http: HTTPNode,
  vector_search: VectorNode,
  iterator: IteratorNode,
};

// 2. The Custom Edge
export const edgeTypes = {
  deleteButton: DeleteButtonEdge,
};

// 3. Dropdown Menu Configuration
export const nodeOptions = [
  {
    type: "webhook_trigger",
    icon: Zap,
    color: "purple",
    label: "Webhook Trigger",
    description: "Catch incoming JSON payloads.",
  },
  {
    type: "coral_sql",
    icon: Database,
    color: "blue",
    label: "Coral SQL",
    description: "Query your data sources.",
  },
  {
    type: "vector_search",
    icon: Search,
    color: "teal",
    label: "Vector Search",
    description: "Semantic similarity search.",
  },
  {
    type: "llm_reasoner",
    icon: BrainCircuit,
    color: "orange",
    label: "LLM Reasoner",
    description: "Ask an AI to make decisions.",
  },
  {
    type: "if_condition",
    icon: GitBranch,
    color: "yellow",
    label: "If Condition",
    description: "Branch workflow logic.",
  },
  {
    type: "action_http",
    icon: Send,
    color: "green",
    label: "Action HTTP",
    description: "Send out a REST payload.",
  },
  {
    type: "iterator",
    icon: Repeat,
    color: "pink",
    label: "Iterator",
    description: "Loop over arrays of data.",
  },
];

// 4. A great default template mimicking your "AI-SRE-Debugger" payload
export const initialNodes: Node[] = [
  {
    id: "node_1",
    type: "webhook_trigger",
    position: { x: 350, y: 50 },
    data: { name: "GitHub Alert" },
  },
  {
    id: "node_2",
    type: "vector_search",
    position: { x: 350, y: 200 },
    data: { name: "Search Runbooks", query: "{{node_1.error_message}}" },
  },
  {
    id: "node_3",
    type: "llm_reasoner",
    position: { x: 350, y: 350 },
    data: { name: "Diagnose Issue" },
  },
  {
    id: "node_4",
    type: "action_http",
    position: { x: 350, y: 500 },
    data: { name: "Slack Alert", method: "POST" },
  },
];

export const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "node_1",
    target: "node_2",
    animated: true,
    style: { stroke: "#a855f7" },
    type: "deleteButton",
  },
  {
    id: "e2-3",
    source: "node_2",
    target: "node_3",
    animated: true,
    style: { stroke: "#14b8a6" },
    type: "deleteButton",
  },
  {
    id: "e3-4",
    source: "node_3",
    target: "node_4",
    animated: true,
    style: { stroke: "#f97316" },
    type: "deleteButton",
  },
];
