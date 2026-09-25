'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react';
import { generateChecklist, type ChecklistResponse } from '@/lib/api';
import { useDocument } from '@/context/DocumentContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ClayBlobs from '@/components/ClayBlobs';

// ── Types & Constants ─────────────────────────────────────────────────────

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
];

const SAMPLE_CHECKLIST: ChecklistResponse = {
  document_id: 'sample-doc-lease',
  language: 'en',
  before_signing_checklist: [
    'Verify that the $75 late fee applies strictly after the 3-day grace period in writing',
    'Document pre-existing property conditions and take timestamped photos before move-in',
    'Request itemized receipts requirement for any security deposit deductions within 30 days',
    'Negotiate the 90-day automatic renewal notice window down to a standard 30 or 60 days',
    'Clarify that landlord remains responsible for pre-existing HVAC and major plumbing defects',
    'Confirm emergency contact protocol and minimum 24-hour notice before landlord property entry',
  ],
  questions_to_ask: [
    'Can the 90-day auto-renewal clause be amended to 30 days or convert to a month-to-month lease?',
    'What specific documentation or receipts are required before security deposit funds can be retained?',
    'Under Section 5, who pays for HVAC repairs if system failure is caused by normal wear and tear?',
    'Does the 3-day termination notice comply with local municipal statutory eviction notice periods?',
  ],
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-clay-canvas/60 backdrop-blur-md">
      <Card
        variant="solid"
        className="max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden p-0 shadow-deepClay border border-white/90"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-clay-accent/15 flex items-center justify-center text-clay-accent shadow-clayPressed">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-clay-foreground">
                Lawyer Consultation Brief
              </h3>
              <p className="text-xs text-clay-muted">Structured overview ready for legal review</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#EFEBF5] shadow-clayPressed text-clay-muted hover:text-clay-foreground flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-clay-foreground font-sans">
          {/* Document Metadata Pill */}
          <div className="p-4 rounded-2xl bg-[#EFEBF5] shadow-clayPressed border border-white flex items-center justify-between">
            <div>
              <span className="text-[10px] font-heading font-black uppercase tracking-wider text-clay-accent block">
                Target Agreement
              </span>
              <p className="font-heading font-bold text-sm text-clay-foreground">{documentType}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-clay-muted uppercase block">Generated</span>
              <p className="text-xs font-mono text-clay-foreground">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Unresolved Items */}
          <div>
            <h4 className="font-heading font-black text-xs uppercase tracking-wider text-clay-muted mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-clay-warning" />
              Items Requiring Verification ({uncheckedItems.length})
            </h4>
            {uncheckedItems.length > 0 ? (
              <ul className="space-y-2">
                {uncheckedItems.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm"
                  >
                    <span className="font-heading font-black text-clay-accent shrink-0">{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 shadow-clayPressed">
                ✓ All pre-signing checklist items have been verified and checked off!
              </div>
            )}
          </div>

          {/* Questions to Ask */}
          <div>
            <h4 className="font-heading font-black text-xs uppercase tracking-wider text-clay-muted mb-2.5 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-clay-accent-alt" />
              Targeted Questions for Counsel ({questions.length})
            </h4>
            <ul className="space-y-2">
              {questions.map((q, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed p-3.5 bg-pink-50/40 rounded-2xl border border-pink-100 shadow-sm"
                >
                  <span className="font-heading font-black text-clay-accent-alt shrink-0">Q{i + 1}:</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-[#FAF8FD] flex items-center justify-between gap-3">
          <span className="text-[11px] text-clay-muted font-sans">Informational consultation prep</span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyText}
              className="text-xs !h-10 !px-4"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-clay-success" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied' : 'Copy Brief'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="text-xs !h-10 !px-4 shadow-clayButton"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print / Save PDF
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Checklist Page Content Component ─────────────────────────────────────

function ChecklistContent() {
  const searchParams = useSearchParams();
  const {
    documentId: ctxDocId,
    documentType: ctxDocType,
    language,
    setLanguage,
    setChecklistData,
  } = useDocument();

  const documentId = searchParams.get('doc') || searchParams.get('document_id') || ctxDocId || '';
  const docTypeParam = searchParams.get('type') || (ctxDocId ? ctxDocType : '') || 'Legal Document';

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
  }, [documentId, language, setChecklistData]);

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

  const handleLoadSample = () => {
    setData(SAMPLE_CHECKLIST);
    setChecklistData(SAMPLE_CHECKLIST);
    setCheckedItems(new Set([0, 1]));
  };

  const totalItems = data?.before_signing_checklist.length ?? 0;
  const completedCount = checkedItems.size;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // ── 5. Empty State (No Document Loaded) ─────────────────────────────────
  if (!documentId && !data) {
    return (
      <main className="min-h-screen bg-clay-canvas text-clay-foreground flex flex-col justify-between py-12 px-4 sm:px-6 relative overflow-hidden">
        <ClayBlobs />

        <div className="max-w-2xl mx-auto w-full pt-4 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-heading font-bold text-clay-muted hover:text-clay-accent transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <Card variant="hero" className="text-center p-10 sm:p-14">
            {/* Friendly Icon in Large Gradient Orb */}
            <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clayButton flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="w-10 h-10" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-heading font-bold text-clay-accent bg-clay-accent/10 mb-4 shadow-clayPressed">
              <Sparkles className="w-3.5 h-3.5" />
              Pre-Signing Action Verification
            </span>

            <h1 className="font-heading font-black text-3xl sm:text-4xl text-clay-foreground tracking-tight mb-3">
              No Document Currently Loaded
            </h1>

            <p className="font-sans text-sm sm:text-base text-clay-muted leading-relaxed max-w-md mx-auto mb-8">
              Upload and analyze a legal contract first. We will extract its specific obligations, notice deadlines, and liability terms to build your tailored pre-signing checklist.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/analyze">
                <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-clayButton">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze a Document First
                </Button>
              </Link>

              <Button
                variant="secondary"
                size="lg"
                onClick={handleLoadSample}
                className="w-full sm:w-auto"
              >
                <Layers className="w-4 h-4 mr-2 text-clay-accent" />
                Load Sample Checklist
              </Button>
            </div>
          </Card>
        </div>

        <div className="text-center text-xs text-clay-muted/70 py-6 relative z-10 font-sans">
          Legal Document Assistant · Pre-signing Action Verification · In-Memory Privacy
        </div>
      </main>
    );
  }

  // ── 2. Active Checklist Interface ───────────────────────────────────────
  return (
    <main className="min-h-screen bg-clay-canvas text-clay-foreground pb-24 relative overflow-hidden">
      <ClayBlobs />

      {/* Top Persistent Header Bar */}
      <header className="sticky top-0 z-30 bg-clay-canvas/80 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/analyze"
              className="p-2 rounded-xl bg-white shadow-clayButton text-clay-muted hover:text-clay-accent transition-colors"
              title="Back to Analysis"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-clay-accent/15 flex items-center justify-center text-clay-accent shadow-clayPressed">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-sm text-clay-foreground tracking-tight">
                    Pre-Signing Checklist
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-black bg-purple-100 text-clay-accent shadow-clayPressed uppercase">
                    {docTypeParam}
                  </span>
                </div>
                <div className="text-[11px] text-clay-muted font-sans flex items-center gap-2">
                  <span>Grounding: Contract Clauses</span>
                  <span>·</span>
                  <Link
                    href={`/ask?doc=${documentId}&type=${encodeURIComponent(docTypeParam)}`}
                    className="text-clay-accent hover:underline font-bold flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" /> Q&amp;A Chat
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Language Selector */}
          <div className="flex items-center gap-2.5 self-end sm:self-center">
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
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 relative z-10 space-y-8">
        {/* Loading State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-10 h-10 rounded-full border-3 border-clay-accent border-t-transparent animate-spin" />
            <div>
              <p className="font-heading font-black text-base text-clay-foreground">
                Synthesizing Pre-Signing Checklist…
              </p>
              <p className="text-xs text-clay-muted font-sans mt-1">
                Extracting verification obligations and high-risk terms from your agreement
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5 shadow-clayPressed">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
            <span className="font-sans">{error}</span>
          </div>
        )}

        {/* Active Data Layout */}
        {data && !isLoading && (
          <div className="space-y-8">
            {/* ── 1. PROGRESS HEADER: SLIM GLASS CARD WITH RECESSED TRACK & CONVEX FILL ── */}
            <Card variant="glass" className="p-6 sm:p-7 shadow-clayCard border border-white/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-base text-clay-foreground tracking-tight">
                    Verification Progress
                  </span>
                  <span className="text-xs font-heading font-bold px-2.5 py-0.5 rounded-full bg-[#EFEBF5] text-clay-muted shadow-clayPressed">
                    {progressPercent}%
                  </span>
                </div>

                {/* X of Y completed in Nunito bold */}
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm text-clay-foreground">
                    {completedCount} of {totalItems} completed
                  </span>
                  {progressPercent === 100 && (
                    <span className="inline-flex items-center gap-1 text-xs font-heading font-black text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full shadow-clayPressed uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      All Verified!
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar: Recessed Track + Convex Gradient Fill */}
              <div className="w-full h-4 rounded-full bg-[#EFEBF5] shadow-clayPressed p-0.5 overflow-hidden border border-white/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-clay-accent via-[#9061F9] to-clay-accent-alt shadow-clayButton transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </Card>

            {/* ── 2. "BEFORE SIGNING" CHECKLIST ITEMS ──────────────────────── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center shadow-clayPressed">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-xl text-clay-foreground tracking-tight">
                      Before Signing Checklist
                    </h2>
                    <p className="text-xs text-clay-muted font-sans">
                      Click anywhere on a row to check off an obligation
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
                  className="text-xs font-heading font-bold text-clay-accent hover:underline cursor-pointer"
                >
                  {checkedItems.size === totalItems ? 'Uncheck All' : 'Check All'}
                </button>
              </div>

              {/* Checklist Cards List */}
              <div className="space-y-3">
                {data.before_signing_checklist.map((item, idx) => {
                  const isChecked = checkedItems.has(idx);

                  return (
                    <Card
                      key={idx}
                      variant="solid"
                      onClick={() => toggleCheck(idx)}
                      className={`!rounded-[24px] p-5 sm:p-6 shadow-clayCard border border-white/90 cursor-pointer select-none transition-all duration-200 active:scale-[0.98] ${
                        isChecked ? 'opacity-60 bg-white/60' : 'bg-white hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Custom Checkbox on the left */}
                        <div
                          className={`relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-[0.92] select-none ${
                            isChecked
                              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-clayButton'
                              : 'bg-[#EFEBF5] shadow-clayPressed border-2 border-white/80'
                          }`}
                        >
                          {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>

                        {/* Item Text with Strikethrough when checked */}
                        <div className="flex-1 pt-0.5">
                          <p
                            className={`font-sans text-sm sm:text-[15px] leading-relaxed transition-all duration-200 ${
                              isChecked
                                ? 'line-through text-clay-muted'
                                : 'text-clay-foreground font-medium'
                            }`}
                          >
                            {item}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* ── 3. "QUESTIONS TO ASK" SECTION (DISTINCT SOFT GRADIENT CARDS) ── */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2.5 px-1">
                <div className="w-8 h-8 rounded-xl bg-clay-accent-alt/15 text-clay-accent-alt flex items-center justify-center shadow-clayPressed">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-heading font-black text-xl text-clay-foreground tracking-tight">
                    Questions to Ask Before Signing
                  </h2>
                  <p className="text-xs text-clay-muted font-sans">
                    Targeted inquiries referencing identified contract clauses
                  </p>
                </div>
              </div>

              {/* Questions Cards: soft gradient wash background + circular gradient number badge */}
              <div className="grid grid-cols-1 gap-3.5">
                {data.questions_to_ask.map((question, qIdx) => (
                  <Card
                    key={qIdx}
                    variant="solid"
                    className="!rounded-[24px] p-5 sm:p-6 shadow-clayCard border border-pink-100/70 bg-gradient-to-br from-clay-accent-alt/5 via-white/90 to-transparent"
                  >
                    <div className="flex items-start gap-4">
                      {/* Rounded-full gradient number badge */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F472B6] to-[#DB2777] text-white shadow-clayButton flex items-center justify-center font-heading font-black text-xs shrink-0 mt-0.5">
                        {String(qIdx + 1).padStart(2, '0')}
                      </div>

                      <div className="flex-1">
                        <p className="font-sans text-sm sm:text-[15px] font-semibold text-clay-foreground leading-relaxed">
                          {question}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* ── 4. "GENERATE LAWYER-PREP SUMMARY" PRIMARY BUTTON (FULL WIDTH ON MOBILE) ── */}
            <div className="pt-6">
              <Card variant="glass" className="p-6 sm:p-8 shadow-clayCard text-center">
                <h3 className="font-heading font-black text-xl text-clay-foreground mb-2">
                  Ready for Professional Legal Review?
                </h3>
                <p className="font-sans text-sm text-clay-muted max-w-lg mx-auto mb-6">
                  Export a structured consultation brief containing your unresolved checklist items and targeted questions to bring to an attorney.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href={`/lawyer-prep?doc=${documentId}&type=${encodeURIComponent(docTypeParam)}`}
                    className="w-full sm:w-auto"
                  >
                    <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-clayButton">
                      <Scale className="w-5 h-5 mr-2" />
                      Generate Lawyer-Prep Summary
                    </Button>
                  </Link>

                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setIsLawyerModalOpen(true)}
                    className="w-full sm:w-auto shadow-clayButton"
                  >
                    Quick Preview Brief
                  </Button>
                </div>
              </Card>
            </div>
          </div>
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
        <div className="min-h-screen bg-clay-canvas flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-clay-accent border-t-transparent animate-spin" />
            <span className="text-sm font-heading font-bold text-clay-muted">Loading pre-signing checklist…</span>
          </div>
        </div>
      }
    >
      <ChecklistContent />
    </Suspense>
  );
}
