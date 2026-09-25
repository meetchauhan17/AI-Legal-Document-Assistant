'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Individual rotating geometric shape
interface ShapeProps {
  position: [number, number, number];
  color: string;
  type: 'sphere' | 'torusKnot' | 'octahedron';
  speed?: number;
  rotationSpeed?: [number, number, number];
  scale?: number;
}

function Shape({
  position,
  color,
  type,
  speed = 1.2,
  rotationSpeed = [0.2, 0.3, 0.1],
  scale = 1,
}: ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * rotationSpeed[0] * 0.4;
      meshRef.current.rotation.y += delta * rotationSpeed[1] * 0.4;
      meshRef.current.rotation.z += delta * rotationSpeed[2] * 0.2;
    }
  });

  return (
    <Float
      speed={speed}
      rotationIntensity={0.6}
      floatIntensity={0.8}
      floatingRange={[-0.2, 0.2]}
    >
      <mesh ref={meshRef} position={position} scale={scale}>
        {type === 'sphere' && <sphereGeometry args={[1, 32, 32]} />}
        {type === 'torusKnot' && <torusKnotGeometry args={[0.8, 0.25, 100, 16]} />}
        {type === 'octahedron' && <octahedronGeometry args={[1, 0]} />}

        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.18}
          roughness={0.3}
          metalness={0.15}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color="#D97706" />

      {/* Primary Deep Blue Torus Knot - Upper Right */}
      <Shape
        position={[3.2, 1.6, -2]}
        color="#1E3A8A"
        type="torusKnot"
        scale={1.1}
        rotationSpeed={[0.3, 0.4, 0.2]}
      />

      {/* Warm Gold Sphere - Lower Left */}
      <Shape
        position={[-3.0, -1.8, -1.5]}
        color="#D97706"
        type="sphere"
        scale={1.2}
        rotationSpeed={[0.2, 0.25, 0.15]}
      />

      {/* Primary Blue Translucent Sphere - Top Left */}
      <Shape
        position={[-2.8, 2.2, -3]}
        color="#1E3A8A"
        type="sphere"
        scale={0.9}
        rotationSpeed={[0.15, 0.2, 0.1]}
      />

      {/* Warm Gold Octahedron - Right Center / Bottom */}
      <Shape
        position={[2.8, -1.5, -2.5]}
        color="#D97706"
        type="octahedron"
        scale={1.0}
        rotationSpeed={[0.25, 0.35, 0.18]}
      />

      {/* Subtle Central Backdrop Torus Knot */}
      <Shape
        position={[0.2, -0.2, -4]}
        color="#1E3A8A"
        type="torusKnot"
        scale={1.5}
        rotationSpeed={[0.1, 0.15, 0.05]}
      />
    </>
  );
}

interface FloatingShapesProps {
  className?: string;
}

export default function FloatingShapes({ className = '' }: FloatingShapesProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden hidden md:block ${className}`}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        dpr={[1, 1.25]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
