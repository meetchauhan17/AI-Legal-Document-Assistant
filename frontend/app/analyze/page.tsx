'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Upload,
  Type,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  BookOpen,
  ClipboardList,
  Globe,
  MessageSquare,
  Scale,
  RotateCcw,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useDocument } from '@/context/DocumentContext';
import { getTranslations } from '@/lib/translations';
import PillBadge from '@/components/ui/PillBadge';
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
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';

// ── Sample Document for Quick Evaluation ──────────────────────────────────

const SAMPLE_CONTRACT = `RESIDENTIAL LEASE AGREEMENT
This Agreement is entered into on March 1, 2026, between Greenfield Properties LLC ("Landlord") and Alex Mercer ("Tenant").
1. PREMISES & TERM: Landlord leases to Tenant the premises at 742 Evergreen Terrace for a fixed term of 12 months, beginning April 1, 2026 and ending March 31, 2027.
2. MONTHLY RENT: Tenant agrees to pay $2,200.00 on or before the 1st of each month. A late fee of $75.00 applies if rent is not received within a 3-day grace period.
3. SECURITY DEPOSIT: Tenant shall deposit $4,400.00 upon execution. Landlord reserves the unilateral right to withhold deposits for standard wear-and-tear without itemized receipts within 60 days.
4. AUTO-RENEWAL TRAP: This lease shall automatically renew for an additional 12-month period unless written certified notice is received 90 days prior to term expiration.
5. MAINTENANCE & REPAIRS: Tenant is liable for all plumbing, HVAC servicing, and mechanical repairs regardless of pre-existing condition.
6. UNILATERAL TERMINATION: Landlord may terminate this lease and execute immediate lockout with 3 days notice upon any alleged rule infraction.
7. GOVERNING LAW: State of Oregon.`;

// ── Constants & Types ─────────────────────────────────────────────────────

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
];

const LOADING_STAGES = [
  { key: 'uploading', label: 'Reading document…', desc: 'Extracting text and establishing in-memory session', icon: Upload, color: 'from-[#4338CA] to-[#6366F1]' },
  { key: 'simplifying', label: 'Simplifying language…', desc: 'Translating legalese into plain English and key takeaways', icon: BookOpen, color: 'from-[#8B5CF6] to-[#6D28D9]' },
  { key: 'risks', label: 'Scanning for risks…', desc: 'Evaluating one-sided clauses, liability waivers, and hidden traps', icon: ShieldAlert, color: 'from-[#F97316] to-[#FB923C]' },
] as const;

type StageKey = typeof LOADING_STAGES[number]['key'];

interface AnalysisResult {
  upload: UploadResponse;
  simplify: SimplifyResponse;
  risk: RiskResponse;
}

function clauseLevel(clause: Clause): 'standard' | 'attention' | 'risk' {
  const raw = (clause.category_level ?? clause.category ?? '').toLowerCase();
  if (raw.includes('risk')) return 'risk';
  if (raw.includes('attention')) return 'attention';
  return 'standard';
}

const SEVERITY_CONFIG = {
  risk: {
    borderLeft: 'border-l-4 border-l-[#DB2777]',
    badgeBg: 'bg-pink-100 text-pink-700',
    dotBg: 'bg-[#DB2777]',
    icon: ShieldAlert,
    label: 'Potential Risk',
  },
  attention: {
    borderLeft: 'border-l-4 border-l-[#F59E0B]',
    badgeBg: 'bg-amber-100 text-amber-700',
    dotBg: 'bg-[#F59E0B]',
    icon: AlertTriangle,
    label: 'Attention Needed',
  },
  standard: {
    borderLeft: 'border-l-4 border-l-[#10B981]',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    dotBg: 'bg-[#10B981]',
    icon: ShieldCheck,
    label: 'Standard Terms',
  },
};

// ── Clause Item Component ─────────────────────────────────────────────────

