'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Check, Heart, Shield } from 'lucide-react';

export default function ClayTestPage() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <main className="min-h-screen bg-clay-canvas text-clay-foreground p-6 sm:p-12 max-w-5xl mx-auto">
      {/* Navigation */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-clay-muted hover:text-clay-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Header with Nunito font */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-clay-accent/10 text-clay-accent text-xs font-bold mb-4 shadowClayCard">
          <Sparkles className="w-3.5 h-3.5" /> High-Fidelity Claymorphism Design System
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-clay-foreground tracking-tight mb-3">
          Clay Design System Verification
        </h1>
        <p className="font-sans text-clay-muted text-base sm:text-lg max-w-2xl leading-relaxed">
          Verifying canvas background color (<span className="font-mono text-xs bg-white px-2 py-0.5 rounded-md shadowClayPressed">#F4F1FA</span>),
          Google Fonts (<strong>Nunito</strong> for headings, <strong>DM Sans</strong> for body),
          multi-layer clay shadows, keyframe animations, and reduced-motion accessibility.
        </p>
      </div>

      {/* Reduced Motion Status Banner */}
      <div className="mb-10 p-5 rounded-[24px] bg-white border border-white/80 shadowClayCard flex items-center justify-between">
        <div>
          <h3 className="font-heading font-bold text-sm text-clay-foreground">
            Accessibility: prefers-reduced-motion
          </h3>
          <p className="font-sans text-xs text-clay-muted mt-0.5">
            {reducedMotion
              ? 'Reduced motion is ACTIVE — all clay floating animations are safely disabled.'
              : 'Reduced motion is INACTIVE — smooth clay floating and breathing animations are enabled.'}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            reducedMotion
              ? 'bg-clay-warning/15 text-clay-warning'
              : 'bg-clay-success/15 text-clay-success'
          }`}
        >
          {reducedMotion ? 'Reduced Motion: ON' : 'Animations: RUNNING'}
        </span>
      </div>

      {/* 5 Multi-Layer Clay Shadows Showcase */}
      <section className="mb-12">
        <h2 className="font-heading font-extrabold text-2xl mb-6 text-clay-foreground">
          Tactile 4-Layer Clay Box Shadows
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. shadowDeepClay */}
          <div className="p-6 rounded-[32px] bg-clay-cardBg shadowDeepClay border border-white flex flex-col justify-between h-48 animate-clay-float">
            <div>
              <span className="text-[11px] font-mono font-bold text-clay-accent uppercase tracking-wider">
                Elevation 1
              </span>
              <h3 className="font-heading font-bold text-lg text-clay-foreground mt-1">
                shadowDeepClay
              </h3>
              <p className="font-sans text-xs text-clay-muted mt-2">
                4-layer stack: outer drop shadow, top-left highlight, inner purple reflection, inner rim light.
              </p>
            </div>
            <div className="h-2 w-16 rounded-full bg-clay-accent/30" />
          </div>

          {/* 2. shadowClayCard */}
          <div className="p-6 rounded-[28px] bg-clay-cardBg shadowClayCard border border-white flex flex-col justify-between h-48 animate-clay-float-delayed animation-delay-2000">
            <div>
              <span className="text-[11px] font-mono font-bold text-clay-tertiary uppercase tracking-wider">
                Elevation 2
              </span>
              <h3 className="font-heading font-bold text-lg text-clay-foreground mt-1">
                shadowClayCard
              </h3>
              <p className="font-sans text-xs text-clay-muted mt-2">
                Soft pillow card elevation used for primary content containers and clause matrices.
              </p>
            </div>
            <div className="h-2 w-16 rounded-full bg-clay-tertiary/30" />
          </div>

          {/* 3. shadowClayButton */}
          <div className="p-6 rounded-[24px] bg-clay-cardBg shadowClayCard border border-white flex flex-col justify-between h-48 animate-clay-float-slow animation-delay-4000">
            <div>
              <span className="text-[11px] font-mono font-bold text-clay-accent-alt uppercase tracking-wider">
                Action Element
              </span>
              <h3 className="font-heading font-bold text-lg text-clay-foreground mt-1">
                shadowClayButton
              </h3>
              <p className="font-sans text-xs text-clay-muted mt-2">
                Inflated tactile button shadow with outer glow and crisp top-edge highlight.
              </p>
            </div>
            <button
              type="button"
              className="self-start px-4 py-2 rounded-[20px] bg-clay-accent text-white font-heading font-bold text-xs shadowClayButton hover:shadowClayButtonHover active:shadowClayPressed transition-all"
            >
              Interactive Button
            </button>
          </div>

          {/* 4. shadowClayButtonHover */}
          <div className="p-6 rounded-[24px] bg-clay-cardBg shadowClayCard border border-white flex flex-col justify-between h-48">
            <div>
              <span className="text-[11px] font-mono font-bold text-clay-success uppercase tracking-wider">
                Hover State
              </span>
              <h3 className="font-heading font-bold text-lg text-clay-foreground mt-1">
                shadowClayButtonHover
              </h3>
              <p className="font-sans text-xs text-clay-muted mt-2">
                Higher displacement drop shadow with intensified highlight for hovered controls.
              </p>
            </div>
            <div className="px-4 py-2 rounded-[20px] bg-clay-accent-alt text-white font-heading font-bold text-xs shadowClayButtonHover text-center w-max">
              Hovered Effect
            </div>
          </div>

          {/* 5. shadowClayPressed */}
          <div className="p-6 rounded-[24px] bg-clay-cardBg shadowClayCard border border-white flex flex-col justify-between h-48">
            <div>
              <span className="text-[11px] font-mono font-bold text-clay-warning uppercase tracking-wider">
                Pressed State
              </span>
              <h3 className="font-heading font-bold text-lg text-clay-foreground mt-1">
                shadowClayPressed
              </h3>
              <p className="font-sans text-xs text-clay-muted mt-2">
                Depressed inner bevel shadow simulating tactile finger press into soft clay.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setButtonPressed(!buttonPressed)}
              className={`px-4 py-2 rounded-[20px] font-heading font-bold text-xs transition-all ${
                buttonPressed
                  ? 'bg-slate-100 text-clay-foreground shadowClayPressed'
                  : 'bg-clay-tertiary text-white shadowClayButton'
              }`}
            >
              {buttonPressed ? 'Pressed In!' : 'Click to Press'}
            </button>
          </div>

          {/* Color Tokens Palette */}
          <div className="p-6 rounded-[24px] bg-clay-cardBg shadowClayCard border border-white flex flex-col justify-between h-48">
            <div>
              <span className="text-[11px] font-mono font-bold text-clay-muted uppercase tracking-wider">
                Palette Tokens
              </span>
              <h3 className="font-heading font-bold text-lg text-clay-foreground mt-1">
                Clay Colors
              </h3>
              <div className="flex gap-2 mt-3">
                <div className="w-7 h-7 rounded-full bg-clay-accent shadowClayPressed" title="clay-accent" />
                <div className="w-7 h-7 rounded-full bg-clay-accent-alt shadowClayPressed" title="clay-accent-alt" />
                <div className="w-7 h-7 rounded-full bg-clay-tertiary shadowClayPressed" title="clay-tertiary" />
                <div className="w-7 h-7 rounded-full bg-clay-success shadowClayPressed" title="clay-success" />
                <div className="w-7 h-7 rounded-full bg-clay-warning shadowClayPressed" title="clay-warning" />
              </div>
            </div>
            <span className="text-[11px] text-clay-muted">Hex validated & verified</span>
          </div>
        </div>
      </section>

      {/* Typography Validation Section */}
      <section className="p-8 rounded-[32px] bg-white border border-white/80 shadowDeepClay mb-12">
        <h2 className="font-heading font-black text-2xl text-clay-foreground mb-4">
          Typography Hierarchy (Nunito & DM Sans)
        </h2>
        <div className="space-y-4">
          <div>
            <span className="text-xs font-mono text-clay-muted">Nunito Weight 900 (Black):</span>
            <p className="font-heading font-black text-3xl text-clay-foreground">
              Empowering Legal Clarity for Everyone
            </p>
          </div>
          <div>
            <span className="text-xs font-mono text-clay-muted">Nunito Weight 800 (ExtraBold):</span>
            <p className="font-heading font-extrabold text-2xl text-clay-foreground">
              Automated Plain-Language Simplification & Risk Matrix
            </p>
          </div>
          <div>
            <span className="text-xs font-mono text-clay-muted">Nunito Weight 700 (Bold):</span>
            <p className="font-heading font-bold text-xl text-clay-foreground">
              Section 4: Limitation of Liability & Grace Periods
            </p>
          </div>
          <div>
            <span className="text-xs font-mono text-clay-muted">DM Sans Weight 400/500/700 (Body):</span>
            <p className="font-sans text-sm sm:text-base text-clay-muted leading-relaxed">
              This document preview demonstrates the clean optical balance between Nunito headings and DM Sans body typography.
              Every contract clause, summary point, and risk explanation is effortlessly readable across all screen sizes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
