/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Language, Currency } from '@/types/database';
import { t as translate } from '@/lib/i18n';

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  dir: 'rtl' | 'ltr';
  currency: Currency;
  setCurrency: (c: Currency) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'ar';
  });
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('currency') as Currency) || 'EGP';
  });

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem('lang', lang);
  }, [lang, dir]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const setLang = useCallback((l: Language) => setLangState(l), []);
  const setCurrency = useCallback((c: Currency) => setCurrencyState(c), []);

  const tFn = useCallback((key: string) => translate(key, lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir, currency, setCurrency, t: tFn }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
