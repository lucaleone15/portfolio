import { useLanguage } from '../context/LanguageContext';
import { homePath, Link } from '../router';
import { USER_INFO } from '../data/portfolioData';

/**
 * Privacy policy (Swiss nLPD / revFADP, and GDPR for visitors in the EU).
 * It must describe what the site actually does — keep it in sync with:
 *   server/contact.ts    (contact form: fields, IP used in memory for rate limiting only)
 *   server/analytics.ts  (page views: path, referrer host, date; no IP, no cookie; 13 months)
 *   ThemeContext / index.html (theme preference in localStorage)
 */

const LAST_UPDATED = { fr: '2 octobre 2026', en: 'October 2, 2026' };

interface Section {
  title: string;
  body: (string | string[])[];
}

const CONTENT: Record<'fr' | 'en', { label: string; title: string; intro: string; summary: string[]; sections: Section[]; updated: string; back: string }> = {
  fr: {
    label: 'Confidentialité',
    title: 'Politique de confidentialité',
    intro:
      'Ce site est un portfolio personnel. Il collecte le moins de données possible, et uniquement pour fonctionner. Cette page explique lesquelles, pourquoi, et quels sont vos droits.',
    summary: [
      'Aucun cookie, aucune publicité, aucun outil de suivi tiers.',
      'Les polices, images et documents sont hébergés sur le site lui-même : aucune donnée n’est transmise à Google ou à d’autres services lors de votre visite.',
      'Les statistiques de visite sont internes et ne contiennent ni votre adresse IP ni aucun identifiant.',
      'Le site et ses données sont hébergés en Suisse.',
    ],
    sections: [
      {
        title: 'Responsable du traitement',
        body: [
          `Luca Leone, Orbe (Vaud, Suisse). Contact : ${USER_INFO.email}.`,
        ],
      },
      {
        title: 'Hébergement',
        body: [
          'Le site est hébergé par Infomaniak Network SA, à Genève (Suisse), dans des centres de données situés en Suisse. Comme tout hébergeur, Infomaniak peut enregistrer des journaux techniques (par exemple l’adresse IP et l’heure d’une requête) pour assurer la sécurité et le bon fonctionnement de ses serveurs, selon sa propre politique de confidentialité.',
        ],
      },
      {
        title: 'Formulaire de contact',
        body: [
          'Lorsque vous utilisez le formulaire, les données suivantes sont traitées :',
          ['votre nom ;', 'votre adresse email ;', 'le sujet choisi et votre message.'],
          'Elles servent uniquement à vous répondre. Elles sont envoyées par email à ma boîte de messagerie (hébergée chez Infomaniak, en Suisse) et ne sont pas stockées ailleurs sur le site.',
          'Votre adresse IP est utilisée temporairement, en mémoire et sans être enregistrée, pour limiter les envois abusifs (5 messages par 10 minutes).',
          'Les messages sont conservés le temps nécessaire au traitement de votre demande et au suivi de nos échanges, au maximum deux ans après le dernier contact, sauf obligation légale contraire.',
        ],
      },
      {
        title: 'Statistiques de visite',
        body: [
          'Pour savoir quelles pages sont consultées, le site enregistre lui-même, pour chaque page vue :',
          ['la page consultée ;', 'le site d’où vous venez, le cas échéant (par exemple linkedin.com) ;', 'la date et l’heure.'],
          'Ces statistiques ne contiennent ni votre adresse IP, ni cookie, ni identifiant : il est impossible de vous reconnaître d’une visite à l’autre. Les robots ne sont pas comptés, et si votre navigateur envoie le signal « Do Not Track », aucune visite n’est enregistrée.',
          'Ces données restent sur le serveur du site et sont supprimées automatiquement après 13 mois.',
        ],
      },
      {
        title: 'Stockage dans votre navigateur',
        body: [
          'Si vous choisissez un thème (clair ou sombre), ce choix est mémorisé dans le stockage local de votre navigateur (localStorage) pour être réappliqué à votre prochaine visite. Cette information reste sur votre appareil et n’est jamais transmise. Vous pouvez la supprimer en effaçant les données du site dans votre navigateur.',
          'Le site n’utilise aucun cookie.',
        ],
      },
      {
        title: 'Liens externes',
        body: [
          'Le site contient des liens vers d’autres sites, notamment LinkedIn. En les suivant, vous quittez ce site : la politique de confidentialité du site concerné s’applique alors.',
        ],
      },
      {
        title: 'Sécurité',
        body: [
          'Les échanges avec le site sont chiffrés (HTTPS) et le site applique des en-têtes de sécurité stricts, qui l’empêchent notamment de charger des scripts provenant d’autres sites.',
        ],
      },
      {
        title: 'Vos droits',
        body: [
          'Conformément à la loi fédérale sur la protection des données (nLPD) et, pour les personnes situées dans l’Union européenne, au Règlement général sur la protection des données (RGPD), vous pouvez à tout moment :',
          [
            'savoir quelles données vous concernant sont traitées (droit d’accès) ;',
            'les faire corriger ou supprimer ;',
            'vous opposer à leur traitement ou en demander la limitation ;',
            'recevoir les données que vous avez fournies dans un format courant.',
          ],
          `Il suffit d’écrire à ${USER_INFO.email}. Je réponds dans un délai de 30 jours.`,
          'Vous pouvez également vous adresser au Préposé fédéral à la protection des données et à la transparence (PFPDT, www.edoeb.admin.ch) ou, si vous résidez dans l’Union européenne, à l’autorité de protection des données de votre pays.',
        ],
      },
      {
        title: 'Modifications',
        body: [
          'Cette politique peut être mise à jour si le fonctionnement du site change. La date de dernière mise à jour figure ci-dessous.',
        ],
      },
    ],
    updated: 'Dernière mise à jour',
    back: 'Retour à l’accueil',
  },
  en: {
    label: 'Privacy',
    title: 'Privacy policy',
    intro:
      'This website is a personal portfolio. It collects as little data as possible, and only what it needs to work. This page explains which data, why, and what your rights are.',
    summary: [
      'No cookies, no advertising, no third-party tracking.',
      'Fonts, images and documents are hosted on the site itself: no data is sent to Google or other services when you visit.',
      'Visit statistics are first-party and contain neither your IP address nor any identifier.',
      'The site and its data are hosted in Switzerland.',
    ],
    sections: [
      {
        title: 'Data controller',
        body: [`Luca Leone, Orbe (Vaud, Switzerland). Contact: ${USER_INFO.email}.`],
      },
      {
        title: 'Hosting',
        body: [
          'The site is hosted by Infomaniak Network SA, Geneva (Switzerland), in data centres located in Switzerland. Like any host, Infomaniak may keep technical logs (for example the IP address and time of a request) to keep its servers secure and running, under its own privacy policy.',
        ],
      },
      {
        title: 'Contact form',
        body: [
          'When you use the contact form, the following data is processed:',
          ['your name;', 'your email address;', 'the topic you chose and your message.'],
          'It is only used to reply to you. It is sent by email to my mailbox (hosted by Infomaniak, in Switzerland) and is not stored anywhere else on the site.',
          'Your IP address is used temporarily, in memory and without being recorded, to limit abuse (5 messages per 10 minutes).',
          'Messages are kept for as long as needed to handle your request and follow up on our exchange, at most two years after the last contact, unless the law requires otherwise.',
        ],
      },
      {
        title: 'Visit statistics',
        body: [
          'To know which pages are viewed, the site itself records, for each page view:',
          ['the page viewed;', 'the site you came from, if any (for example linkedin.com);', 'the date and time.'],
          'These statistics contain no IP address, no cookie and no identifier: you cannot be recognised from one visit to the next. Bots are not counted, and if your browser sends the “Do Not Track” signal, no visit is recorded.',
          'This data stays on the site’s server and is deleted automatically after 13 months.',
        ],
      },
      {
        title: 'Storage in your browser',
        body: [
          'If you choose a theme (light or dark), your choice is remembered in your browser’s local storage (localStorage) so it applies on your next visit. It stays on your device and is never sent anywhere. You can remove it by clearing the site’s data in your browser.',
          'The site uses no cookies.',
        ],
      },
      {
        title: 'External links',
        body: [
          'The site links to other websites, including LinkedIn. By following them you leave this site, and that website’s privacy policy applies.',
        ],
      },
      {
        title: 'Security',
        body: [
          'Traffic to the site is encrypted (HTTPS) and the site uses strict security headers, which in particular prevent it from loading scripts from other websites.',
        ],
      },
      {
        title: 'Your rights',
        body: [
          'Under the Swiss Federal Act on Data Protection (revFADP) and, for people in the European Union, the General Data Protection Regulation (GDPR), you can at any time:',
          [
            'find out which data about you is processed (right of access);',
            'have it corrected or deleted;',
            'object to its processing or ask for it to be restricted;',
            'receive the data you provided in a common format.',
          ],
          `Just write to ${USER_INFO.email}. I reply within 30 days.`,
          'You can also contact the Swiss Federal Data Protection and Information Commissioner (FDPIC, www.edoeb.admin.ch) or, if you live in the European Union, the data protection authority of your country.',
        ],
      },
      {
        title: 'Changes',
        body: ['This policy may be updated if the way the site works changes. The date of the last update is shown below.'],
      },
    ],
    updated: 'Last updated',
    back: 'Back to home',
  },
};

