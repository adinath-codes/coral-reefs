import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Search } from "lucide-react";

export default function VectorNode({ selected }: NodeProps) {
  return (
    <div
      className={`bg-gray-900/90 backdrop-blur-md rounded-xl p-4 w-72 transition-all duration-200 border-2 ${
        selected
          ? "border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)] scale-105"
          : "border-teal-500/40 hover:border-teal-500/80"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-teal-500 border-gray-900"
      />
      <div className="flex items-start gap-3">
        <div className="p-2 bg-teal-500/20 rounded-lg border border-teal-500/30">
          <Search className="w-5 h-5 text-teal-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Vector Search</h3>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Search semantic runbooks or embedded context.
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-teal-500 border-gray-900"
      />
    </div>
  );
}
