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
  requiresDoc?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/', icon: Sparkles },
  { name: 'Analyze', href: '/analyze', icon: Search },
  { name: 'Ask Questions', href: '/ask', icon: MessageSquare, requiresDoc: true },
  { name: 'Compare', href: '/compare', icon: Scale },
  { name: 'Checklist', href: '/checklist', icon: ClipboardList, requiresDoc: true },
  { name: 'Lawyer-Prep', href: '/lawyer-prep', icon: FileCheck2, requiresDoc: true },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
];

export default function NavBar() {
  const pathname = usePathname();
  const { language, setLanguage, documentId, documentType, hasDocument } = useDocument();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white shadow-sm shadow-primary/20 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-text-primary tracking-tight" style={{ fontWeight: 800 }}>
                Legal Assistant
              </span>
              {hasDocument ? (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="truncate max-w-[120px]">{documentType}</span>
                </div>
              ) : (
                <p className="text-[10px] text-text-secondary leading-none">Plain-language AI</p>
              )}
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
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
                  className={`relative px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>

                  {/* Animated sliding underline */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-primary to-primary-light rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action: Global Language Selector & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-text-secondary shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent font-medium text-text-primary text-xs focus:outline-none cursor-pointer pr-1"
                aria-label="Select Language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-slate-200/80 bg-surface/95 backdrop-blur-lg px-4 pt-2 pb-4 space-y-1 shadow-lg overflow-hidden"
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
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-50/80 text-primary border border-blue-100'
                      : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
                </Link>
              );
            })}

            {hasDocument && (
              <div className="mt-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-xs flex items-center justify-between">
                <span className="font-semibold text-emerald-800 truncate">
                  Loaded: {documentType}
                </span>
                <span className="text-[10px] text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                  {documentId?.substring(0, 6)}…
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
