import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import HypercubeMesh from "./HypercubeMesh";
import { useStore } from "../store";

export default function HypercubeScene() {
  const fov = useStore((s) => s.fov);
  const bloomStrength = useStore((s) => s.bloomStrength);
  const glow = useStore((s) => s.glow);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov, position: [0, 0, 6] }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#05060f"]} />
      <fog attach="fog" args={["#05060f", 6, 18]} />
      <ambientLight intensity={0.3} />
      <HypercubeMesh />
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        minDistance={2.5}
        maxDistance={14}
      />
      <EffectComposer>
        <Bloom
          intensity={bloomStrength * (0.6 + glow * 0.5)}
          luminanceThreshold={0.05}
          luminanceSmoothing={0.85}
          mipmapBlur
          radius={0.7}
        />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
