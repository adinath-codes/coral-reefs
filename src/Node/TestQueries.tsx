import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Activity } from "lucide-react";
interface TestQueriesData {
  test_query?: string;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  [key: string]: unknown;
}
export type TestQueriesNodeType = Node<TestQueriesData, "test_queries">;

export default function TestQueriesNode({
  selected,
}: NodeProps<TestQueriesNodeType>) {
  return (
    <div
      className={`bg-gray-900/90 backdrop-blur-md rounded-xl p-4 w-72 transition-all duration-200 border-2 ${
        selected
          ? "border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] scale-105"
          : "border-red-500/40 hover:border-red-500/80"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-green-500 border-gray-900"
      />

      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
          <Activity className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Diagnostic Query</h3>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Write SQL to validate the connection.
          </p>
        </div>
      </div>
    </div>
  );
}
