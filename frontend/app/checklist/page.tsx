'use client';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ClipboardList,
  HelpCircle,
  ShieldCheck,
  Printer,
  Copy,
  Check,
  Globe,
  RotateCcw,
  Scale,
  MessageSquare,
  FileDown,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { generateChecklist, type ChecklistResponse } from '@/lib/api';
import Document3D from '@/components/3d/Document3D';
import { useDocument } from '@/context/DocumentContext';

// ── Animation Variants ───────────────────────────────────────────────────

const fadeSlide = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
];

// ── Interactive Animated Checkbox Component ──────────────────────────────

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: () => void;
  id: string;
}

function AnimatedCheckbox({ checked, onChange, id }: AnimatedCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      id={id}
      onClick={onChange}
      className={`relative w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 select-none ${
        checked
          ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
          : 'bg-white border-slate-300 hover:border-emerald-400'
      }`}
    >
      <AnimatePresence>
        {checked && (
          <motion.svg
            key="check"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <motion.path
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}

// ── Lawyer-Prep Modal Component ──────────────────────────────────────────

interface LawyerPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string;
  checklist: string[];
  questions: string[];
  checkedIndices: Set<number>;
}

function LawyerPrepModal({
  isOpen,
  onClose,
  documentType,
  checklist,
  questions,
  checkedIndices,
}: LawyerPrepModalProps) {
  const [copied, setCopied] = useState(false);

  const uncheckedItems = checklist.filter((_, idx) => !checkedIndices.has(idx));

  const handleCopyText = () => {
    const text = `LAWYER CONSULTATION PREPARATION BRIEF
Document Type: ${documentType}
Date: ${new Date().toLocaleDateString()}

==================================================
1. UNRESOLVED / ACTION ITEMS BEFORE SIGNING:
${uncheckedItems.map((item, i) => `[ ] ${i + 1}. ${item}`).join('\n')}

==================================================
2. KEY QUESTIONS TO ASK LEGAL COUNSEL:
${questions.map((q, i) => `[?] ${i + 1}. ${q}`).join('\n')}

==================================================
Generated via Legal Document Assistant (Informational Use Only)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="bg-surface rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary" style={{ fontWeight: 700 }}>
                Lawyer Consultation Brief
              </h3>
              <p className="text-[11px] text-text-secondary">Summary formatted for legal review</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-text-primary">
          {/* Top Document Metadata */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Document Review</span>
              <p className="font-bold text-sm text-text-primary">{documentType}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-text-secondary uppercase">Generated</span>
              <p className="text-xs font-semibold text-text-primary">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Unresolved items */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-text-secondary mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-accent" />
              Items Requiring Clarification or Verification ({uncheckedItems.length})
            </h4>
            {uncheckedItems.length > 0 ? (
              <ul className="space-y-2">
                {uncheckedItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-relaxed p-2.5 bg-slate-50 rounded-lg border border-slate-200/70">
                    <span className="font-bold text-accent shrink-0">{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                All pre-signing checklist items have been checked off!
              </p>
            )}
          </div>

          {/* Questions to ask */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-text-secondary mb-2.5 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
              Specific Questions to Present to Attorney ({questions.length})
            </h4>
            <ul className="space-y-2">
              {questions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-xs leading-relaxed p-2.5 bg-amber-50/50 rounded-lg border border-amber-200/60">
                  <span className="font-bold text-primary shrink-0">Q{i + 1}:</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <span className="text-[11px] text-text-secondary">Informational Brief</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-text-primary text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Brief'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Checklist Page Content Component ─────────────────────────────────────

function ChecklistContent() {
  const searchParams = useSearchParams();
  const { documentId: ctxDocId, documentType: ctxDocType, language, setLanguage, setChecklistData } = useDocument();

  const documentId = searchParams.get('doc') || searchParams.get('document_id') || ctxDocId || '';
  const docTypeParam = searchParams.get('type') || (ctxDocId ? ctxDocType : '') || 'Document';

  const [data, setData] = useState<ChecklistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [isLawyerModalOpen, setIsLawyerModalOpen] = useState(false);

  useEffect(() => {
    if (!documentId) return;

    let isSubscribed = true;
    async function fetchChecklist() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await generateChecklist(documentId, '', [], language);
        if (isSubscribed) {
          setData(res);
          setChecklistData(res);
          setCheckedItems(new Set());
        }
      } catch (err: any) {
        if (isSubscribed) {
          setError(err.message || 'Failed to generate checklist.');
        }
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    fetchChecklist();
    return () => {
      isSubscribed = false;
    };
  }, [documentId, language]);

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const totalItems = data?.before_signing_checklist.length ?? 0;
  const completedCount = checkedItems.size;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // ── 1. Empty State (No Document Loaded) ─────────────────────────────────
  if (!documentId) {
    return (
      <main className="min-h-screen bg-background flex flex-col justify-between py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto w-full pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors mb-6 group font-medium"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-surface rounded-2xl border border-slate-200/80 shadow-soft p-8 sm:p-12 text-center"
          >
            <div className="w-44 h-44 mx-auto mb-6">
              <Document3D className="w-full h-full" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-accent/10 text-accent mb-4">
              <ClipboardList className="w-3.5 h-3.5" />
              Pre-Signing Action Checklist
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3" style={{ fontWeight: 700 }}>
              No Document Currently Loaded
            </h1>

            <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8">
              Upload and analyze a legal contract first. We'll extract its specific obligations, notice deadlines, and penalty clauses to build a tailored pre-signing checklist.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/analyze">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze a Document First
                </motion.button>
              </Link>
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-text-primary font-medium rounded-xl transition-colors text-sm"
                >
                  Return to Home
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="text-center text-[11px] text-text-secondary pt-8 pb-4">
          Legal Document Assistant · Pre-signing Action Verification
        </div>
      </main>
    );
  }

  // ── 2. Active Checklist Interface ───────────────────────────────────────
  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Top Persistent Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/analyze"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-text-secondary hover:text-text-primary transition-colors"
              title="Back to Analysis"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-primary tracking-tight" style={{ fontWeight: 700 }}>
                    Pre-Signing Checklist
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-primary border border-blue-200">
                    {docTypeParam}
                  </span>
                </div>
                <div className="text-[11px] text-text-secondary font-mono flex items-center gap-2">
                  <span>ID: {documentId.substring(0, 8)}…</span>
                  <span>·</span>
                  <Link href={`/ask?doc=${documentId}&type=${encodeURIComponent(docTypeParam)}`} className="text-primary hover:underline font-sans font-medium flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Q&A Chat
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5 self-end sm:self-center">
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
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {/* Loading State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-10 h-10 rounded-full border-3 border-accent border-t-transparent animate-spin" />
            <div>
              <p className="text-sm font-bold text-text-primary" style={{ fontWeight: 700 }}>
                Synthesizing Pre-Signing Checklist…
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Grounding action items and questions in your document's specific terms and risks
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2 mb-6">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Checklist Content */}
        {data && !isLoading && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* ── 1. Progress Indicator Card ─────────────────────────────── */}
            <motion.div
              variants={fadeSlide}
              className="bg-surface rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-soft"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-text-primary" style={{ fontWeight: 700 }}>
                    Verification Progress
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-text-secondary">
                    {completedCount} of {totalItems} completed ({progressPercent}%)
                  </span>
                </div>
                {progressPercent === 100 && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All Checks Verified!
                  </motion.span>
                )}
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-gradient-to-r from-primary via-primary-light to-accent rounded-full"
                />
              </div>
            </motion.div>

            {/* ── 2. Before Signing Interactive Checklist ─────────────────── */}
            <motion.div variants={fadeSlide} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary" style={{ fontWeight: 700 }}>
                      Before Signing Checklist
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Actionable verifications extracted directly from your contract
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (checkedItems.size === totalItems) {
                      setCheckedItems(new Set());
                    } else {
                      setCheckedItems(new Set(Array.from({ length: totalItems }, (_, i) => i)));
                    }
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {checkedItems.size === totalItems ? 'Uncheck All' : 'Check All'}
                </button>
              </div>

              {/* Checklist items list */}
              <div className="space-y-2.5">
                {data.before_signing_checklist.map((item, idx) => {
                  const isChecked = checkedItems.has(idx);
                  return (
                    <motion.div
                      key={idx}
                      variants={fadeSlide}
                      custom={idx}
                      onClick={() => toggleCheck(idx)}
                      className={`group p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer select-none ${
                        isChecked
                          ? 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <AnimatedCheckbox
                        id={`check-${idx}`}
                        checked={isChecked}
                        onChange={() => toggleCheck(idx)}
                      />
                      <div className="flex-1 text-xs sm:text-[13.5px] leading-relaxed">
                        <span
                          className={`transition-colors ${
                            isChecked
                              ? 'text-emerald-900 line-through opacity-80'
                              : 'text-text-primary font-medium'
                          }`}
                        >
                          {item}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* ── 3. Questions to Ask Legal Counsel Section ───────────────── */}
            <motion.div variants={fadeSlide} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-accent">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary" style={{ fontWeight: 700 }}>
                    Questions to Ask Before Signing
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Targeted inquiries referencing identified contract clauses
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {data.questions_to_ask.map((question, qIdx) => (
                  <motion.div
                    key={qIdx}
                    variants={fadeSlide}
                    custom={qIdx}
                    className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/70 via-amber-50/40 to-white border border-amber-200/70 shadow-2xs flex items-start gap-3.5"
                  >
                    {/* 3D-styled question number badge */}
                    <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-amber-200/60 flex items-center justify-center font-bold text-xs text-accent shrink-0 mt-0.5">
                      {String(qIdx + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-[13.5px] font-semibold text-text-primary leading-relaxed">
                        {question}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── 4. Lawyer-Prep Summary Footer Action ─────────────────────── */}
            <motion.div
              variants={fadeSlide}
              className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-primary to-blue-950 text-white shadow-lg shadow-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div>
                <h3 className="text-base font-bold" style={{ fontWeight: 700 }}>
                  Ready to Consult an Attorney?
                </h3>
                <p className="text-xs text-blue-200 mt-1 max-w-md">
                  Generate a structured consultation brief formatted with unresolved checklist items and targeted questions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <Link
                  href={`/lawyer-prep?doc=${documentId}&type=${encodeURIComponent(docTypeParam)}`}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-primary font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Scale className="w-4 h-4 text-accent" />
                  Open Full Lawyer-Prep Page
                </Link>
                <button
                  type="button"
                  onClick={() => setIsLawyerModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Quick Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Lawyer Consultation Brief Modal */}
      {data && (
        <LawyerPrepModal
          isOpen={isLawyerModalOpen}
          onClose={() => setIsLawyerModalOpen(false)}
          documentType={docTypeParam}
          checklist={data.before_signing_checklist}
          questions={data.questions_to_ask}
          checkedIndices={checkedItems}
        />
      )}
    </main>
  );
}

// ── Root Page with Suspense Boundary ─────────────────────────────────────

export default function ChecklistPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm font-medium text-text-secondary">Loading pre-signing checklist…</span>
          </div>
        </div>
      }
    >
      <ChecklistContent />
    </Suspense>
  );
}
