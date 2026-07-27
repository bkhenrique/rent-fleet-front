import { SiteHeader } from '@/components/site-header';

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
