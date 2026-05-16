import React, { useState, useCallback } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Album, GitBranch, Play, Shell, Trash, Trash2 } from "lucide-react";

const initialNodes = [
  { id: "n1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
  { id: "n2", position: { x: 0, y: 100 }, data: { label: "Node 2" } },
];

const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

export default function App() {
  const [currTab, setCurrTab] = useState<"sourcePage" | "workflowPage">(
    "sourcePage",
  );
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div
      className="relative bg-black/90 overflow-hidden"
      style={{ width: "100vw", height: "100vh" }}
    >
      <header className="bg-black/60 w-full pr-6 h-20 flex justify-between items-center gap-2.5 ">
        <div className="LOGOCONTAINER justify-center items-center text-blue-400 flex px-2 py-4 gap-1.5">
          <Shell size={50} />
          <h3 className="font-bold text-5xl font-['Ephesis']">Coral Reefs</h3>
        </div>
        <div className="BUTTONCONTAINER flex p-5 gap-2.5">
          <button className="group px-5 py-2 cursor-pointer bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-200 text-sm font-bold shadow-xl shadow-emerald-500/50 flex items-center gap-2 border border-emerald-400/50 hover:border-emerald-400 hover:shadow-emerald-500/70">
            <Play size={20} fill="white" stroke="none" />
            <p className="text-white text-lg">Execute</p>
          </button>
          <button className="group px-5 py-2 cursor-pointer bg-linear-to-r from-orange-800 to-red-600 hover:from-orange-900 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-200 text-sm font-bold shadow-xl shadow-orange-500/50 flex items-center gap-2 border border-orange-400/50 hover:border-orange-400 hover:shadow-orange-500/70">
            <Trash size={20} stroke="white" />
            <p className="text-white text-lg">Clear All</p>
          </button>
        </div>
      </header>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
      <footer className="absolute flex left-1/2 -translate-x-1/2 bottom-4 bg-white/30 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl ">
        <button
          onClick={() => setCurrTab("sourcePage")}
          className={`flex justify-center items-center h-14 w-32 rounded-l-2xl cursor-pointer transition-all duration-500 ${currTab === "sourcePage" && "bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.7)]"} hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,1)]`}
        >
          <GitBranch
            size={30}
            stroke={currTab === "sourcePage" ? "#000000" : "#808080"}
          />
        </button>
        {/* <div className="h-14 w-0.5 bg-white/20" /> */}
        <button
          onClick={() => setCurrTab("workflowPage")}
          className={`flex justify-center items-center h-14 w-32 rounded-r-2xl cursor-pointer transition-all duration-500 ${currTab === "workflowPage" && "bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.7)]"} hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,1)]`}
        >
          <Album
            size={30}
            stroke={currTab === "workflowPage" ? "#000000" : "#808080"}
          />
        </button>
      </footer>
    </div>
  );
}
