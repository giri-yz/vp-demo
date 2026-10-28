import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export type LangCode = 'en' | 'ta' | 'hi' | 'si' | 'ms';

export type TranslationsBundle = Record<LangCode, Record<string, unknown>>;

interface LanguageContextValue {
  lang: LangCode;
  setLang: (code: LangCode) => void;
  t: (key: string) => string;
  tRaw: (key: string) => unknown;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'vpnexues_lang';
const LANG_CODES: readonly LangCode[] = ['en', 'ta', 'hi', 'si', 'ms'];

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

export function LanguageProvider({ children, translationsMap }: { children: ReactNode; translationsMap: TranslationsBundle }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (LANG_CODES as readonly string[]).includes(stored)) return stored as LangCode;
    } catch { /* ignore */ }
    return 'en';
  });

  const setLang = useCallback((code: LangCode) => {
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
    document.documentElement.lang = code;
    document.documentElement.dir = 'ltr';
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr';
  }, [lang]);

  const tRaw = useCallback((key: string): unknown => {
    const val = getNestedValue(translationsMap[lang] as Record<string, unknown>, key);
    if (val !== undefined) return val;
    if (lang !== 'en') {
      const enVal = getNestedValue(translationsMap.en as Record<string, unknown>, key);
      if (enVal !== undefined) return enVal;
    }
    return key;
  }, [lang, translationsMap]);

  const t = useCallback((key: string): string => {
    const val = tRaw(key);
    return typeof val === 'string' ? val : key;
  }, [tRaw]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tRaw }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
