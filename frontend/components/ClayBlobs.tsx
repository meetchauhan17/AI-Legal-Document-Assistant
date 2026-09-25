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
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10"
      aria-hidden="true"
    >
      {/* Blob 1: Clay Accent (#6D28D9) - Top Left Bleed */}
      <div
        className="absolute -top-24 -left-24 h-[60vh] w-[60vh] rounded-full blur-3xl bg-clay-accent/10 animate-clay-float"
      />

      {/* Blob 2: Clay Accent Alt (#C026D3) - Bottom Right Bleed */}
      <div
        className="absolute -bottom-28 -right-28 h-[60vh] w-[60vh] rounded-full blur-3xl bg-clay-accent-alt/10 animate-clay-float-delayed animation-delay-2000"
      />

      {/* Blob 3: Clay Tertiary (#0EA5E9) - Mid Right Bleed */}
      <div
        className="absolute top-1/3 -right-24 h-[60vh] w-[60vh] rounded-full blur-3xl bg-clay-tertiary/10 animate-clay-float-slow animation-delay-4000"
      />

      {/* Blob 4: Clay Warning (#F59E0B) - Bottom Left Bleed */}
      <div
        className="absolute -bottom-20 left-1/4 h-[50vh] w-[50vh] rounded-full blur-3xl bg-clay-warning/10 animate-clay-breathe"
      />
    </div>
  );
}