function ClauseItem({ clause, index, t }: { clause: Clause; index: number; t: ReturnType<typeof getTranslations> }) {
  const level = clauseLevel(clause);
  const severityConfig = {
    risk: {
      borderLeft: 'border-l-4 border-l-[#DB2777]',
      badgeBg: 'bg-pink-100 text-pink-700',
      icon: ShieldAlert,
      label: t.analyze.potentialRisk,
    },
    attention: {
      borderLeft: 'border-l-4 border-l-[#F59E0B]',
      badgeBg: 'bg-amber-100 text-amber-700',
      icon: AlertTriangle,
      label: t.analyze.attentionNeeded,
    },
    standard: {
      borderLeft: 'border-l-4 border-l-[#10B981]',
      badgeBg: 'bg-emerald-100 text-emerald-700',
      icon: ShieldCheck,
      label: t.analyze.standardTerms,
    },
  };
  const cfg = severityConfig[level];
  const [expanded, setExpanded] = useState(false);
  const IconComponent = cfg.icon;

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`rounded-[24px] bg-white border border-white/90 p-5 shadow-clayCard ${cfg.borderLeft} hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-[16px] bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 shadow-clayPressed">
            <IconComponent className="w-4 h-4 text-clay-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-heading ${cfg.badgeBg}`}>
                {cfg.label}
              </span>
              <span className="text-xs font-bold text-clay-foreground">
                {clause.category || 'General Clause'}
              </span>
            </div>
            <p className="font-sans text-xs sm:text-sm text-clay-foreground font-medium leading-snug line-clamp-2">
              {clause.clause_text.replace(/\n/g, ' ')}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-clay-muted hover:text-clay-accent transition-colors w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100/80 space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-clay-foreground font-heading block mb-1">
              {t.analyze.practicalExplanation}
            </span>
            <p className="font-sans text-xs sm:text-sm text-clay-foreground leading-relaxed bg-slate-50/80 p-3.5 rounded-[16px] border border-slate-100">
              {clause.explanation}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-clay-foreground font-heading block mb-1">
              {t.analyze.exactExcerpt}
            </span>
            <p className="font-mono text-xs text-clay-foreground italic bg-[#EFEBF5]/60 p-3.5 rounded-[16px] border border-white shadow-clayPressed leading-relaxed">
              &quot;{clause.clause_text.trim()}&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Analyze Page Component ───────────────────────────────────────────

