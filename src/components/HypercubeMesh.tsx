import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildNCube, buildCells, buildCellPairs } from "../hypercube/geometry";
import { planesFor, rotatePoint } from "../hypercube/rotation";
import { projectTo3D } from "../hypercube/projection";
import { useStore } from "../store";

const tmp = new THREE.Color();

const CUBE_QUADS: [number, number, number, number][] = [
  [0, 2, 6, 4],
  [1, 5, 7, 3],
  [0, 4, 5, 1],
  [2, 3, 7, 6],
  [0, 1, 3, 2],
  [4, 6, 7, 5],
];

const GOLDEN = 0.6180339887498949;

export default function HypercubeMesh() {
  const dimension = useStore((s) => s.dimension);
  const rotationsState = useStore((s) => s.rotations);
  const speeds = useStore((s) => s.speeds);
  const paused = useStore((s) => s.paused);
  const projection = useStore((s) => s.projection);
  const projectionDistances = useStore((s) => s.projectionDistances);
  const scale = useStore((s) => s.scale);
  const edgeColorA = useStore((s) => s.edgeColorA);
  const edgeColorB = useStore((s) => s.edgeColorB);
  const vertexColor = useStore((s) => s.vertexColor);
  const edgeWidth = useStore((s) => s.edgeWidth);
  const vertexSize = useStore((s) => s.vertexSize);
  const showVertices = useStore((s) => s.showVertices);
  const depthFade = useStore((s) => s.depthFade);
  const showCells = useStore((s) => s.showCells);
  const cellOpacity = useStore((s) => s.cellOpacity);
  const cellSaturation = useStore((s) => s.cellSaturation);
  const cellHueOffset = useStore((s) => s.cellHueOffset);
  const highlightCell = useStore((s) => s.highlightCell);
  const cellEdges = useStore((s) => s.cellEdges);
  const highlightPair = useStore((s) => s.highlightPair);
  const pairColorMode = useStore((s) => s.pairColorMode);

  const cube = useMemo(() => buildNCube(dimension), [dimension]);
  const planes = useMemo(() => planesFor(dimension), [dimension]);
  const cells = useMemo(() => buildCells(dimension), [dimension]);
  const cellPairs = useMemo(() => buildCellPairs(cells), [cells]);
  const cellToPair = useMemo(() => {
    const map = new Map<number, { pair: number; side: 0 | 1 }>();
    cellPairs.forEach((p, pi) => {
      map.set(p.a, { pair: pi, side: 0 });
      map.set(p.b, { pair: pi, side: 1 });
    });
    return map;
  }, [cellPairs]);
  const vertsPerCell = dimension <= 3 ? 4 : 8;
  const trisPerCell = dimension <= 3 ? 2 : 12;

  const lineRef = useRef<THREE.LineSegments>(null!);
  const pointRef = useRef<THREE.Points>(null!);
  const cellRef = useRef<THREE.Mesh>(null!);
  const cellEdgeRef = useRef<THREE.LineSegments>(null!);

  const positions = useMemo(
    () => new Float32Array(cube.edges.length * 6),
    [cube.edges.length],
  );
  const colors = useMemo(
    () => new Float32Array(cube.edges.length * 6),
    [cube.edges.length],
  );
  const vertexPositions = useMemo(
    () => new Float32Array(cube.vertices.length * 3),
    [cube.vertices.length],
  );

  const cellPositions = useMemo(
    () => new Float32Array(cells.length * vertsPerCell * 3),
    [cells.length, vertsPerCell],
  );
  const cellColorBuf = useMemo(
    () => new Float32Array(cells.length * vertsPerCell * 3),
    [cells.length, vertsPerCell],
  );
  const cellIndices = useMemo(() => {
    const arr = new Uint32Array(cells.length * trisPerCell * 3);
    let w = 0;
    for (let ci = 0; ci < cells.length; ci++) {
      const base = ci * vertsPerCell;
      if (vertsPerCell === 4) {
        arr[w++] = base + 0;
        arr[w++] = base + 1;
        arr[w++] = base + 2;
        arr[w++] = base + 0;
        arr[w++] = base + 2;
        arr[w++] = base + 3;
      } else {
        for (const [a, b, c, d] of CUBE_QUADS) {
          arr[w++] = base + a;
          arr[w++] = base + b;
          arr[w++] = base + c;
          arr[w++] = base + a;
          arr[w++] = base + c;
          arr[w++] = base + d;
        }
      }
    }
    return arr;
  }, [cells.length, vertsPerCell, trisPerCell]);

  const cellEdgeIndices = useMemo(() => {
    const pairs: [number, number][] = [];
    if (vertsPerCell === 4) {
      pairs.push([0, 1], [1, 2], [2, 3], [3, 0]);
    } else {
      pairs.push(
        [0, 1], [2, 3], [4, 5], [6, 7],
        [0, 2], [1, 3], [4, 6], [5, 7],
        [0, 4], [1, 5], [2, 6], [3, 7],
      );
    }
    const arr = new Uint32Array(cells.length * pairs.length * 2);
    let w = 0;
    for (let ci = 0; ci < cells.length; ci++) {
      const base = ci * vertsPerCell;
      for (const [a, b] of pairs) {
        arr[w++] = base + a;
        arr[w++] = base + b;
      }
    }
    return arr;
  }, [cells.length, vertsPerCell]);

  const cellBaseColors = useMemo(() => {
    const arr: THREE.Color[] = [];
    for (let i = 0; i < cells.length; i++) {
      const c = new THREE.Color();
      if (pairColorMode) {
        const meta = cellToPair.get(i);
        if (meta) {
          const h = ((meta.pair * GOLDEN + cellHueOffset) % 1 + 1) % 1;
          c.setHSL(h, cellSaturation, meta.side === 0 ? 0.42 : 0.68);
        } else {
          c.setHSL(0, 0, 0.5);
        }
      } else {
        const h = ((i * GOLDEN + cellHueOffset) % 1 + 1) % 1;
        c.setHSL(h, cellSaturation, 0.55);
      }
      arr.push(c);
    }
    return arr;
  }, [cells.length, cellSaturation, cellHueOffset, pairColorMode, cellToPair]);

  const accRotations = useRef<Record<string, number>>({});
  const colA = useMemo(() => new THREE.Color(), []);
  const colB = useMemo(() => new THREE.Color(), []);

  useFrame((_, delta) => {
    if (!paused) {
      for (const p of planes) {
        const speed = speeds[p.key] ?? 0;
        if (speed !== 0) {
          accRotations.current[p.key] = (accRotations.current[p.key] ?? 0) + speed * delta;
        }
      }
    }

    const activeRotations = planes.map((p) => ({
      i: p.i,
      j: p.j,
      angle: (rotationsState[p.key] ?? 0) + (accRotations.current[p.key] ?? 0),
    }));

    const rotated = cube.vertices.map((v) => rotatePoint(v, activeRotations));

    const projected = rotated.map((p) =>
      projectTo3D(p, projection, projectionDistances).map((x) => x * scale) as [
        number,
        number,
        number,
      ],
    );

    const wValues = rotated.map((p) =>
      p.length > 3 ? p.slice(3).reduce((a, b) => a + b, 0) / (p.length - 3) : 0,
    );
    let minW = Infinity;
    let maxW = -Infinity;
    for (const w of wValues) {
      if (w < minW) minW = w;
      if (w > maxW) maxW = w;
    }
    const wRange = Math.max(1e-6, maxW - minW);

    colA.set(edgeColorA);
    colB.set(edgeColorB);

    for (let e = 0; e < cube.edges.length; e++) {
      const [a, b] = cube.edges[e];
      const pa = projected[a];
      const pb = projected[b];
      positions[e * 6 + 0] = pa[0];
      positions[e * 6 + 1] = pa[1];
      positions[e * 6 + 2] = pa[2];
      positions[e * 6 + 3] = pb[0];
      positions[e * 6 + 4] = pb[1];
      positions[e * 6 + 5] = pb[2];

      const ta = (wValues[a] - minW) / wRange;
      const tb = (wValues[b] - minW) / wRange;
      tmp.copy(colA).lerp(colB, ta);
      const fa = THREE.MathUtils.lerp(1 - depthFade, 1, ta);
      colors[e * 6 + 0] = tmp.r * fa;
      colors[e * 6 + 1] = tmp.g * fa;
      colors[e * 6 + 2] = tmp.b * fa;

      tmp.copy(colA).lerp(colB, tb);
      const fb = THREE.MathUtils.lerp(1 - depthFade, 1, tb);
      colors[e * 6 + 3] = tmp.r * fb;
      colors[e * 6 + 4] = tmp.g * fb;
      colors[e * 6 + 5] = tmp.b * fb;
    }

    for (let i = 0; i < cube.vertices.length; i++) {
      vertexPositions[i * 3 + 0] = projected[i][0];
      vertexPositions[i * 3 + 1] = projected[i][1];
      vertexPositions[i * 3 + 2] = projected[i][2];
    }

    if (showCells && cells.length > 0) {
      const anyHighlight = highlightCell >= 0 || highlightPair >= 0;
      for (let ci = 0; ci < cells.length; ci++) {
        const cell = cells[ci];
        const baseV = ci * vertsPerCell;
        const meta = cellToPair.get(ci);
        const inPair = highlightPair >= 0 && meta?.pair === highlightPair;
        const focused = !anyHighlight || highlightCell === ci || inPair;
        const dimMul = focused ? 1 : 0.06;
        const baseColor = cellBaseColors[ci];

        let wAvg = 0;
        for (let vi = 0; vi < vertsPerCell; vi++) {
          wAvg += wValues[cell.vertices[vi]];
        }
        wAvg /= vertsPerCell;
        const t = (wAvg - minW) / wRange;
        const depth = THREE.MathUtils.lerp(1 - depthFade, 1, t);
        const m = dimMul * depth;

        for (let vi = 0; vi < vertsPerCell; vi++) {
          const vIdx = cell.vertices[vi];
          const p = projected[vIdx];
          const off = (baseV + vi) * 3;
          cellPositions[off + 0] = p[0];
          cellPositions[off + 1] = p[1];
          cellPositions[off + 2] = p[2];
          cellColorBuf[off + 0] = baseColor.r * m;
          cellColorBuf[off + 1] = baseColor.g * m;
          cellColorBuf[off + 2] = baseColor.b * m;
        }
      }
    }

    if (lineRef.current) {
      const geom = lineRef.current.geometry as THREE.BufferGeometry;
      (geom.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
      (geom.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;
    }
    if (pointRef.current) {
      const geom = pointRef.current.geometry as THREE.BufferGeometry;
      (geom.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    }
    if (cellRef.current) {
      const geom = cellRef.current.geometry as THREE.BufferGeometry;
      (geom.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
      (geom.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;
    }
    if (cellEdgeRef.current) {
      const geom = cellEdgeRef.current.geometry as THREE.BufferGeometry;
      (geom.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
      (geom.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;
    }
  });

  return (
    <group>
      {showCells && cells.length > 0 && (
        <mesh ref={cellRef} renderOrder={-1}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[cellPositions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[cellColorBuf, 3]}
            />
            <bufferAttribute attach="index" args={[cellIndices, 1]} />
          </bufferGeometry>
          <meshBasicMaterial
            vertexColors
            transparent
            opacity={cellOpacity}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {showCells && cellEdges && cells.length > 0 && (
        <lineSegments ref={cellEdgeRef} renderOrder={0}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[cellPositions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[cellColorBuf, 3]}
            />
            <bufferAttribute attach="index" args={[cellEdgeIndices, 1]} />
          </bufferGeometry>
          <lineBasicMaterial
            vertexColors
            transparent
            opacity={Math.min(1, cellOpacity * 4)}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>
      )}

      <lineSegments ref={lineRef} renderOrder={1}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          linewidth={edgeWidth}
          toneMapped={false}
        />
      </lineSegments>

      {showVertices && (
        <points ref={pointRef} renderOrder={2}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[vertexPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color={vertexColor}
            size={vertexSize}
            sizeAttenuation
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </points>
      )}
    </group>
  );
}
