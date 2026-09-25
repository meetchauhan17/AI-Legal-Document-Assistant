'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Upload,
  Type,
  Loader2,
  CheckCircle2,
  Scale,
  Sparkles,
  Layers,
  ArrowRight,
  Globe,
  RotateCcw,
  Check,
  Equal,
  Info,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import {
  uploadFile,
  compareDocuments,
  type CompareResponse,
  type ComparisonPoint,
} from '@/lib/api';
import VsBadge3D from '@/components/3d/VsBadge3D';
import { useDocument } from '@/context/DocumentContext';

// ── Sample Documents for Quick Testing ───────────────────────────────────

const SAMPLE_DOC_A = `LEASE AGREEMENT — CONTRACT A
Tenant: Bob Chen. Landlord: Greenfield Properties LLC.
Property: 42 Oakdale Avenue, Suite 3B, Portland, Oregon.

1. MONTHLY RENT: $2,400.00 per month, payable in advance on the 1st of each month.
2. LATE PAYMENT FEE: $100.00 flat fee if not received within a 3-day grace period.
3. SECURITY DEPOSIT: $4,800.00 (non-refundable if tenant vacates prior to full lease term).
4. LEASE TERM: 12 months (March 1, 2026 to February 28, 2027).
5. AUTO-RENEWAL: Automatically renews for another 12-month term unless written notice is received 60 days in advance.
6. MAINTENANCE & REPAIRS: Tenant is responsible for all plumbing repairs and HVAC servicing regardless of cost.
7. GOVERNING LAW: State of Oregon.`;

const SAMPLE_DOC_B = `LEASE AGREEMENT — CONTRACT B
Tenant: Bob Chen. Landlord: Greenfield Properties LLC.
Property: 42 Oakdale Avenue, Suite 3B, Portland, Oregon.

1. MONTHLY RENT: $2,100.00 per month, payable on the 1st of each month.
2. LATE PAYMENT FEE: $50.00 fee if not received within a 7-day grace period.
3. SECURITY DEPOSIT: $2,100.00 (fully refundable within 30 days of lease end minus documented damages).
4. LEASE TERM: 12 months (March 1, 2026 to February 28, 2027).
5. RENEWAL: Converts to month-to-month tenancy upon expiration with 30 days written notice.
6. MAINTENANCE & REPAIRS: Landlord handles all major HVAC and structural repairs; Tenant handles minor repairs under $100.
7. GOVERNING LAW: State of Oregon.`;

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
];

// ── Animation Variants ───────────────────────────────────────────────────

