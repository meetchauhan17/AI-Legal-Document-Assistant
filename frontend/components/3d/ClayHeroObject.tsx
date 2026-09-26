'use client';

/**
 * ClayHeroObject.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Organic 3-D clay lump rendered via React Three Fiber.
 *
 * Design spec:
 *  • Shape  : Subdivided icosahedron with per-vertex noise displacement
 *             → organic "clay lump" feel, not a perfect geometric primitive
 *  • Material: MeshPhysicalMaterial — clay-accent violet (#6D28D9)
 *              roughness 0.45, metalness 0, clearcoat 0.15
 *  • Lighting: Soft directional top-left + ambient fill (matching the
 *              design system's stated light source)
 *  • Motion  : Slow idle Y-rotation + mouse-follow lerped tilt
 *  • Accents : Two smaller floating orbs (teal + magenta) behind the main shape
 *
 * Loaded lazily via next/dynamic (ssr:false) from page.tsx, so this file
 * MUST NOT contain any top-level server-incompatible code. ✓
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshPhysicalMaterial, Color, Vector3 } from 'three';
import * as THREE from 'three';

// ─── Simplex-style noise (inline, no extra deps) ────────────────────────────
function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + t * (b - a); }

const perm = new Uint8Array(512);
(function buildPerm() {
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
})();

function grad(hash: number, x: number, y: number, z: number) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function noise3(x: number, y: number, z: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
  const u = fade(x), v = fade(y), w = fade(z);
  const A  = perm[X]   + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
  const B  = perm[X+1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
  return lerp(
    lerp(lerp(grad(perm[AA  ], x  , y  , z  ), grad(perm[BA  ], x-1, y  , z  ), u),
         lerp(grad(perm[AB  ], x  , y-1, z  ), grad(perm[BB  ], x-1, y-1, z  ), u), v),
    lerp(lerp(grad(perm[AA+1], x  , y  , z-1), grad(perm[BA+1], x-1, y  , z-1), u),
         lerp(grad(perm[AB+1], x  , y-1, z-1), grad(perm[BB+1], x-1, y-1, z-1), u), v), w);
}

// ─── Displaced Icosahedron geometry ─────────────────────────────────────────
function useClayGeometry(detail = 6, noiseAmp = 0.22, noiseFreq = 1.6) {
  return useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, detail);
    const pos = geo.attributes.position;
    const count = pos.count;
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const len = Math.sqrt(x * x + y * y + z * z);
      const nx = x / len, ny = y / len, nz = z / len; // unit normal
      const n = noise3(nx * noiseFreq, ny * noiseFreq, nz * noiseFreq);
      const r = 1 + n * noiseAmp;
      pos.setXYZ(i, nx * r, ny * r, nz * r);
    }
    geo.computeVertexNormals();
    return geo;
  }, [detail, noiseAmp, noiseFreq]);
}

// ─── Mouse tracker (shared via ref) ─────────────────────────────────────────
// The outer wrapper div captures onPointerMove and writes to this ref.
// We use a module-level ref so the Canvas doesn't need DOM access.
export const mouseNDC = { x: 0, y: 0 };

// ─── Main clay blob mesh ─────────────────────────────────────────────────────
function ClayBlob({ color, position, scale, speed, phase }: {
  color: string;
  position: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRot = useRef({ x: 0, y: 0 });
  const geo = useClayGeometry(6, 0.22, 1.6);

  const mat = useMemo(() => new MeshPhysicalMaterial({
    color: new Color(color),
    roughness: 0.45,
    metalness: 0.0,
    clearcoat: 0.15,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.6,
  }), [color]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Idle Y-rotation
    meshRef.current.rotation.y += speed * 0.004;
    // Gentle float bob
    meshRef.current.position.y = position[1] + Math.sin(t * 0.5 + phase) * 0.06;

    // Mouse-follow lerp (only on main blob)
    if (scale > 1) {
      targetRot.current.x = mouseNDC.y * 0.35;
      targetRot.current.y += (mouseNDC.x * 0.35 - targetRot.current.y) * 0.06;
      meshRef.current.rotation.x += (targetRot.current.x - meshRef.current.rotation.x) * 0.06;
    }
  });

  return <mesh ref={meshRef} geometry={geo} material={mat} position={position} scale={scale} />;
}

// ─── Floating accent orbs (small, simpler geometry) ──────────────────────────
function AccentOrb({ color, position, scale, speed, phase }: {
  color: string;
  position: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geo = useClayGeometry(5, 0.16, 1.9);
  const mat = useMemo(() => new MeshPhysicalMaterial({
    color: new Color(color),
    roughness: 0.5,
    metalness: 0,
    clearcoat: 0.1,
  }), [color]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y += speed * 0.003;
    meshRef.current.rotation.x += speed * 0.002;
    meshRef.current.position.x = position[0] + Math.sin(t * 0.4 + phase) * 0.12;
    meshRef.current.position.y = position[1] + Math.cos(t * 0.5 + phase) * 0.10;
  });

  return <mesh ref={meshRef} geometry={geo} material={mat} position={position} scale={scale} />;
}

// ─── Scene (lights + objects) ────────────────────────────────────────────────
function Scene() {
  return (
    <>
      {/* Ambient fill — soft, warm */}
      <ambientLight intensity={0.55} color="#f5f0ff" />

      {/* Main directional — top-left (matches design system light source) */}
      <directionalLight
        position={[-3, 4, 2]}
        intensity={1.6}
        color="#e0d4ff"
        castShadow={false}
      />

      {/* Subtle rim / back fill from bottom-right */}
      <pointLight position={[3, -2, 2]} intensity={0.4} color="#C026D3" />

      {/* Warm top fill */}
      <pointLight position={[0, 4, -1]} intensity={0.3} color="#ffffff" />

      {/* ─── Main clay blob ─── */}
      <ClayBlob
        color="#6D28D9"
        position={[0, 0, 0]}
        scale={1}
        speed={1}
        phase={0}
      />

      {/* ─── Accent orbs ─── */}
      <AccentOrb
        color="#0D9488"   /* clay-teal */
        position={[-1.6, 0.8, -0.5]}
        scale={0.34}
        speed={0.8}
        phase={1.2}
      />
      <AccentOrb
        color="#C026D3"   /* clay-accent-alt magenta */
        position={[1.5, -0.7, -0.4]}
        scale={0.26}
        speed={1.2}
        phase={2.5}
      />
    </>
  );
}

// ─── Camera rig (auto-fits to canvas) ───────────────────────────────────────
function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 3.2);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

// ─── Exported wrapper (the component imported lazily from page.tsx) ──────────
export default function ClayHeroObject() {
  return (
    <Canvas
      dpr={[1, 1.5]}   // cap DPR for perf on mobile
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      aria-hidden="true"
    >
      <CameraSetup />
      <Scene />
    </Canvas>
  );
}
