import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next.js 16 renomeou `middleware.ts`/`export function middleware` para `proxy.ts`/`export function
// proxy` (ver AGENTS.md e node_modules/next/dist/docs/.../upgrading/version-16.md). O helper do
// next-intl continua se chamando `createMiddleware` (nome da lib, não do arquivo do Next), mas o
// que o Next.js precisa encontrar aqui é a exportação `proxy`.
export const proxy = createMiddleware(routing);

export const config = {
  // roda em tudo, exceto assets estáticos, arquivos internos do Next e a API routes (não temos
  // nenhuma aqui, mas é o padrão recomendado do next-intl). `icon`/`apple-icon`/`pwa-icon` também
  // ficam de fora: são rotas geradas por código (`next/og`, fora de `[locale]`) sem ponto no nome,
  // então sem essa exclusão o middleware tentava prefixar com locale e dava 404 (bug real, achado
  // ao testar os ícones do manifest).
  matcher: ['/((?!api|_next|_vercel|icon|apple-icon|pwa-icon|.*\\..*).*)'],
};
