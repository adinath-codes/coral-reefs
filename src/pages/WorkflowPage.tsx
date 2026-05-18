import "@xyflow/react/dist/style.css";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import { Plus, Trash } from "lucide-react";
import { useCallback, useState } from "react";
const initialNodes = [
  { id: "n1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
  { id: "n2", position: { x: 0, y: 100 }, data: { label: "Node 2" } },
];

const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

const WorkflowPage = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );
  return (
    <>
      <div className="w-full pr-6 h-20 flex justify-between items-center gap-2.5 ">
        <div className="BUTTONCONTAINER flex p-5 gap-2.5">
          <button className="group px-5 py-2 cursor-pointer bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-200 text-sm font-bold shadow-xl shadow-emerald-500/50 flex items-center gap-2 border border-emerald-400/50 hover:border-emerald-400 hover:shadow-emerald-500/70">
            <Plus size={30} fill="white" />
            <p className="text-white text-lg">Add Node</p>
          </button>
          <button className="group px-5 py-2 cursor-pointer bg-linear-to-r from-orange-800 to-red-600 hover:from-orange-900 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-200 text-sm font-bold shadow-xl shadow-orange-500/50 flex items-center gap-2 border border-orange-400/50 hover:border-orange-400 hover:shadow-orange-500/70">
            <Trash size={20} stroke="white" />
            <p className="text-white text-lg">Clear All</p>
          </button>
        </div>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </>
  );
};

export default WorkflowPage;
