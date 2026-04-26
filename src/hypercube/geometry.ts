export type Vec = number[];

export interface NCube {
  dimension: number;
  vertices: Vec[];
  edges: [number, number][];
}

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
