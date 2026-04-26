import type { Vec } from "./geometry";

export interface PlaneRotation {
  i: number;
  j: number;
  angle: number;
}

export function rotatePoint(p: Vec, rotations: PlaneRotation[]): Vec {
  const out = p.slice();
  for (const { i, j, angle } of rotations) {
    if (angle === 0) continue;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const a = out[i];
    const b = out[j];
    out[i] = a * c - b * s;
    out[j] = a * s + b * c;
  }
  return out;
}

export function planesFor(n: number): { i: number; j: number; key: string; label: string }[] {
  const axisLabels = ["X", "Y", "Z", "W", "V", "U"];
  const out: { i: number; j: number; key: string; label: string }[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const label = `${axisLabels[i]}${axisLabels[j]}`;
      out.push({ i, j, key: label, label });
    }
  }
  return out;
}
