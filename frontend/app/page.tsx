'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ClayBlobs from '@/components/ClayBlobs';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  FileText,
  ShieldAlert,
  MessageSquareText,
  Scale,
  CheckSquare,
  ArrowRight,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

// Motion variants for entrance animations
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Home() {
  return (
    <main className="relative min-h-screen bg-clay-canvas text-clay-foreground overflow-x-hidden selection:bg-clay-accent/20 selection:text-clay-accent">
      {/* ── 1. AMBIENT BACKGROUND BLOBS ──────────────────────────────── */}
      <ClayBlobs />

      {/* ── 2. HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 pt-16 pb-20 text-center clay-grain overflow-hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl mx-auto flex flex-col items-center"
        >
          {/* Eyebrow badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur-md shadow-clayCard border border-white text-xs font-bold text-clay-accent font-heading">
              <Sparkles className="w-3.5 h-3.5 text-clay-accent" />
              High-Fidelity AI Legal Document Intelligence
            </div>
          </motion.div>

          {/* Large Headline with Nunito Font-Black & Clay Text Gradient */}
          <motion.h1
            variants={itemVariants}
            className="font-heading font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] text-clay-foreground mb-6"
          >
            Understand any legal document{' '}
            <span className="bg-gradient-to-r from-clay-foreground via-clay-accent to-clay-accent-alt bg-clip-text text-transparent">
              in plain language
            </span>
            {' '}— instantly.
          </motion.h1>

          {/* Subheading in DM Sans, text-lg, text-clay-muted, max-w-2xl */}
          <motion.p
            variants={itemVariants}
            className="font-sans text-lg sm:text-xl text-clay-muted max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Upload a contract, lease, or agreement. Get a plain-English summary, one-sided risk flags,
            clause-by-clause analysis, and a pre-signing checklist — in seconds.
          </motion.p>

          {/* Two CTA Buttons: Stacked vertically on mobile, horizontal on desktop */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-6 sm:flex-row justify-center items-center w-full sm:w-auto"
          >
            <Link href="/analyze" id="cta-analyze" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-clayButton">
                Analyze a Document
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Link href="/compare" id="cta-compare" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto shadow-clayCard bg-white/60 backdrop-blur-md">
                <Scale className="w-5 h-5 mr-2" />
                Compare Two Documents
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Explore cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-16 flex flex-col items-center gap-1.5 text-clay-foreground"
          aria-hidden="true"
        >
          <span className="text-xs font-bold tracking-widest uppercase font-heading">Explore Capabilities</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-4 h-4"
          >
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ── 3. FEATURE SECTION AS A BENTO GRID ──────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24" aria-labelledby="features-heading">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold text-clay-accent bg-clay-accent/10 mb-3 shadow-clayPressed font-heading">
            <Layers className="w-3.5 h-3.5" />
            All-In-One Legal Intelligence
          </span>
          <h2
            id="features-heading"
            className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-clay-foreground tracking-tight mb-3"
          >
            Everything you need before you sign
          </h2>
          <p className="font-sans text-base sm:text-lg text-clay-muted max-w-xl mx-auto">
            Five specialized legal AI engines, grounded strictly in your document&apos;s actual text with zero permanent storage.
          </p>
        </motion.div>

        {/* Bento Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* CARD 1 (HERO BENTO CARD): "Simplify Documents" - INDIGO PALETTE */}
          <div className="md:col-span-2 md:row-span-2">
            <Card
              variant="hero"
              interactive
              id="feature-simplify-hero"
              className="h-full hover:scale-[1.02] transition-all duration-500 flex flex-col justify-between"
            >
              <div>
                {/* Header row with gradient icon orb */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-[#4338CA] to-[#6366F1] flex items-center justify-center text-white shadow-clayButton shrink-0">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 font-heading">
                        Core Feature
                      </span>
                      <h3 className="font-heading font-black text-2xl sm:text-3xl text-clay-foreground mt-1">
                        Plain-Language Simplification
                      </h3>
                    </div>
                  </div>

                  <Link href="/analyze" className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-clay-accent hover:text-clay-accent-alt font-heading">
                    Try Now <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <p className="font-sans text-base text-clay-muted leading-relaxed mb-6">
                  Translates dense, convoluted legal agreements into clear, structured plain language.
                  Preserves every substantive financial obligation, deadline, and dollar amount while discarding archaic legal traps.
                </p>

                {/* Tactile Side-by-Side Example Preview inside the Bento Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                  {/* Before: Complex Legalese */}
                  <div className="p-4 rounded-2xl bg-[#EFEBF5] shadow-clayPressed border border-white/60">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-red-500 font-heading">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Archaic Contract Clause
                    </div>
                    <p className="font-mono text-xs text-clay-foreground leading-relaxed italic">
                      &quot;In the event of Lessee&apos;s failure to tender full remittance on or before the designated inception calendar date, Lessor retains sole, absolute, unilateral discretion to declare forfeiture...&quot;
                    </p>
                  </div>

                  {/* After: Plain Language Translation */}
                  <div className="p-4 rounded-2xl bg-white shadow-clayCard border border-white">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-600 font-heading">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Plain-Language Summary
                    </div>
                    <p className="font-sans text-xs text-clay-foreground font-medium leading-relaxed">
                      &quot;Pay rent by the 1st of each month. A $50 late charge applies after the 3-day grace period, but the landlord cannot seize your deposit without written notice.&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Feature Tags & Action */}
              <div className="pt-6 mt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-clay-foreground">
                  <span className="px-3 py-1 rounded-full bg-white shadow-clayCard">PDF & Text Input</span>
                  <span className="px-3 py-1 rounded-full bg-white shadow-clayCard">English · हिन्दी · ગુજરાતી</span>
                  <span className="px-3 py-1 rounded-full bg-white shadow-clayCard">5-8 Takeaway Bullets</span>
                </div>
                <Link href="/analyze">
                  <Button variant="primary" size="sm">
                    Analyze Document &rarr;
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* CARD 2: "Risk Detection" - CORAL PALETTE */}
          <Card
            variant="glass"
            interactive
            id="feature-risk"
            className="flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center text-white shadow-clayButton mb-5">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800 font-heading bg-orange-100 px-2.5 py-0.5 rounded-full inline-block">
                Safety First
              </span>
              <h3 className="font-heading font-black text-xl text-clay-foreground mt-2 mb-2">
                Clause Risk Classification
              </h3>
              <p className="font-sans text-sm text-clay-muted leading-relaxed">
                Flags one-sided clauses as Standard, Attention, or Risk. Highlights auto-renewal traps, unilateral forfeiture, and unreasonable waivers with objective explanations.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold font-heading text-orange-800">
              <span>View Sample Risks</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Card>

          {/* CARD 3: "Ask Questions" - VIOLET / MAGENTA PALETTE */}
          <Card
            variant="glass"
            interactive
            id="feature-qa"
            className="flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#C026D3] flex items-center justify-center text-white shadow-clayButton mb-5">
                <MessageSquareText className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 font-heading bg-purple-100 px-2.5 py-0.5 rounded-full inline-block">
                Grounded Q&amp;A
              </span>
              <h3 className="font-heading font-black text-xl text-clay-foreground mt-2 mb-2">
                Ask Document Questions
              </h3>
              <p className="font-sans text-sm text-clay-muted leading-relaxed">
                Ask specific questions about your agreement. Retrieves source excerpts and refuses to hallucinate if terms are omitted from the text.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold font-heading text-purple-800">
              <span>Try In-Scope Q&amp;A</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Card>

          {/* CARD 4: "Compare Documents" - TEAL PALETTE */}
          <Card
            variant="glass"
            interactive
            id="feature-compare"
            className="flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#14B8A6] flex items-center justify-center text-white shadow-clayButton mb-5">
                <Scale className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 font-heading bg-teal-100 px-2.5 py-0.5 rounded-full inline-block">
                Side-by-Side
              </span>
              <h3 className="font-heading font-black text-xl text-clay-foreground mt-2 mb-2">
                Compare Two Contracts
              </h3>
              <p className="font-sans text-sm text-clay-muted leading-relaxed">
                Compare competing lease proposals or vendor contracts side-by-side with automated favorability verdicts per clause.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold font-heading text-teal-800">
              <Link href="/compare" className="flex items-center justify-between w-full">
                <span>Compare Contracts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>

          {/* CARD 5: "Checklist & Lawyer Prep" - EMERALD PALETTE */}
          <Card
            variant="glass"
            interactive
            id="feature-checklist"
            className="flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white shadow-clayButton mb-5">
                <CheckSquare className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 font-heading bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                Action Plan
              </span>
              <h3 className="font-heading font-black text-xl text-clay-foreground mt-2 mb-2">
                Pre-Signing Checklist
              </h3>
              <p className="font-sans text-sm text-clay-muted leading-relaxed">
                Generates actionable items referencing actual clauses, plus tailored questions to ask the counterparty or your lawyer before signing.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold font-heading text-emerald-800">
              <Link href="/checklist" className="flex items-center justify-between w-full">
                <span>View Checklist</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>

        </div>
      </section>

      {/* ── 4. DISCLAIMER SECTION (Dedicated Glass Card Component) ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <Card variant="glass" className="p-8 sm:p-10 border border-amber-200/80 bg-white/70">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-clayButton">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-clay-foreground mb-1">
                Legal Disclaimer &amp; Purpose
              </h3>
              <p className="font-sans text-sm sm:text-base text-clay-muted leading-relaxed">
                This tool provides information and assistance to help you understand documents —{' '}
                <strong className="text-clay-foreground font-semibold">it does not replace professional legal advice.</strong>{' '}
                Our analysis is informational only, uses non-verdict explanations, and helps you prepare for meaningful consultations with qualified attorneys.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ── 5. PERSISTENT FOOTER ────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-200/60 bg-white/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-clay-foreground">
          <p className="font-sans">
            AI Legal Document Assistant — Built with High-Fidelity Claymorphism
          </p>
          <p className="flex items-center gap-2 font-medium">
            <Scale className="w-3.5 h-3.5 text-clay-accent" />
            <span>Zero Data Persistence · In-Memory Privacy</span>
          </p>
        </div>
      </footer>
    </main>
  );
}
