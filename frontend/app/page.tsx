'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ClayHeroObjectWrapper from '@/components/3d/ClayHeroObjectWrapper';
import IconOrbWrapper from '@/components/3d/IconOrbWrapper';
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
  Upload,
  Brain,
  BarChart2,
  Lock,
  Zap,
  Users,
} from 'lucide-react';
import { useDocument } from '@/context/DocumentContext';
import { getTranslations } from '@/lib/translations';
import PillBadge from '@/components/ui/PillBadge';

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
  const { language } = useDocument();
  const t = getTranslations(language);

  return (
    <main className="relative min-h-screen bg-clay-canvas text-clay-foreground overflow-x-hidden selection:bg-clay-accent/20 selection:text-clay-accent">
      {/* ── 2. HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 pt-16 pb-20 text-center clay-grain overflow-hidden">
        {/* ── 3D CLAY OBJECT — desktop only, right side, behind text ── */}
        <div
          className="hidden md:block absolute right-[-24px] top-1/2 -translate-y-[45%] w-[440px] h-[440px] pointer-events-none"
          style={{ zIndex: 0 }}
          aria-hidden="true"
        >
          {/* Radial mask so canvas edges fade into the hero bg */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 70% at 60% 50%, transparent 40%, var(--clay-canvas, #F3F0FA) 100%)',
              zIndex: 2,
            }}
          />
          <ClayHeroObjectWrapper />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl mx-auto flex flex-col items-center"
        >
          {/* Eyebrow badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <PillBadge icon={Sparkles} className="px-4 py-1.5 shadow-clayCard">
              {t.home.heroBadge}
            </PillBadge>
          </motion.div>

          {/* Large Headline with Nunito Font-Black & Clay Text Gradient */}
          <motion.h1
            variants={itemVariants}
            className="font-heading font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] text-clay-foreground mb-6"
          >
            {t.home.heroTitlePart1}{' '}
            <span className="bg-gradient-to-r from-clay-foreground via-clay-accent to-clay-accent-alt bg-clip-text text-transparent">
              {t.home.heroTitleGradient}
            </span>
          </motion.h1>

          {/* Subheading in DM Sans, text-lg, text-clay-muted, max-w-2xl */}
          <motion.p
            variants={itemVariants}
            className="font-sans text-lg sm:text-xl text-clay-muted max-w-2xl mx-auto leading-relaxed mb-10"
          >
            {t.home.heroSubtitle}
          </motion.p>

          {/* Two CTA Buttons: Stacked vertically on mobile, horizontal on desktop */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-6 sm:flex-row justify-center items-center w-full sm:w-auto"
          >
            <Link href="/analyze" id="cta-analyze" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-clayButton">
                {t.home.analyzeNow}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Link href="/compare" id="cta-compare" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto shadow-clayCard bg-white/60 backdrop-blur-md">
                <Scale className="w-5 h-5 mr-2" />
                {t.home.compareDocs}
              </Button>
            </Link>
          </motion.div>
        </motion.div>


        {/* ── HERO STAT BADGES ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: Users, text: '10,000+ Documents Analyzed', color: 'text-violet-600', bg: 'bg-violet-50' },
            { icon: Zap, text: 'Instant AI Analysis', color: 'text-amber-600', bg: 'bg-amber-50' },
            { icon: Lock, text: 'Zero Data Stored', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(({ icon: Icon, text, color, bg }) => (
            <div key={text} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${bg} border border-white/80 shadow-clayCard text-xs font-heading font-bold ${color}`}>
              <Icon className="w-3.5 h-3.5" />
              {text}
            </div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="mt-12 flex flex-col items-center gap-1.5 text-clay-foreground"
          aria-hidden="true"
        >
          <span className="text-xs font-semibold text-clay-accent font-heading opacity-80">{t.home.featuresBadge}</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-4 h-4 opacity-60"
          >
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="mb-3.5 flex justify-center">
            <PillBadge icon={BarChart2}>
              {t.home.howItWorksBadge}
            </PillBadge>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-clay-foreground tracking-tight">
            {t.home.howItWorksTitle}
          </h2>
          <p className="font-sans text-sm sm:text-base text-clay-muted mt-2 max-w-lg mx-auto">
            {t.home.howItWorksSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
          {/* Connector line — desktop only */}
          <div className="hidden sm:block absolute top-10 left-[33%] right-[33%] h-0.5 bg-gradient-to-r from-clay-accent/30 to-clay-accent-alt/30" />

          {[
            {
              step: '01',
              icon: Upload,
              color: 'from-[#4338CA] to-[#6366F1]',
              bg: 'bg-indigo-50',
              title: t.home.step1Title,
              desc: t.home.step1Desc
            },
            {
              step: '02',
              icon: Brain,
              color: 'from-[#8B5CF6] to-[#C026D3]',
              bg: 'bg-purple-50',
              title: t.home.step2Title,
              desc: t.home.step2Desc
            },
            {
              step: '03',
              icon: CheckCircle2,
              color: 'from-[#10B981] to-[#059669]',
              bg: 'bg-emerald-50',
              title: t.home.step3Title,
              desc: t.home.step3Desc
            },
          ].map(({ step, icon: Icon, color, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className={`relative w-20 h-20 rounded-[28px] bg-gradient-to-br ${color} text-white shadow-clayButton flex items-center justify-center mb-4`}>
                <Icon className="w-9 h-9" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow-clayCard text-[10px] font-heading font-black text-clay-foreground flex items-center justify-center">{step}</span>
              </div>
              <h3 className="font-heading font-black text-base text-clay-foreground mb-2">{title}</h3>
              <p className="font-sans text-sm text-clay-muted leading-relaxed max-w-[220px]">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Single CTA below steps */}
        <div className="flex justify-center mt-10">
          <Link href="/analyze" id="how-it-works-cta">
            <Button variant="primary" size="lg" className="shadow-clayButton gap-2">
              <Upload className="w-4 h-4" />
              Start Analyzing for Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── 3. FEATURE SECTION AS A BENTO GRID ──────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24" aria-labelledby="features-heading">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="mb-3.5 flex justify-center">
            <PillBadge icon={Layers}>
              {t.home.featuresBadge}
            </PillBadge>
          </div>
          <h2
            id="features-heading"
            className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-clay-foreground tracking-tight mb-3"
          >
            {t.home.featuresTitle}
          </h2>
          <p className="font-sans text-base sm:text-lg text-clay-muted max-w-xl mx-auto">
            {t.home.featuresSubtitle}
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
                    <IconOrbWrapper
                      color="#4338CA"
                      gradientFrom="#4338CA"
                      gradientTo="#6366F1"
                      icon={<FileText className="w-8 h-8" />}
                      size={64}
                    />
                    <div>
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 font-heading">
                        Core Feature
                      </span>
                      <h3 className="font-heading font-black text-2xl sm:text-3xl text-clay-foreground mt-1">
                        {t.home.bento1Title}
                      </h3>
                    </div>
                  </div>

                  <Link href="/analyze" className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-clay-accent hover:text-clay-accent-alt font-heading">
                    Try Now <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <p className="font-sans text-base text-clay-muted leading-relaxed mb-6">
                  {t.home.bento1Desc}
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
                  <span className="px-3 py-1 rounded-full bg-white shadow-clayCard">PDF &amp; Text Input</span>
                  <span className="px-3 py-1 rounded-full bg-white shadow-clayCard">English · हिन्दी · ગુજરાતી</span>
                  <span className="px-3 py-1 rounded-full bg-white shadow-clayCard">5-8 Takeaway Bullets</span>
                </div>
                <Link href="/analyze">
                  <Button variant="primary" size="sm">
                    {t.home.analyzeNow} &rarr;
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
              <IconOrbWrapper
                color="#F97316"
                gradientFrom="#F97316"
                gradientTo="#FB923C"
                icon={<ShieldAlert className="w-7 h-7" />}
                size={56}
                className="mb-5"
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800 font-heading bg-orange-100 px-2.5 py-0.5 rounded-full inline-block">
                Safety First
              </span>
              <h3 className="font-heading font-black text-xl text-clay-foreground mt-2 mb-2">
                {t.home.bento2Title}
              </h3>
              <p className="font-sans text-sm text-clay-muted leading-relaxed">
                {t.home.bento2Desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold font-heading text-orange-800">
              <Link href="/analyze" className="flex items-center justify-between w-full">
                <span>{t.home.analyzeNow}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
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
              <IconOrbWrapper
                color="#8B5CF6"
                gradientFrom="#8B5CF6"
                gradientTo="#C026D3"
                icon={<MessageSquareText className="w-7 h-7" />}
                size={56}
                className="mb-5"
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 font-heading bg-purple-100 px-2.5 py-0.5 rounded-full inline-block">
                Grounded Q&amp;A
              </span>
              <h3 className="font-heading font-black text-xl text-clay-foreground mt-2 mb-2">
                {t.home.bento3Title}
              </h3>
              <p className="font-sans text-sm text-clay-muted leading-relaxed">
                {t.home.bento3Desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold font-heading text-purple-800">
              <Link href="/ask" className="flex items-center justify-between w-full">
                <span>{t.nav.ask}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
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
              <IconOrbWrapper
                color="#0D9488"
                gradientFrom="#0D9488"
                gradientTo="#14B8A6"
                icon={<Scale className="w-7 h-7" />}
                size={56}
                className="mb-5"
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 font-heading bg-teal-100 px-2.5 py-0.5 rounded-full inline-block">
                Side-by-Side
              </span>
              <h3 className="font-heading font-black text-xl text-clay-foreground mt-2 mb-2">
                {t.home.bento4Title}
              </h3>
              <p className="font-sans text-sm text-clay-muted leading-relaxed">
                {t.home.bento4Desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold font-heading text-teal-800">
              <Link href="/compare" className="flex items-center justify-between w-full">
                <span>{t.home.compareDocs}</span>
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
              <IconOrbWrapper
                color="#10B981"
                gradientFrom="#10B981"
                gradientTo="#059669"
                icon={<CheckSquare className="w-7 h-7" />}
                size={56}
                className="mb-5"
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 font-heading bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                Action Plan
              </span>
              <h3 className="font-heading font-black text-xl text-clay-foreground mt-2 mb-2">
                {t.home.bento5Title}
              </h3>
              <p className="font-sans text-sm text-clay-muted leading-relaxed">
                {t.home.bento5Desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold font-heading text-emerald-800">
              <Link href="/checklist" className="flex items-center justify-between w-full">
                <span>{t.nav.checklist}</span>
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
                {t.home.privacyBadge}
              </h3>
              <p className="font-sans text-sm sm:text-base text-clay-muted leading-relaxed">
                {t.home.privacySubtitle} —{' '}
                <strong className="text-clay-foreground font-semibold">{t.home.privacy1}.</strong>{' '}
                {t.home.privacy3}.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ── 5. PERSISTENT FOOTER ────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-200/60 bg-white/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Quick Links Row */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-6 text-xs font-heading font-bold text-clay-muted">
            {[
              { href: '/analyze', label: 'Analyze a Document' },
              { href: '/ask', label: 'Ask AI Questions' },
              { href: '/compare', label: 'Compare Contracts' },
              { href: '/checklist', label: 'Pre-Signing Checklist' },
              { href: '/lawyer-prep', label: 'Lawyer Prep Brief' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="hover:text-clay-accent transition-colors">
                {label}
              </Link>
            ))}
          </div>
          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-clay-foreground border-t border-slate-100 pt-5">
            <p className="font-sans text-xs text-clay-muted">
              {t.home.footerText}
            </p>
            <p className="flex items-center gap-2 font-medium text-xs text-clay-muted">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero Data Persistence · In-Memory Privacy</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
