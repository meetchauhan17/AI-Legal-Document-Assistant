'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
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
import { useDocument } from '@/context/DocumentContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import ClayBlobs from '@/components/ClayBlobs';

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

// ── Document Input Card Component (Recessed Dropzone & Textarea) ──────────

interface DocInputProps {
  label: string;
  badgeLabel: string;
  badgeGradient: string;
  accentColor: string;
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
  badgeLabel,
  badgeGradient,
  accentColor,
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
    <Card
      variant="solid"
      className="p-6 sm:p-8 flex flex-col justify-between relative z-10 shadow-clayCard border border-white/80"
    >
      <div>
        {/* Header with Label and Mode Switch */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-heading font-black text-sm text-white shadow-clayButton ${badgeGradient}`}
            >
              {badgeLabel}
            </span>
            <div>
              <span className="font-heading font-black text-base text-clay-foreground tracking-tight block">
                {label}
              </span>
              <span className="text-xs text-clay-foreground">
                {mode === 'file' ? 'PDF File Upload' : 'Direct Text Input'}
              </span>
            </div>
          </div>

          {/* Mode Switch Tabs (rounded-[24px] for 32px parent) */}
          <div className="flex bg-[#EFEBF5] p-1.5 rounded-[24px] shadow-clayPressed text-xs font-heading font-bold">
            <button
              type="button"
              onClick={() => onModeChange('file')}
              className={`min-h-[44px] px-3.5 py-2 rounded-[16px] transition-all flex items-center ${
                mode === 'file'
                  ? 'bg-white text-clay-foreground shadow-clayButton'
                  : 'text-clay-foreground hover:bg-white/40'
              }`}
            >
              Upload PDF
            </button>
            <button
              type="button"
              onClick={() => onModeChange('text')}
              className={`min-h-[44px] px-3.5 py-2 rounded-[16px] transition-all flex items-center ${
                mode === 'text'
                  ? 'bg-white text-clay-foreground shadow-clayButton'
                  : 'text-clay-foreground hover:bg-white/40'
              }`}
            >
              Paste Text
            </button>
          </div>
        </div>

        {/* Input Area: Dropzone or Textarea */}
        {mode === 'file' ? (
          <div>
            {!file ? (
              <div
                {...getRootProps()}
                className={`relative rounded-[24px] p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 bg-[#EFEBF5] shadow-clayPressed border-2 border-dashed ${
                  isDragActive
                    ? 'border-clay-accent bg-clay-accent/5 ring-4 ring-clay-accent/20'
                    : 'border-clay-accent/25 hover:border-clay-accent/60'
                }`}
              >
                <input {...getInputProps()} />

                {/* Gradient Upload Orb */}
                <div
                  className={`w-14 h-14 mx-auto mb-3 rounded-[16px] bg-gradient-to-br ${accentColor} text-white shadow-clayButton flex items-center justify-center`}
                >
                  <Upload className="w-7 h-7" />
                </div>

                <h4 className="font-heading font-black text-base text-clay-foreground mb-1">
                  {isDragActive ? 'Drop PDF into tray!' : `Drop ${label} PDF here`}
                </h4>
                <p className="font-sans text-xs sm:text-sm text-clay-foreground">
                  or <span className="text-clay-accent font-bold underline">browse files</span> (up to 5MB)
                </p>
              </div>
            ) : (
              /* File selected state */
              <div className="p-5 rounded-[24px] bg-[#EFEBF5] shadow-clayPressed border border-white flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-[16px] bg-clay-success/15 text-clay-success flex items-center justify-center shadow-clayPressed shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-heading font-bold text-xs sm:text-sm text-clay-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-clay-foreground font-mono">
                      {(file.size / 1024).toFixed(1)} KB · PDF Ready
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClear}
                  className="min-h-[44px] text-xs font-heading font-bold text-clay-foreground hover:text-red-500 underline transition-colors px-2 py-1 inline-flex items-center"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <Textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder={`Paste the clauses, terms, or full text of ${label} here...`}
              rows={8}
              className="text-xs sm:text-sm font-sans"
            />
          </div>
        )}
      </div>

      {/* Ready Indicator Footer */}
      {hasContent && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-heading font-bold">
          <span className="flex items-center gap-1.5 text-clay-success">
            <CheckCircle2 className="w-4 h-4" />
            {label} Ready
          </span>
          <button
            type="button"
            onClick={onClear}
            className="text-clay-muted hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </Card>
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
    <main className="min-h-screen bg-clay-canvas text-clay-foreground pb-20 relative overflow-hidden">
      {/* Ambient background blobs */}
      <ClayBlobs />

      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-clay-canvas/80 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white shadow-clayButton text-clay-muted hover:text-clay-accent transition-colors"
              title="Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-clay-accent/15 flex items-center justify-center text-clay-accent shadow-clayPressed">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-heading font-black text-sm text-clay-foreground tracking-tight">
                  Compare Legal Documents
                </h1>
                <p className="text-xs text-clay-foreground font-sans">
                  Side-by-side term &amp; liability evaluation
                </p>
              </div>
            </div>
          </div>

          {/* Right Actions: Language Selector & Analyze Link */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-clayButton border border-white text-xs font-heading font-bold text-clay-foreground">
              <Globe className="w-3.5 h-3.5 text-clay-accent shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent font-heading font-bold text-xs text-clay-foreground focus:outline-none cursor-pointer pr-1"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <Link href="/analyze" className="hidden sm:inline-block">
              <Button variant="ghost" size="sm" className="text-xs">
                Single Document Analysis &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 relative z-10">
        {/* ── Page Intro Header ───────────────────────────────────────────── */}
        {!result && (
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-heading font-bold text-clay-accent bg-clay-accent/10 mb-4 shadow-clayPressed">
              <Sparkles className="w-3.5 h-3.5" />
              Intelligent Difference &amp; Favorability Detection
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-clay-foreground tracking-tight mb-3">
              Compare Two Contracts Side-by-Side
            </h2>
            <p className="font-sans text-sm sm:text-base text-clay-muted leading-relaxed">
              Upload two versions of an agreement or competing proposals. Our AI highlights key differences in rent, liabilities, notice windows, and identifies which terms are more favorable.
            </p>

            {/* Quick Sample Trigger */}
            <div className="mt-5">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLoadSample}
                className="shadow-clayButton text-xs"
              >
                <Layers className="w-4 h-4 mr-2 text-clay-accent" />
                Load Sample Comparison (Contract A vs Contract B)
              </Button>
            </div>
          </div>
        )}

        {/* ── 1. & 2. Two Side-by-Side Upload Zones + Floating "VS" Badge ──── */}
        {!result && (
          <div className="relative mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch relative">
              {/* Document A Zone */}
              <DocInputZone
                label="Document A"
                badgeLabel="A"
                badgeGradient="bg-gradient-to-br from-[#A78BFA] to-[#7C3AED]"
                accentColor="from-[#A78BFA] to-[#7C3AED]"
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

              {/* 2. CIRCULAR "VS" BADGE (FLOATING AT CENTER ON DESKTOP, INLINE ON MOBILE) */}
              {/* Desktop Floating VS Badge */}
              <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <div
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-clay-accent to-clay-accent-alt text-white shadow-clayButton border-4 border-white flex items-center justify-center font-heading font-black text-lg tracking-wider animate-clay-breathe"
                  style={{ animationDuration: '3s' }}
                >
                  VS
                </div>
              </div>

              {/* Mobile Inline VS Badge */}
              <div className="flex lg:hidden justify-center items-center -my-3 relative z-20">
                <div
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-clay-accent to-clay-accent-alt text-white shadow-clayButton border-4 border-white flex items-center justify-center font-heading font-black text-base tracking-wider animate-clay-breathe"
                  style={{ animationDuration: '3s' }}
                >
                  VS
                </div>
              </div>

              {/* Document B Zone */}
              <DocInputZone
                label="Document B"
                badgeLabel="B"
                badgeGradient="bg-gradient-to-br from-[#F472B6] to-[#DB2777]"
                accentColor="from-[#F472B6] to-[#DB2777]"
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

            {/* Error Banner */}
            {error && (
              <div className="mt-6 flex items-center gap-2.5 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 shadow-clayPressed">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                <span className="font-sans">{error}</span>
              </div>
            )}

            {/* Compare Action Button */}
            <div className="mt-8 flex justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={handleCompare}
                disabled={!hasBothDocs || isLoading}
                className="w-full sm:w-80 shadow-clayButton"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span>{loadingStage}</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-5 h-5 mr-2" />
                    <span>Compare Documents</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── 3. RESULTS SECTION ───────────────────────────────────────────── */}
        {result && !isLoading && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/60">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-heading font-black bg-clay-accent/10 text-clay-accent shadow-clayPressed uppercase mb-1">
                  <Sparkles className="w-3 h-3" />
                  Comparison Complete
                </span>
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-clay-foreground tracking-tight">
                  Detailed Clause Comparison
                </h2>
                <p className="font-sans text-xs sm:text-sm text-clay-foreground font-medium">
                  {result.comparison_points.length} key aspects evaluated across Document A &amp; Document B
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleReset}
                className="shadow-clayButton shrink-0 self-start sm:self-auto"
              >
                <RotateCcw className="w-4 h-4 mr-1.5 text-clay-accent" />
                Compare Different Documents
              </Button>
            </div>

            {/* 3a. OVERALL SUMMARY IN HERO-VARIANT CARD WITH GRADIENT WASH */}
            <Card
              variant="hero"
              className="p-8 sm:p-10 border border-clay-accent/20 bg-gradient-to-br from-clay-accent/5 via-white/80 to-clay-accent-alt/5 shadow-clayCard"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[24px] bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white flex items-center justify-center shadow-clayButton">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-heading font-black uppercase tracking-wider text-clay-accent block">
                    Executive Analysis
                  </span>
                  <h3 className="font-heading font-black text-lg sm:text-xl text-clay-foreground tracking-tight">
                    Overall Comparison Summary
                  </h3>
                </div>
              </div>
              <p className="font-sans text-sm sm:text-base text-clay-foreground leading-relaxed whitespace-pre-wrap">
                {result.overall_summary}
              </p>
            </Card>

            {/* 3b. COMPARISON TABLE REBUILT AS STACKED LIST OF CARD COMPONENTS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2 pt-2">
                <h3 className="font-heading font-black text-lg text-clay-foreground">
                  Comparison Aspects ({result.comparison_points.length})
                </h3>
                <div className="flex items-center gap-3 text-xs font-sans text-clay-foreground font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                    Emerald Left Accent = Favorable
                  </span>
                </div>
              </div>

              {result.comparison_points.map((point, index) => {
                const favorable = normalizeFavorable(point.more_favorable);

                return (
                  <Card
                    key={index}
                    variant="solid"
                    className="!rounded-[24px] p-6 sm:p-7 shadow-clayCard border border-white/90"
                  >
                    {/* Aspect Label & Note */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-heading font-black uppercase tracking-wider text-clay-foreground block">
                          Aspect #{index + 1}
                        </span>
                        <h4 className="font-heading font-black text-base sm:text-lg text-clay-foreground tracking-tight">
                          {point.aspect}
                        </h4>
                      </div>
                      {(point.note || point.explanation) && (
                        <p className="font-sans text-xs sm:text-sm text-clay-foreground sm:max-w-md sm:text-right">
                          {point.note || point.explanation}
                        </p>
                      )}
                    </div>

                    {/* Side-by-Side Values (grid-cols-1 sm:grid-cols-2) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {/* Document A Value (rounded-[16px] for 24px parent Card) */}
                      <div
                        className={`p-4 sm:p-5 rounded-[16px] transition-all ${
                          favorable === 'a'
                            ? 'bg-emerald-50/80 border-l-4 border-l-emerald-500 border border-emerald-200/60 shadow-clayPressed'
                            : 'bg-[#F4F1FA]/60 border border-slate-200/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-heading font-black text-clay-accent tracking-wider uppercase">
                            Document A
                          </span>
                          {favorable === 'a' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-black bg-emerald-100 text-emerald-800 shadow-clayPressed uppercase">
                              <Check className="w-3 h-3 stroke-[3]" />
                              More Favorable
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-xs sm:text-sm text-clay-foreground leading-relaxed whitespace-pre-wrap">
                          {point.document_a_value}
                        </p>
                      </div>

                      {/* Document B Value (rounded-[16px] for 24px parent Card) */}
                      <div
                        className={`p-4 sm:p-5 rounded-[16px] transition-all ${
                          favorable === 'b'
                            ? 'bg-emerald-50/80 border-l-4 border-l-emerald-500 border border-emerald-200/60 shadow-clayPressed'
                            : 'bg-[#F4F1FA]/60 border border-slate-200/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-heading font-black text-clay-accent-alt tracking-wider uppercase">
                            Document B
                          </span>
                          {favorable === 'b' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-black bg-emerald-100 text-emerald-800 shadow-clayPressed uppercase">
                              <Check className="w-3 h-3 stroke-[3]" />
                              More Favorable
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-xs sm:text-sm text-clay-foreground leading-relaxed whitespace-pre-wrap">
                          {point.document_b_value}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Bottom Quick Links & Legal Guardrail */}
            <Card variant="glass" className="p-5 sm:p-6 shadow-clayCard">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 text-clay-muted font-sans">
                  <Info className="w-4 h-4 text-clay-accent shrink-0" />
                  <span>
                    Favorability classifications are comparative heuristics and depend on whether you are the tenant, landlord, contractor, or hiring party.
                  </span>
                </div>
                <div className="flex items-center gap-4 font-heading font-bold shrink-0">
                  <Link href="/analyze" className="text-clay-accent hover:underline flex items-center gap-1">
                    Analyze Individual Contract <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link href="/ask" className="text-clay-accent hover:underline flex items-center gap-1">
                    Q&amp;A Chat Assistant <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
