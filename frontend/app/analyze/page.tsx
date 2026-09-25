'use client';

import React, { useCallback, useState } from 'react';
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
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  BookOpen,
  ClipboardList,
  Globe,
  MessageSquare,
  Scale,
} from 'lucide-react';
import { useDocument } from '@/context/DocumentContext';
import {
  uploadFile,
  uploadText,
  simplifyDocument,
  analyzeRisk,
  type UploadResponse,
  type SimplifyResponse,
  type RiskResponse,
  type Clause,
} from '@/lib/api';

// ── Constants ─────────────────────────────────────────────────────────────

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
];

const LOADING_STAGES = [
  { key: 'uploading', icon: Upload, label: 'Reading document…', color: '#2563EB' },
  { key: 'simplifying', icon: BookOpen, label: 'Simplifying language…', color: '#7C3AED' },
  { key: 'risks', icon: ShieldAlert, label: 'Scanning for risks…', color: '#DC2626' },
] as const;

type StageKey = typeof LOADING_STAGES[number]['key'];

// ── Animation variants ────────────────────────────────────────────────────

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
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.82 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

// ── Helpers ───────────────────────────────────────────────────────────────

function clauseLevel(clause: Clause): 'standard' | 'attention' | 'risk' {
  const raw = (clause.category_level ?? clause.category ?? '').toLowerCase();
  if (raw.includes('risk')) return 'risk';
  if (raw.includes('attention')) return 'attention';
  return 'standard';
}

const SEVERITY_STYLES = {
  risk: {
    border: 'border-l-red-500',
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-700',
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
    label: 'Risk',
    dot: 'bg-red-500',
  },
  attention: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    label: 'Attention',
    dot: 'bg-amber-400',
  },
  standard: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    label: 'Standard',
    dot: 'bg-emerald-500',
  },
};

// ── Sub-components ────────────────────────────────────────────────────────

function StagedLoader({ currentStage }: { currentStage: StageKey }) {
  const currentIdx = LOADING_STAGES.findIndex((s) => s.key === currentStage);
  return (
    <div className="flex flex-col items-center gap-6 py-12 px-6">
      {/* Animated ring + icon */}
      <div className="relative w-20 h-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: LOADING_STAGES[currentIdx]?.color ?? '#2563EB',
            borderRightColor: `${LOADING_STAGES[currentIdx]?.color ?? '#2563EB'}30`,
          }}
        />
        <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center shadow-inner">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25 }}
              className="text-primary"
            >
              {React.createElement(
                LOADING_STAGES[currentIdx]?.icon ?? Loader2,
                { className: 'w-7 h-7', style: { color: LOADING_STAGES[currentIdx]?.color } }
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Stage label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentStage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="text-base font-semibold text-text-primary"
        >
          {LOADING_STAGES[currentIdx]?.label}
        </motion.p>
      </AnimatePresence>

      {/* Stage progress dots */}
      <div className="flex gap-3">
        {LOADING_STAGES.map((stage, idx) => (
          <motion.div
            key={stage.key}
            className={`h-2 rounded-full transition-all duration-500 ${
              idx < currentIdx
                ? 'bg-emerald-500 w-6'
                : idx === currentIdx
                ? 'w-6'
                : 'bg-slate-200 w-2'
            }`}
            style={idx === currentIdx ? { background: stage.color } : {}}
            animate={idx === currentIdx ? { opacity: [1, 0.5, 1] } : {}}
            transition={idx === currentIdx ? { repeat: Infinity, duration: 1.2 } : {}}
          />
        ))}
      </div>

      <p className="text-[12px] text-text-secondary">
        This may take 10–20 seconds for long documents
      </p>
    </div>
  );
}

