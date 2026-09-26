'use client';

/**
 * IconOrbWrapper.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop-in replacement for the flat gradient icon circles in the bento grid.
 *
 * Renders:
 *  • DESKTOP (≥ 768px): Lazy-loaded 3D clay orb (IconOrb3D) beneath a 2D
 *    Lucide icon overlay, so we get the premium 3D feel without losing the
 *    recognisable icon.
 *  • MOBILE (< 768px): The original flat gradient circle — no Three.js, no
 *    GPU overhead, identical visual to the previous implementation.
 *
 * The `isHovered` state is tracked internally via onMouseEnter/Leave so the
 * parent Card doesn't need to be refactored — this is fully self-contained.
 *
 * Usage:
 *   <IconOrbWrapper
 *     color="#F97316"          // orb sphere colour
 *     gradientFrom="#F97316"   // fallback 2D gradient start
 *     gradientTo="#FB923C"     // fallback 2D gradient end
 *     size={56}                // total orb area in px
 *     icon={<ShieldAlert className="w-7 h-7" />}
 *   />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { use3DPerformance } from '@/lib/use3DPerformance';

// Lazily import the Three.js canvas — SSR disabled, code-split
const IconOrb3D = dynamic(() => import('./IconOrb3D'), {
  ssr: false,
  loading: () => null, // nothing while loading; the 2D fallback is already showing
});

// ─── Props ─────────────────────────────────────────────────────────────────────
export interface IconOrbWrapperProps {
  /** 3D sphere color */
  color: string;
  /** 2D fallback gradient start color */
  gradientFrom: string;
  /** 2D fallback gradient end color */
  gradientTo: string;
  /** Lucide icon element to render as overlay */
  icon: React.ReactNode;
  /** Orb container size in px (applied to both 2D and 3D) */
  size?: number;
  /** Additional class names for the outer wrapper */
  className?: string;
}

// ─── 2D Fallback (mobile + SSR) ──────────────────────────────────────────────
function FlatOrb({
  gradientFrom,
  gradientTo,
  icon,
  size,
}: {
  gradientFrom: string;
  gradientTo: string;
  icon: React.ReactNode;
  size: number;
}) {
  return (
    <div
      className="rounded-[22px] flex items-center justify-center text-white shadow-clayButton shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      {icon}
    </div>
  );
}

// ─── Main exported wrapper ────────────────────────────────────────────────────
export default function IconOrbWrapper({
  color,
  gradientFrom,
  gradientTo,
  icon,
  size = 56,
  className = '',
}: IconOrbWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Single shared hook — covers mobile UA, viewport width, CPU cores,
  // device memory, and prefers-reduced-motion in one call
  const { shouldRender3D } = use3DPerformance();

  const handleEnter = useCallback(() => setIsHovered(true), []);
  const handleLeave = useCallback(() => setIsHovered(false), []);

  // On low-capability devices: render the flat 2D orb
  if (!shouldRender3D) {
    return (
      <div className={`shrink-0 ${className}`}>
        <FlatOrb
          gradientFrom={gradientFrom}
          gradientTo={gradientTo}
          icon={icon}
          size={size}
        />
      </div>
    );
  }

  // Desktop: 3D orb with 2D icon overlay
  return (
    <div
      ref={wrapperRef}
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* 3D canvas layer */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: 22,
          overflow: 'hidden',
          // Subtle shadow matching clay convex button feel
          boxShadow:
            '0 4px 14px rgba(0,0,0,0.13), 0 1px 3px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.25)',
        }}
      >
        <IconOrb3D
          color={color}
          isHovered={isHovered}
          size={size}
        />
      </div>

      {/* 2D icon overlay — centered absolutely on top of the canvas */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          // White icon drop-shadow for legibility against any orb colour
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
          color: '#ffffff',
          // Smooth scale on hover mirroring the orb's 1.08 scale
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 300ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {icon}
      </div>
    </div>
  );
}
