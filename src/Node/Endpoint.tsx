import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Link } from "lucide-react";
interface EndpointData {
  table_name?: string;
  method?: "GET" | "POST";
  endpoint?: string;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  [key: string]: unknown;
}
export type EndpointNodeType = Node<EndpointData, "endpoint">;

export default function EndpointNode({
  selected,
}: NodeProps<EndpointNodeType>) {
  return (
    <div
      className={`bg-gray-900/90 backdrop-blur-md rounded-xl p-4 w-72 transition-all duration-200 border-2 ${
        selected
          ? "border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-105"
          : "border-blue-500/40 hover:border-blue-500/80"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-purple-500 border-gray-900"
      />

      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <Link className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Endpoint</h3>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Specify the path and HTTP method.
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-gray-900"
      />
    </div>
  );
}
