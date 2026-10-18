import React, { createContext, useContext } from 'react';
import { Language } from '../types';
import { alternatePath, useRouter } from '../router';


interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navigation
    'nav.projects': 'Projets',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',
    'nav.close': 'Fermer',

    // Hero
    'hero.ctaProjects': 'Découvrir les projets',
    'hero.ctaContact': 'Me contacter',


    // Projects Section
    'projects.index': '01',
    'projects.title': 'Projets',
    'projects.seeAll': 'Filtrer les projets',
    'projects.viewProject': 'Voir le projet',

    // About Section
    'about.index': '02',
    'about.title': 'À propos',
    'about.educationTitle': 'Formation et parcours',
    'about.experienceTitle': 'Expériences professionnelles',
    'about.languagesTitle': 'Langues',
    'about.passionsTitle': 'Centres d’intérêt & Passions',

    // Contact Section
    'contact.index': '03',
    'contact.title': 'Contact',
    'contact.talkPrefix': 'Parlons de votre',
    'contact.talkHighlight': 'prochain projet.',
    'contact.sendBtn': 'Envoyer le message',
  },
  en: {
    // Navigation
    'nav.projects': 'Projects',
    'nav.about': 'About me',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',
    'nav.close': 'Close',

    // Hero
    'hero.ctaProjects': 'Explore projects',
    'hero.ctaContact': 'Get in touch',


    // Projects Section
    'projects.index': '01',
    'projects.title': 'Projects',
    'projects.seeAll': 'Filter projects',
    'projects.viewProject': 'View project',

    // About Section
    'about.index': '02',
    'about.title': 'About me',
    'about.educationTitle': 'Education & Academic Journey',
    'about.experienceTitle': 'Professional Experience',
    'about.languagesTitle': 'Languages',
    'about.passionsTitle': 'Interests & Passions',

    // Contact Section
    'contact.index': '03',
    'contact.title': 'Contact',
    'contact.talkPrefix': "Let's talk about your",
    'contact.talkHighlight': 'next project.',
    'contact.sendBtn': 'Send message',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (key: string) => key
});

/** The language comes from the URL (/ vs /en/); switching language navigates to the other URL. */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { route, navigate } = useRouter();
  const lang = route.lang;

  const setLang = (newLang: Language) => {
    if (newLang !== lang) navigate(alternatePath(route, newLang), { keepScroll: true });
  };

  const t = (key: string): string => {
    const dict = translations[lang] as Record<string, any>;
    return dict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
