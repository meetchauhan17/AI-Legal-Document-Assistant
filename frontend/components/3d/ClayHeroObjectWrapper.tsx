'use client';

/**
 * ClayHeroObjectWrapper.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Lazy-loaded (ssr:false) wrapper for the Three.js ClayHeroObject canvas.
 *
 * Usage in page.tsx:
 *   import ClayHeroObjectWrapper from '@/components/3d/ClayHeroObjectWrapper';
 *   ...
 *   <ClayHeroObjectWrapper />
 *
 * • Renders a CSS fallback gradient blob while Three.js loads
 * • Container is pointer-events-none so CTA buttons are never blocked
 * • onPointerMove on the outer div feeds normalised mouse coords into the
 *   module-level mouseNDC ref used by ClayHeroObject's lerp routine
 * • Respects prefers-reduced-motion: disables all animation classes and
 *   stops feeding mouse updates
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { Suspense, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { mouseNDC } from './ClayHeroObject';
import { use3DPerformance } from '@/lib/use3DPerformance';

// Dynamically import — no SSR, code-split from the main bundle
const ClayHeroObject = dynamic(() => import('./ClayHeroObject'), {
  ssr: false,
  loading: () => <CssFallback />,
});

// ─── CSS-only fallback (shown before Three.js hydrates) ──────────────────────
function CssFallback() {
  return (
    <div
      aria-hidden="true"
      className="w-full h-full flex items-center justify-center"
    >
      <div
        className="w-72 h-72 rounded-full opacity-60 animate-[clay-breathe_4s_ease-in-out_infinite]"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #a78bfa, #6D28D9 55%, #4C1D95)',
          filter: 'blur(2px)',
          boxShadow: '0 8px 48px 8px rgba(109,40,217,0.35)',
        }}
      />
    </div>
  );
}

// ─── Main exported wrapper ────────────────────────────────────────────────────
export default function ClayHeroObjectWrapper() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { shouldRender3D, reducedMotion } = use3DPerformance();

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    },
    [reducedMotion]
  );

  const handlePointerLeave = useCallback(() => {
    mouseNDC.x = 0;
    mouseNDC.y = 0;
  }, []);

  // When capability gate fails: render CSS fallback, don't mount WebGL context
  if (!shouldRender3D) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ zIndex: 0 }}
      >
        <CssFallback />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: 0 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Suspense fallback={<CssFallback />}>
        <ClayHeroObject />
      </Suspense>
    </div>
  );
}
