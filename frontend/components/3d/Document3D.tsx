'use client';

import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';

/**
 * Tactile Claymorphism Document visual element.
 * Achieves depth through 4-layer box shadows and soft clay curvatures rather than 3D WebGL canvases.
 */
export default function Document3D({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center p-6 ${className}`} aria-hidden="true">
      {/* Background layered angled clay page */}
      <div className="absolute w-44 h-56 bg-white/70 rounded-[32px] shadowDeepClay rotate-6 scale-95 border border-white/80" />

      {/* Main Front Layer Clay Document */}
      <div className="relative w-48 h-60 bg-clay-cardBg rounded-[32px] shadowDeepClay p-5 flex flex-col justify-between border border-white/90 animate-clay-float">
        <div>
          {/* Header Accent Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-2xl bg-clay-accent/15 flex items-center justify-center text-clay-accent shadowClayPressed">
              <FileText className="w-5 h-5" />
            </div>
            <div className="h-2.5 w-16 rounded-full bg-clay-accent/25" />
          </div>

          {/* Skeleton lines representing legal clauses */}
          <div className="space-y-2.5 mt-2">
            <div className="h-2.5 w-full rounded-full bg-slate-200/80" />
            <div className="h-2.5 w-5/6 rounded-full bg-slate-200/70" />
            <div className="h-2.5 w-4/6 rounded-full bg-slate-200/60" />
            <div className="h-2.5 w-3/4 rounded-full bg-slate-200/50" />
          </div>
        </div>

        {/* Golden Seal Badge */}
        <div className="self-end flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-clay-warning to-amber-500 text-white shadowClayButton text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>VERIFIED</span>
        </div>
      </div>
    </div>
  );
}
