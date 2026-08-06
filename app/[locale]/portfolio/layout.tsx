import type { Metadata } from 'next';
import { LogoMarkIcon } from '@/components/landing-icons';
import { LocaleSwitcher } from '@/components/locale-switcher';

/**
 * Layout mínimo pro portfólio público da frota (bloco 5 do PORTFOLIO_PUBLICO.md) — mesmo padrão de
 * `app/[locale]/contrato/layout.tsx`: sibling da landing, fora do grupo `(app)`, sem `SiteHeader`
 * nem qualquer navegação pro painel autenticado. É aberto por um cliente final sem conta, geralmente
 * via link do WhatsApp.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PortfolioPublicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
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
