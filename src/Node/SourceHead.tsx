import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Network } from "lucide-react";
interface SourceHeadData {
  src_name?: string;
  base_url?: string;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  [key: string]: unknown;
}
export type SourceHeadNodeType = Node<SourceHeadData, "source_head">;
export default function SourceHeadNode({
  selected,
}: NodeProps<SourceHeadNodeType>) {
  return (
    <div
      className={`bg-gray-900/90 backdrop-blur-md rounded-xl p-4 w-72 transition-all duration-200 border-2 ${
        selected
          ? "border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-105"
          : "border-purple-500/40 hover:border-purple-500/80"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
          <Network className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Source Configuration</h3>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Define the Base URL and integration name.
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-purple-500 border-gray-900"
      />
    </div>
  );
}
