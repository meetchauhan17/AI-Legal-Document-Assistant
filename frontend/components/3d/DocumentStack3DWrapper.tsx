'use client';

/**
 * DocumentStack3DWrapper.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Lazy-loaded wrapper for DocumentStack3D.
 *
 * • Uses next/dynamic (ssr:false) — Three.js never runs on the server
 * • Shows the original CSS PaperStackDecoration as the fallback while loading
 * • Tracks window scroll position and feeds a normalised 0-1 value into the
 *   3D scene so the stack rotates subtly with scroll
 * • Hidden on mobile (< 768px) — shows CSS fallback instead — so there's
 *   no Three.js overhead on phones/tablets
 * • Respects prefers-reduced-motion: shows CSS fallback, no animation
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { use3DPerformance } from '@/lib/use3DPerformance';

// ─── Lazy import (no SSR) ─────────────────────────────────────────────────────
const DocumentStack3D = dynamic(() => import('./DocumentStack3D'), {
  ssr: false,
  loading: () => <CssPaperStack />,
});

// ─── CSS Fallback: the original Prompt-H paper-stack decoration ───────────────
// Kept here as the loading placeholder AND the mobile/reduced-motion fallback
export function CssPaperStack() {
  return (
    <div
      className="relative w-28 h-24 mx-auto mb-3 flex items-center justify-center filter drop-shadow-[0_12px_28px_rgba(124,58,237,0.14)]"
      aria-hidden="true"
    >
      {/* Layer 3: Back Paper */}
      <div className="absolute w-20 h-24 bg-violet-100/90 rounded-[14px] shadow-sm border border-violet-200/70 transform rotate-8 translate-x-2.5 -translate-y-1 z-0" />
      {/* Layer 2: Middle Paper */}
      <div className="absolute w-20 h-24 bg-slate-50 rounded-[14px] shadow-sm border border-slate-200/80 transform -rotate-4 -translate-x-2 translate-y-0.5 z-10" />
      {/* Layer 1: Front Paper */}
      <div className="relative w-20 h-24 bg-white rounded-[14px] shadow-md border border-slate-200/90 p-2.5 flex flex-col justify-between z-20">
        <div className="w-9 h-2 rounded-sm bg-gradient-to-r from-violet-600 to-indigo-600 shadow-sm" />
        <div className="space-y-1.5 my-1">
          <div className="w-full h-1 bg-slate-300 rounded-full" />
          <div className="w-3/4 h-1 bg-slate-300 rounded-full" />
          <div className="w-5/6 h-1 bg-slate-300 rounded-full" />
          <div className="w-2/3 h-1 bg-slate-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <div className="w-5 h-0.5 bg-violet-300 rounded-full" />
          <div className="w-4 h-4 rounded-full bg-violet-100 border border-violet-300 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-violet-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scroll-normalised hook ───────────────────────────────────────────────────
// Returns 0 at top of page, 1 when scrolled to bottom
function useNormalisedScroll(maxScroll = 600): number {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(Math.min(window.scrollY / maxScroll, 1));
    };
    // Passive listener for scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [maxScroll]);

  return scrollY;
}

// ─── Main exported wrapper ────────────────────────────────────────────────────
export default function DocumentStack3DWrapper() {
  const scrollY = useNormalisedScroll(500);
  // Shared performance gate: returns false on mobile UA, low CPU, narrow
  // viewport, reduced-motion, or low device memory
  const { shouldRender3D } = use3DPerformance();

  if (!shouldRender3D) {
    return <CssPaperStack />;
  }

  return (
    <div
      className="mx-auto mb-2 flex items-center justify-center filter drop-shadow-[0_16px_36px_rgba(124,58,237,0.12)]"
      style={{ width: 180, height: 180 }}
      aria-hidden="true"
    >
      <DocumentStack3D scrollY={scrollY} size={180} />
    </div>
  );
}
