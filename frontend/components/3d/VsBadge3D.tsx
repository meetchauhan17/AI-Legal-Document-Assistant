'use client';

import React from 'react';

/**
 * Tactile Claymorphism VS Badge.
 * Features dual interlocking clay spheres with 4-layer box shadows and soft floating animations.
 */
export default function VsBadge3D({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} aria-hidden="true">
      {/* Circle A - Clay Accent Purple */}
      <div className="absolute -left-3.5 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-clay-accent shadowClayButton flex items-center justify-center text-white text-xs font-black animate-clay-float">
        A
      </div>

      {/* Circle B - Clay Accent Alt Pink */}
      <div className="absolute -right-3.5 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-clay-accent-alt shadowClayButton flex items-center justify-center text-white text-xs font-black animate-clay-float-delayed animation-delay-2000">
        B
      </div>

      {/* Central Interlocking VS Badge */}
      <div className="relative z-10 w-11 h-11 rounded-full bg-white shadowDeepClay border-2 border-white flex items-center justify-center font-heading font-black text-xs text-clay-foreground">
        VS
      </div>
    </div>
  );
}
