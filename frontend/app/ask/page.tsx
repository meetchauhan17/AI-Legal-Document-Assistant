'use client';

import React, { Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Info,
  CornerDownLeft,
} from 'lucide-react';
import { askQuestion, type QAResponse } from '@/lib/api';
import Document3D from '@/components/3d/Document3D';
import { useDocument } from '@/context/DocumentContext';

// ── Types ─────────────────────────────────────────────────────────────────

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
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
];

const SAMPLE_QUESTIONS = [
  'What are the termination conditions?',
  'What is the payment amount and schedule?',
  'What penalties or late fees apply?',
  'Who is responsible for maintenance or repairs?',
  'Are there any automatic renewal clauses?',
];

// ── Animation Variants ───────────────────────────────────────────────────

const messageAnimation = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

const expandAnimation = {
  hidden: { opacity: 0, height: 0, overflow: 'hidden' },
  visible: {
    opacity: 1,
    height: 'auto',
    overflow: 'hidden',
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    height: 0,
    overflow: 'hidden',
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Sub-components ───────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      variants={messageAnimation}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="flex items-center gap-1.5 px-4 py-3 bg-white border border-slate-200/80 rounded-2xl rounded-tl-sm shadow-soft max-w-[120px]"
    >
      <span className="text-[12px] text-text-secondary font-medium mr-1">AI</span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{
            repeat: Infinity,
            duration: 0.6,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
          className="w-1.5 h-1.5 rounded-full bg-primary"
        />
      ))}
    </motion.div>
  );
}

