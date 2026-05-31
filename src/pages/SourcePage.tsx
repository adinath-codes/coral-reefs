import { useState, useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  BackgroundVariant,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ChevronDown,
  Plus,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Trash,
  Sparkles,
} from "lucide-react";
import {
  initialEdges,
  initialNodes,
  nodeTypes,
  edgeTypes,
  nodeOptions,
} from "../utils/constants";
import NodeSidePanel from "../components/NodeSidePanel";
import AIModal from "../components/AiModel";

export type t_CustomNodeData = Record<string, unknown>;
let nodeIdCounter = 12;

const useFlowStates = (
  initialNodes: Node<t_CustomNodeData>[],
  initialEdges: Edge[],
) => {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<t_CustomNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  return { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange };
};

const useExecutionState = () => {
  const [executingParentIds, setExecutingParentIds] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  return {
    executingParentIds,
    setExecutingParentIds,
    isExecuting,
    setIsExecuting,
  };
};

const SourcePageContent = () => {
  const { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange } =
    useFlowStates(initialNodes, initialEdges);
  const { executingParentIds, setExecutingParentIds } = useExecutionState();

  const currentSelectedNode = nodes.find((n) => n.selected);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  // Translates React Flow state into the FastAPI Coral YAML Schema
  const compileWorkflow = () => {
    // 1. Hunt down the specific nodes by their type
    const sourceNode = nodes.find((n) => n.type === "source_head")?.data || {};
    const endpointNode = nodes.find((n) => n.type === "endpoint")?.data || {};
    const columnsNode = nodes.find((n) => n.type === "columns")?.data || {};
    const testQueriesNode =
      nodes.find((n) => n.type === "test_queries")?.data || {};

    // 2. Safely parse the columns JSON from the textarea
    let parsedColumns: Record<string, unknown>[] = [];
    if (columnsNode.columns) {
      if (typeof columnsNode.columns === "string") {
        try {
          parsedColumns = JSON.parse(columnsNode.columns);
        } catch (error) {
          console.error("JSON Parsing Error:", error);
          alert("⚠️ Warning: Legacy Column Schema is not valid JSON.");
        }
      } else if (Array.isArray(columnsNode.columns)) {
        // It's already a clean array from our new side panel UI!
        parsedColumns = columnsNode.columns;
      }
    }

    // 3. Convert comma-separated string into an array (e.g., "records, fields" -> ["records", "fields"])
    let parsedRowsPath: string[] = [];
    if (columnsNode.rows_path && typeof columnsNode.rows_path === "string") {
      parsedRowsPath = columnsNode.rows_path
        .split(",")
        .map((path) => path.trim())
        .filter(Boolean); // Removes empty strings
    }

    // 4. Handle test queries (split by newlines if the user pasted multiple queries)
    let parsedTestQueries: string[] = [];
    if (
      testQueriesNode.test_query &&
      typeof testQueriesNode.test_query === "string"
    ) {
      parsedTestQueries = testQueriesNode.test_query
        .split("\n")
        .map((query) => query.trim())
        .filter(Boolean);
    }

    // 5. Assemble the exact JSON schema for the /generate-customsrc-yaml endpoint
    return {
      src_name: sourceNode.src_name || "untitled_source",
      base_url: sourceNode.base_url || "",
      tables: [
        {
          name: endpointNode.table_name || "Untitled_Table",
          desc: `Data mapping for ${endpointNode.table_name || "custom source"}`,
          method: endpointNode.method || "GET",
          endpoint: endpointNode.endpoint || "",
          columns: parsedColumns,
          pagination: {
            cursor_param: "offset", // Default mapped from your dummy payload
          },
          rows_path: parsedRowsPath,
        },
      ],
      test_queries: parsedTestQueries,
    };
  };
  const handleExecuteAll = async () => {
    if (nodes.length === 0) {
      alert("Canvas is empty! Add some nodes first.");
      return;
    }

    setIsExecuting(true);
    const payload = compileWorkflow();

    console.log(
      "Sending Payload to Backend:",
      JSON.stringify(payload, null, 2),
    );

    try {
      // --- STEP 1: Generate the YAML Configuration ---
      console.log("Step 1: Generating YAML...");
      const genResponse = await fetch(
        "http://localhost:8000/generate-customsrc-yaml",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!genResponse.ok) {
        const errorData = await genResponse.json();
        throw new Error(
          `Generation Failed: ${errorData.detail || "Unknown error"}`,
        );
      }
      console.log("YAML Generated Successfully.");

      // --- STEP 2: Execute the YAML (Run the Test Queries) ---
      console.log("Step 2: Executing YAML...");
      const sourceNode = nodes.find((n) => n.type === "source_head");
      const authToken = (sourceNode?.data?.auth_token as string) || "";
      const execPayload = {
        src_name: payload.src_name,
        auth_token: authToken,
      };

      const execResponse = await fetch(
        "http://localhost:8000/execute-customsrc-yaml",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(execPayload),
        },
      );

      if (!execResponse.ok) {
        const errorData = await execResponse.json();
        throw new Error(
          `Execution Failed: ${errorData.detail || "Unknown error"}`,
        );
      }

      const execResult = await execResponse.json();
      console.log("Execution Result:", execResult);

      alert("Success! Custom source Created.");
    } catch (error) {
      console.error("Workflow Error:", error);
      // Safely handle both network errors and our custom thrown errors
      alert(
        `${error instanceof Error ? error.message : "Could not connect to backend."}`,
      );
    } finally {
      setIsExecuting(false);
    }
  };
  const handleClearAll = () => {
    if (nodes.length === 0) {
      return;
    }

    const confirmClear = window.confirm(
      "Are you sure you want to clear the entire canvas? This cannot be undone.",
    );

    if (confirmClear) {
      setNodes([]);
      setEdges([]);
    }
  };
  const handleNodesChange = useCallback(
    (changes: NodeChange<Node<t_CustomNodeData>>[]) => {
      onNodesChange(changes);
    },
    [onNodesChange],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
    },
    [onEdgesChange],
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: false,
            type: "deleteButton",
            style: {
              stroke: "#f97316",
              strokeWidth: 2,
            },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const findBranchNodesAndEdges = (startNodeId: string, allEdges: Edge[]) => {
    const nodeIdsInBranch = [startNodeId];
    const queue = [startNodeId];
    let index = 0;

    while (index < queue.length) {
      const currentId = queue[index++];
      const downstreamIds = allEdges
        .filter((e) => e.source === currentId)
        .map((e) => e.target);

      downstreamIds.forEach((id) => {
        if (!nodeIdsInBranch.includes(id)) {
          nodeIdsInBranch.push(id);
          queue.push(id);
        }
      });
    }

    const edgesInBranch = allEdges
      .filter(
        (edge) =>
          nodeIdsInBranch.includes(edge.source) &&
          nodeIdsInBranch.includes(edge.target),
      )
      .map((e) => e.id);

    return { nodeIds: nodeIdsInBranch, edgeIds: edgesInBranch };
  };

  const handleExecuteParentWorkflow = useCallback(
    (parentNodeId: string) => {
      if (executingParentIds.includes(parentNodeId)) return;

      setExecutingParentIds((prev) => [...prev, parentNodeId]);

      const { edgeIds, nodeIds } = findBranchNodesAndEdges(parentNodeId, edges);

      setEdges((eds) =>
        eds.map((edge) => {
          if (edgeIds.includes(edge.id)) {
            return { ...edge, animated: true };
          }
          return edge;
        }),
      );

      setTimeout(() => {
        setExecutingParentIds((prev) =>
          prev.filter((id) => id !== parentNodeId),
        );

        setEdges((eds) =>
          eds.map((edge) => {
            if (edgeIds.includes(edge.id)) {
              return { ...edge, animated: false };
            }
            return edge;
          }),
        );
        setNodes((nds) =>
          nds.map((node) => {
            if (
              (node.type === "dataset" ||
                node.type === "mloutput" ||
                node.type === "basemodel") &&
              nodeIds.includes(node.id)
            ) {
              const currExecCount: number = node.data.executedCount as number;
              return {
                ...node,
                data: {
                  ...node.data,
                  status: "Completed",
                  executedCount:
                    node.data.executedCount !== undefined
                      ? currExecCount + 1
                      : undefined,
                },
              };
            }
            return node;
          }),
        );
      }, 3000);
    },
    [executingParentIds, setExecutingParentIds, edges, setEdges, setNodes],
  );

  // Add New Node logic remains the same
  const addNewNode = (type: string) => {
    // Basic auto-layout logic: just stack them downwards for now
    const newY =
      nodes.length > 0
        ? Math.max(...nodes.map((n) => n.position.y)) + 150
        : 100;

    let defaultData = {};

    // Inject the exact schema our Side Panel expects
    switch (type) {
      case "source_head":
        defaultData = { src_name: "", base_url: "" };
        break;
      case "endpoint":
        defaultData = { table_name: "", method: "GET", endpoint: "" };
        break;
      case "params":
        defaultData = { params: "" };
        break;
      case "columns":
        defaultData = { rows_path: "", columns: "" };
        break;
      case "test_queries":
        defaultData = { test_query: "" };
        break;
    }

    const newNode: Node = {
      id: `${nodeIdCounter++}`,
      type: type,
      position: { x: 250, y: newY }, // Center it in the view
      data: defaultData,
    };

    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="w-full h-[90vh] bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col overflow-hidden">
      {/* Enhanced Toolbar with Dropdown Menu */}
      <div className="relative from-gray-800/70 via-gray-800/80 to-gray-800/70 backdrop-blur-md border-b border-gray-700/50 px-6 py-3 flex items-center justify-between gap-3 shadow-inner z-10">
        <div className="flex items-center gap-3">
          {/* Modern Add Node Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="group px-4 py-2 bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl transition-all duration-200 text-sm font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-2 border border-emerald-400/50"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              Add Node
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  showAddMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Animated Dropdown Menu */}
            {showAddMenu && (
              <div className="absolute z-50 top-full left-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 space-y-1">
                  {nodeOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => {
                        addNewNode(option.type);
                        setShowAddMenu(false);
                      }}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-${option.color}-500/10 hover:border-${option.color}-500/30 border border-transparent group`}
                    >
                      <div
                        className={`p-2 bg-${option.color}-500/20 rounded-lg border border-${option.color}-500/30 group-hover:scale-110 transition-transform`}
                      >
                        <option.icon
                          className={`w-5 h-5 text-${option.color}-400`}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-white font-semibold text-sm">
                          {option.label}
                        </div>
                        <div className="text-gray-400 text-xs mt-0.5">
                          {option.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* View Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowViewMenu(!showViewMenu)}
              className="px-4 py-2 bg-gray-700/70 hover:bg-gray-700 text-white rounded-xl transition-all duration-200 text-sm flex items-center gap-2 border border-gray-600/50 shadow-md"
            >
              <Eye className="w-4 h-4" />
              View
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  showViewMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showViewMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setShowMiniMap(!showMiniMap);
                      setShowViewMenu(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-all text-sm text-gray-300"
                  >
                    <span className="flex items-center gap-2">
                      {showMiniMap ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                      Mini Map
                    </span>
                    <div
                      className={`w-10 h-5 rounded-full transition-colors ${
                        showMiniMap ? "bg-emerald-500" : "bg-gray-600"
                      } relative`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          showMiniMap ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      ></div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setIsFullscreen(!isFullscreen);
                      setShowViewMenu(false);
                    }}
                    className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-gray-800 transition-all text-sm text-gray-300"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                    {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleExecuteAll}
                disabled={isExecuting}
                className={`"group px-5 py-2 cursor-pointer text-white rounded-xl transition-all duration-200 text-sm font-bold shadow-xl shadow-emerald-500/50 flex items-center gap-2 border " ${
                  isExecuting
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 border-emerald-400/50 hover:border-emerald-400 hover:shadow-emerald-500/70"
                }`}
              >
                {isExecuting ? (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <span className="text-lg leading-none">▶</span>
                )}
                {isExecuting ? "Executing..." : "Execute"}
              </button>
            </div>
            <button
              onClick={handleClearAll}
              className="group px-2 py-2 cursor-pointer bg-linear-to-r from-orange-800 to-red-600 hover:from-orange-900 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-200 text-sm font-bold shadow-xl shadow-orange-500/50 flex items-center gap-2 border border-orange-400/50 hover:border-orange-400 hover:shadow-orange-500/70"
            >
              <Trash size={20} stroke="white" />
              <p className="text-white text-lg">Clear All</p>
            </button>
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/50 rounded-xl transition-all font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              <Sparkles className="w-4 h-4" />
              AI Assist
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex">
        {/* ReactFlow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                onExecute:
                  node.type === "dataset"
                    ? handleExecuteParentWorkflow
                    : node.data.onExecute,
                isRunning: executingParentIds.includes(node.id),
              },
            }))}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onBeforeDelete={async () => {
              return confirm("Are you sure you want to DELETE this node?");
            }}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            deleteKeyCode={["Backspace", "Delete"]}
            selectionKeyCode="Shift"
            panOnDrag={true}
            fitView
            className="bg-transparent"
          >
            <Background
              color="#4b5563"
              gap={25}
              size={5}
              variant={BackgroundVariant.Dots}
              className="opacity-10"
            />
            {/* Controls - Modernized floating glass effect */}
            <Controls className="absolute max-w-0 bottom-6 right-6" />
            {showMiniMap && (
              <MiniMap
                zoomable
                pannable
                nodeBorderRadius={10}
                bgColor="rgba(31, 41, 55, 0.9)"
                maskColor="rgba(100, 100, 100, 0.4)"
                nodeColor={(node) => {
                  switch (node.type) {
                    case "source_head":
                      return "#a855f7"; // purple-500
                    case "endpoint":
                      return "#3b82f6"; // blue-500
                    case "params":
                      return "#eab308"; // yellow-500
                    case "columns":
                      return "#22c55e"; // green-500
                    case "test_queries":
                      return "#ef4444"; // red-500
                    default:
                      return "#6b7280";
                  }
                }}
                className="cursor-pointer shadow-lg rounded-xl border border-gray-700/50"
              />
            )}
          </ReactFlow>

          {/* Configuration Panel (Right Sidebar) - Now using the dedicated component */}
          <div
            className={`absolute top-0 right-0 h-full z-50 transition-transform duration-300 ease-in-out shadow-2xl ${
              currentSelectedNode ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <NodeSidePanel
              selectedNode={currentSelectedNode}
              setNodes={setNodes}
            />
          </div>
        </div>
      </div>
      <AIModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        setNodes={setNodes}
        setEdges={setEdges}
      />
    </div>
  );
};
const SourcePage = () => {
  return (
    <ReactFlowProvider>
      <SourcePageContent />
    </ReactFlowProvider>
  );
};
export default SourcePage;
