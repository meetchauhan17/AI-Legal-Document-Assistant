'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Send, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';

export default function ClayTestPage() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [sampleText, setSampleText] = useState('');
  const [sampleDoc, setSampleDoc] = useState('');
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <main className="min-h-screen bg-clay-canvas text-clay-foreground p-6 sm:p-12 max-w-5xl mx-auto pb-24">
      {/* Navigation */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-clay-muted hover:text-clay-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-clay-accent/10 text-clay-accent text-xs font-bold mb-4 shadow-clayCard">
          <Sparkles className="w-3.5 h-3.5" /> High-Fidelity Claymorphism Component Suite
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-clay-foreground tracking-tight mb-3">
          Clay Component Library Isolation Test
        </h1>
        <p className="font-sans text-clay-muted text-base sm:text-lg max-w-2xl leading-relaxed">
          Verifying core UI primitives: <strong>Card</strong> (lift on hover, variants), <strong>Button</strong> (tactile click squish, 4 variants), and <strong>Input / Textarea</strong> (recessed-to-raised focus transformation).
        </p>
      </div>

      {/* SECTION 1: BUTTONS (Testing tactile squish physics & variants) */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-black text-2xl text-clay-foreground">
              1. Clay Buttons & Squish Physics
            </h2>
            <p className="text-xs text-clay-muted mt-1">
              Test: Click each button to observe the tactile squish (<code className="font-mono bg-white/80 px-1 py-0.5 rounded">active:scale-[0.92]</code>) and shadow displacement.
            </p>
          </div>
          <span className="text-xs font-bold bg-white px-3 py-1 rounded-full shadow-clayCard text-clay-accent">
            Clicks: {clickCount}
          </span>
        </div>

        <Card variant="solid" className="p-8">
          <div className="space-y-8">
            {/* 4 Variants */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-clay-muted block mb-3">
                Variants (Default Size: md / h-14)
              </span>
              <div className="flex flex-wrap gap-4 items-center">
                <Button
                  variant="primary"
                  onClick={() => setClickCount((c) => c + 1)}
                  id="test-btn-primary"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Primary Button (Squish Me)
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setClickCount((c) => c + 1)}
                  id="test-btn-secondary"
                >
                  Secondary Button
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setClickCount((c) => c + 1)}
                  id="test-btn-outline"
                >
                  Outline Button
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setClickCount((c) => c + 1)}
                  id="test-btn-ghost"
                >
                  Ghost Button
                </Button>
              </div>
            </div>

            {/* 3 Sizes */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-clay-muted block mb-3">
                Sizes (sm: h-11, md: h-14, lg: h-16)
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm" variant="primary" onClick={() => setClickCount((c) => c + 1)}>
                  Small (h-11)
                </Button>
                <Button size="md" variant="primary" onClick={() => setClickCount((c) => c + 1)}>
                  Medium (h-14)
                </Button>
                <Button size="lg" variant="primary" onClick={() => setClickCount((c) => c + 1)}>
                  Large (h-16)
                </Button>
                <Button size="md" variant="primary" disabled>
                  Disabled State
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* SECTION 2: CARDS (Testing hover lift & variants) */}
      <section className="mb-14">
        <h2 className="font-heading font-black text-2xl text-clay-foreground mb-2">
          2. Clay Cards & Hover Lift Physics
        </h2>
        <p className="text-xs text-clay-muted mb-6">
          Test: Hover over interactive cards to verify smooth upward lift (<code className="font-mono bg-white/80 px-1 py-0.5 rounded">hover:-translate-y-2</code>) and deepened shadow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Variant Glass + Interactive */}
          <Card
            variant="glass"
            interactive
            id="test-card-glass"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-clay-accent/15 flex items-center justify-center text-clay-accent shadow-clayPressed">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-clay-accent uppercase tracking-wider">
                  Interactive
                </span>
                <h3 className="font-heading font-bold text-lg text-clay-foreground">
                  Glass Card (Hover Me)
                </h3>
              </div>
            </div>
            <p className="font-sans text-xs text-clay-muted leading-relaxed mb-4">
              Features <code className="bg-white/80 px-1 py-0.5 rounded">bg-white/60 backdrop-blur-xl</code> with smooth 500ms hover lift and deepened shadow.
            </p>
            <span className="mt-auto text-[11px] font-bold text-clay-accent flex items-center gap-1">
              Lifts on hover &rarr;
            </span>
          </Card>

          {/* Card: Variant Solid + Interactive */}
          <Card
            variant="solid"
            interactive
            id="test-card-solid"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-clay-tertiary/15 flex items-center justify-center text-clay-tertiary shadow-clayPressed">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-clay-tertiary uppercase tracking-wider">
                  Interactive
                </span>
                <h3 className="font-heading font-bold text-lg text-clay-foreground">
                  Solid Card (Hover Me)
                </h3>
              </div>
            </div>
            <p className="font-sans text-xs text-clay-muted leading-relaxed mb-4">
              Features pure <code className="bg-slate-100 px-1 py-0.5 rounded">bg-white</code> with 4-layer clay shadow stack and interactive physics.
            </p>
            <span className="mt-auto text-[11px] font-bold text-clay-tertiary flex items-center gap-1">
              Lifts on hover &rarr;
            </span>
          </Card>

          {/* Card: Static (Non-interactive) */}
          <Card
            variant="glass"
            interactive={false}
            id="test-card-static"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-clay-success/15 flex items-center justify-center text-clay-success shadow-clayPressed">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-clay-success uppercase tracking-wider">
                  Static
                </span>
                <h3 className="font-heading font-bold text-lg text-clay-foreground">
                  Static Baseline Card
                </h3>
              </div>
            </div>
            <p className="font-sans text-xs text-clay-muted leading-relaxed">
              Standard non-interactive card. Preserves tactile clay elevation without hover displacement.
            </p>
          </Card>
        </div>

        {/* Hero Card Variant */}
        <div className="mt-6">
          <Card variant="hero" interactive id="test-card-hero">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-clay-accent uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Hero Bento Card
                </span>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-clay-foreground mb-2">
                  Variant: &quot;hero&quot; with Enhanced Padding
                </h3>
                <p className="font-sans text-sm text-clay-muted max-w-xl">
                  Designed for high-impact bento grids and feature announcements. Features extra generous padding and responsive clay layout.
                </p>
              </div>
              <Button variant="primary" size="lg" className="shrink-0">
                Hero Action
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* SECTION 3: INPUT & TEXTAREA (Testing concave-to-raised focus transformation) */}
      <section>
        <h2 className="font-heading font-black text-2xl text-clay-foreground mb-2">
          3. Clay Input & Textarea
        </h2>
        <p className="text-xs text-clay-muted mb-6">
          Test: Focus each input to verify transformation from recessed concave look (<code className="font-mono bg-white/80 px-1 py-0.5 rounded">bg-[#EFEBF5] shadow-clayPressed</code>) to raised-white (<code className="font-mono bg-white/80 px-1 py-0.5 rounded">focus:bg-white focus:ring-4</code>).
        </p>

        <Card variant="solid" className="p-8">
          <div className="space-y-6 max-w-2xl">
            {/* Input Component */}
            <div>
              <label
                htmlFor="test-clay-input"
                className="block text-xs font-bold uppercase tracking-wider text-clay-muted mb-2"
              >
                Document Question Input (h-16)
              </label>
              <div className="flex gap-3">
                <Input
                  id="test-clay-input"
                  placeholder="e.g. What is the deposit refund timeline? (Click to focus)"
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                />
                <Button variant="primary" size="md" className="shrink-0 h-16 w-16 p-0 rounded-2xl">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <span className="text-[11px] text-clay-muted mt-1 block">
                Notice how the input transforms from concave recessed clay to crisp raised-white when active.
              </span>
            </div>

            {/* Textarea Component */}
            <div>
              <label
                htmlFor="test-clay-textarea"
                className="block text-xs font-bold uppercase tracking-wider text-clay-muted mb-2"
              >
                Contract Textarea (Multi-line)
              </label>
              <Textarea
                id="test-clay-textarea"
                placeholder="Paste contract clauses here... (Click to focus and watch it pop into raised-white)"
                rows={4}
                value={sampleDoc}
                onChange={(e) => setSampleDoc(e.target.value)}
              />
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
