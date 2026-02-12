export const locales = ['en-US', 'zh-CN'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en-US';

export const localeNames: Record<Locale, string> = {
  'en-US': 'English',
  'zh-CN': '简体中文',
};

export const localeFlags: Record<Locale, string> = {
  'en-US': '🇺🇸',
  'zh-CN': '🇨🇳',
};
