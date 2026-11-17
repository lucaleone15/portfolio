/** Injected by vite.config.ts (define): facts for the hidden /stand page */
declare const __BUILD_INFO__: {
  commits: number;
  firstCommit: string;
  builtAt: string;
  versions: Record<string, string>;
};

/** Injected by vite.config.ts (define): each page's real dates, from git (scripts/page-dates.mjs) */
declare const __PAGE_DATES__: {
  site: { published: string; modified: string };
  projects: Record<string, { added: string; modified: string }>;
};
