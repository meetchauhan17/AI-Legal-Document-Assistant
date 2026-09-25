'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function VsScene() {
  const groupRef = useRef<THREE.Group>(null);
  const ringRefA = useRef<THREE.Mesh>(null);
  const ringRefB = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
    if (ringRefA.current) {
      ringRefA.current.rotation.x += delta * 0.8;
    }
    if (ringRefB.current) {
      ringRefB.current.rotation.z += delta * 0.8;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8} floatingRange={[-0.1, 0.1]}>
      <group ref={groupRef}>
        {/* Document A sphere - Deep Blue */}
        <mesh position={[-0.8, 0, 0]}>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial
            color="#1E3A8A"
            metalness={0.4}
            roughness={0.2}
          />
        </mesh>

        {/* Document B sphere - Warm Amber Gold */}
        <mesh position={[0.8, 0, 0]}>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial
            color="#D97706"
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>

        {/* Interlocking Orbital Ring A */}
        <mesh ref={ringRefA} position={[-0.8, 0, 0]}>
          <torusGeometry args={[0.65, 0.04, 16, 64]} />
          <meshStandardMaterial color="#2563EB" metalness={0.3} roughness={0.3} />
        </mesh>

        {/* Interlocking Orbital Ring B */}
        <mesh ref={ringRefB} position={[0.8, 0, 0]}>
          <torusGeometry args={[0.65, 0.04, 16, 64]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.3} roughness={0.3} />
        </mesh>

        {/* Central glowing connection bridge */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 1.4, 16]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
    </Float>
  );
}

export default function VsBadge3D({ className = '' }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 ${className}`}>
        VS
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[4, 6, 4]} intensity={0.9} />
        <pointLight position={[-4, -3, 2]} intensity={0.6} color="#1E3A8A" />
        <pointLight position={[4, 3, -2]} intensity={0.6} color="#D97706" />
        <VsScene />
      </Canvas>
    </div>
  );
}
