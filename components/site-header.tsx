'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useTenantSettings } from '@/lib/use-tenant-settings';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { LogoMarkIcon } from '@/components/landing-icons';

const TENANT_NAV_LINKS = [
  { href: '/dashboard', key: 'painel' },
  { href: '/vehicles', key: 'veiculos' },
  { href: '/customers', key: 'clientes' },
  { href: '/rental-contracts', key: 'contratos' },
  { href: '/finance', key: 'financeiro' },
] as const;

const TENANT_ADMIN_NAV_LINKS = [{ href: '/team', key: 'equipe' }] as const;

const SUPER_ADMIN_NAV_LINKS = [{ href: '/admin', key: 'locadoras' }] as const;

/** Anel de foco compartilhado por todo elemento interativo do header. */
const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

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
  const [lastPathname, setLastPathname] = useState(pathname);

  const isBlocked = pathname === '/blocked';
  const navLinks =
    user?.role === 'super_admin'
      ? SUPER_ADMIN_NAV_LINKS
      : user?.role === 'tenant_admin'
        ? [...TENANT_NAV_LINKS, ...TENANT_ADMIN_NAV_LINKS]
        : TENANT_NAV_LINKS;

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  // Fecha o menu mobile sempre que a rota muda (ex: usuário clicou num link) — ajustado durante o
  // render (padrão recomendado pelo React pra "resetar estado quando uma prop muda"), não num
  // `useEffect`, pra evitar o cascading render que o lint (`react-hooks/set-state-in-effect`) aponta.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
    router.push('/login');
  }

  const showAuthedNav = hasHydrated && user && !isBlocked;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-7">
          <span className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <LogoMarkIcon size={16} />
            </span>
            RentFleet
          </span>
          {showAuthedNav && (
            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`border-b-2 py-0.5 text-sm transition-colors ${FOCUS_RING} ${
                    isActive(link.href)
                      ? 'border-accent text-foreground'
                      : 'border-transparent text-foreground-dim hover:text-foreground'
                  }`}
                >
                  {t(link.key)}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <LocaleSwitcher />

          {showAuthedNav && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-xs text-foreground-faint">
                {user.name} · {t(`role.${user.role}`)}
                {tenantSettings ? ` · ${tenantSettings.nome}` : ''}
              </span>
              {user.role === 'tenant_admin' && (
                <Link
                  href="/account/profile"
                  className={`rounded-xs text-foreground-dim transition-colors hover:text-foreground ${FOCUS_RING}`}
                >
                  {t('profile')}
                </Link>
              )}
              <Link
                href="/account/password"
                className={`rounded-xs text-foreground-dim transition-colors hover:text-foreground ${FOCUS_RING}`}
              >
                {t('changePassword')}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={`rounded-xs text-foreground-dim transition-colors hover:text-foreground ${FOCUS_RING}`}
              >
                {t('logout')}
              </button>
            </div>
          )}

          {hasHydrated && !user && (
            <Link
              href="/login"
              className={`rounded-xs text-sm text-foreground-dim transition-colors hover:text-foreground ${FOCUS_RING}`}
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
            className={`flex items-center justify-center rounded-md p-2 text-foreground-dim hover:bg-surface md:hidden ${FOCUS_RING}`}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        )}
      </div>

      {menuOpen && (
        <div className="absolute inset-x-0 top-full z-20 flex flex-col gap-1 border-b border-border bg-background px-4 py-3 shadow-elevated md:hidden">
          {showAuthedNav && (
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`rounded-md px-2 py-2 text-sm hover:bg-surface ${FOCUS_RING} ${
                    isActive(link.href) ? 'font-medium text-foreground' : 'text-foreground-dim'
                  }`}
                >
                  {t(link.key)}
                </Link>
              ))}
            </nav>
          )}

          {showAuthedNav && (
            <>
              <div className="my-1 border-t border-border" />
              <span className="px-2 py-1 font-mono text-xs text-foreground-faint">
                {user.name} · {t(`role.${user.role}`)}
                {tenantSettings ? ` · ${tenantSettings.nome}` : ''}
              </span>
              {user.role === 'tenant_admin' && (
                <Link
                  href="/account/profile"
                  className={`rounded-md px-2 py-2 text-left text-sm text-foreground-dim hover:bg-surface ${FOCUS_RING}`}
                >
                  {t('profile')}
                </Link>
              )}
              <Link
                href="/account/password"
                className={`rounded-md px-2 py-2 text-left text-sm text-foreground-dim hover:bg-surface ${FOCUS_RING}`}
              >
                {t('changePassword')}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={`rounded-md px-2 py-2 text-left text-sm text-foreground-dim hover:bg-surface ${FOCUS_RING}`}
              >
                {t('logout')}
              </button>
            </>
          )}

          {hasHydrated && !user && (
            <Link
              href="/login"
              className={`rounded-md px-2 py-2 text-sm text-foreground-dim hover:bg-surface ${FOCUS_RING}`}
            >
              {t('login')}
            </Link>
          )}

          <div className="my-1 border-t border-border" />
          <div className="px-2 py-1">
            <LocaleSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
