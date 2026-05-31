import React from "react";
import type { Node } from "@xyflow/react";

// 1. Export the generic type so the rest of the app can use it safely
export type t_CustomNodeData = Record<string, unknown>;

interface NodeSidePanelProps {
  selectedNode: Node<t_CustomNodeData> | undefined;
  setNodes: React.Dispatch<React.SetStateAction<Node<t_CustomNodeData>[]>>;
}

export default function NodeSidePanel({
  selectedNode,
  setNodes,
}: NodeSidePanelProps) {
  // If no node is clicked, show an empty state
  if (!selectedNode) {
    return (
      <div className="w-80 h-full bg-gray-900 border-l border-gray-700 p-6 flex flex-col items-center justify-center text-gray-500 shadow-2xl">
        <div className="text-4xl mb-4">🖱️</div>
        <p className="text-center text-sm">
          Select a node on the canvas to configure its properties.
        </p>
      </div>
    );
  }

  // 2. The universal update function. It safely injects the sidebar inputs back into the canvas node!
  const updateData = (key: string, value: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return { ...node, data: { ...node.data, [key]: value } };
        }
        return node;
      }),
    );
  };

  // 3. Render the specific form based on which node is clicked
  const renderForm = () => {
    switch (selectedNode.type) {
      case "webhook_trigger":
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Trigger Name
              </label>
              <input
                className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-purple-500 transition-colors"
                placeholder="e.g., GitHub Alert"
                value={(selectedNode.data.name as string) || ""}
                onChange={(e) => updateData("name", e.target.value)}
              />
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-xs text-purple-300 leading-relaxed">
                This node acts as the entry point. The incoming HTTP payload
                will be available as variables (e.g.,{" "}
                <code className="bg-black/30 px-1 rounded">
                  {"{{node_1.error_message}}"}
                </code>
                ) for downstream nodes.
              </p>
            </div>
          </div>
        );

      case "coral_sql":
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Step Name
              </label>
              <input
                className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g., Fetch User Data"
                value={(selectedNode.data.name as string) || ""}
                onChange={(e) => updateData("name", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                SQL Query
              </label>
              <textarea
                className="w-full bg-gray-800 text-blue-200 text-sm p-2 rounded border border-gray-700 outline-none focus:border-blue-500 h-32 font-mono transition-colors"
                placeholder="SELECT * FROM users WHERE id = {{node_1.user_id}}"
                value={(selectedNode.data.query as string) || ""}
                onChange={(e) => updateData("query", e.target.value)}
              />
            </div>
          </div>
        );

      case "vector_search":
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Step Name
              </label>
              <input
                className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-teal-500 transition-colors"
                placeholder="e.g., Search Runbooks"
                value={(selectedNode.data.name as string) || ""}
                onChange={(e) => updateData("name", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Search Query (Semantic)
              </label>
              <textarea
                className="w-full bg-gray-800 text-teal-200 text-sm p-2 rounded border border-gray-700 outline-none focus:border-teal-500 h-24 font-mono transition-colors"
                placeholder="{{node_1.error_message}}"
                value={(selectedNode.data.query as string) || ""}
                onChange={(e) => updateData("query", e.target.value)}
              />
            </div>
          </div>
        );

      case "llm_reasoner":
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Step Name
              </label>
              <input
                className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-orange-500 transition-colors"
                placeholder="e.g., Diagnose Issue"
                value={(selectedNode.data.name as string) || ""}
                onChange={(e) => updateData("name", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Prompt / Instructions
              </label>
              <textarea
                className="w-full bg-gray-800 text-orange-200 text-sm p-2 rounded border border-gray-700 outline-none focus:border-orange-500 h-48 font-mono transition-colors"
                placeholder="Error reported: {{node_1.error_message}}\n\nFound Documentation:\n{{node_2.context}}\n\nWrite a 2-sentence diagnosis."
                value={(selectedNode.data.prompt as string) || ""}
                onChange={(e) => updateData("prompt", e.target.value)}
              />
            </div>
          </div>
        );

      case "if_condition":
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Step Name
              </label>
              <input
                className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-yellow-500 transition-colors"
                placeholder="e.g., Is Critical Error?"
                value={(selectedNode.data.name as string) || ""}
                onChange={(e) => updateData("name", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Condition Expression
              </label>
              <input
                className="w-full bg-gray-800 text-yellow-200 text-sm p-2 rounded border border-gray-700 outline-none focus:border-yellow-500 font-mono transition-colors"
                placeholder="{{node_3.severity}} == 'CRITICAL'"
                value={(selectedNode.data.condition as string) || ""}
                onChange={(e) => updateData("condition", e.target.value)}
              />
            </div>
          </div>
        );

      case "action_http":
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Step Name
              </label>
              <input
                className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-green-500 transition-colors"
                placeholder="e.g., Slack Alert"
                value={(selectedNode.data.name as string) || ""}
                onChange={(e) => updateData("name", e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="w-1/3">
                <label className="text-xs text-gray-400 block mb-1">
                  Method
                </label>
                <select
                  className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-green-500"
                  value={(selectedNode.data.method as string) || "POST"}
                  onChange={(e) => updateData("method", e.target.value)}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                </select>
              </div>
              <div className="w-2/3">
                <label className="text-xs text-gray-400 block mb-1">
                  Target URL
                </label>
                <input
                  className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-green-500 transition-colors"
                  placeholder="https://hooks.slack.com/..."
                  value={(selectedNode.data.url as string) || ""}
                  onChange={(e) => updateData("url", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                JSON Body Payload
              </label>
              <textarea
                className="w-full bg-gray-800 text-green-200 text-xs p-2 rounded border border-gray-700 outline-none focus:border-green-500 h-32 font-mono transition-colors"
                placeholder='{"text": "🚨 AI Diagnosis: {{node_3.summary}}"}'
                value={(selectedNode.data.body as string) || ""}
                onChange={(e) => updateData("body", e.target.value)}
              />
            </div>
          </div>
        );

      case "iterator":
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Step Name
              </label>
              <input
                className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-pink-500 transition-colors"
                placeholder="e.g., Loop Over Logs"
                value={(selectedNode.data.name as string) || ""}
                onChange={(e) => updateData("name", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Array Variable Path
              </label>
              <input
                className="w-full bg-gray-800 text-pink-200 text-sm p-2 rounded border border-gray-700 outline-none focus:border-pink-500 font-mono transition-colors"
                placeholder="{{node_2.results_array}}"
                value={(selectedNode.data.array_path as string) || ""}
                onChange={(e) => updateData("array_path", e.target.value)}
              />
            </div>
          </div>
        );
      case "source_head":
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Source Name
              </label>
              <input
                className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-purple-500 transition-colors"
                placeholder="e.g., airtable"
                value={(selectedNode.data.src_name as string) || ""}
                onChange={(e) => updateData("src_name", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Base URL
              </label>
              <input
                className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-purple-500 transition-colors"
                placeholder="https://api.airtable.com/v0"
                value={(selectedNode.data.base_url as string) || ""}
                onChange={(e) => updateData("base_url", e.target.value)}
              />
            </div>

            {/* THE NEW AUTH TOKEN FIELD */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Auth Token (Bearer API Key)
              </label>
              <input
                type="password"
                className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-purple-500 transition-colors"
                placeholder="Paste your API key here..."
                value={(selectedNode.data.auth_token as string) || ""}
                onChange={(e) => updateData("auth_token", e.target.value)}
              />
            </div>
          </div>
        );
      case "endpoint":
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Table Name
              </label>
              <input
                className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g., Employees"
                value={(selectedNode.data.table_name as string) || ""}
                onChange={(e) => updateData("table_name", e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="w-1/3">
                <label className="text-xs text-gray-400 block mb-1">
                  Method
                </label>
                <select
                  className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-blue-500"
                  value={(selectedNode.data.method as string) || "GET"}
                  onChange={(e) => updateData("method", e.target.value)}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>
              <div className="w-2/3">
                <label className="text-xs text-gray-400 block mb-1">
                  Endpoint Path
                </label>
                <input
                  className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-blue-500 transition-colors"
                  placeholder="/users"
                  value={(selectedNode.data.endpoint as string) || ""}
                  onChange={(e) => updateData("endpoint", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case "params":
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                JSON Parameters
              </label>
              <textarea
                className="w-full bg-gray-800 text-yellow-300 text-sm p-2 rounded border border-gray-700 outline-none focus:border-yellow-500 h-32 font-mono transition-colors"
                placeholder='[{"name": "sort", "exact": "asc"}]'
                value={(selectedNode.data.params as string) || ""}
                onChange={(e) => updateData("params", e.target.value)}
              />
            </div>
          </div>
        );

      case "columns": {
        const getColumnsArray = () => {
          const cols = selectedNode.data.columns;
          if (typeof cols === "string") {
            try {
              return JSON.parse(cols);
            } catch {
              return [];
            }
          }
          return Array.isArray(cols) ? cols : [];
        };

        const columnsList = getColumnsArray();

        return (
          <div className="flex flex-col gap-4">
            {/* Rows Path Input */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Rows Path (Optional)
              </label>
              <input
                className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g., records"
                value={(selectedNode.data.rows_path as string) || ""}
                onChange={(e) => updateData("rows_path", e.target.value)}
              />
            </div>

            {/* The New Dynamic Columns UI */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-400 block font-bold uppercase tracking-wider">
                  Schema Columns
                </label>
                <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  {columnsList.length} fields
                </span>
              </div>

              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {columnsList.map((col: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-lg border border-gray-700/50 hover:border-blue-500/30 transition-colors"
                  >
                    {/* Column Name Input */}
                    <input
                      className="flex-1 bg-gray-900 text-white text-sm p-1.5 rounded border border-gray-700 outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g., fields.Name"
                      value={col.name || ""}
                      onChange={(e) => {
                        const newCols = [...columnsList];
                        newCols[index].name = e.target.value;
                        updateData("columns", newCols);
                      }}
                    />

                    {/* Column Type Dropdown */}
                    <select
                      className="w-28 bg-gray-900 text-blue-200 text-sm p-1.5 rounded border border-gray-700 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                      value={col.type || "Utf8"}
                      onChange={(e) => {
                        const newCols = [...columnsList];
                        newCols[index].type = e.target.value;
                        updateData("columns", newCols);
                      }}
                    >
                      <option value="Utf8">String</option>
                      <option value="Int64">Integer</option>
                      <option value="Float64">Float</option>
                      <option value="Boolean">Boolean</option>
                      <option value="Json">JSON</option>
                    </select>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        const newCols = columnsList.filter(
                          (_, i) => i !== index,
                        );
                        updateData("columns", newCols);
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title="Remove Column"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Column Button */}
              <button
                onClick={() => {
                  updateData("columns", [
                    ...columnsList,
                    { name: "", type: "Utf8" },
                  ]);
                }}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2 border border-dashed border-gray-600 text-gray-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-lg transition-all text-sm font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Column
              </button>
            </div>
          </div>
        );
      }
      case "test_queries":
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Diagnostic Query (SQL)
              </label>
              <textarea
                className="w-full bg-gray-800 text-red-200 text-sm p-2 rounded border border-gray-700 outline-none focus:border-red-500 h-32 font-mono transition-colors"
                placeholder='SELECT * FROM my_source."Table" LIMIT 5'
                value={(selectedNode.data.test_query as string) || ""}
                onChange={(e) => updateData("test_query", e.target.value)}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-500 text-sm italic">
            Select a valid node.
          </div>
        );
    }
  };

  // 4. Return the beautifully styled sidebar wrapper
  return (
    <div className="w-80 bg-gray-900 border-l border-gray-700 h-full p-5 flex flex-col shadow-2xl z-50 overflow-y-auto">
      <div className="text-lg font-bold text-white mb-6 border-b border-gray-700 pb-3 flex items-center gap-2">
        {selectedNode.type === "source_head" && "Source Config"}
        {selectedNode.type === "endpoint" && "Endpoint Config"}
        {selectedNode.type === "params" && "Parameters"}
        {selectedNode.type === "columns" && "Column Schema"}
        {selectedNode.type === "test_queries" && "Diagnostic Query"}
      </div>

      {renderForm()}
    </div>
  );
}
