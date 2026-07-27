import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';

/**
 * Sem valor de SEO (conteúdo por trás de login, personalizado por tenant) — reforça o
 * `disallow` de `app/robots.ts` pra qualquer crawler que não respeite robots.txt.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Layout do grupo `(app)` — todas as rotas autenticadas (dashboard, admin, veículos, clientes,
 * contratos, login, blocked) têm o `SiteHeader` compartilhado. A landing pública (`/`, fora deste
 * grupo) tem seu próprio header, então não pode herdar isso do layout raiz (`app/[locale]/layout.tsx`).
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </>
  );
}
