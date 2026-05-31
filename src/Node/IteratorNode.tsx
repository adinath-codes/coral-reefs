import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Repeat } from "lucide-react";

export default function IteratorNode({ selected }: NodeProps) {
  return (
    <div
      className={`bg-gray-900/90 backdrop-blur-md rounded-xl p-4 w-72 transition-all duration-200 border-2 ${
        selected
          ? "border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)] scale-105"
          : "border-pink-500/40 hover:border-pink-500/80"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-pink-500 border-gray-900"
      />
      <div className="flex items-start gap-3">
        <div className="p-2 bg-pink-500/20 rounded-lg border border-pink-500/30">
          <Repeat className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Iterator</h3>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Loop through array outputs for batch processing.
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-pink-500 border-gray-900"
      />
    </div>
  );
}
