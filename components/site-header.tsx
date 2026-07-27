'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useTenantSettings } from '@/lib/use-tenant-settings';
import { LocaleSwitcher } from '@/components/locale-switcher';

const TENANT_NAV_LINKS = [
  { href: '/dashboard', key: 'painel' },
  { href: '/vehicles', key: 'veiculos' },
  { href: '/customers', key: 'clientes' },
  { href: '/rental-contracts', key: 'contratos' },
] as const;

const SUPER_ADMIN_NAV_LINKS = [{ href: '/admin', key: 'locadoras' }] as const;

/**
 * Header único do app inteiro — decide o que mostrar a partir do estado de auth em vez de cada
 * página desenhar sua própria navegação (ver bloco 17 do MELHORIAS.md). Na `/blocked` mostra só a
 * marca + idioma, sem nav nem indicador de usuário: a própria tela já tem seu botão de sair e é
 * proposital não oferecer nenhum outro link enquanto o acesso está congelado.
 */
export function SiteHeader() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const { user, hasHydrated, logout } = useAuthStore();
  const tenantSettings = useTenantSettings();

  const isBlocked = pathname === '/blocked';
  const navLinks = user?.role === 'super_admin' ? SUPER_ADMIN_NAV_LINKS : TENANT_NAV_LINKS;

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <header className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/15">
      <div className="flex items-center gap-6">
        <span className="font-semibold">RentFleet</span>
        {hasHydrated && user && !isBlocked && (
          <nav className="flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/70 transition-colors hover:text-foreground"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-4">
        <LocaleSwitcher />

        {hasHydrated && user && !isBlocked && (
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-foreground/60 sm:inline">
              {user.name} · {t(`role.${user.role}`)}
              {tenantSettings ? ` · ${tenantSettings.nome}` : ''}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-foreground/60 underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {t('logout')}
            </button>
          </div>
        )}

        {hasHydrated && !user && (
          <Link
            href="/login"
            className="text-sm text-foreground/60 underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {t('login')}
          </Link>
        )}
      </div>
    </header>
  );
}
