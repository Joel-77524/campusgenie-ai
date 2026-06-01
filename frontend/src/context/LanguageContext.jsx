import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LANGUAGES = {
  EN: { code: 'en', name: 'English' },
  ML: { code: 'ml', name: 'Malayalam' },
  HI: { code: 'hi', name: 'Hindi' },
  TA: { code: 'ta', name: 'Tamil' }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('ait_language');
    return saved || LANGUAGES.EN.code;
  });

  useEffect(() => {
    localStorage.setItem('ait_language', language);
    // Optionally update document lang attribute
    document.documentElement.lang = language;
  }, [language]);

  const currentLanguageName = Object.values(LANGUAGES).find(l => l.code === language)?.name || 'English';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentLanguageName, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
