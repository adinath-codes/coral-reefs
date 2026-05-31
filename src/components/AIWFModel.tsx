import React, { useState } from "react";
import { Sparkles, X, Loader2, BrainCircuit } from "lucide-react";
import type { Node, Edge } from "@xyflow/react";

interface AIWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export default function AIWorkflowModal({
  isOpen,
  onClose,
  setNodes,
  setEdges,
}: AIWorkflowModalProps) {
  const [agentName, setAgentName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please describe the workflow you want to build.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        "http://localhost:8000/generate-workflow-ai",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent_name: agentName || "AI-Generated-Agent",
            prompt: prompt,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to generate AI Workflow");

      const result = await response.json();

      if (result.status === "success" && result.workflow) {
        // MAGIC AUTO-LAYOUT: We calculate the Y position dynamically
        // so the nodes stack perfectly in a vertical line on the canvas!
        const generatedNodes: Node[] = result.workflow.nodes.map(
          (n: any, index: number) => ({
            id: n.id,
            type: n.type,
            position: { x: 350, y: index * 150 + 50 }, // Spaced 150px apart vertically
            data: { name: n.name, ...n.config },
          }),
        );

        const generatedEdges: Edge[] = result.workflow.edges.map(
          (e: any, index: number) => ({
            id: `e-${e.src}-${e.target}-${index}`,
            source: e.src,
            target: e.target,
            animated: true,
            style: { stroke: "#6366f1", strokeWidth: 2 },
            type: "deleteButton",
          }),
        );

        setNodes(generatedNodes);
        setEdges(generatedEdges);

        setPrompt("");
        setAgentName("");
        onClose();
      } else {
        throw new Error(result.message || "Invalid AI response");
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
      <div className="bg-slate-900 border border-indigo-500/30 w-full max-w-lg rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.15)] overflow-hidden relative flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h2 className="text-white font-bold text-lg">
              AI Workflow Copilot
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <input
            className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 outline-none focus:border-indigo-500 transition-colors"
            placeholder="Agent Name (e.g., Support-Ticket-Router)"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            disabled={isGenerating}
          />

          <textarea
            className="w-full h-32 bg-slate-950 text-white p-4 rounded-xl border border-slate-800 outline-none focus:border-indigo-500 transition-colors resize-none shadow-inner"
            placeholder="Describe your workflow... e.g., 'Catch a GitHub issue webhook, use vector search to find documentation, have an LLM reason about the fix, and send a Slack alert with the HTTP node.'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white font-bold transition-all duration-200 ${
              isGenerating
                ? "bg-indigo-500/50 cursor-not-allowed"
                : "bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-500/25"
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Build Workflow
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
