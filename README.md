# HYPERCUBE

🌐 **Live demo:** https://thibaultbrun.github.io/hypercube/

🇬🇧 [English](#english) · 🇫🇷 [Français](#français)

---

## English

A 4D playground in your browser. Rotate, project, and play with the tesseract — and a couple of its bigger cousins.

Built with **Vite + React + TypeScript**, rendered with **Three.js / react-three-fiber**, post-processed with bloom & vignette.

### Features

- **3D, 4D, 5D** — switch between cube (8 vertices), tesseract (16 vertices), and penteract (32 vertices)
- **All rotation planes exposed** — `XY`, `XZ`, `XW`, `YZ`, `YW`, `ZW`… up to 10 planes in 5D
- **Manual angles + auto-rotate speeds** for every plane independently
- **Perspective / orthographic** projection, with adjustable 4D and 5D eye-distance
- **Cell highlighting** — render the 8 cubic cells of the tesseract (or 40 in 5D) with distinct colors, isolate any single cube, and highlight antipodal pairs
- **Depth-aware coloring** — gradient between two colors driven by W-axis position, plus depth fade
- **Live theme presets** (Neon / Solar / Matrix / Mono) and full color pickers
- **Bloom + vignette + glow** — knobs for everything
- Camera FOV, scale, edge width, vertex size, vertex visibility
- Keyboard shortcuts: drag to orbit, scroll to zoom

### Stack

- `vite` + `react` + `typescript`
- `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- `zustand` for state
- `tailwindcss` v4 for styling
- `lucide-react` for icons

### Run locally

```bash
npm install
npm run dev
```

### Build & deploy

```bash
npm run build
```

The repo is published to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Every push to `main` rebuilds and redeploys to https://thibaultbrun.github.io/hypercube/.

### Math notes

- An **N-cube** has `2^N` vertices at coordinates `(±1, ±1, …, ±1)`. Two vertices are connected by an edge if they differ in exactly one coordinate — giving `N · 2^(N-1)` edges.
- A **k-face** of an N-cube is determined by choosing `k` "free" axes and fixing the remaining `N-k` axes to ±1. The 4D tesseract has `C(4,3) · 2 = 8` cubic cells (3-faces).
- Rotation in 4D space is a rotation in a 2D plane (e.g. `XW`). There are `C(N, 2)` independent planes.
- Projection from `R^N` to `R^3` is iterative perspective division along each extra axis, with a configurable "eye distance" for each step.

### License

MIT — have fun.

---

## Français

Un terrain de jeu 4D dans ton navigateur. Tourne, projette et manipule le tesseract — et quelques-uns de ses plus gros cousins.

Construit avec **Vite + React + TypeScript**, rendu avec **Three.js / react-three-fiber**, post-traitement avec bloom & vignette.

### Fonctionnalités

- **3D, 4D, 5D** — bascule entre cube (8 sommets), tesseract (16 sommets) et pentéract (32 sommets)
- **Tous les plans de rotation exposés** — `XY`, `XZ`, `XW`, `YZ`, `YW`, `ZW`… jusqu'à 10 plans en 5D
- **Angles manuels + vitesses d'auto-rotation** pour chaque plan indépendamment
- **Projection perspective / orthographique**, avec distance d'œil 4D et 5D ajustable
- **Mise en évidence des cellules** — affiche les 8 cubes du tesseract (ou 40 en 5D) avec des couleurs distinctes, isole un cube précis, et met en avant les paires antipodales
- **Coloration en profondeur** — dégradé entre deux couleurs piloté par la position sur l'axe W, plus fondu de profondeur
- **Préréglages de thème live** (Neon / Solar / Matrix / Mono) et sélecteurs de couleurs complets
- **Bloom + vignette + glow** — un curseur pour tout
- FOV caméra, échelle, épaisseur d'arête, taille de sommet, visibilité des sommets
- Raccourcis : glisser pour orbiter, molette pour zoomer

### Stack

- `vite` + `react` + `typescript`
- `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- `zustand` pour l'état
- `tailwindcss` v4 pour le style
- `lucide-react` pour les icônes

### Lancer en local

```bash
npm install
npm run dev
```

### Build & déploiement

```bash
npm run build
```

Le repo est publié sur GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Chaque push sur `main` reconstruit et redéploie vers https://thibaultbrun.github.io/hypercube/.

### Notes mathématiques

- Un **N-cube** a `2^N` sommets aux coordonnées `(±1, ±1, …, ±1)`. Deux sommets sont reliés par une arête s'ils diffèrent sur exactement une coordonnée — soit `N · 2^(N-1)` arêtes.
- Une **k-face** d'un N-cube est définie en choisissant `k` axes "libres" et en fixant les `N-k` axes restants à ±1. Le tesseract 4D possède `C(4,3) · 2 = 8` cellules cubiques (3-faces).
- Une rotation dans l'espace 4D est une rotation dans un plan 2D (par ex. `XW`). Il y a `C(N, 2)` plans indépendants.
- La projection de `R^N` vers `R^3` est une division perspective itérative le long de chaque axe supplémentaire, avec une "distance d'œil" configurable à chaque étape.

### Licence

MIT — amuse-toi.
