import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildNCube } from "../hypercube/geometry";
import { planesFor, rotatePoint } from "../hypercube/rotation";
import { projectTo3D } from "../hypercube/projection";
import { useStore } from "../store";

const tmp = new THREE.Color();

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

  const cube = useMemo(() => buildNCube(dimension), [dimension]);
  const planes = useMemo(() => planesFor(dimension), [dimension]);

  const lineRef = useRef<THREE.LineSegments>(null!);
  const pointRef = useRef<THREE.Points>(null!);

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

    if (lineRef.current) {
      const geom = lineRef.current.geometry as THREE.BufferGeometry;
      const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
      const colAttr = geom.getAttribute("color") as THREE.BufferAttribute;
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }
    if (pointRef.current) {
      const geom = pointRef.current.geometry as THREE.BufferGeometry;
      const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      <lineSegments ref={lineRef}>
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
        <points ref={pointRef}>
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
