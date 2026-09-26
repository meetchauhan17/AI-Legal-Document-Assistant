'use client';

/**
 * DocumentStack3D.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * 3-D stacked document pile for the Lawyer-Prep page heading decoration.
 *
 * DESIGN SPEC:
 *  • 3 thin BoxGeometry planes (depth 0.05, aspect ~3:4 like A4 paper)
 *  • MeshStandardMaterial — white/off-white, roughness ~0.6 (paper-like matte)
 *  • Subtle colour variation: front page pure white, middle faint warm, back
 *    with a very light clay-accent tint to suggest the "active" document
 *  • Top-left soft directional lighting (matches hero + icon orb lighting rig)
 *  • SETTLE ANIMATION: Pages start scattered (more rotation) and ease into
 *    their resting stacked position over ~800ms on mount — plays once only
 *  • IDLE: After settling, the whole stack slowly rotates in Y in response
 *    to the scroll position (subtle, barely perceptible — ~15deg max swing)
 *  • Rendered size: ~180px canvas, acting as a compact decorative element
 *
 * SCROLL RESPONSE:
 *  The component accepts a `scrollY` prop (0–1 normalised from the wrapper)
 *  and applies a gentle Y-rotation to the whole group mesh.
 *
 * PERFORMANCE:
 *  • Very low poly (BoxGeometry is 6 faces per page × 3 pages = 18 tris)
 *  • DPR capped at [1, 1.5]
 *  • Single canvas, single draw call group
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Easing function ─────────────────────────────────────────────────────────
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ─── Individual page mesh definition ─────────────────────────────────────────
interface PageConfig {
  restPos: [number, number, number];
  restRot: [number, number, number];
  startPos: [number, number, number];
  startRot: [number, number, number];
  color: string;
  opacity: number;
}

// Resting stacked configuration (3 pages)
const PAGE_CONFIGS: PageConfig[] = [
  // Back page — soft luminous lavender-white
  {
    restPos: [0.12, -0.07, -0.10],
    restRot: [0.03, 0.0, 0.11],
    startPos: [0.42, -0.25, -0.25],
    startRot: [0.1, 0.25, 0.38],
    color: '#EDE9FE',
    opacity: 1.0,
  },
  // Middle page — crisp bright white-slate
  {
    restPos: [-0.08, 0.03, -0.05],
    restRot: [-0.02, 0.0, -0.055],
    startPos: [-0.32, 0.22, -0.18],
    startRot: [-0.07, -0.22, -0.28],
    color: '#F8FAFC',
    opacity: 1.0,
  },
  // Front page — brilliant pure white
  {
    restPos: [0.0, 0.0, 0.0],
    restRot: [0.0, 0.0, 0.0],
    startPos: [0.14, 0.09, 0.14],
    startRot: [0.0, 0.0, 0.04],
    color: '#FFFFFF',
    opacity: 1.0,
  },
];

// ─── Page geometry (shared, thin box like A4 paper) ──────────────────────────
function usePageGeometry() {
  return useMemo(() => new THREE.BoxGeometry(0.85, 1.12, 0.04), []);
}

// ─── All pages in a group, animated ─────────────────────────────────────────
function DocumentPages({ scrollY }: { scrollY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const pageGeo = usePageGeometry();
  const progressRef = useRef(0);
  const SETTLE_DURATION = 0.8; // seconds

  // Mesh and group refs
  const backMeshRef = useRef<THREE.Mesh>(null);
  const middleMeshRef = useRef<THREE.Mesh>(null);
  const frontGroupRef = useRef<THREE.Group>(null);

  // Ultra-bright, radiant paper materials with emissive floor to guarantee pure whites
  const materials = useMemo(
    () => [
      // Back page: soft luminous lavender tint
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#EDE9FE'),
        roughness: 0.16,
        metalness: 0.0,
        emissive: new THREE.Color('#DDD6FE'),
        emissiveIntensity: 0.22,
      }),
      // Middle page: crisp bright off-white
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#F8FAFC'),
        roughness: 0.14,
        metalness: 0.0,
        emissive: new THREE.Color('#F1F5F9'),
        emissiveIntensity: 0.24,
      }),
      // Front page: brilliant, gleaming pure white
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FFFFFF'),
        roughness: 0.1,
        metalness: 0.0,
        emissive: new THREE.Color('#FFFFFF'),
        emissiveIntensity: 0.32,
      }),
    ],
    []
  );

  // Vibrant accent header band on front page
  const headerBandGeo = useMemo(() => new THREE.BoxGeometry(0.70, 0.085, 0.006), []);
  const headerBandMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#7C3AED'),
        roughness: 0.15,
        metalness: 0.05,
        emissive: new THREE.Color('#6D28D9'),
        emissiveIntensity: 0.45,
      }),
    []
  );

  // Clean, crisp high-contrast text lines
  const lineLongGeo = useMemo(() => new THREE.BoxGeometry(0.66, 0.022, 0.005), []);
  const lineMediumGeo = useMemo(() => new THREE.BoxGeometry(0.50, 0.022, 0.005), []);
  const lineMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#94A3B8'),
        roughness: 0.2,
        metalness: 0.0,
        emissive: new THREE.Color('#CBD5E1'),
        emissiveIntensity: 0.28,
      }),
    []
  );

  // Legal seal badge (bottom-right)
  const sealOuterGeo = useMemo(() => new THREE.CylinderGeometry(0.068, 0.068, 0.008, 24), []);
  const sealOuterMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#7C3AED'),
        roughness: 0.2,
        emissive: new THREE.Color('#6D28D9'),
        emissiveIntensity: 0.45,
      }),
    []
  );
  const sealInnerGeo = useMemo(() => new THREE.CylinderGeometry(0.038, 0.038, 0.010, 16), []);
  const sealInnerMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#DDD6FE'),
        roughness: 0.2,
        emissive: new THREE.Color('#C4B5FD'),
        emissiveIntensity: 0.55,
      }),
    []
  );

  // Signature line (bottom-left)
  const sigGeo = useMemo(() => new THREE.BoxGeometry(0.28, 0.016, 0.005), []);
  const sigMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#A78BFA'),
        roughness: 0.25,
        emissive: new THREE.Color('#8B5CF6'),
        emissiveIntensity: 0.4,
      }),
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const elapsed = clock.getElapsedTime();

    // ── Settling animation ───────────────────────────────────────────────────
    const rawProgress = Math.min(elapsed / SETTLE_DURATION, 1);
    progressRef.current = easeOutCubic(rawProgress);
    const t = progressRef.current;

    // Animate Back page
    if (backMeshRef.current) {
      const c = PAGE_CONFIGS[0];
      backMeshRef.current.position.set(
        c.startPos[0] + (c.restPos[0] - c.startPos[0]) * t,
        c.startPos[1] + (c.restPos[1] - c.startPos[1]) * t,
        c.startPos[2] + (c.restPos[2] - c.startPos[2]) * t
      );
      backMeshRef.current.rotation.set(
        c.startRot[0] + (c.restRot[0] - c.startRot[0]) * t,
        c.startRot[1] + (c.restRot[1] - c.startRot[1]) * t,
        c.startRot[2] + (c.restRot[2] - c.startRot[2]) * t
      );
    }

    // Animate Middle page
    if (middleMeshRef.current) {
      const c = PAGE_CONFIGS[1];
      middleMeshRef.current.position.set(
        c.startPos[0] + (c.restPos[0] - c.startPos[0]) * t,
        c.startPos[1] + (c.restPos[1] - c.startPos[1]) * t,
        c.startPos[2] + (c.restPos[2] - c.startPos[2]) * t
      );
      middleMeshRef.current.rotation.set(
        c.startRot[0] + (c.restRot[0] - c.startRot[0]) * t,
        c.startRot[1] + (c.restRot[1] - c.startRot[1]) * t,
        c.startRot[2] + (c.restRot[2] - c.startRot[2]) * t
      );
    }

    // Animate Front group (moves together with header band & lines seamlessly)
    if (frontGroupRef.current) {
      const c = PAGE_CONFIGS[2];
      frontGroupRef.current.position.set(
        c.startPos[0] + (c.restPos[0] - c.startPos[0]) * t,
        c.startPos[1] + (c.restPos[1] - c.startPos[1]) * t,
        c.startPos[2] + (c.restPos[2] - c.startPos[2]) * t
      );
      frontGroupRef.current.rotation.set(
        c.startRot[0] + (c.restRot[0] - c.startRot[0]) * t,
        c.startRot[1] + (c.restRot[1] - c.startRot[1]) * t,
        c.startRot[2] + (c.restRot[2] - c.startRot[2]) * t
      );
    }

    // ── Idle / scroll response after settling ────────────────────────────────
    if (rawProgress >= 1) {
      const targetY = (scrollY - 0.5) * 0.4;
      const targetX = 0.08 + Math.sin(elapsed * 0.3) * 0.03;

      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.04;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.03;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.08, 0, 0]}>
      {/* ── Back Page ── */}
      <mesh
        ref={backMeshRef}
        geometry={pageGeo}
        material={materials[0]}
        position={PAGE_CONFIGS[0].startPos}
        rotation={PAGE_CONFIGS[0].startRot}
        castShadow={false}
        receiveShadow={false}
      />

      {/* ── Middle Page ── */}
      <mesh
        ref={middleMeshRef}
        geometry={pageGeo}
        material={materials[1]}
        position={PAGE_CONFIGS[1].startPos}
        rotation={PAGE_CONFIGS[1].startRot}
        castShadow={false}
        receiveShadow={false}
      />

      {/* ── Front Page Group (Sheet + Accents that animate as one unit) ── */}
      <group
        ref={frontGroupRef}
        position={PAGE_CONFIGS[2].startPos}
        rotation={PAGE_CONFIGS[2].startRot}
      >
        {/* Front Sheet */}
        <mesh
          geometry={pageGeo}
          material={materials[2]}
          castShadow={false}
          receiveShadow={false}
        />

        {/* Vibrant Accent Header Band */}
        <mesh
          geometry={headerBandGeo}
          material={headerBandMat}
          position={[0.0, 0.42, 0.024]}
        />

        {/* Crisp Text Lines */}
        <mesh geometry={lineLongGeo} material={lineMat} position={[0.0, 0.26, 0.024]} />
        <mesh geometry={lineMediumGeo} material={lineMat} position={[-0.08, 0.17, 0.024]} />
        <mesh geometry={lineLongGeo} material={lineMat} position={[0.0, 0.08, 0.024]} />
        <mesh geometry={lineMediumGeo} material={lineMat} position={[-0.05, -0.01, 0.024]} />
        <mesh geometry={lineLongGeo} material={lineMat} position={[0.0, -0.10, 0.024]} />

        {/* Signature Line (Bottom Left) */}
        <mesh geometry={sigGeo} material={sigMat} position={[-0.17, -0.30, 0.024]} />

        {/* Certified Notary Seal (Bottom Right) */}
        <mesh
          geometry={sealOuterGeo}
          material={sealOuterMat}
          position={[0.22, -0.30, 0.025]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <mesh
          geometry={sealInnerGeo}
          material={sealInnerMat}
          position={[0.22, -0.30, 0.026]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </group>
    </group>
  );
}

