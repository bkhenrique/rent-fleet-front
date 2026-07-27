'use client';

import { useEffect, useState } from 'react';
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

const TENANT_ADMIN_NAV_LINKS = [{ href: '/team', key: 'equipe' }] as const;

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
  const [menuOpen, setMenuOpen] = useState(false);

  const isBlocked = pathname === '/blocked';
  const navLinks =
    user?.role === 'super_admin'
      ? SUPER_ADMIN_NAV_LINKS
      : user?.role === 'tenant_admin'
        ? [...TENANT_NAV_LINKS, ...TENANT_ADMIN_NAV_LINKS]
        : TENANT_NAV_LINKS;

  // Fecha o menu mobile sempre que a rota muda (ex: usuário clicou num link).
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    router.push('/login');
  }

  const showAuthedNav = hasHydrated && user && !isBlocked;

  return (
    <header className="relative border-b border-black/10 dark:border-white/15">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="font-semibold">RentFleet</span>
          {showAuthedNav && (
            <nav className="hidden items-center gap-4 md:flex">
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

        <div className="hidden items-center gap-4 md:flex">
          <LocaleSwitcher />

          {showAuthedNav && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-foreground/60">
                {user.name} · {t(`role.${user.role}`)}
                {tenantSettings ? ` · ${tenantSettings.nome}` : ''}
              </span>
              <Link
                href="/account/password"
                className="text-foreground/60 underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {t('changePassword')}
              </Link>
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

        {(showAuthedNav || (hasHydrated && !user)) && (
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={t(menuOpen ? 'closeMenu' : 'openMenu')}
            aria-expanded={menuOpen}
            className="flex items-center justify-center rounded p-2 text-foreground/70 hover:bg-foreground/10 md:hidden"
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        )}
      </div>

      {menuOpen && (
        <div className="absolute inset-x-0 top-full z-20 flex flex-col gap-1 border-b border-black/10 bg-background px-4 py-3 shadow-lg md:hidden dark:border-white/15">
          {showAuthedNav && (
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded px-2 py-2 text-sm text-foreground/80 hover:bg-foreground/10"
                >
                  {t(link.key)}
                </Link>
              ))}
            </nav>
          )}

          {showAuthedNav && (
            <>
              <div className="my-1 border-t border-black/10 dark:border-white/15" />
              <span className="px-2 py-1 text-xs text-foreground/60">
                {user.name} · {t(`role.${user.role}`)}
                {tenantSettings ? ` · ${tenantSettings.nome}` : ''}
              </span>
              <Link
                href="/account/password"
                className="rounded px-2 py-2 text-left text-sm text-foreground/80 hover:bg-foreground/10"
              >
                {t('changePassword')}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded px-2 py-2 text-left text-sm text-foreground/80 hover:bg-foreground/10"
              >
                {t('logout')}
              </button>
            </>
          )}

          {hasHydrated && !user && (
            <Link
              href="/login"
              className="rounded px-2 py-2 text-sm text-foreground/80 hover:bg-foreground/10"
            >
              {t('login')}
            </Link>
          )}

          <div className="my-1 border-t border-black/10 dark:border-white/15" />
          <div className="px-2 py-1">
            <LocaleSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