function ConfidenceBadge({ confidence }: { confidence?: 'high' | 'medium' | 'low' }) {
  if (!confidence) return null;

  const config = {
    high: {
      label: 'High Grounding',
      icon: ShieldCheck,
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    medium: {
      label: 'Medium Grounding',
      icon: Info,
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    low: {
      label: 'Low Grounding',
      icon: AlertTriangle,
      classes: 'bg-slate-100 text-slate-600 border-slate-200',
    },
  }[confidence];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border ${config.classes}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function SourceExcerpt({ excerpt }: { excerpt: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!excerpt || excerpt.trim() === '' || excerpt.includes('None')) return null;

  return (
    <div className="mt-3 pt-2.5 border-t border-slate-100">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[12px] font-medium text-primary hover:text-primary-light transition-colors group cursor-pointer select-none"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-125 transition-transform" />
        <span>{isOpen ? 'Hide Source Excerpt' : 'View Source Excerpt'}</span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 transition-transform" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 transition-transform" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={expandAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="mt-2 p-3 bg-slate-50 border-l-2 border-primary rounded-r-lg text-[12px] text-slate-700 font-mono italic leading-relaxed whitespace-pre-wrap">
              "{excerpt}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Ask Content Component ───────────────────────────────────────────

function AskPageContent() {
  const searchParams = useSearchParams();
  const { documentId: ctxDocId, documentType: ctxDocType, language, setLanguage } = useDocument();
  
  const documentId = searchParams.get('doc') || searchParams.get('document_id') || ctxDocId || '';
  const docTypeParam = searchParams.get('type') || (ctxDocId ? ctxDocType : '') || 'Document';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I have indexed your document (${docTypeParam}). Ask me any specific question about terms, payment obligations, cancellation clauses, or liability, and I will ground my response in the exact excerpts.`,
      confidence: 'high',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
        content: `I ran into an issue finding the answer: ${err.message || 'Server error'}. Please try rephrasing your question.`,
        confidence: 'low',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── 1. Empty State (No Document Loaded) ─────────────────────────────────
  if (!documentId) {
    return (
      <main className="min-h-screen bg-background flex flex-col justify-between py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto w-full pt-6">
          {/* Back Navigation */}
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
            {/* 3D Illustration Canvas */}
            <div className="w-44 h-44 mx-auto mb-6">
              <Document3D className="w-full h-full" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-primary/10 text-primary mb-4">
              <FileText className="w-3.5 h-3.5" />
              Document Q&A
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3" style={{ fontWeight: 700 }}>
              No Document Currently Loaded
            </h1>

            <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8">
              To ask questions and receive answers grounded in specific clauses, please upload or paste your legal document for analysis first.
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
          Legal Document Assistant · Grounded Clause-level Question Answering
        </div>
      </main>
    );
  }

  // ── 2. Active Chat Interface ─────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-background flex flex-col justify-between">
      {/* Top Persistent Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Document Info */}
          <div className="flex items-center gap-3">
            <Link
              href="/analyze"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-text-secondary hover:text-text-primary transition-colors"
              title="Back to Document Analysis"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-primary tracking-tight" style={{ fontWeight: 700 }}>
                    {docTypeParam}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Ready
                  </span>
                </div>
                <div className="text-[11px] text-text-secondary font-mono flex items-center gap-2">
                  <span>ID: {documentId.substring(0, 8)}…</span>
                  <span>·</span>
                  <Link
                    href="/analyze"
                    className="text-primary hover:underline font-sans font-medium"
                  >
                    Change Document
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Language Selector */}
          <div className="flex items-center gap-2 self-end sm:self-center">
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

            <button
              type="button"
              onClick={() => {
                setMessages([
                  {
                    id: 'welcome-reset',
                    role: 'assistant',
                    content: `Conversation reset. Ask me anything regarding ${docTypeParam}.`,
                    confidence: 'high',
                    timestamp: 'Just now',
                  },
                ]);
              }}
              className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-slate-100 transition-colors"
              title="Reset Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col justify-between">
        {/* Messages Feed */}
        <div className="space-y-4 pb-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                variants={messageAnimation}
                initial="hidden"
                animate="visible"
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {msg.role === 'user' ? (
                  // User Message
                  <div className="bg-primary text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%] sm:max-w-[75%] text-[13.5px] leading-relaxed">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className="block text-[10px] text-blue-200 mt-1 text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                ) : (
                  // AI Assistant Message
                  <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-sm shadow-soft p-4 sm:p-5 max-w-[92%] sm:max-w-[85%] text-[13.5px] leading-relaxed">
                    {/* Header with confidence */}
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-[12px] font-bold text-text-primary" style={{ fontWeight: 700 }}>
                          Legal Assistant
                        </span>
                      </div>
                      <ConfidenceBadge confidence={msg.confidence} />
                    </div>

                    {/* Answer content */}
                    <div className="text-text-primary leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* Expandable Source Excerpt */}
                    {msg.source_excerpt && <SourceExcerpt excerpt={msg.source_excerpt} />}

                    <span className="block text-[10px] text-text-secondary mt-2">
                      {msg.timestamp}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isLoading && <TypingIndicator key="typing" />}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips (when 1 or few messages) */}
        {messages.length <= 2 && (
          <div className="my-3">
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Suggested Questions
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUESTIONS.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(sq)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-primary text-text-secondary hover:text-primary rounded-xl text-[12px] font-medium transition-all hover:shadow-xs cursor-pointer text-left"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Input Bar */}
      <footer className="sticky bottom-0 z-30 bg-surface/95 backdrop-blur-md border-t border-slate-200/80 px-4 sm:px-6 py-3.5 shadow-lg shadow-slate-200/30">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2 bg-slate-50 border border-slate-200/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 rounded-2xl p-2 transition-all"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any question about this document (e.g., What is the refund timeline?)..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent px-3 py-1.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none resize-none max-h-32 min-h-[38px]"
            />

            <motion.button
              type="submit"
              disabled={!input.trim() || isLoading}
              whileHover={{ scale: input.trim() && !isLoading ? 1.05 : 1 }}
              whileTap={{ scale: input.trim() && !isLoading ? 0.95 : 1 }}
              className={`p-2.5 rounded-xl font-medium transition-all flex items-center justify-center cursor-pointer ${
                input.trim() && !isLoading
                  ? 'bg-primary text-white shadow-sm shadow-primary/30 hover:bg-primary-light'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title="Send question (Enter)"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </form>

          <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-text-secondary">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" /> Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline
            </span>
            <span>Grounded in document excerpts</span>
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm font-medium text-text-secondary">Loading document chat…</span>
          </div>
        </div>
      }
    >
      <AskPageContent />
    </Suspense>
  );
}
