'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Scale,
  Sparkles,
  HelpCircle,
  Printer,
  ChevronRight,
  MessageSquare,
  ClipboardList,
  Check,
  Layers,
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
import { useDocument } from '@/context/DocumentContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ClayBlobs from '@/components/ClayBlobs';

// ── Sample Data for Instant Preview / Testing ────────────────────────────

const SAMPLE_PREP_DATA = {
  documentType: 'Residential Lease Agreement',
  summary:
    'This is a standard 12-month residential lease for 742 Evergreen Terrace between Greenfield Properties LLC and Tenant Alex Mercer. Rent is $2,200/month with a 3-day grace period and $75 late penalty. Key attention areas include a non-refundable $4,400 deposit clause, 90-day automatic renewal notice, and a unilateral clause shifting all plumbing/HVAC maintenance costs to the tenant.',
  keyPoints: [
    'Monthly Rent: $2,200.00 payable in advance on the 1st of each month',
    'Late Fee: $75.00 flat penalty applied after a 3-day grace period',
    'Security Deposit: $4,400.00 (landlord reserves right to retain without receipts)',
    'Auto-Renewal: 12-month automatic rollover requiring 90 days advance written notice',
    'Maintenance: Tenant bears 100% cost of all HVAC and plumbing repairs regardless of cause',
  ],
  clauses: [
    {
      category: 'Unilateral Security Deposit Forfeiture',
      category_level: 'risk',
      explanation:
        'Clause 3 permits the landlord to retain the $4,400 deposit without presenting itemized contractor receipts within 60 days, contrary to standard statutory deposit protections.',
      clause_text: 'Landlord retains unilateral authority to withhold deposits without receipts within 60 days.',
    },
    {
      category: 'HVAC & Plumbing Structural Maintenance Shift',
      category_level: 'risk',
      explanation:
        'Clause 5 forces the tenant to pay for major structural plumbing and HVAC repairs regardless of who caused the issue or normal wear and tear.',
      clause_text: 'Tenant is responsible for all plumbing and HVAC servicing regardless of cause.',
    },
    {
      category: 'Extended 90-Day Auto-Renewal Notice Window',
      category_level: 'attention',
      explanation:
        'Clause 4 requires 90 days advance written notice to prevent automatic 12-month rollover, which is significantly longer than standard 30-day statutory notice.',
      clause_text: 'Automatically renews for 12 months unless written notice is given 90 days in advance.',
    },
  ],
  questions: [
    'Can the 90-day automatic renewal window be negotiated down to 30 days or convert to a month-to-month tenancy?',
    'What specific statutory protections exist in my jurisdiction against unilateral deposit forfeiture without itemized receipts?',
    'Under local habitability laws, can a landlord legally shift structural HVAC and plumbing maintenance obligations to a residential tenant?',
    'Does the 3-day termination for any minor rule violation constitute an enforceable lease termination provision?',
  ],
};

// ── 1. Paper-Stack Pure CSS Decorative Element ───────────────────────────

