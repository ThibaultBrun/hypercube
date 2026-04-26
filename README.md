# HYPERCUBE

🌐 **Live demo:** https://thibaultbrun.github.io/hypercube/

🇬🇧 [English](#english) · 🇫🇷 [Français](#français)

---

## English

A 4D playground in your browser. Rotate, project, unfold, and **build** the tesseract — and a couple of its bigger cousins.

Built with **Vite + React + TypeScript**, rendered with **Three.js / react-three-fiber**, post-processed with bloom & vignette.

### Live demo

👉 https://thibaultbrun.github.io/hypercube/

### Features

- **3D, 4D, 5D** — switch between cube (8 vertices), tesseract (16 vertices), and penteract (32 vertices)
- **Four views**:
  - **Rotating** — standard 4D rotation projected to 3D
  - **Build** — animated construction: watch the cube extrude along the W axis (yellow edges) and the 8 cubic cells form one by one
  - **Bloom** — original "exploded view": the 8 cells are pushed apart **inside 4D** before projection, so they breathe outward and reform like a flower (see [§7 below](#7-the-bloom-view-an-exploded-view-in-4d))
  - **Dalí** — tesseract unfolded into the 3D Latin cross of *Crucifixion (Corpus Hypercubus)*
- **All rotation planes exposed** — `XY`, `XZ`, `XW`, `YZ`, `YW`, `ZW`… up to 10 planes in 5D
- **Manual angles + auto-rotate speeds** for every plane independently
- **Perspective / orthographic** projection, with adjustable 4D and 5D eye-distance
- **Cell highlighting** — render the 8 cubic cells of the tesseract (or 40 in 5D) with distinct colors, isolate any single cube, and highlight antipodal pairs
- **Depth-aware coloring** — gradient between two colors driven by W-axis position, plus depth fade
- **Live theme presets** (Neon / Solar / Matrix / Mono) and full color pickers
- Bloom, vignette, glow, FOV, scale — knobs for everything

---

### What is a hypercube?

A **hypercube** is the n-dimensional generalization of the square (n=2) and the cube (n=3). Each step up adds one perpendicular axis and doubles the structure.

#### 1. The recursive idea: extrusion

You go from dimension `n` to dimension `n+1` by **extrusion**:

> *Take the n-cube. Make a copy. Translate the copy along a new axis perpendicular to all the existing ones. Connect every vertex of the original to its twin in the copy.*

| Step | Object | New axis | Vertices |
|---|---|---|---|
| 0 → 1 | point → segment | X | 1 → 2 |
| 1 → 2 | segment → square | Y | 2 → 4 |
| 2 → 3 | square → cube | Z | 4 → 8 |
| 3 → 4 | cube → **tesseract** | W | 8 → 16 |
| 4 → 5 | tesseract → penteract | V | 16 → 32 |

The trick of 4D: the W axis is perpendicular to X, Y, **and** Z simultaneously. There is no such direction in our 3D space — that's why the tesseract can only be projected, not embedded, into 3D.

#### 2. Counting the elements (the four "levels")

A k-face of an n-cube is determined by:
- choosing **k free axes** (the axes along which the face extends),
- fixing the remaining **n−k axes** to either +1 or −1.

This gives the closed-form count:

> **`#k-faces(n) = C(n, k) · 2^(n−k)`**

Worked out for our three dimensions:

| Dim | vertices (k=0) | edges (k=1) | squares (k=2) | cubes (k=3) | tesseracts (k=4) |
|---|---|---|---|---|---|
| **3 (cube)** | 8 | 12 | 6 | **1** | – |
| **4 (tesseract)** | 16 | 32 | 24 | **8** | 1 |
| **5 (penteract)** | 32 | 80 | 80 | 40 | **10** |

The **8 cubic cells of the tesseract** are exactly what the *Cubes* panel of this app colors — each in its own hue.

#### 3. Where the 8 cubes come from

Building the tesseract by extruding a cube along W:

- 1 cube at the start (W = −1) — that's the original cube
- 1 cube at the end (W = +1) — that's the translated copy
- 6 cubes swept by the 6 square faces during the extrusion (one per face of the original cube)

→ **2 + 6 = 8 cubes** — exactly `C(4,3) · 2 = 8`.

The **Build** view of the app animates this exact process: you start with the inner cube, the outer cube emerges along W, the connecting edges appear (in yellow), and the 6 swept cubes fill in.

#### 4. The bit-mask construction (used in the code)

Every vertex of the n-cube is encoded by an integer `i ∈ [0, 2^n)`. Bit `d` of `i` tells whether coordinate `d` is +1 or −1:

```ts
v[d] = i & (1 << d) ? 1 : -1;
```

Going from the cube to the tesseract is **literally adding one bit**: each 3-bit vertex becomes two 4-bit vertices (W=−1 and W=+1).

Two vertices are connected by an edge iff they differ on **exactly one bit** (Hamming distance 1) — this gives `n · 2^(n−1)` edges automatically.

See [src/hypercube/geometry.ts](src/hypercube/geometry.ts).

#### 5. Rotations in 4D

In 3D you rotate *around an axis*. In 4D you rotate **in a plane** — and there are `C(n, 2)` independent rotation planes. For the tesseract that's 6: `XY, XZ, YZ, XW, YW, ZW`. Each plane has its own angle and its own auto-rotate speed in the panel.

`XW`, `YW`, `ZW` are the rotations that *cannot exist* in 3D — they're what makes a 4D rotation visually striking: the structure seems to "turn inside out".

#### 6. Projecting from R^N to R^3

We use iterative perspective division. For each extra axis (W, then V, …) we apply:

```
k = d / (d − w)      // d = "eye distance" along that axis
(x, y, z) ← (x, y, z) · k
```

This is the *Schlegel diagram* style projection: vertices with larger W project farther from the origin. That's why the tesseract is usually drawn as "a smaller cube inside a bigger cube" — the small one is the W=−1 cell, the big one is W=+1, and the 8 connecting edges form the 6 "side" cubes.

#### 7. The "Bloom" view — an exploded view *in 4D*

Most tesseract visualizations operate in the 3D image after projection: rotate the 4D rotation matrix (Rotating), or unfold the cells into a 3D net (Dalí). **Bloom** does something neither of those does — it manipulates the cells **inside 4D**, *before* the Schlegel projection runs.

**The trick:**

1. For each of the 8 cells, compute its **4D centroid** (the average of its 8 vertex coordinates in `R^4`). For an axis-aligned tesseract this lands on a coordinate axis: e.g. the X+ cell's centroid is `(+1, 0, 0, 0)`, the W− cell's centroid is `(0, 0, 0, −1)`, and so on.

2. Pick a *bloom factor* `α ∈ [0, ~2]`, oscillating slowly with a cosine.

3. Before projecting each cell's vertices to 3D, **translate them by `α · centroid` in 4D**:
   ```
   v_exploded = v + α · centroid_of_cell(v)
   ```

4. Apply the standard Schlegel projection.

**What you see:**

- The 6 axis-aligned cells (`X±`, `Y±`, `Z±`) drift outward along the 6 cardinal 3D directions, exactly where you'd expect.
- The `W−` cell drifts toward `W = −2` — under Schlegel `(d − w)` denominator, this **shrinks it dramatically** into a tiny inner core.
- The `W+` cell drifts toward `W = +2` — same denominator, opposite effect: it **inflates into a huge outer shell** that contains the rest.
- The 4D rotations keep running, so the whole flower tumbles gently.
- `α` pulses on a ~10 s period so the flower breathes: closed → bloomed → closed.

**Why it's a "new" representation:** it's an exploded view, but the explosion happens in 4D, not 3D. Every cell's centroid points in a different 4D direction (one of the 8 unit-axis directions ±X, ±Y, ±Z, ±W), so the eight cells separate cleanly without artificial offsets — the geometry of the tesseract itself dictates where each cell goes. The result is something you couldn't draw with classical 3D-only tooling.

---

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

### License

MIT — have fun.

---

## Français

Un terrain de jeu 4D dans ton navigateur. Tourne, projette, déplie et **construis** le tesseract — et quelques-uns de ses plus gros cousins.

Construit avec **Vite + React + TypeScript**, rendu avec **Three.js / react-three-fiber**, post-traitement avec bloom & vignette.

### Démo en ligne

👉 https://thibaultbrun.github.io/hypercube/

### Fonctionnalités

- **3D, 4D, 5D** — bascule entre cube (8 sommets), tesseract (16 sommets) et pentéract (32 sommets)
- **Quatre vues** :
  - **Rotating** — rotation 4D classique projetée en 3D
  - **Build** — construction animée : on regarde le cube s'extruder le long de l'axe W (arêtes jaunes) et les 8 cellules cubiques se former une par une
  - **Bloom** — "vue éclatée" originale : les 8 cellules sont écartées **dans la 4D** avant la projection, elles respirent vers l'extérieur et se referment comme une fleur (voir [§7 plus bas](#7-la-vue-bloom--une-vue-éclatée-en-4d))
  - **Dalí** — tesseract déplié en croix latine 3D, comme dans *Crucifixion (Corpus Hypercubus)*
- **Tous les plans de rotation exposés** — `XY`, `XZ`, `XW`, `YZ`, `YW`, `ZW`… jusqu'à 10 plans en 5D
- **Angles manuels + vitesses d'auto-rotation** pour chaque plan indépendamment
- **Projection perspective / orthographique**, avec distance d'œil 4D et 5D ajustable
- **Mise en évidence des cellules** — affiche les 8 cubes du tesseract (ou 40 en 5D) avec des couleurs distinctes, isole un cube précis, et met en avant les paires antipodales
- **Coloration en profondeur** — dégradé entre deux couleurs piloté par la position sur l'axe W, plus fondu de profondeur
- **Préréglages de thème live** (Neon / Solar / Matrix / Mono) et sélecteurs de couleurs complets
- Bloom, vignette, glow, FOV, échelle — un curseur pour tout

---

### C'est quoi un hypercube ?

Un **hypercube** est la généralisation à `n` dimensions du carré (n=2) et du cube (n=3). Chaque pas en avant ajoute un axe perpendiculaire et **double** la structure.

#### 1. L'idée récursive : l'extrusion

On passe de la dimension `n` à la dimension `n+1` par **extrusion** :

> *Prends le n-cube. Duplique-le. Translate la copie le long d'un nouvel axe perpendiculaire à tous les autres. Relie chaque sommet de l'original à son jumeau dans la copie.*

| Étape | Objet | Nouvel axe | Sommets |
|---|---|---|---|
| 0 → 1 | point → segment | X | 1 → 2 |
| 1 → 2 | segment → carré | Y | 2 → 4 |
| 2 → 3 | carré → cube | Z | 4 → 8 |
| 3 → 4 | cube → **tesseract** | W | 8 → 16 |
| 4 → 5 | tesseract → pentéract | V | 16 → 32 |

Le tour de magie de la 4D : l'axe W est perpendiculaire à X, Y **et** Z simultanément. Cette direction n'existe pas dans notre espace 3D — c'est pour ça que le tesseract ne peut être que **projeté** en 3D, pas plongé.

#### 2. Les quatre "niveaux"

Une k-face d'un n-cube est définie par :
- le choix de **k axes libres** (ceux le long desquels la face s'étend),
- la fixation des **n−k axes** restants à +1 ou −1.

D'où la formule fermée :

> **`#k-faces(n) = C(n, k) · 2^(n−k)`**

Appliquée à nos trois dimensions :

| Dim | sommets (k=0) | arêtes (k=1) | carrés (k=2) | cubes (k=3) | tesseracts (k=4) |
|---|---|---|---|---|---|
| **3 (cube)** | 8 | 12 | 6 | **1** | – |
| **4 (tesseract)** | 16 | 32 | 24 | **8** | 1 |
| **5 (pentéract)** | 32 | 80 | 80 | 40 | **10** |

Les **8 cellules cubiques du tesseract**, ce sont exactement celles que la section *Cubes* du panneau colore — une teinte par cube.

#### 3. D'où viennent les 8 cubes ?

Construction du tesseract par extrusion d'un cube le long de W :

- 1 cube de départ (W = −1) — le cube original
- 1 cube d'arrivée (W = +1) — la copie translatée
- 6 cubes balayés par les 6 faces carrées pendant l'extrusion (une par face de l'original)

→ **2 + 6 = 8 cubes** — soit `C(4,3) · 2 = 8`.

La vue **Build** de l'appli anime exactement ce processus : on part du cube intérieur, le cube extérieur émerge le long de W, les arêtes de liaison apparaissent (en jaune), et les 6 cubes balayés se remplissent.

#### 4. La construction par bits (utilisée dans le code)

Chaque sommet du n-cube est codé par un entier `i ∈ [0, 2^n)`. Le bit `d` de `i` indique si la coordonnée `d` vaut +1 ou −1 :

```ts
v[d] = i & (1 << d) ? 1 : -1;
```

Passer du cube au tesseract revient **littéralement à ajouter un bit** : chaque sommet à 3 bits devient deux sommets à 4 bits (W=−1 et W=+1).

Deux sommets sont reliés par une arête ssi ils diffèrent sur **exactement un bit** (distance de Hamming = 1) — ce qui donne `n · 2^(n−1)` arêtes automatiquement.

Voir [src/hypercube/geometry.ts](src/hypercube/geometry.ts).

#### 5. Les rotations en 4D

En 3D tu tournes *autour d'un axe*. En 4D tu tournes **dans un plan** — et il y a `C(n, 2)` plans de rotation indépendants. Pour le tesseract ça en fait 6 : `XY, XZ, YZ, XW, YW, ZW`. Chaque plan a son propre angle et sa propre vitesse d'auto-rotation dans le panneau.

`XW`, `YW`, `ZW` sont les rotations qui *n'existent pas* en 3D — c'est ce qui rend une rotation 4D visuellement saisissante : la structure semble "se retourner sur elle-même".

#### 6. Projection R^N → R^3

On utilise une division perspective itérative. Pour chaque axe supplémentaire (W, puis V, …) :

```
k = d / (d − w)      // d = "distance d'œil" sur cet axe
(x, y, z) ← (x, y, z) · k
```

C'est la projection façon *diagramme de Schlegel* : les sommets avec un W plus grand se projettent plus loin de l'origine. C'est pour ça que le tesseract se dessine classiquement comme "un petit cube dans un grand cube" — le petit est la cellule W=−1, le grand est W=+1, et les 8 arêtes de liaison forment les 6 cubes "latéraux".

#### 7. La vue "Bloom" — une vue éclatée *en 4D*

La plupart des visualisations de tesseract opèrent dans l'image 3D après projection : on tourne la matrice de rotation 4D (Rotating), ou on déplie les cellules dans un patron 3D (Dalí). **Bloom** fait autre chose — on manipule les cellules **directement en 4D**, *avant* d'appliquer la projection Schlegel.

**Le truc :**

1. Pour chacune des 8 cellules, on calcule son **centroïde 4D** (la moyenne des coordonnées 4D de ses 8 sommets). Pour un tesseract aligné sur les axes, ce centroïde tombe pile sur un axe : la cellule X+ a son centroïde en `(+1, 0, 0, 0)`, la cellule W− en `(0, 0, 0, −1)`, etc.

2. On choisit un *facteur d'éclatement* `α ∈ [0, ~2]`, qui oscille lentement en cosinus.

3. Avant de projeter les sommets de chaque cellule en 3D, on les **translate de `α · centroïde` en 4D** :
   ```
   v_éclaté = v + α · centroïde_de_la_cellule(v)
   ```

4. On applique la projection Schlegel habituelle.

**Ce qu'on voit :**

- Les 6 cellules axiales (`X±`, `Y±`, `Z±`) glissent vers l'extérieur le long des 6 directions cardinales 3D, comme attendu.
- La cellule `W−` glisse vers `W = −2` — sous le dénominateur Schlegel `(d − w)`, elle **rétrécit drastiquement** en un noyau minuscule au centre.
- La cellule `W+` glisse vers `W = +2` — même dénominateur, effet inverse : elle **gonfle en une coquille gigantesque** qui englobe tout le reste.
- Les rotations 4D continuent de tourner, donc toute la fleur pivote doucement.
- `α` pulse sur une période ~10 s donc la fleur respire : fermée → éclose → fermée.

**Pourquoi c'est une représentation "nouvelle" :** c'est une vue éclatée, mais l'éclatement se fait en 4D, pas en 3D. Le centroïde de chaque cellule pointe dans une direction 4D différente (l'une des 8 directions ±X, ±Y, ±Z, ±W), donc les huit cellules se séparent proprement sans avoir à inventer un offset arbitraire — c'est la géométrie du tesseract elle-même qui décide où va chaque cellule. Le résultat est quelque chose qu'on ne pourrait pas dessiner avec des outils 3D classiques.

---

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

### Licence

MIT — amuse-toi.
