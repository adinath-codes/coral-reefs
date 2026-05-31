import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Album, GitBranch, Shell } from "lucide-react";
import SourcePage from "./pages/SourcePage";
import WorkflowPage from "./pages/WorkflowPage";

export default function App() {
  const [currTab, setCurrTab] = useState<"sourcePage" | "workflowPage">(
    "sourcePage",
  );

  return (
    <div
      className="relative bg-black/90 overflow-hidden"
      style={{ width: "100vw", height: "100vh" }}
    >
      <header className="bg-black/60 w-full pr-6 h-20 flex justify-between items-center gap-2.5 ">
        <div className="LOGOCONTAINER justify-center items-center text-blue-400 flex px-2 py-4 gap-1.5">
          <Shell size={50} />
          <h3 className="font-bold text-5xl font-['Ephesis']">Coral Reefs</h3>
        </div>
        <AnimatePresence mode="wait">
          <motion.h1
            key={currTab} // Crucial: Tells React this is a new element when the tab changes
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="font-bold text-5xl font-['Ephesis'] text-blue-400"
          >
            {currTab[0].toUpperCase() + currTab.slice(1, -4) + " Page"}
          </motion.h1>
        </AnimatePresence>
      </header>
      {currTab === "sourcePage" ? <SourcePage /> : <WorkflowPage />}
      <footer className="absolute flex left-1/2 -translate-x-1/2 bottom-4 bg-white/30 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl ">
        <button
          onClick={() => setCurrTab("sourcePage")}
          className={`flex relative group justify-center items-center h-14 w-32 rounded-l-2xl cursor-pointer transition-all duration-500 ${currTab === "sourcePage" && "bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.7)]"} hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,1)]`}
        >
          <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-xs font-semibold rounded-lg opacity-0 translate-y-2 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 shadow-lg whitespace-nowrap">
            Source Playground
          </span>
          <GitBranch
            size={30}
            stroke={currTab === "sourcePage" ? "#000000" : "#808080"}
          />
        </button>
        <button
          onClick={() => setCurrTab("workflowPage")}
          className={`flex relative group justify-center items-center h-14 w-32 rounded-r-2xl cursor-pointer transition-all duration-500 ${currTab === "workflowPage" && "bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.7)]"} hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,1)]`}
        >
          <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-xs font-semibold rounded-lg opacity-0 translate-y-2 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 shadow-lg whitespace-nowrap">
            workflow playground
          </span>
          <Album
            size={30}
            stroke={currTab === "workflowPage" ? "#000000" : "#808080"}
          />
        </button>
      </footer>
    </div>
  );
}