function ClauseCard({ clause, index }: { clause: Clause; index: number }) {
  const level = clauseLevel(clause);
  const style = SEVERITY_STYLES[level];
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      variants={fadeSlide}
      custom={index * 0.5}
      whileHover={{ y: -3, boxShadow: '0 12px 28px -6px rgba(15,23,42,0.1)' }}
      transition={{ y: { duration: 0.2 }, boxShadow: { duration: 0.2 } }}
      className={`relative bg-white rounded-xl border border-slate-200/70 border-l-4 ${style.border}
                  shadow-[0_2px_12px_-4px_rgba(15,23,42,0.05)] overflow-hidden cursor-pointer`}
      onClick={() => setExpanded((p) => !p)}
      role="button"
      aria-expanded={expanded}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Severity badge */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
                      uppercase tracking-wide shrink-0 mt-0.5 ${style.badge}`}
        >
          {style.icon}
          {style.label}
        </span>

        {/* Category + excerpt preview */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-text-primary leading-snug mb-0.5">
            {clause.category}
          </p>
          <p className="text-[12px] text-text-secondary line-clamp-2 leading-relaxed">
            {clause.clause_text.replace(/\n/g, ' ')}
          </p>
        </div>

        {/* Expand toggle */}
        <button
          className="shrink-0 text-text-secondary hover:text-text-primary transition-colors"
          aria-label={expanded ? 'Collapse clause' : 'Expand clause'}
          tabIndex={-1}
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Expanded explanation */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={`overflow-hidden border-t border-slate-100 ${style.bg}`}
          >
            <div className="px-4 py-3 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
                Explanation
              </p>
              <p className="text-[13px] text-text-primary leading-relaxed">
                {clause.explanation}
              </p>
              {clause.clause_text && (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary pt-1">
                    Excerpt
                  </p>
                  <p className="text-[12px] text-text-secondary italic leading-relaxed border-l-2 border-slate-300 pl-3">
                    {clause.clause_text.trim().slice(0, 400)}
                    {clause.clause_text.length > 400 ? '…' : ''}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

interface AnalysisResult {
  upload: UploadResponse;
  simplify: SimplifyResponse;
  risk: RiskResponse;
}

export default function AnalyzePage() {
  const { language, setLanguage, setDocumentData } = useDocument();
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [pastedText, setPastedText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<StageKey | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Dropzone ──────────────────────────────────────────────────────────

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const msg = fileRejections[0]?.errors[0]?.message ?? 'File rejected';
      setError(msg.includes('size') ? 'File exceeds 5 MB limit.' : msg);
    },
  });

  // ── Submit flow ───────────────────────────────────────────────────────

  async function handleSubmit() {
    setError(null);
    setResult(null);

    const hasInput = mode === 'file' ? !!file : pastedText.trim().length > 50;
    if (!hasInput) {
      setError(mode === 'file' ? 'Please drop or select a PDF.' : 'Please paste at least 50 characters of text.');
      return;
    }

    try {
      // Stage 1: Upload
      setStage('uploading');
      const upload =
        mode === 'file' ? await uploadFile(file!) : await uploadText(pastedText.trim());

      // Stage 2: Simplify
      setStage('simplifying');
      const simplify = await simplifyDocument(upload.document_id, upload.full_text, language);

      // Stage 3: Risk
      setStage('risks');
      const risk = await analyzeRisk(upload.document_id, upload.full_text, language);

      setStage(null);
      setResult({ upload, simplify, risk });
      setDocumentData({
        documentId: upload.document_id,
        documentType: simplify.document_type,
        fullText: upload.full_text,
        simplifyResult: simplify,
        riskResult: risk,
      });
    } catch (err: unknown) {
      setStage(null);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setFile(null);
    setPastedText('');
    setStage(null);
  }

  const isLoading = stage !== null;
  const riskCount = result?.risk.clauses.filter((c) => clauseLevel(c) === 'risk').length ?? 0;
  const attentionCount = result?.risk.clauses.filter((c) => clauseLevel(c) === 'attention').length ?? 0;

  return (
    <main className="min-h-screen bg-background">

      {/* ── Top nav bar ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/compare"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-accent transition-colors"
            >
              <Scale className="w-3.5 h-3.5" />
              Compare Mode
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-text-secondary" />
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm font-medium text-text-primary bg-transparent border-none outline-none
                         cursor-pointer hover:text-primary transition-colors"
              aria-label="Output language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10 pb-20">

        {/* ── Page header ──────────────────────────────────────────────── */}
        {!result && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-primary mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              AI Analysis
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
              Analyze a Document
            </h1>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              Upload a PDF or paste text to get a plain-language summary, risk flags, and clause analysis.
            </p>
          </motion.div>
        )}

        {/* ── Loading ───────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden"
            >
              <StagedLoader currentStage={stage!} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Upload UI (shown when no result + not loading) ─────────── */}
        <AnimatePresence>
          {!result && !isLoading && (
            <motion.div
              key="upload-ui"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Mode toggle */}
              <div className="flex rounded-xl bg-slate-100 p-1 max-w-xs mx-auto">
                {(['file', 'text'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    id={`mode-${m}`}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold
                                transition-all duration-200 ${
                                  mode === m
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                                }`}
                  >
                    {m === 'file' ? <Upload className="w-3.5 h-3.5" /> : <Type className="w-3.5 h-3.5" />}
                    {m === 'file' ? 'Upload PDF' : 'Paste Text'}
                  </button>
                ))}
              </div>

              {/* Dropzone */}
              <AnimatePresence mode="wait">
                {mode === 'file' ? (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div
                      {...getRootProps()}
                      id="drop-zone"
                      className={`relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer
                                  transition-all duration-250 group
                                  ${
                                    isDragActive
                                      ? 'border-primary bg-blue-50/70 shadow-[0_0_0_4px_rgba(37,99,235,0.12),0_8px_32px_-8px_rgba(30,58,138,0.18)]'
                                      : file
                                      ? 'border-emerald-400 bg-emerald-50/40 shadow-[0_4px_20px_-4px_rgba(5,150,105,0.12),inset_0_1px_0_rgba(255,255,255,0.8)]'
                                      : 'border-slate-300 bg-white hover:border-primary/60 hover:bg-blue-50/30 shadow-[0_4px_20px_-6px_rgba(15,23,42,0.06),0_2px_8px_-2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]'
                                  }`}
                    >
                      <input {...getInputProps()} />

                      {/* 3D depth layers */}
                      <div className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{ boxShadow: 'inset 0 -3px 0 rgba(15,23,42,0.04)' }}
                        aria-hidden="true"
                      />

                      <AnimatePresence mode="wait">
                        {file ? (
                          <motion.div
                            key="file-selected"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-3"
                          >
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-emerald-800 text-sm">{file.name}</p>
                              <p className="text-xs text-emerald-600 mt-0.5">
                                {(file.size / 1024).toFixed(0)} KB — ready to analyze
                              </p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setFile(null); }}
                              className="text-xs text-text-secondary hover:text-red-500 transition-colors underline"
                            >
                              Remove
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="drop-prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-3"
                          >
                            <motion.div
                              animate={isDragActive ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center
                                          ${isDragActive ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-50'} transition-colors`}
                            >
                              <Upload className={`w-6 h-6 ${isDragActive ? 'text-primary' : 'text-text-secondary group-hover:text-primary'} transition-colors`} />
                            </motion.div>

                            <div>
                              <p className="font-semibold text-text-primary text-sm">
                                {isDragActive ? 'Drop it here…' : 'Drag & drop a PDF'}
                              </p>
                              <p className="text-xs text-text-secondary mt-1">
                                or{' '}
                                <span className="text-primary font-semibold underline underline-offset-2">
                                  click to browse
                                </span>
                                {' '}· PDF only · max 5 MB
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="textarea"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="relative rounded-2xl bg-white border border-slate-200 overflow-hidden
                                    shadow-[0_4px_20px_-6px_rgba(15,23,42,0.06),0_2px_8px_-2px_rgba(15,23,42,0.04),inset_0_-3px_0_rgba(15,23,42,0.04)]
                                    focus-within:border-primary/60 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1),0_4px_20px_-4px_rgba(30,58,138,0.12)] transition-all duration-200">
                      <textarea
                        id="paste-textarea"
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder="Paste the full text of your legal document here…"
                        rows={10}
                        className="w-full p-5 text-sm text-text-primary bg-transparent resize-none outline-none
                                   placeholder:text-text-secondary/50 leading-relaxed"
                      />
                      <div className="px-5 py-2.5 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <span className="text-[11px] text-text-secondary">
                          {pastedText.length > 0 ? `${pastedText.length.toLocaleString()} characters` : 'Minimum 50 characters'}
                        </span>
                        {pastedText.length > 0 && (
                          <button
                            onClick={() => setPastedText('')}
                            className="text-[11px] text-text-secondary hover:text-red-500 transition-colors"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                id="analyze-submit"
                onClick={handleSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white
                           bg-gradient-to-r from-primary to-primary-light
                           shadow-[0_4px_20px_-4px_rgba(30,58,138,0.4)]
                           hover:shadow-[0_6px_24px_-4px_rgba(30,58,138,0.5)]
                           transition-shadow duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Analyze Document
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {result && !isLoading && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Results header bar */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-between mb-8"
              >
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Analysis Complete</h2>
                  <p className="text-sm text-text-secondary mt-0.5">
                    {result.risk.clauses.length} clauses reviewed
                    {riskCount > 0 && ` · `}
                    {riskCount > 0 && (
                      <span className="text-red-600 font-semibold">{riskCount} risk{riskCount !== 1 ? 's' : ''}</span>
                    )}
                    {attentionCount > 0 && ` · `}
                    {attentionCount > 0 && (
                      <span className="text-amber-600 font-semibold">{attentionCount} attention needed</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/checklist?doc=${result.upload.document_id}&type=${encodeURIComponent(result.simplify.document_type)}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-accent bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:shadow-xs transition-all px-3.5 py-2 rounded-xl"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Checklist
                  </Link>
                  <Link
                    href={`/ask?doc=${result.upload.document_id}&type=${encodeURIComponent(result.simplify.document_type)}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-light hover:shadow-md hover:shadow-primary/20 transition-all px-3.5 py-2 rounded-xl"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Ask Questions
                  </Link>
                  <button
                    id="analyze-reset"
                    onClick={reset}
                    className="text-xs sm:text-sm font-medium text-text-secondary hover:text-primary transition-colors border border-slate-200 px-3 py-2 rounded-xl hover:border-primary/30 hover:bg-blue-50/50"
                  >
                    Analyze Another
                  </button>
                </div>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* 1. Document Type Badge & Ask Questions Quick Action */}
                <motion.div variants={scaleIn} className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {result.simplify.document_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/checklist?doc=${result.upload.document_id}&type=${encodeURIComponent(result.simplify.document_type)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>Action Checklist</span>
                    </Link>
                    <Link
                      href={`/ask?doc=${result.upload.document_id}&type=${encodeURIComponent(result.simplify.document_type)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat with AI &rarr;</span>
                    </Link>
                  </div>
                </motion.div>

                {/* 2. Plain Summary */}
                <motion.div
                  variants={fadeSlide}
                  className="bg-white rounded-2xl border border-slate-200/70 p-6
                             shadow-[0_4px_20px_-6px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-700 text-text-primary" style={{ fontWeight: 700 }}>Plain-Language Summary</h3>
                  </div>
                  <p className="text-[14px] text-text-primary leading-relaxed whitespace-pre-line">
                    {result.simplify.plain_summary}
                  </p>
                </motion.div>

                {/* 3. Key Points */}
                {result.simplify.key_points?.length > 0 && (
                  <motion.div
                    variants={fadeSlide}
                    className="bg-white rounded-2xl border border-slate-200/70 p-6
                               shadow-[0_4px_20px_-6px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                        <ClipboardList className="w-4 h-4 text-violet-600" />
                      </div>
                      <h3 className="font-700 text-text-primary" style={{ fontWeight: 700 }}>Key Points</h3>
                    </div>
                    <motion.ul
                      variants={staggerContainer}
                      className="space-y-2.5"
                    >
                      {result.simplify.key_points.map((pt, i) => (
                        <motion.li
                          key={i}
                          variants={fadeSlide}
                          custom={i}
                          className="flex items-start gap-2.5 text-[13px] text-text-primary leading-relaxed"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </motion.div>
                )}

                {/* 4. Clause Analysis */}
                {result.risk.clauses.length > 0 && (
                  <motion.div variants={fadeSlide}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                      </div>
                      <h3 className="font-700 text-text-primary" style={{ fontWeight: 700 }}>Clause Analysis</h3>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-2 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                      <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide mr-1 self-center">Legend:</span>
                      {(Object.entries(SEVERITY_STYLES) as [keyof typeof SEVERITY_STYLES, typeof SEVERITY_STYLES[keyof typeof SEVERITY_STYLES]][]).map(([key, s]) => (
                        <span
                          key={key}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                      ))}
                      <span className="text-[11px] text-text-secondary self-center ml-auto flex items-center gap-1">
                        <Info className="w-3 h-3" /> Click any clause to expand
                      </span>
                    </div>

                    <motion.div
                      variants={staggerContainer}
                      className="space-y-2.5"
                    >
                      {result.risk.clauses.map((clause, i) => (
                        <ClauseCard key={i} clause={clause} index={i} />
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {/* Disclaimer */}
                <motion.div
                  variants={fadeSlide}
                  className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/70 border border-amber-200/70"
                >
                  <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-[12px] text-amber-800 leading-relaxed">
                    <strong>Reminder:</strong> This analysis is informational only and does not
                    constitute legal advice. All explanations use phrasing like{' '}
                    <em>"this may be worth clarifying"</em>. Consult a qualified attorney before
                    making any legally significant decisions.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
