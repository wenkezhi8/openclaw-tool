'use client';

import { useLocale } from 'next-intl';
import enUS from '@/lib/i18n/locales/en-US.json';
import zhCN from '@/lib/i18n/locales/zh-CN.json';

const messages = {
  'en-US': enUS,
  'zh-CN': zhCN,
} as const;

type Locale = keyof typeof messages;
type Messages = typeof enUS;

type PathImpl<T, Key extends string> =
  Key extends keyof T
    ? T[Key]
    : Key extends `${infer K}.${infer Rest}`
      ? K extends keyof T
        ? PathImpl<T[K], Rest>
        : never
      : never;

type Path = PathImpl<Messages, string>;

/**
 * Get nested value from object using dot notation
 */
function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj as unknown);
}

export function useI18n() {
  const locale = useLocale() as Locale;

  const t = (key: Path): string => {
    const value = getNestedValue(messages[locale], key as string);
    if (typeof value === 'string') {
      return value;
    }
    return key as string;
  };

  return {
    locale,
    t,
  };
}

export type { Messages, Path };
