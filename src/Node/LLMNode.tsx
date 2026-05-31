import { Handle, Position, type NodeProps } from "@xyflow/react";
import { BrainCircuit } from "lucide-react";

export default function LLMNode({ selected }: NodeProps) {
  return (
    <div
      className={`bg-gray-900/90 backdrop-blur-md rounded-xl p-4 w-72 transition-all duration-200 border-2 ${
        selected
          ? "border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)] scale-105"
          : "border-orange-500/40 hover:border-orange-500/80"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-orange-500 border-gray-900"
      />
      <div className="flex items-start gap-3">
        <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
          <BrainCircuit className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">LLM Reasoner</h3>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Evaluate data and make dynamic prompt decisions.
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-orange-500 border-gray-900"
      />
    </div>
  );
}
