import {
  getBezierPath,
  EdgeLabelRenderer,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  X, // 🚨 IMPORTED: Code icon for CodeBlockNode
} from "lucide-react";
import type { MouseEvent } from "react";
const DeleteButtonEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: MouseEvent, edgeId: string) => {
    evt.stopPropagation();
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  };

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            position: "absolute",
          }}
        >
          <button
            className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center p-0.5 transition-colors shadow-lg ring-2 ring-white/20"
            onClick={(event) => onEdgeClick(event, id)}
            title="Delete Connection"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
export default DeleteButtonEdge;
