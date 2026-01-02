import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../services/languageContext';
import { ChevronDown, Check, Globe } from 'lucide-react';

interface LanguageOption {
  code: 'en' | 'id';
  name: string;
  nativeName: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
];

interface LanguageSwitcherProps {
  variant?: 'default' | 'hero' | 'compact';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'default',
  className = '' 
}) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: 'en' | 'id') => {
    setLanguage(code);
    setIsOpen(false);
  };

  const baseClasses = variant === 'hero' 
    ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' 
    : variant === 'compact'
    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm';

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${baseClasses}`}
      >
        <span className="text-base">{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right animate-fade-in rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Globe className="h-3.5 w-3.5" />
              Select Language
            </div>
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                language === lang.code 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{lang.flag}</span>
                <div>
                  <p className="font-semibold">{lang.nativeName}</p>
                  <p className="text-xs text-slate-500">{lang.name}</p>
                </div>
              </div>
              {language === lang.code && (
                <Check className="h-4 w-4 text-indigo-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
