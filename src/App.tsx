import { useEffect, useState } from "react";
import HypercubeScene from "./components/HypercubeScene";
import ControlPanel from "./components/ControlPanel";
import { planesFor } from "./hypercube/rotation";
import { useStore } from "./store";

const BUILD_PHASES = [
  { range: [0, 0.04], title: "1 — A 3D cube", desc: "8 vertices, 12 edges, 6 faces, 1 volume." },
  { range: [0.04, 0.55], title: "2 — Extrude along W", desc: "Translate the cube perpendicular to all 3 axes (the new W axis, in yellow)." },
  { range: [0.55, 0.95], title: "3 — Sweep the faces", desc: "Each of the 6 faces sweeps a new cube. Plus the original + the copy = 8 cubes." },
  { range: [0.95, 1.01], title: "4 — Tesseract complete", desc: "16 vertices · 32 edges · 24 squares · 8 cubic cells." },
];

export default function App() {
  const dimension = useStore((s) => s.dimension);
  const paused = useStore((s) => s.paused);
  const setPaused = useStore((s) => s.setPaused);
  const view = useStore((s) => s.view);
  const buildStart = useStore((s) => s.buildStart);
  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    if (view !== "build") return;
    const id = setInterval(() => {
      const elapsed = ((Date.now() - buildStart) / 1000) % 12;
      const raw = Math.min(1, elapsed / 8);
      const t = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      const idx = BUILD_PHASES.findIndex(
        (p) => t >= p.range[0] && t < p.range[1],
      );
      if (idx >= 0) setPhaseIdx(idx);
    }, 120);
    return () => clearInterval(id);
  }, [view, buildStart]);

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
        {view === "build" && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 select-none pointer-events-none">
            <div className="glass-strong px-5 py-3 rounded-xl text-center max-w-md">
              <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/80 font-mono">
                {BUILD_PHASES[phaseIdx]?.title}
              </div>
              <div className="text-[12px] text-white/80 mt-1.5 leading-relaxed">
                {BUILD_PHASES[phaseIdx]?.desc}
              </div>
            </div>
          </div>
        )}
      </div>

      <ControlPanel />
    </main>
  );
}
