import { useState, type Dispatch, type SetStateAction } from "react";
import { X, Settings, Trash } from "lucide-react";
import { nodeOptions } from "../utils/constants";
import type { Node } from "@xyflow/react";
export type t_validNodeValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | unknown[]
  | ((parentNodeId: string) => void);
export interface t_CustomNodeData {
  label?: string;
  description?: string;
  status?: string;

  HFdataset?: string;
  basemodel?: string;
  modelLink?: string | null;
  clusterID?: number | null;

  onExecute?: (parentNodeId: string) => void;
  isRunning?: boolean;

  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | unknown[]
    | ((parentNodeId: string) => void);
}

interface NodeConfigPanelProps {
  node: Node<t_CustomNodeData> | null;
  setNodes: Dispatch<SetStateAction<Node<t_CustomNodeData>[]>>;
  setSelectedNode: Dispatch<SetStateAction<Node<t_CustomNodeData> | null>>;
  handleSimulateMerge?: () => void;
  handleCopyToClipboard?: (content: string) => void;
  handleDownloadVideo?: (url: string) => void;
}

const NodeConfigPanel = ({
  node,
  setNodes,
  setSelectedNode,
}: NodeConfigPanelProps) => {
  const [localData, setLocalData] = useState<t_CustomNodeData>(
    node?.data || {},
  );

  if (!node) return null;

  const nodeType = node.type;

  const updateLocalData = (field: string, value: t_validNodeValue) => {
    setLocalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const persistNodeData = (field: string, value: t_validNodeValue) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id
          ? {
              ...n,
              data: {
                ...n.data,
                [field]: value,
              },
            }
          : n,
      ),
    );
  };

  const handleChange = (field: string, value: t_validNodeValue) => {
    updateLocalData(field, value);
    persistNodeData(field, value);
  };

  const handleBlur = (field: string) => {
    persistNodeData(field, localData[field]);
  };

  const handleDeleteNode = () => {
    if (
      confirm(
        `Are you sure you want to delete the ${nodeType} node: ${localData.label}?`,
      )
    ) {
      setNodes((nds) => nds.filter((n) => n.id !== node.id));
      setSelectedNode(null);
    }
  };

  const headerColor =
    nodeOptions.find((opt) => opt.type === nodeType)?.color || "gray";
  const HeaderIcon =
    nodeOptions.find((opt) => opt.type === nodeType)?.icon || Settings;

  const InputField = ({
    label,
    field,
    type = "text",
  }: {
    label: string;
    field: string;
    type?: string;
  }) => (
    <div>
      <label className="block text-sm font-bold text-gray-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={(localData[field] as string | number) || ""}
        onChange={(e) => handleChange(field, e.target.value)}
        onBlur={() => handleBlur(field)}
        className="w-full px-4 py-3 bg-gray-800/70 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
      />
    </div>
  );

  const datasetForm = () => (
    <>
      <InputField label="Node Label" field="label" />
      <InputField label="Hugging Face Dataset Link" field="HFdataset" />
    </>
  );

  const basemodelForm = () => (
    <>
      <InputField label="Node Label" field="label" />
      <InputField label="Base Model Link/Name" field="basemodel" />
    </>
  );

  const mlopForm = () => (
    <>
      <InputField label="Node Label" field="label" />
      <InputField
        label="Specify local File path (if no cluster ID)"
        field="modelLink"
      />
      <InputField label="clusterID" field="clusterID" type="number" />
    </>
  );

  return (
    <div className="absolute right-0 top-0 bottom-0 w-96 bg-gray-900/90 backdrop-blur-xl border-l border-gray-700/50 shadow-2xl shadow-gray-900/50 overflow-y-auto z-10">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-700/50 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 bg-${headerColor}-500/20 rounded-xl border border-${headerColor}-500/50`}
            >
              <HeaderIcon className={`w-5 h-5 text-${headerColor}-400`} />
            </div>
            <h3 className="text-xl font-bold text-white">
              {localData.label || "Node Configuration"}
            </h3>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-full transition-all duration-200"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {(nodeType === "dataset" || nodeType === "promptdataset") &&
            datasetForm()}
          {nodeType === "basemodel" && basemodelForm()}
          {nodeType === "mloutput" && mlopForm()}

          {/* Common Info & Delete */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">
                NODE TYPE
              </label>
              <div className="px-4 py-3 bg-gray-800/50 text-white rounded-xl border border-gray-700/50 text-sm font-semibold">
                {node.type}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">
                NODE ID
              </label>
              <div className="px-4 py-3 bg-gray-800/50 text-gray-400 rounded-xl border border-gray-700/50 text-sm font-mono truncate">
                {node.id}
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <div className="pt-4 border-t border-gray-700/50">
            <button
              onClick={handleDeleteNode}
              className="w-full px-4 py-3 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-200 font-bold shadow-xl shadow-red-500/30 border border-red-700/50 flex items-center justify-center gap-2"
            >
              <Trash className="w-5 h-5" />
              Delete Node
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeConfigPanel;
