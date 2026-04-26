import type { Vec } from "./geometry";

export type ProjectionMode = "perspective" | "orthographic";

export function projectTo3D(
  point: Vec,
  mode: ProjectionMode,
  distances: number[],
): [number, number, number] {
  let p = point.slice();
  while (p.length > 3) {
    const last = p.length - 1;
    const w = p[last];
    const d = distances[p.length - 4] ?? 4;
    if (mode === "perspective") {
      const denom = d - w;
      const k = denom !== 0 ? d / denom : 1;
      p = p.slice(0, last).map((v) => v * k);
    } else {
      p = p.slice(0, last);
    }
  }
  while (p.length < 3) p.push(0);
  return [p[0], p[1], p[2]];
}

export function depthValue(point: Vec): number {
  if (point.length <= 3) return 0;
  let acc = 0;
  for (let i = 3; i < point.length; i++) acc += point[i];
  return acc / (point.length - 3);
}