const fadeSlide = {
  hidden: { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

// ── Helper for Favorability ──────────────────────────────────────────────

function normalizeFavorable(fav: string): 'a' | 'b' | 'neutral' {
  const clean = fav.toLowerCase().trim();
  if (clean === 'a' || clean === 'document_a' || clean.includes('doc a') || clean.includes('document a')) {
    return 'a';
  }
  if (clean === 'b' || clean === 'document_b' || clean.includes('doc b') || clean.includes('document b')) {
    return 'b';
  }
  return 'neutral';
}

// ── Document Input Card Component ────────────────────────────────────────

interface DocInputProps {
  label: string;
  badgeColor: string;
  text: string;
  file: File | null;
  mode: 'file' | 'text';
  onModeChange: (m: 'file' | 'text') => void;
  onTextChange: (t: string) => void;
  onFileDrop: (f: File) => void;
  onClear: () => void;
}

function DocInputZone({
  label,
  badgeColor,
  text,
  file,
  mode,
  onModeChange,
  onTextChange,
  onFileDrop,
  onClear,
}: DocInputProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFileDrop(accepted[0]);
    },
    [onFileDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const hasContent = mode === 'file' ? file !== null : text.trim().length > 0;

  return (
    <div className="flex-1 bg-surface rounded-2xl border border-slate-200/80 shadow-soft p-5 sm:p-6 flex flex-col justify-between transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white ${badgeColor}`}
            >
              {label.split(' ')[1] || 'A'}
            </span>
            <span className="font-bold text-sm text-text-primary" style={{ fontWeight: 700 }}>
              {label}
            </span>
          </div>

          {/* Mode Switch */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => onModeChange('file')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                mode === 'file'
                  ? 'bg-white text-text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Upload PDF
            </button>
            <button
              type="button"
              onClick={() => onModeChange('text')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                mode === 'text'
                  ? 'bg-white text-text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Paste Text
            </button>
          </div>
        </div>

        {/* Input Area */}
        {mode === 'file' ? (
          <div>
            {!file ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-primary bg-blue-50/50 shadow-inner'
                    : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-text-primary">
                  {isDragActive ? 'Drop PDF here' : 'Click or drag PDF here'}
                </p>
                <p className="text-[11px] text-text-secondary mt-1">PDF up to 5MB</p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-text-primary truncate">{file.name}</p>
                    <p className="text-[10px] text-text-secondary">
                      {(file.size / 1024).toFixed(1)} KB · PDF Ready
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClear}
                  className="text-xs text-text-secondary hover:text-red-500 font-medium px-2 py-1"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder={`Paste the full text of ${label} here...`}
              rows={7}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-mono"
            />
          </div>
        )}
      </div>

      {/* Mini preview snippet footer if text available */}
      {hasContent && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Document Ready
          </span>
          <button
            type="button"
            onClick={onClear}
            className="hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

// ── Comparison Table Row Component ───────────────────────────────────────

function ComparisonRow({ point, index }: { point: ComparisonPoint; index: number }) {
  const favorable = normalizeFavorable(point.more_favorable);

  return (
    <motion.tr
      variants={fadeSlide}
      custom={index}
      className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
    >
      {/* Aspect */}
      <td className="py-4 px-4 sm:px-6 align-top w-[25%] sm:w-[22%]">
        <div className="font-bold text-xs sm:text-sm text-text-primary" style={{ fontWeight: 700 }}>
          {point.aspect}
        </div>
        {(point.note || point.explanation) && (
          <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
            {point.note || point.explanation}
          </p>
        )}
      </td>

      {/* Document A Value */}
      <td className="py-4 px-4 sm:px-6 align-top w-[35%] sm:w-[36%]">
        <div
          className={`p-3 rounded-xl border text-xs sm:text-[13px] leading-relaxed transition-all ${
            favorable === 'a'
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium shadow-xs ring-1 ring-emerald-400/30'
              : 'bg-white border-slate-200/80 text-text-primary'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <span>{point.document_a_value}</span>
            {favorable === 'a' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs"
              >
                <Check className="w-3 h-3 stroke-[3]" />
                More Favorable
              </motion.span>
            )}
          </div>
        </div>
      </td>

      {/* Document B Value */}
      <td className="py-4 px-4 sm:px-6 align-top w-[35%] sm:w-[36%]">
        <div
          className={`p-3 rounded-xl border text-xs sm:text-[13px] leading-relaxed transition-all ${
            favorable === 'b'
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium shadow-xs ring-1 ring-emerald-400/30'
              : 'bg-white border-slate-200/80 text-text-primary'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <span>{point.document_b_value}</span>
            {favorable === 'b' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs"
              >
                <Check className="w-3 h-3 stroke-[3]" />
                More Favorable
              </motion.span>
            )}
          </div>
        </div>
      </td>

      {/* Status indicator icon column */}
      <td className="py-4 px-2 sm:px-4 align-middle text-center w-[5%] sm:w-[6%]">
        {favorable === 'neutral' ? (
          <span className="inline-flex p-1.5 rounded-full bg-slate-100 text-slate-400" title="Neutral / Equal">
            <Equal className="w-3.5 h-3.5" />
          </span>
        ) : favorable === 'a' ? (
          <span className="inline-flex p-1.5 rounded-full bg-blue-100 text-primary font-bold text-xs" title="Doc A Advantage">
            A
          </span>
        ) : (
          <span className="inline-flex p-1.5 rounded-full bg-amber-100 text-accent font-bold text-xs" title="Doc B Advantage">
            B
          </span>
        )}
      </td>
    </motion.tr>
  );
}

// ── Main Compare Page Component ──────────────────────────────────────────

export default function ComparePage() {
  const { language, setLanguage } = useDocument();

  // Document A State
  const [modeA, setModeA] = useState<'file' | 'text'>('text');
  const [textA, setTextA] = useState('');
  const [fileA, setFileA] = useState<File | null>(null);

  // Document B State
  const [modeB, setModeB] = useState<'file' | 'text'>('text');
  const [textB, setTextB] = useState('');
  const [fileB, setFileB] = useState<File | null>(null);

  // Loading & Results State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Preparing comparison…');
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLoadSample = () => {
    setModeA('text');
    setModeB('text');
    setTextA(SAMPLE_DOC_A);
    setTextB(SAMPLE_DOC_B);
    setFileA(null);
    setFileB(null);
    setError(null);
  };

  const handleCompare = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // 1. Resolve Text A
      let resolvedTextA = textA.trim();
      if (modeA === 'file' && fileA) {
        setLoadingStage('Extracting text from Document A…');
        const uploadResA = await uploadFile(fileA);
        resolvedTextA = uploadResA.full_text;
      }

      // 2. Resolve Text B
      let resolvedTextB = textB.trim();
      if (modeB === 'file' && fileB) {
        setLoadingStage('Extracting text from Document B…');
        const uploadResB = await uploadFile(fileB);
        resolvedTextB = uploadResB.full_text;
      }

      if (!resolvedTextA) {
        throw new Error('Please upload or paste Document A.');
      }
      if (!resolvedTextB) {
        throw new Error('Please upload or paste Document B.');
      }

      // 3. Call Comparison API
      setLoadingStage('Analyzing differences & assessing favorability…');
      const compareRes = await compareDocuments(resolvedTextA, resolvedTextB, language);
      setResult(compareRes);
    } catch (err: any) {
      setError(err.message || 'Comparison failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const hasBothDocs =
    (modeA === 'file' ? fileA !== null : textA.trim().length > 0) &&
    (modeB === 'file' ? fileB !== null : textB.trim().length > 0);

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-text-secondary hover:text-text-primary transition-colors"
              title="Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-text-primary tracking-tight" style={{ fontWeight: 700 }}>
                  Compare Legal Documents
                </h1>
                <p className="text-[11px] text-text-secondary">Side-by-side term & liability evaluation</p>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-text-secondary" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent font-medium text-text-primary focus:outline-none cursor-pointer pr-1"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <Link
              href="/analyze"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
            >
              Single Document Analysis &rarr;
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {/* Page Hero Description */}
        {!result && (
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-accent/10 text-accent mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Intelligent Difference & Favorability Detection
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2" style={{ fontWeight: 700 }}>
              Compare Two Contracts Side-by-Side
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Upload two versions of a contract or competing proposals. Our AI highlights key differences in pricing, liability, notice windows, and identifies which terms are more favorable.
            </p>

            {/* Quick Demo Trigger */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                Load Sample Comparison (Contract A vs Contract B)
              </button>
            </div>
          </div>
        )}

        {/* ── Upload & Input Section ──────────────────────────────────────── */}
        {!result && (
          <div className="relative mb-8">
            <div className="flex flex-col lg:flex-row items-stretch gap-6">
              {/* Document A Zone */}
              <DocInputZone
                label="Document A"
                badgeColor="bg-primary"
                text={textA}
                file={fileA}
                mode={modeA}
                onModeChange={setModeA}
                onTextChange={setTextA}
                onFileDrop={setFileA}
                onClear={() => {
                  setTextA('');
                  setFileA(null);
                }}
              />

              {/* Central 3D VS Divider */}
              <div className="flex lg:flex-col items-center justify-center my-2 lg:my-0">
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24">
                    <VsBadge3D className="w-full h-full" />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="absolute z-10 w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent text-white font-extrabold text-xs flex items-center justify-center shadow-md border-2 border-white pointer-events-auto cursor-default"
                  >
                    VS
                  </motion.div>
                </div>
              </div>

              {/* Document B Zone */}
              <DocInputZone
                label="Document B"
                badgeColor="bg-accent"
                text={textB}
                file={fileB}
                mode={modeB}
                onModeChange={setModeB}
                onTextChange={setTextB}
                onFileDrop={setFileB}
                onClear={() => {
                  setTextB('');
                  setFileB(null);
                }}
              />
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Compare Button */}
            <div className="mt-6 flex justify-center">
              <motion.button
                onClick={handleCompare}
                disabled={!hasBothDocs || isLoading}
                whileHover={{ scale: hasBothDocs && !isLoading ? 1.03 : 1 }}
                whileTap={{ scale: hasBothDocs && !isLoading ? 0.98 : 1 }}
                className={`w-full sm:w-80 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  hasBothDocs && !isLoading
                    ? 'bg-gradient-to-r from-primary via-primary-light to-accent shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{loadingStage}</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-5 h-5" />
                    <span>Compare Documents</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}

        {/* ── Results Section ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {result && !isLoading && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Results Top Action Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-text-primary" style={{ fontWeight: 700 }}>
                    Comparison Analysis
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {result.comparison_points.length} key aspects evaluated across Document A & Document B
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-text-secondary hover:text-primary transition-colors border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Compare Different Documents
                </button>
              </div>

              {/* 1. Overall Summary Card */}
              <motion.div
                variants={fadeSlide}
                className="bg-gradient-to-br from-blue-50 via-white to-amber-50/60 rounded-2xl border border-blue-200/80 p-6 sm:p-7 shadow-soft"
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-text-primary text-sm sm:text-base" style={{ fontWeight: 700 }}>
                    Overall Executive Comparison Summary
                  </h3>
                </div>
                <p className="text-text-primary text-sm sm:text-[14.5px] leading-relaxed">
                  {result.overall_summary}
                </p>
              </motion.div>

              {/* 2. Side-by-Side Comparison Table */}
              <motion.div
                variants={fadeSlide}
                className="bg-surface rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                        <th className="py-3.5 px-4 sm:px-6">Aspect / Clause</th>
                        <th className="py-3.5 px-4 sm:px-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-primary">
                            Document A
                          </span>
                        </th>
                        <th className="py-3.5 px-4 sm:px-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-accent">
                            Document B
                          </span>
                        </th>
                        <th className="py-3.5 px-2 sm:px-4 text-center">Advantage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.comparison_points.map((point, i) => (
                        <ComparisonRow key={i} point={point} index={i} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer / Legend */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-text-secondary">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Green highlight indicates more favorable term for tenant/party
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      Neutral indicates balanced or equivalent terms
                    </span>
                  </div>
                  <span>Informational legal comparison</span>
                </div>
              </motion.div>

              {/* Bottom Quick Links / Disclaimer */}
              <motion.div variants={fadeSlide} className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-accent shrink-0" />
                  <span>Favorability assessments are automated and depend on your specific bargaining position.</span>
                </div>
                <div className="flex items-center gap-3 font-semibold">
                  <Link href="/analyze" className="text-primary hover:underline flex items-center gap-1">
                    Analyze Individual Contract <ChevronRight className="w-3 h-3" />
                  </Link>
                  <Link href="/ask" className="text-primary hover:underline flex items-center gap-1">
                    Q&A Chat Assistant <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