export default function AnalyzePage() {
  const { language, setLanguage, setDocumentData } = useDocument();
  const t = getTranslations(language);

  // Mode: 'file' or 'text'
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [pastedText, setPastedText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Loading & Stages
  const [stage, setStage] = useState<StageKey | null>(null);
  const [completedStages, setCompletedStages] = useState<StageKey[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dropzone Setup
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDropRejected: (rejections) => {
      const msg = rejections[0]?.errors[0]?.message || 'File rejected';
      setError(msg.includes('size') ? 'File size exceeds maximum allowed limit of 5MB.' : 'Only PDF documents are supported.');
    },
  });

  const handleLoadSample = () => {
    setMode('text');
    setPastedText(SAMPLE_CONTRACT);
    setFile(null);
    setError(null);
  };

  // Submit Handler
  async function handleSubmit() {
    setError(null);
    setResult(null);

    const hasInput = mode === 'file' ? !!file : pastedText.trim().length >= 30;
    if (!hasInput) {
      setError(mode === 'file' ? 'Please upload a PDF document.' : 'Please enter or paste at least 30 characters of text.');
      return;
    }

    try {
      setCompletedStages([]);

      // Stage 1: Upload / Extract
      setStage('uploading');
      const uploadRes = mode === 'file' ? await uploadFile(file!) : await uploadText(pastedText.trim());
      setCompletedStages(['uploading']);

      // Stage 2: Simplify
      setStage('simplifying');
      const simplifyRes = await simplifyDocument(uploadRes.document_id, uploadRes.full_text, language);
      setCompletedStages(['uploading', 'simplifying']);

      // Stage 3: Risk Classification
      setStage('risks');
      const riskRes = await analyzeRisk(uploadRes.document_id, uploadRes.full_text, language);
      setCompletedStages(['uploading', 'simplifying', 'risks']);

      setStage(null);
      const fullAnalysis: AnalysisResult = {
        upload: uploadRes,
        simplify: simplifyRes,
        risk: riskRes,
      };
      setResult(fullAnalysis);

      // Save to shared Document Context
      setDocumentData({
        documentId: uploadRes.document_id,
        documentType: simplifyRes.document_type,
        fullText: uploadRes.full_text,
        simplifyResult: simplifyRes,
        riskResult: riskRes,
      });
    } catch (err: any) {
      setStage(null);
      setError(err.message || 'Analysis failed. Please check your document and try again.');
    }
  }

  // Auto re-translate active analysis when language is changed
  const prevLangRef = React.useRef(language);
  React.useEffect(() => {
    if (!result || prevLangRef.current === language) {
      prevLangRef.current = language;
      return;
    }
    prevLangRef.current = language;

    let isSubscribed = true;
    async function retranslate() {
      if (!result) return;
      try {
        setStage('simplifying');
        const [simplifyRes, riskRes] = await Promise.all([
          simplifyDocument(result.upload.document_id, result.upload.full_text, language),
          analyzeRisk(result.upload.document_id, result.upload.full_text, language),
        ]);
        if (isSubscribed) {
          const updated: AnalysisResult = {
            upload: result.upload,
            simplify: simplifyRes,
            risk: riskRes,
          };
          setResult(updated);
          setDocumentData({
            documentId: result.upload.document_id,
            documentType: simplifyRes.document_type,
            fullText: result.upload.full_text,
            simplifyResult: simplifyRes,
            riskResult: riskRes,
          });
        }
      } catch (err) {
        console.error('Failed to retranslate document on language change:', err);
      } finally {
        if (isSubscribed) setStage(null);
      }
    }

    retranslate();
    return () => {
      isSubscribed = false;
    };
  }, [language, result, setDocumentData]);

  const handleReset = () => {
    setResult(null);
    setError(null);
    setFile(null);
    setPastedText('');
    setStage(null);
    setCompletedStages([]);
  };

  const isLoading = stage !== null;
  const riskCount = result?.risk.clauses.filter((c) => clauseLevel(c) === 'risk').length ?? 0;
  const attentionCount = result?.risk.clauses.filter((c) => clauseLevel(c) === 'attention').length ?? 0;
  const standardCount = result?.risk.clauses.filter((c) => clauseLevel(c) === 'standard').length ?? 0;

  return (
    <main className="min-h-screen bg-clay-canvas text-clay-foreground pb-24">
      {/* ── STICKY TOP NAVIGATION BAR ─────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/80 px-4 sm:px-6 py-3.5 shadow-clayCard">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-[16px] bg-white shadow-clayButton text-clay-foreground hover:text-clay-accent transition-colors"
              title="Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-heading font-black text-sm text-clay-foreground tracking-tight">
                {t.analyze.title}
              </h1>
              <p className="text-[11px] text-clay-foreground font-medium">{t.analyze.subtitle}</p>
            </div>
          </div>

          {/* 6. Language selector: Pill-shaped dropdown matching clay button aesthetic */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 min-h-[44px] rounded-full bg-white shadow-clayButton border border-white/80 text-xs font-heading font-bold text-clay-foreground">
              <Globe className="w-3.5 h-3.5 text-clay-accent shrink-0" />
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent font-heading font-bold text-clay-foreground text-xs focus:outline-none cursor-pointer pr-1"
                aria-label="Output Language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">

        {/* ── PAGE HEADER (When idle) ─────────────────────────────────── */}
        {!result && !isLoading && (
          <div className="text-center mb-8">
            <div className="mb-3.5 flex justify-center">
              <PillBadge icon={Sparkles}>
                {t.analyze.tagline}
              </PillBadge>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-clay-foreground tracking-tight mb-2">
              {t.analyze.heading}
            </h2>
            <p className="font-sans text-sm sm:text-base text-clay-foreground max-w-lg mx-auto">
              {t.analyze.description}
            </p>

            {/* Quick 1-Click Sample Trigger */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-clay-accent hover:text-clay-accent-alt bg-white shadow-clayButton hover:shadow-clayButtonHover active:scale-[0.95] px-4 py-2.5 min-h-[44px] rounded-full border border-white/80 transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-clay-accent" />
                {t.analyze.loadSampleButton}
              </button>
            </div>
          </div>
        )}

        {/* ── 1 & 2. INPUT & UPLOAD ZONE ─────────────────────────────── */}
        {!result && !isLoading && (
          <div className="space-y-6">
            {/* Mode switch */}
            <div className="flex bg-[#EFEBF5] p-1.5 rounded-[24px] shadow-clayPressed max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => setMode('file')}
                className={`flex-1 flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 rounded-[16px] text-xs font-heading font-bold transition-all ${
                  mode === 'file'
                    ? 'bg-white text-clay-foreground shadow-clayButton'
                    : 'text-clay-foreground hover:text-clay-accent'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                {t.analyze.tabUpload}
              </button>
              <button
                type="button"
                onClick={() => setMode('text')}
                className={`flex-1 flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 rounded-[16px] text-xs font-heading font-bold transition-all ${
                  mode === 'text'
                    ? 'bg-white text-clay-foreground shadow-clayButton'
                    : 'text-clay-foreground hover:text-clay-accent'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                {t.analyze.tabPaste}
              </button>
            </div>

            {/* Mode File: 1. LARGE RECESSED / CONCAVE UPLOAD TRAY */}
            {mode === 'file' ? (
              <div>
                {!file ? (
                  <div
                    {...getRootProps()}
                    id="drop-zone"
                    className={`relative rounded-[32px] p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 bg-[#EFEBF5] shadow-clayPressed border-2 border-dashed ${
                      isDragActive
                        ? 'border-clay-accent bg-clay-accent/5 ring-4 ring-clay-accent/20 scale-[1.01]'
                        : 'border-clay-accent/25 hover:border-clay-accent/60 hover:bg-[#EBE6F5]'
                    }`}
                  >
                    <input {...getInputProps()} />

                    {/* Gradient icon orb */}
                    <div className={`w-16 h-16 mx-auto mb-5 rounded-[24px] flex items-center justify-center shadow-clayButton transition-all duration-300 ${
                      isDragActive
                        ? 'bg-gradient-to-br from-clay-accent to-clay-accent-alt scale-110'
                        : 'bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]'
                    } text-white`}>
                      <Upload className="w-8 h-8" />
                    </div>

                    {isDragActive ? (
                      <>
                        <h3 className="font-heading font-black text-xl text-clay-accent mb-1">Release to upload!</h3>
                        <p className="font-sans text-sm text-clay-accent/80">Drop your PDF here to begin analysis</p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-heading font-black text-lg text-clay-foreground mb-1">
                          {t.analyze.dragDropText}
                        </h3>
                        <p className="font-sans text-xs text-clay-muted mb-3">
                          or <span className="text-clay-accent font-bold underline">{t.analyze.orBrowse}</span>
                        </p>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 shadow-clayCard text-[11px] font-heading font-semibold text-clay-foreground">
                            <FileText className="w-3 h-3 text-clay-accent" /> PDF format only
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 shadow-clayCard text-[11px] font-heading font-semibold text-clay-foreground">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Max 5MB
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* File selected state */
                  <div className="p-6 rounded-[32px] bg-white border border-emerald-100 shadow-clayCard">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[24px] bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-clayPressed shrink-0">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-sm text-clay-foreground truncate max-w-[200px] sm:max-w-xs">
                            {file.name}
                          </h4>
                          <p className="text-xs text-clay-muted mt-0.5">
                            {file.size >= 1024 * 1024
                              ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                              : `${(file.size / 1024).toFixed(1)} KB`
                            } · PDF · Ready to analyze
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="shrink-0 text-xs font-bold text-clay-muted hover:text-red-500 underline transition-colors min-h-[44px] px-3 flex items-center gap-1 rounded-xl hover:bg-red-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Change
                      </button>
                    </div>
                    <div className="mt-4 pt-3 border-t border-emerald-50 flex items-center gap-2 text-[11px] text-emerald-700 font-heading font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      File will be processed in-memory only — no permanent storage.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Mode Text: "Paste text instead" Textarea */
              <div>
                <Textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={`Paste the full text of your legal agreement here...\n\nTip: Include all numbered sections for the most accurate analysis. You need at least 30 characters.`}
                  rows={8}
                />
                <div className="mt-2 flex items-center justify-between text-xs px-2">
                  <span className={`font-heading font-semibold transition-colors ${
                    pastedText.length === 0 ? 'text-clay-muted'
                    : pastedText.length < 30 ? 'text-amber-600'
                    : 'text-emerald-600'
                  }`}>
                    {pastedText.length === 0 ? 'Start typing or paste contract text'
                      : pastedText.length < 30 ? `${pastedText.length}/30 characters minimum`
                      : `${pastedText.length.toLocaleString()} characters ✓`
                    }
                  </span>
                  {pastedText.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPastedText('')}
                      className="min-h-[44px] flex items-center gap-1 hover:text-red-500 transition-colors text-clay-muted font-heading font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex justify-center pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={isLoading}
                id="analyze-submit"
                className="w-full sm:w-80 shadow-clayButton"
              >
                {t.analyze.analyzeButton}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ── 3. STAGED LOADING SEQUENCE (3 Sequential Status Cards) ───── */}
        {isLoading && (
          <div className="py-8 space-y-4 max-w-xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="font-heading font-black text-2xl text-clay-foreground">
                {t.analyze.heading}
              </h3>
              <p className="font-sans text-xs text-clay-foreground mt-1">
                {t.analyze.stageUploading}
              </p>
            </div>

            {LOADING_STAGES.map((s, idx) => {
              const isCurrent = stage === s.key;
              const isDone = completedStages.includes(s.key);
              const IconComp = s.icon;
              const stageLabels: Record<StageKey, { label: string; desc: string }> = {
                uploading: { label: t.analyze.stageUploading, desc: 'Extracting text and establishing in-memory session' },
                simplifying: { label: t.analyze.stageSimplifying, desc: 'Translating legalese into plain English and key takeaways' },
                risks: { label: t.analyze.stageRisks, desc: 'Evaluating one-sided clauses, liability waivers, and hidden traps' },
              };
              const currentInfo = stageLabels[s.key];

              return (
                <Card
                  key={s.key}
                  variant="glass"
                  className={`p-5 transition-all duration-300 border ${
                    isCurrent
                      ? 'border-clay-accent shadow-deepClay bg-white'
                      : isDone
                      ? 'border-clay-success/40 bg-white/90 shadow-clayCard'
                      : 'border-slate-200/60 bg-white/40 opacity-50 shadow-none'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Icon with clay-breathe animation while active */}
                      <div
                        className={`w-12 h-12 rounded-[24px] flex items-center justify-center text-white shrink-0 ${
                          isDone
                            ? 'bg-clay-success shadow-clayPressed'
                            : isCurrent
                            ? `bg-gradient-to-br ${s.color} shadow-clayButton`
                            : 'bg-slate-300'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                          <IconComp className="w-6 h-6" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-clay-foreground uppercase tracking-wider font-heading">
                            Stage {idx + 1}
                          </span>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-clay-accent/15 text-clay-accent font-heading">
                              <span className="w-1.5 h-1.5 rounded-full bg-clay-accent animate-ping" />
                              Processing
                            </span>
                          )}
                        </div>
                        <h4 className="font-heading font-bold text-base text-clay-foreground">
                          {currentInfo.label}
                        </h4>
                        <p className="text-xs text-clay-foreground">
                          {currentInfo.desc}
                        </p>
                      </div>
                    </div>

                    {isDone && (
                      <span className="text-xs font-bold text-clay-success flex items-center gap-1 font-heading">
                        Done
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── 4. STAGGERED RESULTS SECTION ────────────────────────────── */}
        {result && !isLoading && (
          <div className="space-y-8 animate-fade-in">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
              <div>
                <h2 className="font-heading font-black text-2xl text-clay-foreground">
                  {t.analyze.title}
                </h2>
                <p className="font-sans text-xs text-clay-foreground mt-0.5">
                  {result.risk.clauses.length} clauses analyzed · {riskCount} {t.analyze.potentialRisk} · {attentionCount} {t.analyze.attentionNeeded}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  {t.analyze.newAnalysis}
                </Button>
              </div>
            </div>

            {/* 4a. Document Type Badge & Fast Navigation Links */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-clay-accent to-clay-accent-alt text-white font-heading font-black text-xs shadow-clayButton">
                <FileText className="w-4 h-4" />
                <span>{result.simplify.document_type}</span>
              </div>

              {/* Fast links to other pages */}
              <div className="flex items-center gap-2">
                <Link href={`/ask?doc=${result.upload.document_id}`}>
                  <Button variant="outline" size="sm" className="bg-white/80">
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                    {t.analyze.askQuestions}
                  </Button>
                </Link>

                <Link href={`/checklist?doc=${result.upload.document_id}`}>
                  <Button variant="outline" size="sm" className="bg-white/80">
                    <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
                    {t.analyze.viewChecklist}
                  </Button>
                </Link>
              </div>
            </div>

            {/* 4b. Plain-Language Summary (Solid variant Card) */}
            <Card variant="solid" className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-[24px] bg-clay-accent/15 text-clay-accent flex items-center justify-center shadow-clayPressed">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-clay-accent font-heading">
                    Clear Translation
                  </span>
                  <h3 className="font-heading font-black text-xl text-clay-foreground">
                    {t.analyze.executiveSummary}
                  </h3>
                </div>
              </div>
              <p className="font-sans text-sm sm:text-base text-clay-foreground leading-relaxed whitespace-pre-line">
                {result.simplify.plain_summary}
              </p>
            </Card>

            {/* 4c. Key Points List (Card with emerald checkmarks) */}
            {result.simplify.key_points && result.simplify.key_points.length > 0 && (
              <Card variant="solid" className="p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-[24px] bg-clay-success/15 text-clay-success flex items-center justify-center shadow-clayPressed">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-clay-success font-heading">
                      Executive Takeaways
                    </span>
                    <h3 className="font-heading font-black text-xl text-clay-foreground">
                      {t.analyze.keyTakeaways}
                    </h3>
                  </div>
                </div>

                <ul className="space-y-3">
                  {result.simplify.key_points.map((pt, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-xs sm:text-sm text-clay-foreground font-medium leading-relaxed p-2.5 rounded-[16px] hover:bg-slate-50 transition-colors"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-clay-success/15 text-clay-success flex items-center justify-center shrink-0 mt-0.5 shadow-clayPressed">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* 4d & 5. Clause Analysis & Colored Legend Card */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[24px] bg-gradient-to-br from-pink-400 to-pink-600 text-white flex items-center justify-center shadow-clayButton">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 font-heading">
                      Protection Audit
                    </span>
                    <h3 className="font-heading font-black text-xl text-clay-foreground">
                      {t.analyze.clauseMatrix}
                    </h3>
                  </div>
                </div>

                <span className="text-xs font-bold text-clay-foreground">
                  {result.risk.clauses.length} evaluated
                </span>
              </div>

              {/* 5. LEGEND CARD at top of Clause Analysis */}
              <Card variant="glass" className="p-4 mb-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-5">
                    <span className="text-[11px] font-bold text-clay-foreground uppercase tracking-wider font-heading">
                      Classification:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#10B981] shadow-clayPressed" />
                      <span className="font-bold text-clay-foreground text-xs">{t.analyze.standardTerms} ({standardCount})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#F59E0B] shadow-clayPressed" />
                      <span className="font-bold text-clay-foreground text-xs">{t.analyze.attentionNeeded} ({attentionCount})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#DB2777] shadow-clayPressed" />
                      <span className="font-bold text-clay-foreground text-xs">{t.analyze.potentialRisk} ({riskCount})</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-clay-foreground flex items-center gap-1 font-medium">
                    <Info className="w-3.5 h-3.5 text-clay-accent" /> Click any clause to view full explanation
                  </span>
                </div>
              </Card>

              {/* Clause List: Each as its own rounded-[24px] Card with colored left border */}
              <div className="space-y-3">
                {result.risk.clauses.map((clause, i) => (
                  <ClauseItem key={i} clause={clause} index={i} t={t} />
                ))}
              </div>
            </div>

            {/* Bottom Actions Banner */}
            <Card variant="hero" className="p-8 sm:p-10 border border-clay-accent/30 bg-white/80">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-heading font-black text-xl text-clay-foreground mb-1">
                    {t.analyze.nextSteps}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-clay-foreground">
                    {t.analyze.description}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <Link href={`/ask?doc=${result.upload.document_id}`}>
                    <Button variant="secondary" size="md">
                      {t.analyze.askQuestions}
                    </Button>
                  </Link>
                  <Link href={`/checklist?doc=${result.upload.document_id}`}>
                    <Button variant="primary" size="md">
                      {t.analyze.viewChecklist} &rarr;
                    </Button>
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
