import DeleteButtonEdge from "../components/DelButtonEdge";
import SourceHeadNode from "../Node/SourceHead";
import EndpointNode from "../Node/Endpoint";
import ParamsNode from "../Node/Params";
import ColumnsNode from "../Node/Columns";
import TestQueriesNode from "../Node/TestQueries";
import {
  Link,
  FileJson,
  TableProperties,
  Network,
  Activity,
  Settings2,
} from "lucide-react";
import type { Node, NodeTypes, Edge } from "@xyflow/react";
export type t_CustomNodeData = Record<string, unknown>;

// Preserved visual feature: Mapped ML colors to API builder types
const ICON_COLORS = {
  source_head: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  endpoint: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  params: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  columns: "bg-green-500/20 text-green-400 border border-green-500/30",
  test_queries: "bg-red-500/20 text-red-400 border border-red-500/30",
  // Keeping this for potential future settings/auth nodes
  auth_config: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
};

const BASE_COLORS = {
  source_head: "purple",
  endpoint: "blue",
  params: "yellow",
  columns: "green",
  test_queries: "red",
  auth_config: "orange",
};

// Adapted initial nodes to represent a basic API connection flow
// A fully populated, 4-node Airtable template
const initialNodes: Node<t_CustomNodeData>[] = [
  {
    id: "1",
    type: "source_head",
    position: { x: 350, y: 50 }, // Centered horizontally at the top
    data: {
      src_name: "airtable",
      base_url: "https://api.airtable.com/v0",
    },
  },
  {
    id: "2",
    type: "endpoint",
    position: { x: 350, y: 250 },
    data: {
      table_name: "Employees",
      method: "GET",
      endpoint: "appIJmDl1oenGZTlW/Employees",
    },
  },
  {
    id: "3",
    type: "columns",
    position: { x: 350, y: 450 },
    data: {
      rows_path: "records",
      // Important: This must be a string so it renders in the textarea correctly!
      columns:
        '[\n  {\n    "name": "id",\n    "type": "Utf8"\n  },\n  {\n    "name": "fields",\n    "type": "Json"\n  }\n]',
    },
  },
  {
    id: "4",
    type: "test_queries",
    position: { x: 350, y: 650 },
    data: {
      test_query: 'SELECT * FROM airtable."Employees" LIMIT 5',
    },
  },
];

// Wires them sequentially: Source -> Endpoint -> Columns -> Test Query
const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true, // Let's make the template flow animated!
    style: { stroke: "#a855f7", strokeWidth: 2 }, // Purple
    type: "deleteButton",
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    animated: true,
    style: { stroke: "#3b82f6", strokeWidth: 2 }, // Blue
    type: "deleteButton",
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    animated: true,
    style: { stroke: "#22c55e", strokeWidth: 2 }, // Green
    type: "deleteButton",
  },
];

// Mapped the engine types to your specific React components
const nodeTypes: NodeTypes = {
  source_head: SourceHeadNode,
  endpoint: EndpointNode,
  params: ParamsNode,
  columns: ColumnsNode,
  test_queries: TestQueriesNode,
};

const edgeTypes = {
  deleteButton: DeleteButtonEdge,
};

// Updated the dropdown menu definitions
const nodeOptions = [
  {
    type: "source_head",
    icon: Network,
    color: "purple",
    label: "Source Configuration",
    description: "Define the Base URL and integration name.",
  },
  {
    type: "endpoint",
    icon: Link,
    color: "blue",
    label: "Endpoint",
    description: "Specify the path and HTTP method.",
  },
  {
    type: "params",
    icon: Settings2,
    color: "yellow",
    label: "Parameters",
    description: "Define JSON query parameters.",
  },
  {
    type: "columns",
    icon: TableProperties,
    color: "green",
    label: "Column Schema",
    description: "Map API response fields to database columns.",
  },
  {
    type: "test_queries",
    icon: Activity,
    color: "red",
    label: "Diagnostic Query",
    description: "Write SQL to validate the connection.",
  },
  {
    type: "auth_config", // Preserved as an option for expandability
    icon: FileJson,
    color: "orange",
    label: "Auth Headers",
    description: "Set Bearer tokens and API keys.",
  },
];

// Preserved layout variables
const CHILD_NODE_HEIGHT = 170;
const NODE_VERTICAL_SPACING = 50;
const HORIZONTAL_BRANCH_SPACING = 1200;
const CHILD_WIDTH_OFFSET = 400;

export {
  ICON_COLORS,
  BASE_COLORS,
  initialNodes,
  initialEdges,
  nodeTypes,
  edgeTypes,
  nodeOptions,
  CHILD_NODE_HEIGHT,
  NODE_VERTICAL_SPACING,
  HORIZONTAL_BRANCH_SPACING,
  CHILD_WIDTH_OFFSET,
};
