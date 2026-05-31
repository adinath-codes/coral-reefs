import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Send } from "lucide-react";

export default function HTTPNode({ selected }: NodeProps) {
  return (
    <div
      className={`bg-gray-900/90 backdrop-blur-md rounded-xl p-4 w-72 transition-all duration-200 border-2 ${
        selected
          ? "border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] scale-105"
          : "border-green-500/40 hover:border-green-500/80"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-green-500 border-gray-900"
      />
      <div className="flex items-start gap-3">
        <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
          <Send className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Action HTTP</h3>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Fire external webhooks or API requests (e.g., Slack).
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-500 border-gray-900"
      />
    </div>
  );
}
