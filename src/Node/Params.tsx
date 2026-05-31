import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Settings2 } from "lucide-react";
interface ParamsData {
  params?: string;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  [key: string]: unknown;
}
export type ParamsNodeType = Node<ParamsData, "params">;

export default function ParamsNode({ selected }: NodeProps<ParamsNodeType>) {
  return (
    <div
      className={`bg-gray-900/90 backdrop-blur-md rounded-xl p-4 w-72 transition-all duration-200 border-2 ${
        selected
          ? "border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)] scale-105"
          : "border-yellow-500/40 hover:border-yellow-500/80"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-gray-900"
      />

      <div className="flex items-start gap-3">
        <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
          <Settings2 className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Parameters</h3>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Define JSON query parameters.
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-yellow-500 border-gray-900"
      />
    </div>
  );
}
