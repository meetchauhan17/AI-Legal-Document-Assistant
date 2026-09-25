'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Scale,
  Sparkles,
  HelpCircle,
  Printer,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  ClipboardList,
  Check,
} from 'lucide-react';
import {
  simplifyDocument,
  analyzeRisk,
  generateChecklist,
  type SimplifyResponse,
  type RiskResponse,
  type Clause,
  type ChecklistResponse,
} from '@/lib/api';
import Document3D from '@/components/3d/Document3D';
import { useDocument } from '@/context/DocumentContext';

// ── 3D Card Stack Paperwork Illustration Component ───────────────────────

function PaperworkStack3D() {
  return (
    <div className="relative w-48 h-36 mx-auto flex items-center justify-center [perspective:1000px]">
      {/* Back Page 2 */}
      <div
        className="absolute w-36 h-48 bg-slate-200/90 rounded-xl border border-slate-300 shadow-md transform -rotate-12 translate-x-4 -translate-y-2 opacity-60"
        aria-hidden="true"
      />
      {/* Back Page 1 */}
      <div
        className="absolute w-36 h-48 bg-slate-100 rounded-xl border border-slate-300 shadow-lg transform rotate-6 -translate-x-3 translate-y-1 opacity-80"
        aria-hidden="true"
      />
      {/* Front Hero Document */}
      <motion.div
        whileHover={{ rotateY: 0, rotateX: 0, scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative w-38 h-50 bg-white rounded-xl border border-slate-300/80 shadow-2xl p-4 flex flex-col justify-between transform [transform:rotateY(-14deg)_rotateX(10deg)] cursor-pointer"
      >
        <div>
          {/* Header Bar */}
          <div className="w-12 h-2 rounded bg-primary mb-3" />
          {/* Faux text lines */}
          <div className="space-y-1.5">
            <div className="w-full h-1.5 bg-slate-200 rounded" />
            <div className="w-4/5 h-1.5 bg-slate-200 rounded" />
            <div className="w-full h-1.5 bg-slate-200 rounded" />
            <div className="w-3/4 h-1.5 bg-slate-200 rounded" />
          </div>
        </div>

        {/* Golden Stamp Badge */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-[8px] font-bold text-accent">
            ★
          </div>
          <span className="text-[8px] font-bold text-primary font-mono">LEGAL BRIEF</span>
        </div>
      </motion.div>
    </div>
  );
}

// ── PDF Generation Logic using jsPDF ─────────────────────────────────────

function exportToPDF({
  documentType,
  documentId,
  summary,
  keyPoints,
  clauses,
  questions,
}: {
  documentType: string;
  documentId: string;
  summary: string;
  keyPoints: string[];
  clauses: Clause[];
  questions: string[];
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      y = margin;
      drawHeader();
    }
  };

  const drawHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('LEGAL DOCUMENT ASSISTANT — LAWYER CONSULTATION BRIEF', margin, 12);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
  };

  // 1. Title Banner
  doc.setFillColor(30, 58, 138); // Primary Deep Blue
  doc.rect(margin, y, contentWidth, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('LAWYER CONSULTATION PREPARATION BRIEF', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(219, 234, 254);
  doc.text(`Document Type: ${documentType}  |  Date: ${new Date().toLocaleDateString()}`, margin + 6, y + 16);

  y += 28;

  // 2. Executive Summary Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Executive Plain-Language Summary', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(summary || 'No summary available.', contentWidth);
  checkPageBreak(summaryLines.length * 4.5);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 4.5 + 4;

  // Key Points
  if (keyPoints && keyPoints.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    checkPageBreak(6);
    doc.text('Key Takeaways & Core Obligations:', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    keyPoints.slice(0, 6).forEach((pt) => {
      const ptLines = doc.splitTextToSize(`• ${pt}`, contentWidth - 4);
      checkPageBreak(ptLines.length * 4 + 2);
      doc.text(ptLines, margin + 2, y);
      y += ptLines.length * 4 + 1.5;
    });
    y += 4;
  }

  // 3. Risk & Attention Clauses Section
  checkPageBreak(12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Flagged Risk & Attention Clauses', margin, y);
  y += 6;

  if (clauses && clauses.length > 0) {
    clauses.forEach((c, idx) => {
      const isRisk = (c.category_level ?? c.category ?? '').toLowerCase().includes('risk');
      checkPageBreak(22);

      // Card boundary box
      doc.setFillColor(isRisk ? 254 : 255, isRisk ? 242 : 251, isRisk ? 242 : 235);
      doc.setDrawColor(isRisk ? 248 : 251, isRisk ? 113 : 191, isRisk ? 113 : 36);
      doc.setLineWidth(0.3);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(isRisk ? 185 : 180, isRisk ? 28 : 83, isRisk ? 28 : 9);
      doc.text(`[${isRisk ? 'RISK' : 'ATTENTION'}] ${c.category || 'Clause Review'}`, margin + 3, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const expLines = doc.splitTextToSize(`Explanation: ${c.explanation}`, contentWidth - 6);
      doc.text(expLines, margin + 3, y + 9);

      const blockHeight = 11 + expLines.length * 3.8;
      doc.rect(margin, y, contentWidth, blockHeight, 'S');
      y += blockHeight + 3;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('No significant one-sided risk clauses were detected.', margin, y);
    y += 6;
  }

  y += 4;

  // 4. Questions to Ask Section
  checkPageBreak(12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Recommended Questions for Legal Counsel', margin, y);
  y += 6;

  if (questions && questions.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    questions.forEach((q, i) => {
      const qLines = doc.splitTextToSize(`Q${i + 1}: ${q}`, contentWidth - 4);
      checkPageBreak(qLines.length * 4 + 2);
      doc.text(qLines, margin + 2, y);
      y += qLines.length * 4 + 2;
    });
  }

  // 5. Disclaimer Footer (Required exact string)
  checkPageBreak(20);
  y = Math.max(y + 6, pageHeight - margin - 12);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y - 2, pageWidth - margin, y - 2);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const disclaimer =
    'This is an AI-generated summary to help you prepare for a discussion with a qualified legal professional. It is not legal advice.';
  const discLines = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(discLines, margin, y + 2);

  // Save PDF
  doc.save(`Lawyer_Prep_Brief_${documentType.replace(/\s+/g, '_')}.pdf`);
}

// ── Main Lawyer-Prep Page Content ────────────────────────────────────────

function LawyerPrepContent() {
  const searchParams = useSearchParams();
  const {
    documentId: ctxDocId,
    documentType: ctxDocType,
    simplifyResult: ctxSimplify,
    riskResult: ctxRisk,
    checklistResult: ctxChecklist,
    language,
  } = useDocument();

  const documentId = searchParams.get('doc') || searchParams.get('document_id') || ctxDocId || '';
  const docTypeParam = searchParams.get('type') || (ctxDocId ? ctxDocType : '') || 'Legal Document';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<SimplifyResponse | null>(ctxSimplify);
  const [riskData, setRiskData] = useState<RiskResponse | null>(ctxRisk);
  const [checklistData, setChecklistData] = useState<ChecklistResponse | null>(ctxChecklist);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (!documentId) return;

    let isMounted = true;
    async function fetchAllData() {
      // If we already have all data in context, use it directly
      if (ctxSimplify && ctxRisk && ctxChecklist) {
        setSummaryData(ctxSimplify);
        setRiskData(ctxRisk);
        setChecklistData(ctxChecklist);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const [simpRes, riskRes, checkRes] = await Promise.all([
          ctxSimplify ? Promise.resolve(ctxSimplify) : simplifyDocument(documentId, '', language).catch(() => null),
          ctxRisk ? Promise.resolve(ctxRisk) : analyzeRisk(documentId, '', language).catch(() => null),
          ctxChecklist ? Promise.resolve(ctxChecklist) : generateChecklist(documentId, '', [], language).catch(() => null),
        ]);

        if (isMounted) {
          if (simpRes) setSummaryData(simpRes);
          if (riskRes) setRiskData(riskRes);
          if (checkRes) setChecklistData(checkRes);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to fetch document analysis.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchAllData();
    return () => {
      isMounted = false;
    };
  }, [documentId, language, ctxSimplify, ctxRisk, ctxChecklist]);

  const handleDownloadPDF = () => {
    exportToPDF({
      documentType: summaryData?.document_type || docTypeParam,
      documentId,
      summary: summaryData?.plain_summary || 'Analysis summary not available.',
      keyPoints: summaryData?.key_points || [],
      clauses: riskData?.clauses || [],
      questions: checklistData?.questions_to_ask || [
        'Are there any terms in this agreement that are unusual or disadvantageous?',
        'What are the exact obligations and deadlines I must comply with?',
      ],
    });

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

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

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-primary/10 text-primary mb-4">
              <Scale className="w-3.5 h-3.5" />
              Lawyer Consultation Prep
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3" style={{ fontWeight: 700 }}>
              No Document Currently Loaded
            </h1>

            <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8">
              Analyze a contract or agreement first. We will compile a professional, printable PDF preparation brief formatted for your legal consultation.
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
          Legal Document Assistant · Attorney Consultation Brief
        </div>
      </main>
    );
  }

  // ── 2. Active Lawyer-Prep Interface ──────────────────────────────────────
  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/analyze"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-text-secondary hover:text-text-primary transition-colors"
              title="Back to Analysis"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-text-primary tracking-tight" style={{ fontWeight: 700 }}>
                  Lawyer Consultation Prep
                </h1>
                <p className="text-[11px] text-text-secondary">Printable brief & PDF exporter</p>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href={`/ask?doc=${documentId}&type=${encodeURIComponent(docTypeParam)}`}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Q&A Chat
            </Link>
            <Link
              href={`/checklist?doc=${documentId}&type=${encodeURIComponent(docTypeParam)}`}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Checklist
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {/* Top Hero with 3D Paperwork Stack */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="mb-4">
            <PaperworkStack3D />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-primary/10 text-primary mb-3">
            <Scale className="w-3.5 h-3.5" />
            Structured Legal Consultation Export
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2" style={{ fontWeight: 700 }}>
            Lawyer Consultation Preparation Brief
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Preview the generated consultation summary below. Download as a formatted PDF to share directly with your attorney or retain for your pre-signing review.
          </p>

          {/* Action Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <motion.button
              type="button"
              onClick={handleDownloadPDF}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm rounded-xl shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download PDF Brief
            </motion.button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-3 bg-white border border-slate-200 text-text-primary hover:bg-slate-50 font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-text-secondary" />
              Print Preview
            </button>
          </div>

          {/* Success Animated Confirmation */}
          <AnimatePresence>
            {downloadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-700 shadow-sm"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </motion.div>
                PDF Brief Successfully Downloaded!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── On-Screen Printed Page Preview Card ─────────────────────────── */}
        <div className="relative max-w-3xl mx-auto bg-white rounded-2xl border border-slate-300 shadow-2xl p-6 sm:p-12 overflow-hidden transition-all">
          {/* Top Document Header */}
          <div className="border-b-2 border-primary pb-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-primary text-white">
                  CONFIDENTIAL BRIEF
                </span>
                <span className="text-[11px] font-mono text-text-secondary">
                  Ref: {documentId.substring(0, 8)}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary" style={{ fontWeight: 800 }}>
                {summaryData?.document_type || docTypeParam}
              </h2>
            </div>
            <div className="text-left sm:text-right text-xs text-text-secondary">
              <p className="font-semibold text-text-primary">Prepared for Legal Review</p>
              <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Section 1: Plain Summary */}
          <section className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              1. Executive Plain-Language Summary
            </h3>
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {summaryData?.plain_summary || 'Analyzing document summary…'}
            </p>

            {summaryData?.key_points && summaryData.key_points.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="text-xs font-bold text-text-primary">Key Commitments & Figures:</p>
                <ul className="space-y-1.5 text-xs text-text-secondary">
                  {summaryData.key_points.slice(0, 6).map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Section 2: Flagged Risk & Attention Clauses */}
          <section className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              2. Flagged Risk & Attention Clauses
            </h3>

            {riskData?.clauses && riskData.clauses.length > 0 ? (
              <div className="space-y-3">
                {riskData.clauses.map((c, i) => {
                  const isRisk = (c.category_level ?? c.category ?? '').toLowerCase().includes('risk');
                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border text-xs leading-relaxed ${
                        isRisk
                          ? 'bg-red-50/70 border-red-200/80 text-red-950'
                          : 'bg-amber-50/70 border-amber-200/80 text-amber-950'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-[12px] flex items-center gap-1.5">
                          {isRisk ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          {c.category || 'Clause Review'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isRisk ? 'bg-red-200/80 text-red-800' : 'bg-amber-200/80 text-amber-800'
                          }`}
                        >
                          {isRisk ? 'Risk Item' : 'Attention'}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{c.explanation}</p>
                      {c.clause_text && (
                        <p className="mt-2 text-[11px] font-mono italic text-slate-500 border-l-2 border-slate-300 pl-2 line-clamp-2">
                          "{c.clause_text.trim()}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-text-secondary italic">No specific risk clauses flagged.</p>
            )}
          </section>

          {/* Section 3: Recommended Questions for Attorney */}
          <section className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-accent" />
              3. Recommended Questions to Ask Legal Counsel
            </h3>

            {checklistData?.questions_to_ask && checklistData.questions_to_ask.length > 0 ? (
              <div className="space-y-2">
                {checklistData.questions_to_ask.map((q, i) => (
                  <div
                    key={i}
                    className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 flex items-start gap-2.5 text-xs text-text-primary"
                  >
                    <span className="font-bold text-accent shrink-0 mt-0.5">Q{i + 1}:</span>
                    <span className="font-medium leading-relaxed">{q}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 text-xs">
                  <span className="font-bold text-accent mr-1">Q1:</span>
                  <span>Can any of the one-sided clauses identified in this agreement be renegotiated before signing?</span>
                </div>
                <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 text-xs">
                  <span className="font-bold text-accent mr-1">Q2:</span>
                  <span>What is the notice requirement and dispute resolution process for breach?</span>
                </div>
              </div>
            )}
          </section>

          {/* Footer Required Legal Disclaimer */}
          <footer className="pt-6 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 italic leading-relaxed max-w-xl mx-auto">
              This is an AI-generated summary to help you prepare for a discussion with a qualified legal professional. It is not legal advice.
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}

// ── Root Page with Suspense Boundary ─────────────────────────────────────

export default function LawyerPrepPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm font-medium text-text-secondary">Loading consultation brief…</span>
          </div>
        </div>
      }
    >
      <LawyerPrepContent />
    </Suspense>
  );
}
