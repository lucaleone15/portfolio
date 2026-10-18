import React, { createContext, useContext } from 'react';
import { Language } from '../types';
import { alternatePath, useRouter } from '../router';


interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

export const translations = {
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
    'about.bio': "Étudiant en dernière année de Bachelor en ingénierie des médias à la HEIG-VD, je me forme à la communication digitale, au design et aux technologies web, avec une approche qui combine créativité et technique.\n\nJ’aime concevoir des projets numériques de A à Z, de l’idée à sa réalisation : création de contenus, communication sur les réseaux sociaux, identité visuelle, UI/UX, conception de sites web et développement de projets digitaux.\n\nEn parallèle de mes études, je travaille comme community manager pour le Karting de Vuiteboeuf, où je mets en pratique ces compétences à travers la création de contenus photo et vidéo, la gestion des réseaux sociaux et le développement de la présence digitale de la marque.\n\nCurieux et polyvalent, j’aime apprendre, expérimenter avec de nouveaux outils et transformer des idées en projets concrets. Toujours intéressé par de nouvelles collaborations et opportunités dans le digital.",
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
    'about.bio': "As a final-year Bachelor student in Media Engineering at HEIG-VD, I specialize in digital communication, design, and web technologies, with an approach that bridges creativity and technical execution.\n\nI love crafting digital projects from A to Z, from initial concept to deployment: content creation, social media strategy, visual identity, UI/UX, website design, and interactive media.\n\nAlongside my studies, I work as a community manager for Karting de Vuiteboeuf, applying these skills through photo and video production, social media management, and expanding the brand's digital presence.\n\nCurious and versatile, I thrive on learning, experimenting with new tools, and turning ideas into tangible digital realities. Always open to new collaborations and digital opportunities.",
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
