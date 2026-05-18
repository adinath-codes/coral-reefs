import { useState, useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type NodeMouseHandler,
  BackgroundVariant,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Play,
  Trash,
  ChevronDown,
  Plus,
  Grid,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Workflow,
} from "lucide-react";
import {
  initialEdges,
  initialNodes,
  nodeTypes,
  edgeTypes,
  nodeOptions,
  HORIZONTAL_BRANCH_SPACING,
} from "../utils/constants";
import clusterToJSON from "../utils/clusterToJSON";
import NodeConfigPanel, {
  type t_CustomNodeData,
} from "../components/NodeSidePanel";
import { ClusterIDProvider, useClusterID } from "../memory/ClusterIDContext";

const FindExecType = (nodes: Node<t_CustomNodeData>[]) => {
  const execType = nodes.reduce(
    (type: string | null, node: Node<t_CustomNodeData>) => {
      if (node.type === "dataset") {
        return "train";
      } else if (node.type === "evaluation") {
        return "evaluate";
      } else if (node.type === "rlconfig") {
        return "rlhf";
      }
      return type;
    },
    null,
  );
  console.log("Determined Execution Type:", execType);
  return execType;
};

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
  const instance = useReactFlow<Node<t_CustomNodeData>, Edge>();

  const [xPos, setXPos] = useState<number>(() => Math.random() * 800 + 100);
  const [yPos, setYPos] = useState<number>(() => Math.random() * 400 + 500);
  const { setCurrentClusterID } = useClusterID();
  const { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange } =
    useFlowStates(initialNodes, initialEdges);
  const {
    executingParentIds,
    setExecutingParentIds,
    isExecuting,
    setIsExecuting,
  } = useExecutionState();

  const [selectedNode, setSelectedNode] =
    useState<Node<t_CustomNodeData> | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleSimulateMerge = () => {
    alert("Simulating Merge Operation...");
  };

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    alert("Content copied to clipboard!");
  };

  const handleDownloadVideo = (url: string) => {
    alert(`Simulating download of video from: ${url}`);
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

  const onNodeClick: NodeMouseHandler<Node<t_CustomNodeData>> = useCallback(
    (_, node) => {
      setSelectedNode(node);
    },
    [],
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

  const handleMassRun = useCallback(async () => {
    const parentIds = nodes
      .filter((n) => n.type === "dataset")
      .map((n) => n.id);
    parentIds.forEach((id) => handleExecuteParentWorkflow(id));
    setIsExecuting(true);
    setEdges((eds) =>
      eds.map((edge) => {
        return { ...edge, animated: true };
      }),
    );
    try {
      const execType = FindExecType(instance.getNodes());
      // let response = null;
      const JSONdata = clusterToJSON(
        instance as unknown as Parameters<typeof clusterToJSON>[0],
      );
      if (execType === "train") {
        console.log(
          "Sending Cluster Data to API:",
          instance.getNodes(),
          JSONdata,
        );
        setCurrentClusterID(JSON.parse(JSONdata).clusterID);
        setNodes((nds) =>
          nds.map((node) => {
            if (node.type === "mloutput") {
              return {
                ...node,
                data: {
                  ...node.data,
                  clusterID: JSON.parse(JSONdata).clusterID,
                },
              };
            }
            return node;
          }),
        );
      } else if (execType === "evaluate") {
        // ... handled logic
      } else if (execType === "rlhf") {
        // ... handled logic
      }
    } catch (error) {
      console.error("Mass Run Failed:", error);
    }
    setEdges((eds) =>
      eds.map((edge) => {
        return { ...edge, animated: false };
      }),
    );
    setIsExecuting(false);
  }, [
    nodes,
    setIsExecuting,
    setEdges,
    handleExecuteParentWorkflow,
    instance,
    setCurrentClusterID,
    setNodes,
  ]);

  const handleMassDeleteClusterGlobal = useCallback(() => {
    if (
      !confirm(
        "Are you sure you want to delete ALL Parent Prompts and their descendants? This action cannot be undone.",
      )
    ) {
      return;
    }

    const parentNodes = nodes.filter((n) => n.type === "dataset");

    const allNodesToDelete: string[] = [];
    const allEdgesToDelete: string[] = [];

    parentNodes.forEach((parentNode) => {
      allNodesToDelete.push(parentNode.id);
      const { nodeIds, edgeIds } = findBranchNodesAndEdges(
        parentNode.id,
        edges,
      );
      allNodesToDelete.push(...nodeIds);
      allEdgesToDelete.push(...edgeIds);
    });

    const uniqueNodesToDelete = Array.from(new Set(allNodesToDelete));
    const uniqueEdgesToDelete = Array.from(new Set(allEdgesToDelete));

    setNodes((nds) => nds.filter((n) => !uniqueNodesToDelete.includes(n.id)));
    setEdges((eds) => eds.filter((e) => !uniqueEdgesToDelete.includes(e.id)));
    setSelectedNode(null);
  }, [nodes, edges, setNodes, setEdges]);

  // Add New Node logic remains the same
  const addNewNode = (type: string) => {
    const defaultData = {
      parent: {
        label: `New Parent ${nodeIdCounter}`,
        description: "Enter main goal in chat",
        status: "Ready",
        chatHistory: [],
      },
      child: {
        label: `New Child ${nodeIdCounter}`,
        description: "Configure child prompt",
        status: "Ready",
      },
      mloutput: {
        label: "ML Output",
        description: "The output generated by the machine learning model.",
        inputCount: 3,
        clusterID: null,
        modelLink: null,
      },
      textOP: {
        label: `Text Output ${nodeIdCounter}`,
        content: `Analysis complete: Status report for Node ${nodeIdCounter} ready.`,
      },
      basemodel: {
        label: `Base Model ${nodeIdCounter}`,
        description: "Custom merge operation.",
        inputCount: 3,
      },

      evaluation: {
        label: `evaluation ${nodeIdCounter}`,
        language: "JavaScript",
        status: "Ready",
        executedCount: 0,
      },
      summary: {
        label: `Final Report ${nodeIdCounter}`,
        content: "Awaiting inputs for final synthesis...",
        description: "Consolidates text/data inputs into a final report.",
        inputCount: 3,
      },
    };

    if (type === "dataset") {
      const parentNodes = nodes.filter((n) => n.type === "dataset");

      if (parentNodes.length > 0) {
        const maxX = parentNodes.reduce(
          (max, node) => Math.max(max, node.position.x),
          0,
        );

        setXPos(maxX + HORIZONTAL_BRANCH_SPACING);
        setYPos(50);
      } else {
        setXPos(600);
        setYPos(50);
      }
    }
    const Deftype = type as keyof typeof defaultData;
    const newNode: Node<t_CustomNodeData> = {
      id: `${nodeIdCounter++}`,
      type: type,
      position: { x: xPos, y: yPos },
      data: defaultData[Deftype] || {
        label: `New ${type}`,
        description: "Configure me",
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const getSelectedNodeData = () => {
    if (!selectedNode) return null;
    return nodes.find((node) => node.id === selectedNode.id);
  };

  const currentSelectedNode = getSelectedNodeData();

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
          {/* Enhanced stats display */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/50 transition-all hover:border-emerald-500/50 hover:scale-105 duration-200">
              <Workflow className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">{nodes.length}</span>
              <span className="text-gray-400">Nodes</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/50 transition-all hover:border-emerald-500/50 hover:scale-105 duration-200">
              <Grid className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">{edges.length}</span>
              <span className="text-gray-400">Edges</span>
            </div>
          </div>

          {/* Existing Delete All Button */}
          <button
            onClick={handleMassDeleteClusterGlobal}
            className="group px-4 py-2 bg-linear-to-r from-red-600/80 to-red-700/80 hover:from-red-600 hover:to-red-700 disabled:from-gray-700/50 disabled:to-gray-700/50 text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg shadow-red-500/30 flex items-center gap-2 border border-red-500/30 hover:border-red-500/50 hover:shadow-red-500/50"
            disabled={isExecuting}
          >
            <Trash className="w-4 h-4 group-hover:animate-bounce" />
            Clear All
          </button>

          <button
            onClick={handleMassRun}
            disabled={isExecuting}
            className="group px-5 py-2 bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-200 text-sm font-bold shadow-xl shadow-emerald-500/50 flex items-center gap-2 border border-emerald-400/50 hover:border-emerald-400 hover:shadow-emerald-500/70"
          >
            {isExecuting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Executing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                Execute All
              </>
            )}
          </button>
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
            onNodeClick={onNodeClick}
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
                    case "dataset":
                      return "#10b981";
                    case "basemodel":
                      return "#3b82f6";
                    case "mloutput":
                      return "#f59e0b";
                    case "evaluation":
                      return "#8b5cf6";
                    case "promptdataset":
                      return "green";
                    case "rlconfig":
                      return "#f97316";
                    case "codeBlock":
                      return "#14b8a6";
                    case "summary":
                      return "#ec4899";
                    default:
                      return "#6b7280";
                  }
                }}
                className="cursor-pointer shadow-lg rounded-xl border border-gray-700/50"
              />
            )}
          </ReactFlow>

          {/* Configuration Panel (Right Sidebar) - Now using the dedicated component */}
          {currentSelectedNode && (
            <NodeConfigPanel
              key={currentSelectedNode.id}
              node={currentSelectedNode as Node<t_CustomNodeData>}
              setNodes={setNodes}
              setSelectedNode={setSelectedNode}
              handleSimulateMerge={handleSimulateMerge}
              handleCopyToClipboard={handleCopyToClipboard}
              handleDownloadVideo={handleDownloadVideo}
            />
          )}
        </div>
      </div>
    </div>
  );
};
const SourcePage = () => {
  return (
    <ReactFlowProvider>
      <ClusterIDProvider>
        <SourcePageContent />
      </ClusterIDProvider>
    </ReactFlowProvider>
  );
};
export default SourcePage;