// ─── High-Brilliance Lighting Rig ───────────────────────────────────────────
function StackLights() {
  return (
    <>
      {/* High-intensity ambient fill eliminates dull/muddy shadows */}
      <ambientLight intensity={1.8} color="#ffffff" />
      {/* Brilliant key light from front-top illuminates paper surface directly */}
      <directionalLight position={[1.5, 3.5, 3.5]} intensity={2.6} color="#ffffff" />
      {/* Front-left fill light guarantees pure white face illumination */}
      <directionalLight position={[-2.0, 1.2, 3.5]} intensity={1.8} color="#f8faff" />
      {/* Overhead edge light */}
      <directionalLight position={[0, 4.2, 1.5]} intensity={1.2} color="#ffffff" />
      {/* Soft lavender bounce from below */}
      <pointLight position={[0, -2.0, 2.5]} intensity={0.8} color="#ede9fe" />
    </>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────
export interface DocumentStack3DProps {
  /** Normalised scroll progress (0–1) — drives the idle Y-rotation */
  scrollY?: number;
  /** Canvas size in px */
  size?: number;
}

export default function DocumentStack3D({
  scrollY = 0,
  size = 180,
}: DocumentStack3DProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.NoToneMapping,
        powerPreference: 'low-power',
      }}
      style={{
        width: size,
        height: size,
        background: 'transparent',
        display: 'block',
      }}
      camera={{ position: [0, 0, 2.6], fov: 42 }}
      aria-hidden="true"
    >
      <StackLights />
      <DocumentPages scrollY={scrollY} />
    </Canvas>
  );
}
