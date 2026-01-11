import React, { useState } from "react";
import { 
  DynamicIsland, 
  DynamicIslandProvider, 
  DynamicContainer, 
  useDynamicIslandSize, 
  SIZE_PRESETS 
} from "@/lib/ui/dynamic-island"; //
import { Play, Pause, Music, X } from "lucide-react";

const MusicPlayerContent = () => {
  const { state, setSize } = useDynamicIslandSize(); //
  const [isPlaying, setIsPlaying] = useState(false);

  // Use the presets defined in your dynamic-island.tsx
  const expand = () => setSize(SIZE_PRESETS.LONG);
  const collapse = () => setSize(SIZE_PRESETS.COMPACT);

  return (
    <div className="flex flex-col items-center justify-center h-fit bg-zinc-950 rounded-2xl mt-2">
      <DynamicIsland id="music-player">
        {/* COMPACT STATE */}
        {state.size === SIZE_PRESETS.COMPACT && (
          <DynamicContainer className="flex items-center justify-between w-full h-full px-4">
            <button 
              onClick={expand}
              className="flex items-center justify-between w-full h-full group"
              aria-label="Open Player"
            >
              <Music size={14} className="text-pink-500 group-hover:scale-110 transition-transform" />
              <div className="flex gap-0.5 items-end h-3">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className={`w-0.5 bg-pink-500 rounded-full transition-all ${isPlaying ? 'animate-pulse h-3' : 'h-1'}`} 
                  />
                ))}
              </div>
            </button>
          </DynamicContainer>
        )}

        {/* LONG STATE (Expanded) */}
        {state.size === SIZE_PRESETS.LONG && (
          <DynamicContainer className="flex items-center w-full h-full px-4 justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-lg shrink-0" />
              <div className="flex flex-col text-left truncate">
                <span className="text-white text-[13px] font-medium truncate tracking-tight">
                  Midnight City
                </span>
                <span className="text-zinc-500 text-[11px] truncate">
                  M83
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause size={14} fill="black" /> : <Play size={14} fill="black" className="ml-0.5" />}
              </button>
              
              {/* This button triggers the setSize back to COMPACT */}
              <button 
                onClick={collapse}
                className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                aria-label="Collapse"
              >
                <X size={14} />
              </button>
            </div>
          </DynamicContainer>
        )}
      </DynamicIsland>
    </div>
  );
};

export default function App() {
  return (
    // Ensure initialSize matches one of your SIZE_PRESETS
    <DynamicIslandProvider initialSize={SIZE_PRESETS.COMPACT}>
      <MusicPlayerContent />
    </DynamicIslandProvider>
  );
}