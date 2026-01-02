import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { translations } from '../translations';
import { Language } from '../types';

const LANGUAGE_STORAGE_KEY = 'diagnospace_language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => any; // Helper for nested keys
  content: typeof translations['en'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'en' || saved === 'id') {
      return saved;
    }
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('id')) {
      return 'id';
    }
  }
  return 'id'; // Default to Indonesian
};

export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const content = translations[language];

  // Simple helper to access nested keys like 'nav.catalog'
  const t = (path: string) => {
    return path.split('.').reduce((obj, key) => obj && obj[key], content as any) || path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, content }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};