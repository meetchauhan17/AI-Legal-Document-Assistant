'use client';

import React, { Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Info,
  HelpCircle,
  FileQuestion,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { askQuestion, uploadText, type QAResponse } from '@/lib/api';
import { useDocument } from '@/context/DocumentContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import PillBadge from '@/components/ui/PillBadge';

import { getTranslations, type Language } from '@/lib/translations';

// ── Types & Constants ─────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source_excerpt?: string;
  confidence?: 'high' | 'medium' | 'low';
  timestamp: string;
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'gu', label: 'ગુજરાતી' },
];

const SAMPLE_QUESTIONS_MAP: Record<string, string[]> = {
  en: [
    'What is the monthly rent and late fee grace period?',
    'Under what conditions can the security deposit be withheld?',
    'Who is responsible for HVAC and plumbing repairs?',
    'How many days notice is required before automatic renewal?',
    'Can the landlord enter the property without notice?',
  ],
  hi: [
    'मासिक किराया और विलंब शुल्क की छूट अवधि क्या है?',
    'किन शर्तों के तहत सुरक्षा जमा काटी जा सकती है?',
    'HVAC और प्लंबिंग मरम्मत के लिए कौन जिम्मेदार है?',
    'स्वतः नवीनीकरण से पहले कितने दिनों का नोटिस आवश्यक है?',
    'क्या मकान मालिक बिना पूर्व सूचना के संपत्ति में प्रवेश कर सकता है?',
  ],
  gu: [
    'માસિક ભાડું અને મોડા ચૂકવણીની ગ્રેસ પીરિયડ કેટલી છે?',
    'કઈ શરતો હેઠળ સિક્યોરિટી ડિપોઝિટ રોકી શકાય છે?',
    'HVAC અને પ્લમ્બિંગ સમારકામ માટે કોણ જવાબદાર છે?',
    'ઓટો-રિન્યુઅલ પહેલાં કેટલા દિવસોની નોટિસ જરૂરી છે?',
    'શું મકાનમાલિક પૂર્વ નોટિસ વગર ઘરમાં પ્રવેશી શકે છે?',
  ],
};

const SAMPLE_LEASE_TEXT = `RESIDENTIAL LEASE AGREEMENT
1. PARTIES & PREMISES: Greenfield Properties LLC ("Landlord") leases to Alex Mercer ("Tenant") the premises at 742 Evergreen Terrace.
2. MONTHLY RENT: $2,200.00 payable in advance on or before the 1st of each month. A late fee of $75.00 applies after a 3-day grace period.
3. SECURITY DEPOSIT: Tenant shall deposit $4,400.00. Landlord retains unilateral authority to withhold deposits without receipts within 60 days.
4. AUTO-RENEWAL: Automatically renews for 12 months unless written notice is given 90 days in advance.
5. MAINTENANCE & REPAIRS: Tenant is responsible for all plumbing and HVAC servicing regardless of cause.
6. TERMINATION: Landlord may terminate this lease with 3 days notice upon any minor rule violation.`;

