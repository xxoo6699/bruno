import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './translation/en.json';
import translationZhCn from './translation/zh-CN.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '简体中文' }
];

const LANG_STORAGE_KEY = 'bruno-lang';

export const getStoredLanguage = () => {
  try {
    const stored = window.localStorage?.getItem(LANG_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.some((lang) => lang.code === stored)) {
      return stored;
    }
  } catch (e) {
    // localStorage may be unavailable, fall through to browser detection
  }

  const browserLang = typeof navigator !== 'undefined' ? navigator.language : '';
  if (browserLang && browserLang.toLowerCase().startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en';
};

export const storeLanguage = (lng) => {
  try {
    window.localStorage?.setItem(LANG_STORAGE_KEY, lng);
  } catch (e) {
    // ignore storage failures, the in-memory language is still applied
  }
};

// Keys are plain English strings (natural keys): a missing translation falls
// back to the key itself, so the UI degrades to English instead of showing raw ids
const resources = {
  'en': {
    translation: translationEn
  },
  'zh-CN': {
    translation: translationZhCn
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: getStoredLanguage(), // Use "en" as the default language. "cimode" can be used to debug / show translation placeholder
    fallbackLng: 'en',

    ns: 'translation', // Use translation as the default Namespace that will be loaded by default

    keySeparator: false, // keys are full English sentences, disable nested key lookup
    nsSeparator: false,

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
