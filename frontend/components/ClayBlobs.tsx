'use client';

import React from 'react';

/**
 * ClayBlobs: Ambient background component for the High-Fidelity Claymorphism design system.
 * Fixed, full-screen, pointer-events-none container with large blurred circles in clay accent colors
 * at 10% opacity, positioned with negative margins bleeding off screen edges, animated with
 * clay-float, clay-float-delayed, and staggered animation-delay classes.
 */
export default function ClayBlobs() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 [contain:strict]"
      aria-hidden="true"
    >
      {/* Blob 1: Clay Accent (#6D28D9) - Top Left Bleed */}
      <div
        className="absolute -top-24 -left-24 h-[55vh] w-[55vh] rounded-full blur-2xl sm:blur-3xl bg-clay-accent/10 animate-clay-float will-change-transform transform-gpu"
      />

      {/* Blob 2: Clay Accent Alt (#C026D3) - Bottom Right Bleed */}
      <div
        className="absolute -bottom-28 -right-28 h-[55vh] w-[55vh] rounded-full blur-2xl sm:blur-3xl bg-clay-accent-alt/10 animate-clay-float-delayed animation-delay-2000 will-change-transform transform-gpu"
      />

      {/* Blob 3: Clay Tertiary (#0EA5E9) - Mid Right Bleed */}
      <div
        className="absolute top-1/3 -right-24 h-[50vh] w-[50vh] rounded-full blur-2xl sm:blur-3xl bg-clay-tertiary/10 animate-clay-float-slow animation-delay-4000 will-change-transform transform-gpu"
      />

      {/* Blob 4: Clay Warning (#F59E0B) - Bottom Left Bleed */}
      <div
        className="absolute -bottom-20 left-1/4 h-[45vh] w-[45vh] rounded-full blur-2xl sm:blur-3xl bg-clay-warning/10 animate-clay-breathe will-change-transform transform-gpu"
      />
    </div>
  );
}