// ── 3. Typing Indicator Component ─────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-[#EFEBF5] shadow-clayPressed border border-white/60">
        <span
          className="w-2 h-2 rounded-full bg-clay-accent animate-bounce"
          style={{ animationDuration: '0.8s', animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-clay-accent animate-bounce"
          style={{ animationDuration: '0.8s', animationDelay: '150ms' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-clay-accent animate-bounce"
          style={{ animationDuration: '0.8s', animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}

// ── Confidence Badge Component (emerald/amber/muted-gray) ──────────────────

function ConfidenceBadge({
  confidence,
  lang = 'en',
}: {
  confidence?: 'high' | 'medium' | 'low';
  lang?: string;
}) {
  if (!confidence) return null;
  const t = getTranslations(lang);

  const cfg = {
    high: {
      label: t.ask.highConfidence,
      icon: ShieldCheck,
      classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200/60 shadow-clayPressed',
    },
    medium: {
      label: t.ask.medConfidence,
      icon: Info,
      classes: 'bg-amber-100 text-amber-800 border border-amber-200/60 shadow-clayPressed',
    },
    low: {
      label: t.ask.lowConfidence,
      icon: AlertTriangle,
      classes: 'bg-slate-200 text-clay-muted border border-slate-300/60 shadow-clayPressed',
    },
  }[confidence] || {
    label: t.ask.highConfidence,
    icon: ShieldCheck,
    classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200/60 shadow-clayPressed',
  };

  const IconComp = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-black tracking-wider uppercase ${cfg.classes}`}
    >
      <IconComp className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ── Expandable Source Excerpt Component (Ghost Toggle + Recessed Box) ──────

function SourceSection({ excerpt, lang = 'en' }: { excerpt: string; lang?: string }) {
  const [open, setOpen] = useState(false);
  const t = getTranslations(lang);

  if (!excerpt || excerpt.trim() === '' || excerpt.includes('None')) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100/80">
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => setOpen(!open)}
        className="!h-9 !px-3.5 !text-xs !rounded-xl text-clay-accent hover:bg-clay-accent/10 transition-all gap-1 -ml-1 select-none"
      >
        <span>{open ? `▲ ${t.ask.hideSource}` : `▼ ${t.ask.showSource}`}</span>
      </Button>

      {open && (
        <div className="mt-2.5 p-4 rounded-[16px] bg-[#EFEBF5] shadow-clayPressed border border-white font-mono text-xs sm:text-sm text-clay-foreground italic leading-relaxed whitespace-pre-wrap">
          &quot;{excerpt}&quot;
        </div>
      )}
    </div>
  );
}

// ── Main Page Content ─────────────────────────────────────────────────────

function getInitialWelcomeMessage(docType: string, lang: string): string {
  switch (lang) {
    case 'hi':
      return `नमस्ते! मैंने आपके अनुबंध (${docType}) को इंडेक्स कर लिया है। किराए की राशि, समाप्ति जुर्माना, देनदारियों या समय-सीमा के बारे में कोई भी प्रश्न पूछें। मैं आपके दस्तावेज़ के अंशों के आधार पर उत्तर दूंगा।`;
    case 'gu':
      return `નમસ્તે! મેં તમારા કરાર (${docType}) ને ઇન્ડેક્સ કર્યું છે. ભાડાની રકમ, સમાપ્તિ દંડ, જવાબદારીઓ અથવા મુદત વિશે કોઈ પણ પ્રશ્ન પૂછો. હું તમારા દસ્તાવેજના આધારે ઉત્તર આપીશ.`;
    default:
      return `Hello! I have indexed your contract (${docType}). Ask me any specific question about rent amounts, termination penalties, liabilities, or deadlines. I will ground every answer strictly in your document's excerpts.`;
  }
}

function AskPageContent() {
  const searchParams = useSearchParams();
  const {
    documentId: ctxDocId,
    documentType: ctxDocType,
    language,
    setLanguage,
    setDocumentData,
  } = useDocument();

  const t = getTranslations(language);
  const documentId = searchParams.get('doc') || searchParams.get('document_id') || ctxDocId || '';
  const docTypeParam = searchParams.get('type') || (ctxDocId ? ctxDocType : '') || 'Legal Document';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: getInitialWelcomeMessage(docTypeParam, language),
      confidence: 'high',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update initial welcome message if user hasn't sent any messages yet
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            ...prev[0],
            content: getInitialWelcomeMessage(docTypeParam, language),
          },
        ];
      }
      return prev;
    });
  }, [language, docTypeParam]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Quick 1-click sample loader for empty state
  const handleLoadSampleAgreement = async () => {
    setIsLoading(true);
    try {
      const res = await uploadText(SAMPLE_LEASE_TEXT);
      setDocumentData({
        documentId: res.document_id,
        documentType: 'Residential Lease Agreement',
        fullText: res.full_text,
      });
      setMessages([
        {
          id: 'welcome-sample',
          role: 'assistant',
          content:
            language === 'hi'
              ? 'नमूना आवासीय पट्टा समझौता लोड और अनुक्रमित किया गया। किराए, सुरक्षा जमा जब्ती या नवीनीकरण शर्तों के बारे में पूछें!'
              : language === 'gu'
              ? 'નમૂના રહેણાંક ભાડા કરાર લોડ અને અનુક્રમિત થયો. ભાડું, ડિપોઝિટ અથવા નવીનીકરણ શરતો વિશે પૂછો!'
              : 'Sample Residential Lease Agreement loaded and indexed. Ask me about rent, security deposit forfeiture, or renewal terms!',
          confidence: 'high',
          timestamp: 'Just now',
        },
      ]);
    } catch (err: any) {
      alert('Failed to load sample: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (questionText?: string) => {
    const q = (questionText ?? input).trim();
    if (!q || !documentId || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res: QAResponse = await askQuestion(documentId, q, language);

      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        source_excerpt: res.source_excerpt,
        confidence: res.confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Could not retrieve the answer: ${err.message || 'Server error'}. Please try rephrasing your question.`,
        confidence: 'low',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // ── 5. EMPTY STATE (No document loaded) ──────────────────────────────────
  if (!documentId) {
    return (
      <main className="min-h-screen bg-clay-canvas text-clay-foreground py-12 px-4 sm:px-6 flex flex-col justify-between relative overflow-hidden">
        <div className="max-w-2xl mx-auto w-full pt-4 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-heading font-bold text-clay-muted hover:text-clay-accent transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> {t.nav.home}
          </Link>

          {/* Centered Hero Variant Card with larger padding */}
          <Card variant="hero" className="text-center p-10 sm:p-14">
            {/* Friendly icon in large gradient orb */}
            <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white shadow-clayButton flex items-center justify-center mx-auto mb-6">
              <FileQuestion className="w-10 h-10" />
            </div>

            <div className="mb-4">
              <PillBadge icon={Sparkles}>
                {t.ask.title}
              </PillBadge>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-4xl text-clay-foreground tracking-tight mb-3">
              {t.ask.noDocTitle}
            </h1>

            <p className="font-sans text-sm sm:text-base text-clay-muted leading-relaxed max-w-md mx-auto mb-8">
              {t.ask.noDocDesc}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/analyze">
                <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-clayButton">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t.ask.analyzeFirst}
                </Button>
              </Link>

              <Button
                variant="secondary"
                size="lg"
                onClick={handleLoadSampleAgreement}
                disabled={isLoading}
                className="w-full sm:w-auto shadow-clayButton"
              >
                <Layers className="w-4 h-4 mr-2 text-clay-accent" />
                {t.ask.loadSample}
              </Button>
            </div>
          </Card>
        </div>

        <div className="text-center text-xs sm:text-sm text-clay-foreground py-6 relative z-10 font-medium">
          {t.ask.subtitle}
        </div>
      </main>
    );
  }

  const currentQuestions = SAMPLE_QUESTIONS_MAP[language] || SAMPLE_QUESTIONS_MAP.en;

  // ── ACTIVE CHAT INTERFACE ────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-clay-canvas text-clay-foreground flex flex-col justify-between relative overflow-hidden">
      {/* ── 1. TOP CONFIRMATION BAR (Slim Glass Card) ────────────────────── */}
      <div className="px-4 sm:px-6 pt-4 pb-2">
        <div className="max-w-4xl mx-auto">
          <Card variant="glass" className="p-3 sm:p-4 shadow-clayCard border border-white/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-clay-accent/15 text-clay-accent flex items-center justify-center shadow-clayPressed shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-black text-sm sm:text-base text-clay-foreground tracking-tight">
                      {docTypeParam}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-heading font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t.nav.loaded}
                    </span>
                  </div>
                  <span className="text-xs text-clay-muted font-mono">
                    ID: {documentId.substring(0, 10)}…
                  </span>
                </div>
              </div>

              {/* Actions: Change Document Ghost Button + Language Dropdown */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* Language Selector */}
                <div className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-1.5 rounded-full bg-white shadow-clayButton border border-white text-xs font-heading font-bold text-clay-foreground">
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

                {/* Change Document: ghost-variant Button */}
                <Link href="/analyze">
                  <Button variant="ghost" size="sm" className="min-h-[44px] text-xs">
                    {t.analyze.newAnalysis}
                  </Button>
                </Link>

                {/* Reset Chat (min-h-[44px] min-w-[44px]) */}
                <button
                  type="button"
                  onClick={() => {
                    setMessages([
                      {
                        id: 'reset',
                        role: 'assistant',
                        content: getInitialWelcomeMessage(docTypeParam, language),
                        confidence: 'high',
                        timestamp: 'Just now',
                      },
                    ]);
                  }}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-white shadow-clayButton text-clay-foreground hover:text-clay-accent flex items-center justify-center transition-colors active:scale-[0.92]"
                  title="Reset Chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── 2. CHAT AREA ─────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col justify-between relative z-10">
        <div className="space-y-5 pb-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {msg.role === 'user' ? (
                /* USER MESSAGE: Right-aligned, primary gradient, rounded-[24px] rounded-br-[8px] */
                <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white px-5 py-3.5 rounded-[24px] rounded-br-[8px] shadow-clayButton max-w-[85%] sm:max-w-[75%] text-sm leading-relaxed">
                  <p className="whitespace-pre-wrap font-sans font-medium">{msg.content}</p>
                  <span className="block text-[10px] text-white/90 mt-1.5 text-right font-mono font-medium">
                    {msg.timestamp}
                  </span>
                </div>
              ) : (
                /* AI RESPONSE: Left-aligned Card (solid), rounded-[24px] rounded-bl-[8px] */
                <div className="max-w-[92%] sm:max-w-[85%]">
                  <Card
                    variant="solid"
                    className="p-5 sm:p-6 shadow-clayCard border border-white/90 rounded-[24px] rounded-bl-[8px]"
                  >
                    {/* Header with confidence pill in corner */}
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-clay-accent/15 text-clay-accent flex items-center justify-center shadow-clayPressed">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-heading font-black text-xs text-clay-foreground">
                          Legal Assistant
                        </span>
                      </div>
                      <ConfidenceBadge confidence={msg.confidence} lang={language} />
                    </div>

                    {/* Answer Text in DM Sans */}
                    <p className="font-sans text-sm sm:text-[14.5px] text-clay-foreground leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>

                    {/* Expandable Source Excerpt Section */}
                    {msg.source_excerpt && <SourceSection excerpt={msg.source_excerpt} lang={language} />}

                    <span className="block text-[10px] text-clay-foreground font-mono mt-2">
                      {msg.timestamp}
                    </span>
                  </Card>
                </div>
              )}
            </div>
          ))}

          {/* 3. TYPING INDICATOR */}
          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Question Chips */}
        {messages.length <= 2 && (
          <div className="my-4">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-clay-muted mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-clay-accent" /> {t.ask.suggestedInquiries}
            </span>
            <div className="flex flex-wrap gap-2">
              {currentQuestions.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(sq)}
                  disabled={isLoading}
                  className="group px-4 py-2.5 min-h-[44px] bg-white border border-clay-accent/20 shadow-clayCard hover:shadow-deepClay hover:border-clay-accent/60 text-clay-foreground hover:text-clay-accent rounded-2xl text-xs sm:text-sm font-sans font-medium transition-all cursor-pointer text-left active:scale-[0.96] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="w-5 h-5 rounded-full bg-clay-accent/10 text-clay-accent text-[10px] font-heading font-black flex items-center justify-center shrink-0 group-hover:bg-clay-accent group-hover:text-white transition-all">{i + 1}</span>
                  <span className="flex-1">{sq}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-clay-accent opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 4. INPUT AREA AT BOTTOM (Concave Input + Attached Send Button) ── */}
      <footer className="sticky bottom-0 z-30 bg-clay-canvas/90 backdrop-blur-xl border-t border-white/80 px-4 sm:px-6 py-4 shadow-clayCard">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            {/* Input component (recessed/concave transforming to raised-white on focus) */}
            <div className="flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.ask.inputPlaceholder}
                disabled={isLoading}
                id="ask-input"
              />
            </div>

            {/* Attached Send Button (primary variant, rounded to match, immediately adjacent) */}
            <Button
              variant="primary"
              size="md"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              id="ask-submit"
              className="h-16 px-7 shrink-0 shadow-clayButton rounded-[24px]"
              title="Send (Enter)"
            >
              <Send className="w-5 h-5 mr-1.5" />
              <span className="hidden sm:inline">{t.ask.send}</span>
            </Button>
          </div>

          <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-clay-muted font-sans">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white shadow-clayCard text-[10px] font-mono font-bold text-clay-foreground border border-slate-200">Enter</kbd>
              to send · <kbd className="px-1.5 py-0.5 rounded bg-white shadow-clayCard text-[10px] font-mono font-bold text-clay-foreground border border-slate-200">Shift+Enter</kbd> new line
            </span>
            <span className="text-clay-accent font-heading font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Grounded in contract excerpts
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ── Root Page with Suspense Boundary ─────────────────────────────────────

export default function AskPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-clay-canvas flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-clay-accent border-t-transparent animate-spin" />
            <span className="text-sm font-heading font-bold text-clay-muted">Loading document Q&amp;A…</span>
          </div>
        </div>
      }
    >
      <AskPageContent />
    </Suspense>
  );
}
