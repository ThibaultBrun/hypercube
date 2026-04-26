import { useEffect } from "react";
import HypercubeScene from "./components/HypercubeScene";
import ControlPanel from "./components/ControlPanel";
import { planesFor } from "./hypercube/rotation";
import { useStore } from "./store";

export default function App() {
  const dimension = useStore((s) => s.dimension);
  const paused = useStore((s) => s.paused);
  const setPaused = useStore((s) => s.setPaused);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setPaused(!paused);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, setPaused]);

  return (
    <main className="relative h-full w-full overflow-hidden flex">
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="absolute top-5 left-6 z-10 select-none">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-md border border-cyan-400/60 rotate-12" />
            <div className="absolute inset-1 rounded-sm border border-pink-400/60 -rotate-12" />
            <div className="absolute inset-2 bg-white rounded-[1px]" />
          </div>
          <div>
            <div className="font-mono text-[12px] tracking-[0.28em] text-white glow-text">
              HYPERCUBE
            </div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-white/40">
              dimensional viewer
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-5 right-[380px] z-10 flex items-center gap-2 select-none">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/45">
          {planesFor(dimension).length} planes · {1 << dimension} vertices
        </span>
      </div>

      <div className="absolute bottom-5 left-6 z-10 select-none">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35 leading-relaxed">
          drag to orbit · scroll to zoom · space to pause
        </div>
      </div>

      <div className="flex-1 relative">
        <HypercubeScene />
      </div>

      <ControlPanel />
    </main>
  );
}