function PaperStackDecoration() {
  return (
    <div className="relative w-24 h-20 mx-auto mb-4 flex items-center justify-center">
      {/* Layer 3: Back Paper (rotate-6) */}
      <div
        className="absolute w-16 h-20 bg-white/70 rounded-[16px] shadow-clayCard border border-white/80 transform rotate-6 translate-x-2 -translate-y-1 z-0"
        aria-hidden="true"
      />
      {/* Layer 2: Middle Paper (-rotate-3) */}
      <div
        className="absolute w-16 h-20 bg-white/85 rounded-[16px] shadow-clayCard border border-white/80 transform -rotate-3 -translate-x-1.5 translate-y-0.5 z-10"
        aria-hidden="true"
      />
      {/* Layer 1: Front Top Paper */}
      <div className="relative w-16 h-20 bg-white rounded-[16px] shadow-clayCard border border-white/90 p-2.5 flex flex-col justify-between z-20">
        <div className="w-5 h-1.5 rounded-full bg-clay-accent/40" />
        <div className="space-y-1">
          <div className="w-full h-1 bg-slate-200 rounded-full" />
          <div className="w-3/4 h-1 bg-slate-200 rounded-full" />
          <div className="w-5/6 h-1 bg-slate-200 rounded-full" />
        </div>
        <div className="w-3.5 h-3.5 rounded-full bg-clay-accent/15 self-end flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-clay-accent" />
        </div>
      </div>
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
    doc.setTextColor(124, 58, 237);
    doc.text('AI LEGAL DOCUMENT ASSISTANT — CONSULTATION BRIEF', margin, 12);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
  };

  // 1. Header Banner
  doc.setFillColor(124, 58, 237); // Clay Accent Purple (#7C3AED)
  doc.rect(margin, y, contentWidth, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('LAWYER CONSULTATION PREPARATION BRIEF', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(237, 233, 254);
  doc.text(`Document Type: ${documentType}  |  Date: ${new Date().toLocaleDateString()}`, margin + 6, y + 16);

  y += 28;

  // 2. Executive Summary Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(51, 47, 58);
  doc.text('1. Executive Plain-Language Summary', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(99, 95, 105);
  const summaryLines = doc.splitTextToSize(summary || 'No summary available.', contentWidth);
  checkPageBreak(summaryLines.length * 4.5);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 4.5 + 4;

  // Key Commitments
  if (keyPoints && keyPoints.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 47, 58);
    checkPageBreak(6);
    doc.text('Key Commitments & Takeaways:', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(99, 95, 105);
    keyPoints.slice(0, 6).forEach((pt) => {
      const ptLines = doc.splitTextToSize(`• ${pt}`, contentWidth - 4);
      checkPageBreak(ptLines.length * 4 + 2);
      doc.text(ptLines, margin + 2, y);
      y += ptLines.length * 4 + 1.5;
    });
    y += 4;
  }

  // 3. Risk & Attention Clauses Section (Only risk/attention items)
  checkPageBreak(12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(51, 47, 58);
  doc.text('2. Clauses to Discuss (Flagged Risk & Attention Items)', margin, y);
  y += 6;

  const flaggedClauses = clauses.filter((c) => {
    const cat = (c.category_level ?? c.category ?? '').toLowerCase();
    return cat.includes('risk') || cat.includes('attention') || cat.includes('concern');
  });

  const displayClauses = flaggedClauses.length > 0 ? flaggedClauses : clauses.slice(0, 3);

  if (displayClauses && displayClauses.length > 0) {
    displayClauses.forEach((c) => {
      const isRisk = (c.category_level ?? c.category ?? '').toLowerCase().includes('risk');
      checkPageBreak(22);

      // Card boundary box
      doc.setFillColor(isRisk ? 254 : 255, isRisk ? 242 : 251, isRisk ? 242 : 235);
      doc.setDrawColor(isRisk ? 239 : 245, isRisk ? 68 : 158, isRisk ? 68 : 11);
      doc.setLineWidth(0.4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(isRisk ? 185 : 180, isRisk ? 28 : 83, isRisk ? 28 : 9);
      doc.text(`[${isRisk ? 'RISK ITEM' : 'ATTENTION'}] ${c.category || 'Clause Review'}`, margin + 4, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 47, 58);
      const expLines = doc.splitTextToSize(`Explanation: ${c.explanation}`, contentWidth - 8);
      doc.text(expLines, margin + 4, y + 10);

      const blockHeight = 13 + expLines.length * 3.8;
      doc.rect(margin, y, contentWidth, blockHeight, 'S');
      y += blockHeight + 4;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('No critical one-sided clauses detected in this agreement.', margin, y);
    y += 6;
  }

  y += 4;

  // 4. Questions to Ask Section
  checkPageBreak(12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(51, 47, 58);
  doc.text('3. Targeted Questions to Ask Legal Counsel', margin, y);
  y += 6;

  if (questions && questions.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(99, 95, 105);
    questions.forEach((q, i) => {
      const qLines = doc.splitTextToSize(`Q${i + 1}: ${q}`, contentWidth - 4);
      checkPageBreak(qLines.length * 4 + 2);
      doc.text(qLines, margin + 2, y);
      y += qLines.length * 4 + 2;
    });
  }

  // 5. Disclaimer Footer
  checkPageBreak(18);
  y = Math.max(y + 6, pageHeight - margin - 12);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y - 2, pageWidth - margin, y - 2);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(99, 95, 105);
  const disclaimer =
    'This is an AI-generated summary to help you prepare for a discussion with a qualified legal professional. It is not legal advice.';
  const discLines = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(discLines, margin, y + 2);

  // Save PDF file
  doc.save(`Lawyer_Prep_Brief_${documentType.replace(/\s+/g, '_')}.pdf`);
}

// ── Main Lawyer-Prep Content Component ───────────────────────────────────

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

  // Fallback to sample data for instant test drive if visited directly
  const activeDocumentType = summaryData?.document_type || (documentId ? docTypeParam : SAMPLE_PREP_DATA.documentType);
  const activeSummary = summaryData?.plain_summary || SAMPLE_PREP_DATA.summary;
  const activeKeyPoints = summaryData?.key_points || SAMPLE_PREP_DATA.keyPoints;
  const activeClauses = riskData?.clauses || (SAMPLE_PREP_DATA.clauses as Clause[]);
  const activeQuestions = checklistData?.questions_to_ask || SAMPLE_PREP_DATA.questions;

  // Filter only risk/attention items
  const flaggedClauses = activeClauses.filter((c) => {
    const cat = (c.category_level ?? c.category ?? '').toLowerCase();
    return cat.includes('risk') || cat.includes('attention') || cat.includes('concern');
  });
  const displayClauses = flaggedClauses.length > 0 ? flaggedClauses : activeClauses.slice(0, 3);

  const handleDownloadPDF = () => {
    exportToPDF({
      documentType: activeDocumentType,
      documentId: documentId || 'sample-contract',
      summary: activeSummary,
      keyPoints: activeKeyPoints,
      clauses: displayClauses,
      questions: activeQuestions,
    });

    // 4. Transform button to success state for ~2 seconds
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-clay-canvas text-clay-foreground pb-24 relative overflow-hidden">
      <ClayBlobs />

      {/* Top Persistent Navigation Header */}
      <header className="sticky top-0 z-30 bg-clay-canvas/80 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/analyze"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-[16px] bg-white shadow-clayButton text-clay-foreground hover:text-clay-accent transition-colors"
              title="Back to Analysis"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-[16px] bg-clay-accent/15 flex items-center justify-center text-clay-accent shadow-clayPressed">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-heading font-black text-sm text-clay-foreground tracking-tight">
                  Lawyer Consultation Prep
                </h1>
                <p className="text-[11px] text-clay-foreground font-medium font-sans">
                  Printable brief &amp; client PDF export
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Links */}
          <div className="flex items-center gap-2">
            <Link
              href={`/ask?doc=${documentId}&type=${encodeURIComponent(docTypeParam)}`}
              className="hidden sm:inline-block"
            >
              <Button variant="ghost" size="sm" className="text-xs min-h-[44px] px-3">
                <MessageSquare className="w-3.5 h-3.5 mr-1 text-clay-accent" />
                Q&amp;A Chat
              </Button>
            </Link>
            <Link
              href={`/checklist?doc=${documentId}&type=${encodeURIComponent(docTypeParam)}`}
              className="hidden sm:inline-block"
            >
              <Button variant="ghost" size="sm" className="text-xs min-h-[44px] px-3">
                <ClipboardList className="w-3.5 h-3.5 mr-1 text-clay-accent-alt" />
                Checklist
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 relative z-10">
        {/* ── 1. PAGE HEADING WITH PAPER-STACK DECORATION ─────────────────── */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <PaperStackDecoration />

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-heading font-bold text-clay-accent bg-clay-accent/10 mb-3 shadow-clayPressed">
            <Scale className="w-3.5 h-3.5" />
            Structured Legal Consultation Export
          </span>

          <h1 className="font-heading font-black text-3xl sm:text-4xl text-clay-foreground tracking-tight mb-3">
            Lawyer Consultation Preparation Brief
          </h1>

          <p className="font-sans text-sm sm:text-base text-clay-muted leading-relaxed">
            Preview your generated consultation brief below. Download as a clean, structured PDF to share directly with your attorney or retain for pre-signing negotiations.
          </p>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-10 h-10 rounded-full border-3 border-clay-accent border-t-transparent animate-spin" />
            <p className="font-heading font-bold text-sm text-clay-muted">
              Compiling consultation summary &amp; risk items…
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && !isLoading && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5 shadow-clayPressed">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
            <span className="font-sans">{error}</span>
          </div>
        )}

        {/* ── 2. MAIN PREVIEW: LARGE CARD STYLED AS CLEAN PRINTED PAGE ─────── */}
        <Card
          variant="solid"
          className="max-w-3xl mx-auto bg-white p-8 sm:p-14 rounded-[32px] shadow-deepClay border border-white/90 overflow-hidden"
        >
          {/* Top Document Header */}
          <div className="border-b-2 border-clay-accent pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-heading font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-clay-accent text-white shadow-clayPressed">
                  CONFIDENTIAL LEGAL BRIEF
                </span>
                <span className="text-xs font-mono text-clay-foreground">
                  Ref: {documentId ? documentId.substring(0, 8) : 'SAMPLE-DOC'}
                </span>
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-clay-foreground tracking-tight">
                {activeDocumentType}
              </h2>
            </div>

            <div className="text-left sm:text-right text-xs text-clay-foreground font-sans">
              <p className="font-heading font-bold text-clay-foreground">Prepared for Legal Review</p>
              <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Section 1: Plain Summary Paragraph & Key Points */}
          <section className="mb-8">
            <h3 className="font-heading font-black text-xs uppercase tracking-wider text-clay-foreground mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-clay-accent" />
              1. Executive Plain-Language Summary
            </h3>
            <p className="font-sans text-sm sm:text-[15px] text-clay-foreground leading-relaxed whitespace-pre-wrap">
              {activeSummary}
            </p>

            {activeKeyPoints && activeKeyPoints.length > 0 && (
              <div className="mt-4 p-4 sm:p-5 rounded-[24px] bg-[#EFEBF5] shadow-clayPressed border border-white space-y-2">
                <p className="font-heading font-bold text-xs text-clay-foreground">
                  Key Commitments &amp; Takeaways:
                </p>
                <ul className="space-y-1.5 text-xs font-sans text-clay-foreground">
                  {activeKeyPoints.slice(0, 6).map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-clay-success shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Section 2: Clauses to Discuss (Flagged Risk & Attention Items Only) */}
          <section className="mb-8">
            <h3 className="font-heading font-black text-xs uppercase tracking-wider text-clay-foreground mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              2. Clauses to Discuss (Flagged Risk &amp; Attention Items)
            </h3>

            {displayClauses && displayClauses.length > 0 ? (
              <div className="space-y-3.5">
                {displayClauses.map((c, i) => {
                  const isRisk = (c.category_level ?? c.category ?? '').toLowerCase().includes('risk');

                  return (
                    <div
                      key={i}
                      className={`p-4 sm:p-5 rounded-[24px] border transition-none ${
                        isRisk
                          ? 'border-l-4 border-l-red-500 bg-red-50/50 border-red-200/60 shadow-clayPressed'
                          : 'border-l-4 border-l-amber-500 bg-amber-50/50 border-amber-200/60 shadow-clayPressed'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-heading font-black text-xs sm:text-sm text-clay-foreground flex items-center gap-1.5">
                          {isRisk ? (
                            <ShieldAlert className="w-4 h-4 text-red-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          )}
                          {c.category || 'Clause Review'}
                        </span>
                        <span
                          className={`text-[10px] font-heading font-black px-2.5 py-0.5 rounded-full uppercase shadow-sm ${
                            isRisk
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isRisk ? 'Risk Item' : 'Attention'}
                        </span>
                      </div>

                      <p className="font-sans text-xs sm:text-sm text-clay-foreground leading-relaxed">
                        {c.explanation}
                      </p>

                      {c.clause_text && (
                        <p className="mt-2.5 text-xs font-mono italic text-clay-foreground border-l-2 border-slate-300 pl-2.5 line-clamp-2">
                          &quot;{c.clause_text.trim()}&quot;
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-sans text-xs text-clay-foreground italic">
                No high-risk clauses were flagged for this document.
              </p>
            )}
          </section>

          {/* Section 3: Questions to Ask Numbered List */}
          <section className="mb-8">
            <h3 className="font-heading font-black text-xs uppercase tracking-wider text-clay-foreground mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-clay-accent-alt" />
              3. Questions to Ask Legal Counsel
            </h3>

            <div className="space-y-2.5">
              {activeQuestions.map((q, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-[24px] bg-[#EFEBF5] shadow-clayPressed border border-white flex items-start gap-3 text-xs sm:text-sm text-clay-foreground font-sans"
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-clayButton text-clay-accent font-heading font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="font-medium leading-relaxed pt-0.5">{q}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Footer Mandatory Legal Disclaimer */}
          <footer className="pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] font-sans text-clay-foreground italic leading-relaxed max-w-xl mx-auto font-medium">
              This is an AI-generated summary to help you prepare for a discussion with a qualified legal professional. It is not legal advice.
            </p>
          </footer>
        </Card>

        {/* ── 3. & 4. PRIMARY BUTTON WITH TRANSFORMATION TO SUCCESS STATE ───── */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant={downloadSuccess ? 'secondary' : 'primary'}
            size="lg"
            onClick={handleDownloadPDF}
            className={`w-full sm:w-80 shadow-clayButton transition-all duration-300 ${
              downloadSuccess
                ? '!bg-clay-success !text-white !shadow-clayButton hover:!bg-clay-success hover:-translate-y-0'
                : ''
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-5 h-5 mr-2 stroke-[3]" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                <span>Download PDF Report</span>
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => window.print()}
            className="w-full sm:w-auto shadow-clayButton"
          >
            <Printer className="w-4 h-4 mr-2 text-clay-accent" />
            Print Page
          </Button>
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
        <div className="min-h-screen bg-clay-canvas flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-clay-accent border-t-transparent animate-spin" />
            <span className="text-sm font-heading font-bold text-clay-muted">Loading consultation brief…</span>
          </div>
        </div>
      }
    >
      <LawyerPrepContent />
    </Suspense>
  );
}
