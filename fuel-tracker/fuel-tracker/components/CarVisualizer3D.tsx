"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";

/**
 * Procedural placeholder car built from primitives (body, cabin, wheels).
 * Swap the <CarModel> body below for a real GLTF per vehicle.make/model
 * later — e.g. useGLTF(`/models/${make}-${model}.glb`) — the paint-color
 * logic and OrbitControls wiring here won't need to change.
 */
function CarModel({ colorHex }: { colorHex: string }) {
  const bodyRef = useRef<THREE.Mesh>(null);

  return (
    <group position={[0, -0.4, 0]}>
      {/* Lower body */}
      <mesh ref={bodyRef} position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[2.6, 0.5, 1.15]} />
        <meshStandardMaterial color={colorHex} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Cabin */}
      <mesh position={[-0.1, 0.75, 0]} castShadow>
        <boxGeometry args={[1.5, 0.42, 1.05]} />
        <meshStandardMaterial color={colorHex} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Windshield tint band */}
      <mesh position={[-0.1, 0.76, 0]}>
        <boxGeometry args={[1.52, 0.2, 1.07]} />
        <meshStandardMaterial color="#0B0E11" metalness={0.9} roughness={0.1} transparent opacity={0.55} />
      </mesh>
      {/* Wheels */}
      {[
        [0.85, 0.05, 0.62],
        [0.85, 0.05, -0.62],
        [-0.85, 0.05, 0.62],
        [-0.85, 0.05, -0.62],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.24, 24]} />
          <meshStandardMaterial color="#14181D" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
      {/* Headlights */}
      {[0.62, -0.62].map((z, i) => (
        <mesh key={i} position={[1.3, 0.38, z]}>
          <boxGeometry args={[0.05, 0.14, 0.22]} />
          <meshStandardMaterial color="#F5F5F5" emissive="#F5A623" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export default function CarVisualizer3D({
  colorHex,
  height = 320,
  interactive = true,
}: {
  colorHex: string;
  height?: number;
  interactive?: boolean;
}) {
  return (
    <div style={{ height }} className="relative w-full">
      <Canvas shadows camera={{ position: [3.2, 1.6, 3.2], fov: 40 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 3]} intensity={1.4} castShadow />
          <CarModel colorHex={colorHex} />
          <ContactShadows position={[0, -0.42, 0]} opacity={0.55} scale={6} blur={2.2} far={2} />
          <Environment preset="city" />
          <OrbitControls
            enabled={interactive}
            enablePan={false}
            minDistance={2.2}
            maxDistance={6}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.1}
            autoRotate={!interactive}
            autoRotateSpeed={1.2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
