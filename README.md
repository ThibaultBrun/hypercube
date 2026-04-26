# HYPERCUBE

A 4D playground in your browser. Rotate, project, and play with the tesseract — and a couple of its bigger cousins.

Built with **Vite + React + TypeScript**, rendered with **Three.js / react-three-fiber**, post-processed with bloom & vignette.

## Features

- **3D, 4D, 5D** — switch between cube (8 vertices), tesseract (16 vertices), and penteract (32 vertices)
- **All rotation planes exposed** — `XY`, `XZ`, `XW`, `YZ`, `YW`, `ZW`… up to 10 planes in 5D
- **Manual angles + auto-rotate speeds** for every plane independently
- **Perspective / orthographic** projection, with adjustable 4D and 5D eye-distance
- **Depth-aware coloring** — gradient between two colors driven by W-axis position, plus depth fade
- **Live theme presets** (Neon / Solar / Matrix / Mono) and full color pickers
- **Bloom + vignette + glow** — knobs for everything
- Camera FOV, scale, edge width, vertex size, vertex visibility
- Keyboard shortcuts: `Space` to pause, drag to orbit, scroll to zoom

## Stack

- `vite` + `react` + `typescript`
- `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- `zustand` for state
- `tailwindcss` v4 for styling
- `lucide-react` for icons

## Run

```bash
npm install
npm run dev
```

## Math notes

- An **N-cube** has `2^N` vertices at coordinates `(±1, ±1, …, ±1)`. Two vertices are connected by an edge if they differ in exactly one coordinate — giving `N · 2^(N-1)` edges.
- Rotation in 4D space is a rotation in a 2D plane (e.g. `XW`). There are `C(N, 2)` independent planes.
- Projection from `R^N` to `R^3` is iterative perspective division along each extra axis, with a configurable "eye distance" for each step.

## License

MIT — have fun.
