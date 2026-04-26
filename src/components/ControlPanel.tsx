import { useMemo } from "react";
import { useStore, PRESET_NAMES } from "../store";
import { planesFor } from "../hypercube/rotation";
import { buildCells, buildCellPairs } from "../hypercube/geometry";
import Section from "./Section";
import Slider from "./Slider";
import ColorField from "./ColorField";
import { Pause, Play, RotateCcw, Shuffle, Sparkles } from "lucide-react";

const TAU = Math.PI * 2;

export default function ControlPanel() {
  const dimension = useStore((s) => s.dimension);
  const rotations = useStore((s) => s.rotations);
  const speeds = useStore((s) => s.speeds);
  const paused = useStore((s) => s.paused);
  const projection = useStore((s) => s.projection);
  const projectionDistances = useStore((s) => s.projectionDistances);
  const scale = useStore((s) => s.scale);
  const fov = useStore((s) => s.fov);
  const edgeColorA = useStore((s) => s.edgeColorA);
  const edgeColorB = useStore((s) => s.edgeColorB);
  const vertexColor = useStore((s) => s.vertexColor);
  const glow = useStore((s) => s.glow);
  const bloomStrength = useStore((s) => s.bloomStrength);
  const edgeWidth = useStore((s) => s.edgeWidth);
  const vertexSize = useStore((s) => s.vertexSize);
  const showVertices = useStore((s) => s.showVertices);
  const depthFade = useStore((s) => s.depthFade);
  const preset = useStore((s) => s.preset);
  const showCells = useStore((s) => s.showCells);
  const cellOpacity = useStore((s) => s.cellOpacity);
  const cellSaturation = useStore((s) => s.cellSaturation);
  const cellHueOffset = useStore((s) => s.cellHueOffset);
  const highlightCell = useStore((s) => s.highlightCell);
  const cellEdges = useStore((s) => s.cellEdges);
  const highlightPair = useStore((s) => s.highlightPair);
  const pairColorMode = useStore((s) => s.pairColorMode);
  const view = useStore((s) => s.view);

  const planes = planesFor(dimension);
  const cells = useMemo(() => buildCells(dimension), [dimension]);
  const cellPairs = useMemo(() => buildCellPairs(cells), [cells]);
  const cellNoun = dimension <= 3 ? "faces" : "cubes";

  const setDimension = useStore((s) => s.setDimension);
  const setRotation = useStore((s) => s.setRotation);
  const setSpeed = useStore((s) => s.setSpeed);
  const setPaused = useStore((s) => s.setPaused);
  const resetRotations = useStore((s) => s.resetRotations);
  const randomizeSpeeds = useStore((s) => s.randomizeSpeeds);
  const setProjection = useStore((s) => s.setProjection);
  const setProjectionDistance = useStore((s) => s.setProjectionDistance);
  const setScale = useStore((s) => s.setScale);
  const setFov = useStore((s) => s.setFov);
  const setEdgeColorA = useStore((s) => s.setEdgeColorA);
  const setEdgeColorB = useStore((s) => s.setEdgeColorB);
  const setVertexColor = useStore((s) => s.setVertexColor);
  const setGlow = useStore((s) => s.setGlow);
  const setBloomStrength = useStore((s) => s.setBloomStrength);
  const setEdgeWidth = useStore((s) => s.setEdgeWidth);
  const setVertexSize = useStore((s) => s.setVertexSize);
  const setShowVertices = useStore((s) => s.setShowVertices);
  const setDepthFade = useStore((s) => s.setDepthFade);
  const applyPreset = useStore((s) => s.applyPreset);
  const setShowCells = useStore((s) => s.setShowCells);
  const setCellOpacity = useStore((s) => s.setCellOpacity);
  const setCellSaturation = useStore((s) => s.setCellSaturation);
  const setCellHueOffset = useStore((s) => s.setCellHueOffset);
  const setHighlightCell = useStore((s) => s.setHighlightCell);
  const setCellEdges = useStore((s) => s.setCellEdges);
  const setHighlightPair = useStore((s) => s.setHighlightPair);
  const setPairColorMode = useStore((s) => s.setPairColorMode);
  const setView = useStore((s) => s.setView);

  const dimLabel = ["", "", "", "Cube", "Tesseract", "Penteract"][dimension] ?? "N-cube";

  return (
    <aside className="glass-strong w-[360px] h-full flex flex-col overflow-hidden rounded-l-2xl shadow-[0_0_60px_rgba(0,240,255,0.05)]">
      <header className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="font-mono text-[15px] tracking-[0.22em] text-white glow-text">
              HYPERCUBE
            </h1>
            <span className="text-[10px] font-mono text-white/40">v0.1</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">
            4D playground
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[9px] font-mono uppercase tracking-wider text-white/40">
            {dimension}D · {dimLabel}
          </span>
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-soft" />
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 pulse-soft" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar">
        <div className="px-4 pt-3 pb-2 flex gap-2">
          <button
            onClick={() => setPaused(!paused)}
            className="btn btn-primary flex-1 flex items-center justify-center gap-1.5"
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={resetRotations}
            className="btn flex items-center justify-center gap-1.5"
            title="Reset rotations"
          >
            <RotateCcw size={12} />
          </button>
          <button
            onClick={randomizeSpeeds}
            className="btn flex items-center justify-center gap-1.5"
            title="Randomize speeds"
          >
            <Shuffle size={12} />
          </button>
        </div>

        <Section title="View" defaultOpen={true}>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setView("rotating")}
              className={`btn ${view === "rotating" ? "btn-active" : ""}`}
            >
              Rotating
            </button>
            <button
              onClick={() => setView("dali")}
              className={`btn ${view === "dali" ? "btn-active" : ""}`}
              disabled={dimension !== 4}
              title={dimension !== 4 ? "Dalí unfolding only available in 4D" : ""}
            >
              Dalí
            </button>
          </div>
          <p className="text-[10px] text-white/45 leading-relaxed">
            {view === "dali"
              ? "Tesseract unfolded into Dalí's 3D cross — 8 cubes laid out in space, each colored to identify."
              : "Standard 4D rotation projected to 3D."}
          </p>
        </Section>

        <Section title="Dimension" badge={`${1 << dimension} vertices`}>
          <div className="grid grid-cols-3 gap-2">
            {[3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setDimension(n)}
                className={`btn ${dimension === n ? "btn-active" : ""}`}
              >
                {n}D
              </button>
            ))}
          </div>
          <p className="text-[10px] text-white/45 leading-relaxed">
            {dimension === 3 && "Classic cube — 8 vertices, 12 edges."}
            {dimension === 4 && "Tesseract — 16 vertices, 32 edges. The OG hypercube."}
            {dimension === 5 && "Penteract — 32 vertices, 80 edges. Things get wild."}
          </p>
        </Section>

        <Section title="Rotation angles" defaultOpen={false}>
          {planes.map((p) => (
            <Slider
              key={`a-${p.key}`}
              label={`∠ ${p.label}`}
              value={rotations[p.key] ?? 0}
              min={-TAU}
              max={TAU}
              step={0.01}
              format={(v) => `${((v / Math.PI) * 180).toFixed(0)}°`}
              onChange={(v) => setRotation(p.key, v)}
            />
          ))}
        </Section>

        <Section title="Auto-rotate speeds" badge="rad/s">
          {planes.map((p) => (
            <Slider
              key={`s-${p.key}`}
              label={p.label}
              value={speeds[p.key] ?? 0}
              min={-1.5}
              max={1.5}
              step={0.005}
              onChange={(v) => setSpeed(p.key, v)}
            />
          ))}
        </Section>

        <Section title="Projection" defaultOpen={true}>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setProjection("perspective")}
              className={`btn ${projection === "perspective" ? "btn-active" : ""}`}
            >
              Perspective
            </button>
            <button
              onClick={() => setProjection("orthographic")}
              className={`btn ${projection === "orthographic" ? "btn-active" : ""}`}
            >
              Orthographic
            </button>
          </div>
          {projection === "perspective" &&
            Array.from({ length: Math.max(0, dimension - 3) }).map((_, i) => {
              const labels = ["4D", "5D", "6D"];
              return (
                <Slider
                  key={i}
                  label={`${labels[i]} eye distance`}
                  value={projectionDistances[i] ?? 4}
                  min={1.5}
                  max={10}
                  step={0.05}
                  onChange={(v) => setProjectionDistance(i, v)}
                />
              );
            })}
          <Slider
            label="Scale"
            value={scale}
            min={0.3}
            max={2.5}
            step={0.01}
            onChange={setScale}
          />
          <Slider
            label="Camera FOV"
            value={fov}
            min={20}
            max={110}
            step={1}
            unit="°"
            onChange={setFov}
          />
        </Section>

        <Section title={dimension <= 3 ? "Faces" : "Cubes"} badge={`${cells.length} ${cellNoun}`} defaultOpen={true}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/55 font-mono">
              Show
            </span>
            <button
              onClick={() => setShowCells(!showCells)}
              className={`btn ${showCells ? "btn-active" : ""}`}
            >
              {showCells ? "On" : "Off"}
            </button>
          </div>
          {showCells && (
            <>
              <Slider
                label="Opacity"
                value={cellOpacity}
                min={0}
                max={1}
                step={0.01}
                onChange={setCellOpacity}
              />
              <Slider
                label="Saturation"
                value={cellSaturation}
                min={0}
                max={1}
                step={0.01}
                onChange={setCellSaturation}
              />
              <Slider
                label="Hue offset"
                value={cellHueOffset}
                min={0}
                max={1}
                step={0.01}
                onChange={setCellHueOffset}
              />
              <Slider
                label="Highlight cube"
                value={highlightCell}
                min={-1}
                max={Math.max(0, cells.length - 1)}
                step={1}
                format={(v) => (v < 0 ? "all" : `#${v}`)}
                onChange={(v) => setHighlightCell(Math.round(v))}
              />
              {highlightCell >= 0 && cells[highlightCell] && (
                <p className="text-[10px] font-mono text-white/55 leading-relaxed">
                  {cells[highlightCell].label}
                </p>
              )}
              {cellPairs.length > 0 && (
                <Slider
                  label="Highlight pair"
                  value={highlightPair}
                  min={-1}
                  max={cellPairs.length - 1}
                  step={1}
                  format={(v) => (v < 0 ? "all" : `pair ${v}`)}
                  onChange={(v) => setHighlightPair(Math.round(v))}
                />
              )}
              {highlightPair >= 0 && cellPairs[highlightPair] && (
                <p className="text-[10px] font-mono text-white/55 leading-relaxed">
                  {cellPairs[highlightPair].label} · #{cellPairs[highlightPair].a} ↔ #{cellPairs[highlightPair].b}
                </p>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] uppercase tracking-[0.14em] text-white/55 font-mono">
                  Color by pair
                </span>
                <button
                  onClick={() => setPairColorMode(!pairColorMode)}
                  className={`btn ${pairColorMode ? "btn-active" : ""}`}
                >
                  {pairColorMode ? "On" : "Off"}
                </button>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] uppercase tracking-[0.14em] text-white/55 font-mono">
                  Outline
                </span>
                <button
                  onClick={() => setCellEdges(!cellEdges)}
                  className={`btn ${cellEdges ? "btn-active" : ""}`}
                >
                  {cellEdges ? "On" : "Off"}
                </button>
              </div>
              <p className="text-[10px] text-white/45 leading-relaxed">
                {dimension === 3 &&
                  "Each face of the cube gets its own color."}
                {dimension === 4 &&
                  "The 8 cubes (3-cells) of the tesseract — each in a unique hue."}
                {dimension === 5 &&
                  "The 40 cubic cells of the penteract — colored to tell them apart."}
              </p>
            </>
          )}
        </Section>

        <Section title="Theme">
          <div className="flex flex-wrap gap-2">
            {PRESET_NAMES.map((p) => (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                className={`btn ${preset === p ? "btn-active" : ""}`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="pt-1">
            <ColorField label="Edge near" value={edgeColorA} onChange={setEdgeColorA} />
            <ColorField label="Edge far" value={edgeColorB} onChange={setEdgeColorB} />
            <ColorField label="Vertex" value={vertexColor} onChange={setVertexColor} />
          </div>
        </Section>

        <Section title="Render" defaultOpen={false}>
          <Slider
            label="Glow"
            value={glow}
            min={0}
            max={3}
            step={0.01}
            onChange={setGlow}
          />
          <Slider
            label="Bloom strength"
            value={bloomStrength}
            min={0}
            max={3}
            step={0.01}
            onChange={setBloomStrength}
          />
          <Slider
            label="Edge width"
            value={edgeWidth}
            min={1}
            max={6}
            step={1}
            onChange={setEdgeWidth}
          />
          <Slider
            label="Depth fade"
            value={depthFade}
            min={0}
            max={1}
            step={0.01}
            onChange={setDepthFade}
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/55 font-mono">
              Show vertices
            </span>
            <button
              onClick={() => setShowVertices(!showVertices)}
              className={`btn ${showVertices ? "btn-active" : ""}`}
            >
              {showVertices ? "On" : "Off"}
            </button>
          </div>
          {showVertices && (
            <Slider
              label="Vertex size"
              value={vertexSize}
              min={0.01}
              max={0.2}
              step={0.005}
              onChange={setVertexSize}
            />
          )}
        </Section>
      </div>

      <footer className="px-5 py-3 border-t border-white/8 flex items-center justify-between text-[10px] font-mono text-white/40">
        <span className="flex items-center gap-1.5">
          <Sparkles size={10} className="text-cyan-400" />
          drag · scroll · zoom
        </span>
        <span>react · three · r3f</span>
      </footer>
    </aside>
  );
}
