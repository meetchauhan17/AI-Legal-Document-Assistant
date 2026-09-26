'use client';

/**
 * use3DPerformance.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared hook that decides whether a page should mount Three.js canvases.
 *
 * Returns `shouldRender3D: boolean` — when false, every 3D component falls
 * back to its static CSS / flat 2D version.
 *
 * Detection criteria (any failing → shouldRender3D = false):
 *
 *  1. prefers-reduced-motion: reduce  → always false (accessibility hard block)
 *  2. Mobile UA heuristic             → false (phones have weaker GPUs / thermals)
 *  3. Low CPU core count              → false if navigator.hardwareConcurrency ≤ 2
 *  4. Small viewport                  → false if width < 768px (matches md breakpoint)
 *  5. Low memory device               → false if deviceMemory ≤ 2 GB (where available)
 *
 * The check runs once on mount. A resize listener updates the viewport gate
 * to handle orientation changes, but the UA/CPU/memory checks are static.
 *
 * Usage:
 *   const { shouldRender3D, reducedMotion } = use3DPerformance();
 *   if (!shouldRender3D) return <CssFallback />;
 *   return <Three3DComponent />;
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';

// Extend Navigator for non-standard properties
declare global {
  interface Navigator {
    deviceMemory?: number;
  }
}

export interface Use3DPerformanceResult {
  /** True when all performance gates pass — safe to mount Three.js canvases */
  shouldRender3D: boolean;
  /** True when the user has prefers-reduced-motion: reduce set */
  reducedMotion: boolean;
  /** True once the client-side checks have completed (avoids SSR mismatch) */
  isReady: boolean;
}

// ─── Mobile user-agent detection ─────────────────────────────────────────────
function isMobileUA(): boolean {
  if (typeof navigator === 'undefined') return true; // SSR safe default
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// ─── Device capability heuristic ─────────────────────────────────────────────
function hasAdequateHardware(): boolean {
  if (typeof navigator === 'undefined') return false;

  // CPU cores: require at least 4 logical cores for smooth 3D
  const cores = navigator.hardwareConcurrency ?? 2;
  if (cores <= 2) return false;

  // RAM: if deviceMemory is available (Chrome only), require > 2 GB
  const mem = navigator.deviceMemory;
  if (mem !== undefined && mem <= 2) return false;

  return true;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function use3DPerformance(): Use3DPerformanceResult {
  // Safe SSR defaults: don't render 3D until we've checked on the client
  const [isReady, setIsReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isWideViewport, setIsWideViewport] = useState(false);

  useEffect(() => {
    // 1. Reduced motion check
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const motionHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', motionHandler);

    // 2. Viewport width check (reactive)
    const checkViewport = () => setIsWideViewport(window.innerWidth >= 768);
    checkViewport();
    window.addEventListener('resize', checkViewport, { passive: true });

    setIsReady(true);

    return () => {
      mq.removeEventListener('change', motionHandler);
      window.removeEventListener('resize', checkViewport);
    };
  }, []);

  const shouldRender3D =
    isReady &&
    !reducedMotion &&
    isWideViewport &&
    !isMobileUA() &&
    hasAdequateHardware();

  return { shouldRender3D, reducedMotion, isReady };
}

export default use3DPerformance;
