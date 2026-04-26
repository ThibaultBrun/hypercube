export type Vec = number[];

export interface NCube {
  dimension: number;
  vertices: Vec[];
  edges: [number, number][];
}

export interface KFace {
  k: number;
  vertices: number[];
  freeAxes: number[];
  fixed: { axis: number; value: -1 | 1 }[];
  label: string;
}

const AXIS_LABELS = ["X", "Y", "Z", "W", "V", "U"];

export function buildNCube(n: number): NCube {
  const count = 1 << n;
  const vertices: Vec[] = [];
  for (let i = 0; i < count; i++) {
    const v: Vec = new Array(n);
    for (let d = 0; d < n; d++) {
      v[d] = i & (1 << d) ? 1 : -1;
    }
    vertices.push(v);
  }

  const edges: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    for (let d = 0; d < n; d++) {
      const j = i ^ (1 << d);
      if (j > i) edges.push([i, j]);
    }
  }

  return { dimension: n, vertices, edges };
}

function makeLabel(
  free: number[],
  fixed: { axis: number; value: -1 | 1 }[],
): string {
  const freeStr = free.map((a) => AXIS_LABELS[a] ?? `A${a}`).join("");
  const fixedStr = fixed
    .map((f) => `${AXIS_LABELS[f.axis] ?? `A${f.axis}`}=${f.value > 0 ? "+" : "−"}`)
    .join(" ");
  return fixedStr ? `${freeStr} · ${fixedStr}` : freeStr;
}

export function build2Faces(n: number): KFace[] {
  const out: KFace[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const others: number[] = [];
      for (let a = 0; a < n; a++) if (a !== i && a !== j) others.push(a);
      const combos = 1 << others.length;
      for (let c = 0; c < combos; c++) {
        let base = 0;
        const fixed: { axis: number; value: -1 | 1 }[] = [];
        for (let m = 0; m < others.length; m++) {
          const bit = (c >> m) & 1;
          const axis = others[m];
          if (bit) base |= 1 << axis;
          fixed.push({ axis, value: bit ? 1 : -1 });
        }
        out.push({
          k: 2,
          vertices: [
            base,
            base | (1 << i),
            base | (1 << i) | (1 << j),
            base | (1 << j),
          ],
          freeAxes: [i, j],
          fixed,
          label: makeLabel([i, j], fixed),
        });
      }
    }
  }
  return out;
}

export function build3Faces(n: number): KFace[] {
  if (n < 3) return [];
  const out: KFace[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        const free = [i, j, k];
        const others: number[] = [];
        for (let a = 0; a < n; a++) if (!free.includes(a)) others.push(a);
        const combos = 1 << others.length;
        for (let c = 0; c < combos; c++) {
          let base = 0;
          const fixed: { axis: number; value: -1 | 1 }[] = [];
          for (let m = 0; m < others.length; m++) {
            const bit = (c >> m) & 1;
            const axis = others[m];
            if (bit) base |= 1 << axis;
            fixed.push({ axis, value: bit ? 1 : -1 });
          }
          const verts: number[] = [];
          for (let mask = 0; mask < 8; mask++) {
            let v = base;
            if (mask & 1) v |= 1 << i;
            if (mask & 2) v |= 1 << j;
            if (mask & 4) v |= 1 << k;
            verts.push(v);
          }
          out.push({
            k: 3,
            vertices: verts,
            freeAxes: free,
            fixed,
            label: makeLabel(free, fixed),
          });
        }
      }
    }
  }
  return out;
}

export function buildCells(n: number): KFace[] {
  return n <= 3 ? build2Faces(n) : build3Faces(n);
}

export interface CellPair {
  a: number;
  b: number;
  label: string;
}

export function buildCellPairs(cells: KFace[]): CellPair[] {
  const keyToIdx = new Map<string, number>();
  const keyOf = (c: KFace, flip: boolean): string => {
    const free = c.freeAxes.slice().sort((x, y) => x - y).join(",");
    const fixed = c.fixed
      .slice()
      .sort((x, y) => x.axis - y.axis)
      .map((f) => `${f.axis}=${flip ? -f.value : f.value}`)
      .join(",");
    return `${free}|${fixed}`;
  };
  for (let i = 0; i < cells.length; i++) {
    keyToIdx.set(keyOf(cells[i], false), i);
  }
  const pairs: CellPair[] = [];
  const seen = new Set<number>();
  for (let i = 0; i < cells.length; i++) {
    if (seen.has(i)) continue;
    const j = keyToIdx.get(keyOf(cells[i], true));
    if (j !== undefined && j !== i && !seen.has(j)) {
      const free = cells[i].freeAxes
        .map((a) => AXIS_LABELS[a] ?? `A${a}`)
        .join("");
      const fixedAxes = cells[i].fixed
        .map((f) => AXIS_LABELS[f.axis] ?? `A${f.axis}`)
        .join(",");
      const label = fixedAxes ? `${free} · ${fixedAxes}=±` : `${free} ↔`;
      pairs.push({ a: i, b: j, label });
      seen.add(i);
      seen.add(j);
    }
  }
  return pairs;
}
