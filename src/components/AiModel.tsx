import React, { useState } from "react";
import { Sparkles, X, Loader2 } from "lucide-react";
import type { Node, Edge } from "@xyflow/react";

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export default function AIModal({
  isOpen,
  onClose,
  setNodes,
  setEdges,
}: AIModalProps) {
  const [baseUrl, setBaseUrl] = useState("");
  const [baseId, setBaseId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim() || !baseUrl.trim() || !baseId.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        "http://localhost:8000/generate-customsrc-yaml-ai",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base_url: baseUrl,
            base_id: baseId,
            user_prompt: prompt,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate AI Source");
      }

      const result = await response.json();

      if (result.status === "success" && result.ai_response) {
        const data = result.ai_response;
        const table =
          data.tables && data.tables.length > 0 ? data.tables[0] : {};
        const testQuery =
          data.test_queries && data.test_queries.length > 0
            ? data.test_queries[0]
            : "";

        const generatedNodes: Node[] = [
          {
            id: "1",
            type: "source_head",
            position: { x: 350, y: 50 },
            data: {
              src_name: data.src_name || "ai_generated_source",
              base_url: data.base_url || baseUrl,
            },
          },
          {
            id: "2",
            type: "endpoint",
            position: { x: 350, y: 250 },
            data: {
              table_name: table.name || "Untitled",
              method: table.method || "GET",
              endpoint: table.endpoint || baseId,
            },
          },
          {
            id: "3",
            type: "columns",
            position: { x: 350, y: 450 },
            data: {
              rows_path: table.rows_path ? table.rows_path.join(", ") : "",
              columns: JSON.stringify(table.columns || [], null, 2),
            },
          },
          {
            id: "4",
            type: "test_queries",
            position: { x: 350, y: 650 },
            data: { test_query: testQuery },
          },
        ];

        const generatedEdges: Edge[] = [
          {
            id: "e1-2",
            source: "1",
            target: "2",
            animated: true,
            style: { stroke: "#a855f7", strokeWidth: 2 },
            type: "deleteButton",
          },
          {
            id: "e2-3",
            source: "2",
            target: "3",
            animated: true,
            style: { stroke: "#3b82f6", strokeWidth: 2 },
            type: "deleteButton",
          },
          {
            id: "e3-4",
            source: "3",
            target: "4",
            animated: true,
            style: { stroke: "#22c55e", strokeWidth: 2 },
            type: "deleteButton",
          },
        ];

        setNodes(generatedNodes);
        setEdges(generatedEdges);

        setPrompt("");
        setBaseUrl("");
        setBaseId("");
        onClose();
      } else {
        throw new Error(result.message || "Invalid AI response structure");
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert(
        `Generation Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-purple-500/30 w-full max-w-lg rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.15)] overflow-hidden relative flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-white font-bold text-lg">AI Source Builder</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <p className="text-gray-400 text-sm mb-2">
            Provide the base connection details and describe the data you want
            to extract.
          </p>

          <input
            className="w-full bg-gray-950 text-white p-3 rounded-xl border border-gray-800 outline-none focus:border-purple-500 transition-colors"
            placeholder="Base URL (e.g., https://api.airtable.com/v0)"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            disabled={isGenerating}
          />

          <input
            className="w-full bg-gray-950 text-white p-3 rounded-xl border border-gray-800 outline-none focus:border-purple-500 transition-colors"
            placeholder="Base ID / Endpoint (e.g., appIJmDl1oenGZTlW/Employees)"
            value={baseId}
            onChange={(e) => setBaseId(e.target.value)}
            disabled={isGenerating}
          />

          <textarea
            className="w-full h-24 bg-gray-950 text-white p-4 rounded-xl border border-gray-800 outline-none focus:border-purple-500 transition-colors resize-none shadow-inner"
            placeholder="Describe the columns you want to map..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white font-bold transition-all duration-200 ${
              isGenerating
                ? "bg-purple-500/50 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25"
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
