import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next.js 16 renomeou `middleware.ts`/`export function middleware` para `proxy.ts`/`export function
// proxy` (ver AGENTS.md e node_modules/next/dist/docs/.../upgrading/version-16.md). O helper do
// next-intl continua se chamando `createMiddleware` (nome da lib, não do arquivo do Next), mas o
// que o Next.js precisa encontrar aqui é a exportação `proxy`.
export const proxy = createMiddleware(routing);

export const config = {
  // roda em tudo, exceto assets estáticos, arquivos internos do Next e a API routes (não temos
  // nenhuma aqui, mas é o padrão recomendado do next-intl).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
