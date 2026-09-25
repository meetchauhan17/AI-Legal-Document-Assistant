'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import FloatingShapes from '@/components/3d/FloatingShapes';
import {
  FileText,
  ShieldAlert,
  MessageSquare,
  GitCompare,
  ClipboardList,
  ArrowRight,
  Scale,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

// ── Stagger animation variants ──────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Feature card with mouse-tracking 3D tilt ────────────────────────────────

interface FeatureCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  title: string;
  description: string;
  delay?: number;
  accentBar?: string;
}

function FeatureCard({
  icon,
  iconBg,
  iconColor,
  label,
  title,
  description,
  delay = 0,
  accentBar = '#1E3A8A',
}: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Raw mouse position
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Spring-smoothed values for buttery tilt
  const springConfig = { stiffness: 260, damping: 28 };
  const springX = useSpring(rawX, springConfig);
  const springY = useSpring(rawY, springConfig);

  // Map spring values to rotateX / rotateY degrees
  const rotateY = useTransform(springX, [-0.5, 0.5], [-9, 9]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [7, -7]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Normalise cursor position to [-0.5, 0.5]
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <motion.div
      variants={itemVariants}
      custom={delay}
      className="perspective-1000"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
        className="relative bg-white rounded-2xl border border-slate-200/70 p-6 cursor-default
                   shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_2px_8px_-2px_rgba(15,23,42,0.04)]
                   hover:shadow-[0_16px_40px_-8px_rgba(15,23,42,0.12),0_4px_12px_-2px_rgba(15,23,42,0.06)]
                   transition-shadow duration-300 h-full overflow-hidden"
      >
        {/* Coloured top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
          style={{ background: accentBar }}
        />

        {/* Icon badge */}
        <div
          className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4 mt-2`}
        >
          <span className={iconColor}>{icon}</span>
        </div>

        {/* Tiny category label */}
        <p className="text-[10px] font-semibold tracking-widest text-text-secondary uppercase mb-1">
          {label}
        </p>

        <h3 className="text-[15px] font-700 text-text-primary mb-2 leading-snug" style={{ fontWeight: 700 }}>
          {title}
        </h3>
        <p className="text-[13px] text-text-secondary leading-relaxed">{description}</p>

        {/* Subtle inner glint that translates with the tilt */}
        <motion.div
          style={{ translateZ: 12, transformStyle: 'preserve-3d' }}
          className="absolute inset-0 rounded-2xl pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

const FEATURES: FeatureCardProps[] = [
  {
    icon: <FileText className="w-5 h-5" />,
    iconBg: 'bg-blue-50',
    iconColor: 'text-primary',
    label: 'Simplify',
    title: 'Plain-Language Summary',
    description:
      'Converts dense legal text into clear 2–3 paragraph summaries with 5–8 key takeaways, preserving all obligations, deadlines, and dollar amounts.',
    accentBar: 'linear-gradient(90deg,#1E3A8A,#2563EB)',
    delay: 0,
  },
  {
    icon: <ShieldAlert className="w-5 h-5" />,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    label: 'Risk Detection',
    title: 'Clause Risk Classification',
    description:
      'Identifies 10–15 key clauses and flags each as Standard, Attention, or Risk — surfacing auto-renewal traps, unilateral forfeiture, and liability waivers.',
    accentBar: 'linear-gradient(90deg,#EF4444,#F97316)',
    delay: 0.05,
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    label: 'Q&A',
    title: 'Ask Questions',
    description:
      'Ask any question about your document. Retrieves the most relevant excerpts and answers only from the actual text — never from external knowledge.',
    accentBar: 'linear-gradient(90deg,#7C3AED,#8B5CF6)',
    delay: 0.1,
  },
  {
    icon: <GitCompare className="w-5 h-5" />,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    label: 'Compare',
    title: 'Compare Two Documents',
    description:
      'Side-by-side comparison of two contracts — amounts, durations, penalties, and one-sided clauses — with a favorability verdict per dimension.',
    accentBar: 'linear-gradient(90deg,#059669,#10B981)',
    delay: 0.15,
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    iconBg: 'bg-amber-50',
    iconColor: 'text-accent',
    label: 'Checklist',
    title: 'Pre-Signing Checklist',
    description:
      'Generates 5–8 specific actionable items referencing actual document content — section names, dollar amounts, clauses — plus targeted questions to ask before you sign.',
    accentBar: 'linear-gradient(90deg,#D97706,#F59E0B)',
    delay: 0.2,
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background hero-mesh overflow-x-hidden">

      {/* ── SECTION 1: HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-16 pb-24">

        {/* 3D background — low opacity, absolutely positioned, non-interactive */}
        <div className="pointer-events-none absolute inset-0 opacity-75" aria-hidden="true">
          <FloatingShapes />
        </div>

        {/* Soft vignette to ensure text readability over 3D shapes */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(250,250,249,0.85) 100%)',
          }}
        />

        {/* Hero content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          {/* Eyebrow badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-soft text-xs font-semibold text-text-secondary">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              AI-Powered Legal Document Analysis
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-800 text-text-primary leading-[1.1] tracking-tight mb-6"
            style={{ fontWeight: 800 }}
          >
            Understand any legal document{' '}
            <span className="gradient-text">in plain language</span>
            {' '}— instantly.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto mb-8"
          >
            Upload a contract, lease, or agreement. Get a plain-English summary, risk flags, 
            clause-by-clause analysis, and a specific pre-signing checklist — in seconds.
          </motion.p>

          {/* Info card */}
          <motion.div
            variants={itemVariants}
            className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/70 p-5 max-w-2xl mx-auto mb-10
                       shadow-[0_8px_30px_-8px_rgba(15,23,42,0.08)]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-600 text-text-primary text-[13px]" style={{ fontWeight: 600 }}>PDF or Text</p>
                  <p className="text-text-secondary text-[12px]">Upload up to 5 MB or paste your text directly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-left">
                  <p className="font-600 text-text-primary text-[13px]" style={{ fontWeight: 600 }}>Instant Risk Flags</p>
                  <p className="text-text-secondary text-[12px]">One-sided clauses, traps, and penalties highlighted</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Scale className="w-4 h-4 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-600 text-text-primary text-[13px]" style={{ fontWeight: 600 }}>Privacy First</p>
                  <p className="text-text-secondary text-[12px]">Documents never persisted — session memory only</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/analyze"
                id="cta-analyze"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-[15px] text-white
                           bg-gradient-to-r from-primary to-primary-light
                           shadow-[0_4px_20px_-4px_rgba(30,58,138,0.45)]
                           hover:shadow-[0_6px_24px_-4px_rgba(30,58,138,0.55)]
                           transition-shadow duration-200"
              >
                Analyze a Document
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/compare"
                id="cta-compare"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-[15px] text-primary
                           bg-white border border-slate-200 shadow-soft
                           hover:border-primary/30 hover:shadow-[0_4px_16px_-4px_rgba(30,58,138,0.15)]
                           transition-all duration-200"
              >
                <GitCompare className="w-4 h-4" />
                Compare Two Documents
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          aria-hidden="true"
        >
          <span className="text-[11px] font-medium text-text-secondary/60 tracking-widest uppercase">Explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="w-4 h-4 text-text-secondary/40"
          >
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ── SECTION 2: FEATURE CARDS ─────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24" aria-labelledby="features-heading">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <p className="text-[11px] font-semibold tracking-widest text-text-secondary uppercase mb-3">
            Capabilities
          </p>
          <h2
            id="features-heading"
            className="text-2xl sm:text-3xl font-700 text-text-primary mb-3"
            style={{ fontWeight: 700 }}
          >
            Everything you need before you sign
          </h2>
          <p className="text-text-secondary text-[15px] max-w-xl mx-auto">
            Five specialised AI tools, each grounded strictly in your document's actual text.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </motion.div>

        {/* Second CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mt-12"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/analyze"
              id="cta-analyze-2"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white
                         bg-gradient-to-r from-primary to-primary-light
                         shadow-[0_4px_20px_-4px_rgba(30,58,138,0.4)]
                         hover:shadow-[0_6px_24px_-4px_rgba(30,58,138,0.5)]
                         transition-shadow duration-200"
            >
              Get Started — Analyze a Document
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/compare"
              id="cta-compare-2"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-primary
                         bg-white border border-slate-200 shadow-soft
                         hover:border-primary/30
                         transition-all duration-200"
            >
              <GitCompare className="w-4 h-4" />
              Compare Two Documents
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── SECTION 3: DISCLAIMER ────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl border border-amber-200/80 bg-amber-50/60 p-6 overflow-hidden"
        >
          {/* Accent left strip */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-accent-light rounded-l-2xl" />

          <div className="flex items-start gap-4 pl-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-[14px] font-700 text-amber-900 mb-1" style={{ fontWeight: 700 }}>
                Important Disclaimer
              </h3>
              <p className="text-[13px] text-amber-800 leading-relaxed">
                This tool provides information and assistance to help you understand documents —
                it <strong>does not replace professional legal advice</strong>. Analysis results are
                informational only. All explanations use phrasing such as{' '}
                <em>"this may be worth clarifying"</em> and never constitute legal verdicts.
                For any legally significant decision, consult a qualified attorney.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-200/60 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-secondary">
          <p>Legal Document Assistant — AI-powered contract analysis</p>
          <p className="flex items-center gap-1.5">
            <Scale className="w-3 h-3" />
            For informational purposes only · Not legal advice
          </p>
        </div>
      </footer>
    </main>
  );
}
