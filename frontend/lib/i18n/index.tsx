'use client';

import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Locale, defaultLocale, localeNames, locales } from './config';
import enUS from './locales/en-US.json';
import zhCN from './locales/zh-CN.json';

const translations = {
  'en-US': enUS,
  'zh-CN': zhCN,
} as const;

type Translations = typeof translations[Locale];

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
  localeName: string;
  availableLocales: readonly Locale[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'openclaw-locale';

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj) as string || path;
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  try {
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale;
    if (savedLocale && translations[savedLocale]) {
      return savedLocale;
    }
  } catch {
    // Ignore storage errors
  }

  const browserLang = navigator.language;
  const matchedLocale = locales.find(l => browserLang.startsWith(l.split('-')[0]));
  return matchedLocale || defaultLocale;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale());

  const setLocale = (newLocale: Locale) => {
    if (translations[newLocale]) {
      setLocaleState(newLocale);
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      } catch {
        // Ignore storage errors
      }
      document.documentElement.lang = newLocale;
    }
  };

  const value: I18nContextType = useMemo(() => ({
    locale,
    setLocale,
    t: (key: string, fallback?: string): string => {
      const translation = translations[locale];
      const value = getNestedValue(translation, key);
      return value !== key ? value : (fallback || key);
    },
    localeName: localeNames[locale],
    availableLocales: locales,
  }), [locale]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export type { Translations };
