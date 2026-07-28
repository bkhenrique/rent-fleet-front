import type { Metadata } from 'next';
import { LogoMarkIcon } from '@/components/landing-icons';
import { LocaleSwitcher } from '@/components/locale-switcher';

/**
 * Layout mínimo pras páginas públicas de assinatura/visualização de contrato (bloco 31 do
 * MELHORIAS3.md) — sibling da landing (`app/[locale]/page.tsx`), fora do grupo `(app)`, então NÃO
 * herda o `SiteHeader` (nav/login não fazem sentido pra um cliente final sem conta, acessando pelo
 * celular via link do WhatsApp). Só marca + seletor de idioma, sem nenhum link de navegação.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ContratoPublicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-black/10 dark:border-white/15">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2 font-semibold">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-linear-to-br from-accent to-accent-strong text-accent-foreground">
              <LogoMarkIcon size={16} />
            </span>
            RentFleet
          </span>
          <LocaleSwitcher />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </>
  );
}
