'use client';

/**
 * VSBadge3DWrapper.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Lazy-loaded drop-in for the VS badge in the Compare page.
 *
 * • next/dynamic (ssr:false) — Three.js never touches the server
 * • CSS fallback shown while loading AND on mobile/reduced-motion
 * • Accepts the same size prop as VSBadge3D for flexible use in both the
 *   desktop (64px) and mobile-inline (56px) badge variants
 *
 * The wrapper only renders the 3D version on desktop (>= 768px).
 * On mobile it always shows the original CSS badge — identical appearance,
 * zero GPU overhead.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import dynamic from 'next/dynamic';
import { use3DPerformance } from '@/lib/use3DPerformance';

// Lazily import — code-split, no SSR
const VSBadge3D = dynamic(() => import('./VSBadge3D'), {
  ssr: false,
  loading: () => <CssVsBadge size={72} />,
});

// ─── CSS Fallback: the original Prompt-F animated VS badge ───────────────────
// Exported so compare/page.tsx can use it inline for the mobile variant
export function CssVsBadge({ size = 64 }: { size?: number }) {
  const borderThickness = Math.max(2, Math.round(size * 0.055));
  const fontSize = Math.round(size * 0.26);

  return (
    <div
      className="rounded-full bg-gradient-to-br from-clay-accent to-clay-accent-alt text-white flex items-center justify-center font-heading font-black tracking-wider shrink-0 transition-transform hover:scale-105"
      style={{
        width: size,
        height: size,
        fontSize: fontSize,
        letterSpacing: '0.06em',
        border: `${borderThickness}px solid white`,
        boxShadow: '0 4px 14px rgba(109,40,217,0.35), 0 1px 4px rgba(0,0,0,0.12)',
      }}
      aria-label="VS"
      role="img"
    >
      VS
    </div>
  );
}

// ─── Main exported wrapper ────────────────────────────────────────────────────
export interface VSBadge3DWrapperProps {
  size?: number;
}

export default function VSBadge3DWrapper({ size = 64 }: VSBadge3DWrapperProps) {
  // Shared performance gate
  const { shouldRender3D } = use3DPerformance();

  if (!shouldRender3D) {
    return <CssVsBadge size={size} />;
  }

  return <VSBadge3D size={size} />;
}
