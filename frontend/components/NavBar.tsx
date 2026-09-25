'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  MessageSquare,
  Scale,
  ClipboardList,
  FileCheck2,
  Globe,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useDocument } from '@/context/DocumentContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/', icon: Sparkles },
  { name: 'Analyze', href: '/analyze', icon: Search },
  { name: 'Ask', href: '/ask', icon: MessageSquare },
  { name: 'Compare', href: '/compare', icon: Scale },
  { name: 'Checklist', href: '/checklist', icon: ClipboardList },
  { name: 'Lawyer-Prep', href: '/lawyer-prep', icon: FileCheck2 },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'gu', label: 'ગુજરાતી' },
];

/**
 * Floating Claymorphic Navigation Island Component
 * - Floating rounded island (rounded-[32px], mx-4 mt-4, shadow-clayCard, bg-white/80 backdrop-blur-xl)
 * - Active links render with recessed concave pill background (shadow-clayPressed, bg-[#EFEBF5])
 * - Responsive heights: h-16 on mobile, sm:h-20 on desktop
 * - Mobile hamburger menu with slide-down clay panel (rounded-[32px] bottom edge)
 * - Pill-shaped language selector (shadow-clayButton, rounded-full)
 */
export default function NavBar() {
  const pathname = usePathname();
  const { language, setLanguage, documentId, documentType, hasDocument } = useDocument();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        {/* Floating Rounded Island */}
        <nav className="h-16 sm:h-20 rounded-[24px] sm:rounded-[32px] bg-white/80 backdrop-blur-xl shadow-clayCard border border-white/90 px-4 sm:px-6 flex items-center justify-between transition-all duration-300">
          {/* Logo / Brand Header */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center text-white shadow-clayButton group-hover:-translate-y-0.5 group-active:scale-[0.92] transition-all">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-black text-sm sm:text-base text-clay-foreground tracking-tight block">
                Legal Assistant
              </span>
              {hasDocument ? (
                <div className="flex items-center gap-1.5 text-[10px] text-clay-success font-heading font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-clay-success animate-pulse" />
                  <span className="truncate max-w-[110px] sm:max-w-[140px]">{documentType}</span>
                </div>
              ) : (
                <p className="text-[10px] text-clay-muted font-sans leading-none hidden sm:block">
                  Plain-Language AI
                </p>
              )}
            </div>
          </Link>

          {/* Desktop Navigation Links (md and above) */}
          <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 transition-all select-none ${
                    isActive
                      ? 'px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-heading font-black text-clay-accent shadow-clayPressed rounded-full bg-[#EFEBF5] border border-white/70'
                      : 'px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-heading font-bold text-clay-muted hover:text-clay-foreground hover:bg-white/60 rounded-full'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-clay-accent' : 'text-clay-muted'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action: Language Selector & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 4. Language Selector: small pill-shaped dropdown (shadow-clayButton, rounded-full) */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-clayButton border border-white/90 text-xs font-heading font-bold text-clay-foreground cursor-pointer select-none active:scale-[0.95] transition-all">
              <Globe className="w-3.5 h-3.5 text-clay-accent shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent font-heading font-bold text-xs text-clay-foreground focus:outline-none cursor-pointer pr-1"
                aria-label="Select Language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Mobile Hamburger Button (styled as a small clay button, shadow-clayButton) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-2xl bg-white shadow-clayButton flex items-center justify-center text-clay-foreground hover:text-clay-accent active:scale-[0.92] active:shadow-clayPressed transition-all border border-white/80"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* 3. Mobile Slide-down Panel (Card styling, rounded-[32px] at bottom edge) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden mt-2 p-5 rounded-[32px] bg-white/95 backdrop-blur-2xl shadow-deepClay border border-white/90 space-y-1.5 overflow-hidden"
            >
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-heading font-bold transition-all ${
                      isActive
                        ? 'bg-[#EFEBF5] shadow-clayPressed text-clay-accent font-black border border-white/80'
                        : 'text-clay-muted hover:text-clay-foreground hover:bg-clay-canvas/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                          isActive
                            ? 'bg-clay-accent/15 text-clay-accent shadow-clayPressed'
                            : 'bg-white shadow-clayButton text-clay-muted'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-clay-accent" />}
                  </Link>
                );
              })}

              {/* Document status footer inside mobile menu */}
              {hasDocument && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-heading font-bold text-clay-muted">
                  <span className="flex items-center gap-1.5 text-clay-success">
                    <ShieldCheck className="w-4 h-4" />
                    Loaded: {documentType}
                  </span>
                  <span className="font-mono text-[10px] text-clay-muted/70">
                    ID: {documentId?.substring(0, 8)}…
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
