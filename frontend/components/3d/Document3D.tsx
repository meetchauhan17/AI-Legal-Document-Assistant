'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function DocumentModel() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6} floatingRange={[-0.1, 0.1]}>
      <group ref={meshRef}>
        {/* Main Document Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.5, 2.1, 0.08]} />
          <meshStandardMaterial
            color="#FFFFFF"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* Back page layered shadow */}
        <mesh position={[0.08, -0.08, -0.06]} rotation={[0, 0, -0.05]}>
          <boxGeometry args={[1.5, 2.1, 0.05]} />
          <meshStandardMaterial
            color="#E2E8F0"
            roughness={0.4}
          />
        </mesh>

        {/* Header Accent Bar */}
        <mesh position={[0, 0.75, 0.045]}>
          <boxGeometry args={[1.1, 0.18, 0.01]} />
          <meshStandardMaterial color="#1E3A8A" roughness={0.3} />
        </mesh>

        {/* Text lines */}
        <mesh position={[-0.15, 0.4, 0.045]}>
          <boxGeometry args={[0.8, 0.06, 0.01]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>
        <mesh position={[0, 0.2, 0.045]}>
          <boxGeometry args={[1.1, 0.06, 0.01]} />
          <meshStandardMaterial color="#CBD5E1" />
        </mesh>
        <mesh position={[0, 0.0, 0.045]}>
          <boxGeometry args={[1.1, 0.06, 0.01]} />
          <meshStandardMaterial color="#CBD5E1" />
        </mesh>
        <mesh position={[-0.2, -0.2, 0.045]}>
          <boxGeometry args={[0.7, 0.06, 0.01]} />
          <meshStandardMaterial color="#CBD5E1" />
        </mesh>

        {/* Golden Seal / Stamp Badge */}
        <mesh position={[0.4, -0.6, 0.05]}>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 32]} />
          <meshStandardMaterial
            color="#D97706"
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function Document3D({ className = '' }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`w-full h-full bg-slate-100/50 rounded-2xl ${className}`} />;
  }

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 8, 5]} intensity={0.8} />
        <pointLight position={[-4, -3, 2]} intensity={0.5} color="#D97706" />
        <DocumentModel />
      </Canvas>
    </div>
  );
}