export function PrivacyPolicy() {
  const { lang } = useLanguage();
  const c = CONTENT[lang];

  return (
    <main id="main-content" className="relative z-10 pt-28 sm:pt-36 pb-24 sm:pb-32">
      <article className="max-w-3xl mx-auto px-6 sm:px-10">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[var(--accent)] mb-5">{c.label}</p>
        <h1 className="font-serif text-4xl sm:text-6xl font-extrabold tracking-[-0.035em] leading-[1.05] text-neutral-900 dark:text-white mb-6">
          {c.title}
          <span className="text-[var(--accent)]">.</span>
        </h1>
        <p className="text-lg sm:text-xl text-neutral-600 dark:text-[#A1A1AA] leading-relaxed mb-10">{c.intro}</p>

        {/* The essentials, before the details */}
        <ul className="mb-14 space-y-3 border-y border-black/10 dark:border-white/10 py-6">
          {c.summary.map((line) => (
            <li key={line} className="flex gap-3.5 text-base sm:text-lg text-neutral-800 dark:text-[#E4E4E7] leading-relaxed">
              <span className="mt-[0.65em] w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" aria-hidden="true" />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-12">
          {c.sections.map((section, i) => (
            <section key={section.title} aria-labelledby={`privacy-${i}`}>
              <h2 id={`privacy-${i}`} className="flex items-baseline gap-4 text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white mb-4">
                <span className="font-syne text-sm font-bold text-[var(--accent)]">{String(i + 1).padStart(2, '0')}</span>
                {section.title}
              </h2>
              <div className="space-y-4 text-base sm:text-lg text-neutral-600 dark:text-[#A1A1AA] leading-relaxed">
                {section.body.map((block, b) =>
                  Array.isArray(block) ? (
                    <ul key={b} className="space-y-1.5 pl-5 list-disc marker:text-[var(--accent)]">
                      {block.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={b}>{block}</p>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-16 pt-8 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-neutral-500 dark:text-[#A1A1AA]">
            {c.updated}{lang === 'fr' ? ' : ' : ': '}{LAST_UPDATED[lang]}
          </p>
          <Link
            href={homePath(lang)}
            className="font-syne inline-flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white hover:text-[var(--accent)] transition-colors"
          >
            ← {c.back}
          </Link>
        </footer>
      </article>
    </main>
  );
}
