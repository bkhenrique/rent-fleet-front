import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * Só a landing (`/`, `/pt`, `/en`, `/es`) é pública. O resto vive atrás de login (grupo de rotas
 * `(app)` — dashboard, admin, veículos, clientes, contratos) e não tem valor de SEO: um crawler sem
 * sessão só veria redirect ou tela vazia. Bloqueado aqui pra não gastar crawl budget; reforçado com
 * `robots: noindex` no layout de `(app)` (ver `app/[locale]/(app)/layout.tsx`) pra quem não respeitar
 * o disallow.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/*/login', '/*/blocked', '/*/dashboard', '/*/admin', '/*/vehicles', '/*/customers', '/*/rental-contracts'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
