import { create } from "zustand";
import type { ProjectionMode } from "./hypercube/projection";

export type RotationMap = Record<string, number>;

export interface HypercubeState {
  dimension: number;
  rotations: RotationMap;
  speeds: RotationMap;
  paused: boolean;
  projection: ProjectionMode;
  projectionDistances: number[];
  scale: number;

  edgeColorA: string;
  edgeColorB: string;
  vertexColor: string;
  bgColor: string;
  glow: number;
  bloomStrength: number;
  edgeWidth: number;
  vertexSize: number;
  showVertices: boolean;
  depthFade: number;
  fov: number;
  preset: string;

  showCells: boolean;
  cellOpacity: number;
  cellSaturation: number;
  cellHueOffset: number;
  highlightCell: number;
  cellEdges: boolean;
  highlightPair: number;
  pairColorMode: boolean;

  setDimension: (n: number) => void;
  setRotation: (key: string, v: number) => void;
  setSpeed: (key: string, v: number) => void;
  setPaused: (p: boolean) => void;
  resetRotations: () => void;
  randomizeSpeeds: () => void;
  setProjection: (m: ProjectionMode) => void;
  setProjectionDistance: (idx: number, v: number) => void;
  setScale: (v: number) => void;
  setEdgeColorA: (c: string) => void;
  setEdgeColorB: (c: string) => void;
  setVertexColor: (c: string) => void;
  setBgColor: (c: string) => void;
  setGlow: (v: number) => void;
  setBloomStrength: (v: number) => void;
  setEdgeWidth: (v: number) => void;
  setVertexSize: (v: number) => void;
  setShowVertices: (v: boolean) => void;
  setDepthFade: (v: number) => void;
  setFov: (v: number) => void;
  applyPreset: (name: string) => void;

  setShowCells: (v: boolean) => void;
  setCellOpacity: (v: number) => void;
  setCellSaturation: (v: number) => void;
  setCellHueOffset: (v: number) => void;
  setHighlightCell: (v: number) => void;
  setCellEdges: (v: boolean) => void;
  setHighlightPair: (v: number) => void;
  setPairColorMode: (v: boolean) => void;
}

const DEFAULT_DIM = 4;

const presets: Record<string, Partial<HypercubeState>> = {
  Neon: {
    edgeColorA: "#00f0ff",
    edgeColorB: "#ff2bd6",
    vertexColor: "#ffffff",
    bgColor: "#05060f",
    glow: 1.4,
    bloomStrength: 1.1,
  },
  Solar: {
    edgeColorA: "#ffb347",
    edgeColorB: "#ff5277",
    vertexColor: "#fff5d1",
    bgColor: "#0a0410",
    glow: 1.6,
    bloomStrength: 1.3,
  },
  Matrix: {
    edgeColorA: "#7fff9d",
    edgeColorB: "#0fffa1",
    vertexColor: "#d3ffe0",
    bgColor: "#02080a",
    glow: 1.2,
    bloomStrength: 0.9,
  },
  Mono: {
    edgeColorA: "#ffffff",
    edgeColorB: "#aab1ff",
    vertexColor: "#ffffff",
    bgColor: "#000000",
    glow: 0.6,
    bloomStrength: 0.4,
  },
};

export const useStore = create<HypercubeState>((set, get) => ({
  dimension: DEFAULT_DIM,
  rotations: {},
  speeds: { XW: 0.25, YW: 0.18 },
  paused: false,
  projection: "perspective",
  projectionDistances: [3, 4, 5],
  scale: 1,

  edgeColorA: "#00f0ff",
  edgeColorB: "#ff2bd6",
  vertexColor: "#ffffff",
  bgColor: "#05060f",
  glow: 1.4,
  bloomStrength: 1.1,
  edgeWidth: 2,
  vertexSize: 0.06,
  showVertices: true,
  depthFade: 0.55,
  fov: 55,
  preset: "Neon",

  showCells: true,
  cellOpacity: 0.18,
  cellSaturation: 0.75,
  cellHueOffset: 0,
  highlightCell: -1,
  cellEdges: false,
  highlightPair: -1,
  pairColorMode: false,

  setDimension: (n) =>
    set({ dimension: n, rotations: {}, highlightCell: -1, highlightPair: -1 }),
  setRotation: (key, v) =>
    set((s) => ({ rotations: { ...s.rotations, [key]: v } })),
  setSpeed: (key, v) =>
    set((s) => ({ speeds: { ...s.speeds, [key]: v } })),
  setPaused: (p) => set({ paused: p }),
  resetRotations: () => set({ rotations: {}, speeds: {} }),
  randomizeSpeeds: () => {
    const n = get().dimension;
    const next: RotationMap = {};
    const axes = ["X", "Y", "Z", "W", "V"];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        next[`${axes[i]}${axes[j]}`] = (Math.random() * 2 - 1) * 0.6;
      }
    }
    set({ speeds: next });
  },
  setProjection: (m) => set({ projection: m }),
  setProjectionDistance: (idx, v) =>
    set((s) => {
      const d = s.projectionDistances.slice();
      d[idx] = v;
      return { projectionDistances: d };
    }),
  setScale: (v) => set({ scale: v }),
  setEdgeColorA: (c) => set({ edgeColorA: c, preset: "Custom" }),
  setEdgeColorB: (c) => set({ edgeColorB: c, preset: "Custom" }),
  setVertexColor: (c) => set({ vertexColor: c, preset: "Custom" }),
  setBgColor: (c) => set({ bgColor: c, preset: "Custom" }),
  setGlow: (v) => set({ glow: v }),
  setBloomStrength: (v) => set({ bloomStrength: v }),
  setEdgeWidth: (v) => set({ edgeWidth: v }),
  setVertexSize: (v) => set({ vertexSize: v }),
  setShowVertices: (v) => set({ showVertices: v }),
  setDepthFade: (v) => set({ depthFade: v }),
  setFov: (v) => set({ fov: v }),
  applyPreset: (name) => {
    const p = presets[name];
    if (p) set({ ...p, preset: name });
  },

  setShowCells: (v) => set({ showCells: v }),
  setCellOpacity: (v) => set({ cellOpacity: v }),
  setCellSaturation: (v) => set({ cellSaturation: v }),
  setCellHueOffset: (v) => set({ cellHueOffset: v }),
  setHighlightCell: (v) => set({ highlightCell: v }),
  setCellEdges: (v) => set({ cellEdges: v }),
  setHighlightPair: (v) => set({ highlightPair: v }),
  setPairColorMode: (v) => set({ pairColorMode: v }),
}));

export const PRESET_NAMES = Object.keys(presets);
