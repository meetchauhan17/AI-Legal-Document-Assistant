'use client';

/**
 * VSBadge3D.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A small, energetic 3-D VS badge for the Compare page.
 *
 * SHAPE: Smooth SphereGeometry (radius 0.9, 24x24 segments) — rounder and
 * more "badge-like" than an octahedron, matches the circular CSS original.
 *
 * TWO-TONE GRADIENT: Achieved with vertex colors computed per vertex:
 *   • Top hemisphere  → clay-accent     (#6D28D9, deep violet)
 *   • Bottom hemisphere → clay-accent-alt (#C026D3, magenta)
 *   • Colour lerped linearly by normalised Y position → smooth gradient band
 * The MeshStandardMaterial uses vertexColors:true so Three.js reads the
 * per-vertex color buffer instead of a flat material color.
 *
 * ANIMATION:
 *   • Continuous Y-rotation: ~1 full rotation per 4 seconds (energetic)
 *   • Scale breathe: sin() pulse 1.0 to 1.05 (matching clay-breathe feel)
 *   • Subtle X-tilt oscillation so the sphere catches the light differently
 *
 * TEXT: "VS" rendered as an HTML overlay (absolute-positioned Nunito font-black,
 * white text with text-shadow) — not 3D-extruded, keeping this lightweight.
 *
 * LIGHTING: Matches the app-wide 3D lighting rig (soft top-left directional +
 * ambient + rim from opposite side).
 *
 * PERFORMANCE:
 *   • Single tiny canvas (72px default)
 *   • DPR capped [1, 1.5]
 *   • vertexColors computed once in useMemo, no per-frame colour updates
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Colour constants ─────────────────────────────────────────────────────────
const TOP_COLOR    = new THREE.Color('#6D28D9'); // clay-accent (violet)
const BOTTOM_COLOR = new THREE.Color('#C026D3'); // clay-accent-alt (magenta)

// ─── Build a vertex-colored sphere geometry ───────────────────────────────────
function useGradientSphereGeo(radius = 0.9, wSeg = 24, hSeg = 24) {
  return useMemo(() => {
    const geo = new THREE.SphereGeometry(radius, wSeg, hSeg);
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const count = posAttr.count;

    // Build a Float32Array of RGB triplets, one per vertex
    const colors = new Float32Array(count * 3);
    const tmp = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const y = posAttr.getY(i); // ranges roughly from -radius to +radius
      // Normalise y: 0 = bottom, 1 = top
      const t = (y + radius) / (2 * radius);
      // Lerp from BOTTOM_COLOR (t=0) to TOP_COLOR (t=1)
      tmp.lerpColors(BOTTOM_COLOR, TOP_COLOR, t);
      colors[i * 3    ] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [radius, wSeg, hSeg]);
}

// ─── Animated sphere mesh ─────────────────────────────────────────────────────
function VSOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geo = useGradientSphereGeo();

  // vertexColors:true reads from the 'color' attribute built above
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.42,
        metalness: 0.0,
      }),
    []
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Energetic Y-rotation: 1 revolution per 4 seconds
    meshRef.current.rotation.y = t * (Math.PI * 2 / 4);

    // Subtle X-tilt oscillation (+/-8 deg) so gradient band shifts visually
    meshRef.current.rotation.x = Math.sin(t * 0.7) * 0.14;

    // Scale breathe: 1.0 to 1.05
    const scale = 1 + Math.sin(t * 1.6) * 0.025;
    meshRef.current.scale.setScalar(scale);
  });

  return <mesh ref={meshRef} geometry={geo} material={mat} />;
}

// ─── Lighting rig (matches hero / orb / stack lights throughout the app) ──────
function VSLights() {
  return (
    <>
      <ambientLight intensity={0.65} color="#f0ecff" />
      <directionalLight position={[-2, 3, 2]} intensity={1.5} color="#e8deff" />
      {/* Warm magenta rim from lower-right — makes the bottom half glow */}
      <pointLight position={[2, -1.5, 1.5]} intensity={0.5} color="#f0abfc" />
    </>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────
export interface VSBadge3DProps {
  /** Canvas + container size in px (square) */
  size?: number;
}

export default function VSBadge3D({ size = 72 }: VSBadge3DProps) {
  const fontSize = Math.round(size * 0.26);
  const borderThickness = Math.max(2, Math.round(size * 0.055));

  return (
    <div
      className="relative shrink-0 inline-flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        // White border ring matching the CSS original's border-4 border-white
        boxShadow: [
          `0 0 0 ${borderThickness}px #ffffff`,
          '0 6px 20px rgba(109,40,217,0.35)',
          '0 2px 6px rgba(0,0,0,0.12)',
        ].join(', '),
        overflow: 'hidden',
      }}
      aria-label="VS"
      role="img"
    >
      {/* Three.js canvas */}
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        style={{
          width: size,
          height: size,
          background: 'transparent',
          display: 'block',
        }}
        camera={{ position: [0, 0, 2.5], fov: 44 }}
        aria-hidden="true"
      >
        <VSLights />
        <VSOrb />
      </Canvas>

      {/* "VS" HTML overlay — always front-facing, always legible */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{
          fontFamily: 'var(--font-nunito, system-ui, sans-serif)',
          fontWeight: 900,
          fontSize: fontSize,
          color: '#ffffff',
          letterSpacing: '0.04em',
          // Multi-layer shadow for crisp legibility against the rotating gradient
          textShadow: [
            '0 1px 3px rgba(0,0,0,0.55)',
            '0 0 8px rgba(0,0,0,0.30)',
            '0 -1px 0 rgba(255,255,255,0.10)',
          ].join(', '),
        }}
        aria-hidden="true"
      >
        VS
      </div>
    </div>
  );
}
