import en from './locales/en.json';
import si from './locales/si.json';
import ta from './locales/ta.json';

export const DEFAULT_LANGUAGE = 'en' as const;

export const APP_LANGUAGES = ['en', 'si', 'ta'] as const;
export type AppLanguage = (typeof APP_LANGUAGES)[number];

export const resources = {
  en: {
    translation: en,
  },
  si: {
    translation: si,
  },
  ta: {
    translation: ta,
  },
};
