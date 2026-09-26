'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { SimplifyResponse, RiskResponse, ChecklistResponse } from '@/lib/api';

export interface DocumentContextType {
  documentId: string | null;
  documentType: string;
  fullText: string;
  simplifyResult: SimplifyResponse | null;
  riskResult: RiskResponse | null;
  checklistResult: ChecklistResponse | null;
  language: string;
  setLanguage: (lang: string) => void;
  setDocumentData: (data: {
    documentId: string;
    documentType: string;
    fullText?: string;
    simplifyResult?: SimplifyResponse | null;
    riskResult?: RiskResponse | null;
  }) => void;
  setChecklistData: (data: ChecklistResponse) => void;
  clearDocument: () => void;
  hasDocument: boolean;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

const STORAGE_KEY = 'lda_active_document_session';

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string>('Document');
  const [fullText, setFullText] = useState<string>('');
  const [simplifyResult, setSimplifyResult] = useState<SimplifyResponse | null>(null);
  const [riskResult, setRiskResult] = useState<RiskResponse | null>(null);
  const [checklistResult, setChecklistResult] = useState<ChecklistResponse | null>(null);
  const [language, setLanguageState] = useState<string>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore from sessionStorage and localStorage on mount
  useEffect(() => {
    try {
      // Check localStorage for user language preference first
      const storedLang = localStorage.getItem('lda_user_language');
      if (storedLang && ['en', 'hi', 'gu'].includes(storedLang)) {
        setLanguageState(storedLang);
      }

      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.documentId) {
          setDocumentId(parsed.documentId);
          setDocumentType(parsed.documentType || 'Document');
          setFullText(parsed.fullText || '');
          setSimplifyResult(parsed.simplifyResult || null);
          setRiskResult(parsed.riskResult || null);
          setChecklistResult(parsed.checklistResult || null);
          // Only override if storedLang wasn't already set
          if (parsed.language && !storedLang) {
            setLanguageState(parsed.language);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load document context from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to sessionStorage on updates
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (documentId) {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            documentId,
            documentType,
            fullText,
            simplifyResult,
            riskResult,
            checklistResult,
            language,
          })
        );
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save document context to session storage', e);
    }
  }, [documentId, documentType, fullText, simplifyResult, riskResult, checklistResult, language, isLoaded]);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('lda_user_language', lang);
    } catch (e) {
      console.error('Failed to save language to localStorage', e);
    }
  }, []);

  const setDocumentData = useCallback((data: {
    documentId: string;
    documentType: string;
    fullText?: string;
    simplifyResult?: SimplifyResponse | null;
    riskResult?: RiskResponse | null;
  }) => {
    setDocumentId(data.documentId);
    setDocumentType(data.documentType || 'Document');
    if (data.fullText !== undefined) setFullText(data.fullText);
    if (data.simplifyResult !== undefined) setSimplifyResult(data.simplifyResult);
    if (data.riskResult !== undefined) setRiskResult(data.riskResult);
  }, []);

  const setChecklistData = useCallback((data: ChecklistResponse) => {
    setChecklistResult(data);
  }, []);

  const clearDocument = useCallback(() => {
    setDocumentId(null);
    setDocumentType('Document');
    setFullText('');
    setSimplifyResult(null);
    setRiskResult(null);
    setChecklistResult(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }, []);

  return (
    <DocumentContext.Provider
      value={{
        documentId,
        documentType,
        fullText,
        simplifyResult,
        riskResult,
        checklistResult,
        language,
        setLanguage,
        setDocumentData,
        setChecklistData,
        clearDocument,
        hasDocument: !!documentId,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument(): DocumentContextType {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}
