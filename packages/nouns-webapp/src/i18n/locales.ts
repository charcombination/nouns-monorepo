const dayjs = require('dayjs');
const en = require('dayjs/locale/en');
const ja = require('dayjs/locale/ja')
const DaysJSLocale = en.Locale;

export const SUPPORTED_LOCALES = [
  // order as they appear in the language dropdown
  'en-US',
  'ja-JP',
];
export type SupportedLocale = typeof SUPPORTED_LOCALES[number] | 'pseudo';

export const DEFAULT_LOCALE: SupportedLocale = 'en-US';

export const LOCALE_LABEL: { [locale in SupportedLocale]: string } = {
  'en-US': 'English',
  'ja-JP': '日本語',
  pseudo: 'ƥƨèúδô',
};

export enum Locales {
  en_US = 'en-US',
  ja_JP = 'ja-JP',
}

// Map SupportedLocale string to DaysJS locale object (used for locale aware time formatting)
export const SUPPORTED_LOCALE_TO_DAYSJS_LOCALE: { [locale in SupportedLocale]: typeof DaysJSLocale } = {
  'en-US': en,
  'ja-JP': ja,
  pseudo: en,
};
