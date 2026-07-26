import { defineRouting } from 'next-intl/routing';

export const LOCALES = ['pt', 'en', 'es'] as const;
export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'pt';

/**
 * `localePrefix: 'always'` (em vez de 'as-needed') é proposital: assim TODA URL tem o locale
 * como primeiro segmento (/pt/..., /en/..., /es/...), inclusive o idioma padrão. Isso simplifica
 * bastante o código que precisa descobrir o locale atual fora de um Server Component (ex: o
 * cliente HTTP tratando o redirect pra /blocked), já que não tem caso especial "sem prefixo".
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
});
