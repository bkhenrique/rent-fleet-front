import type { MetadataRoute } from 'next';
import { LOCALES } from '@/i18n/routing';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Só a landing é pública — ver `app/robots.ts` pro porquê o resto das rotas fica de fora. */
export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: locale === 'pt' ? 1 : 0.8,
    alternates: {
      languages: {
        ...Object.fromEntries(LOCALES.map((loc) => [loc, `${SITE_URL}/${loc}`])),
        'x-default': `${SITE_URL}/pt`,
      },
    },
  }));
}
