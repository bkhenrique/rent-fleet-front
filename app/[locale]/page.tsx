import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { AuthRedirect } from '@/components/auth-redirect';

const FEATURE_KEYS = ['vehicles', 'tracking', 'contracts', 'dashboard'] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing' });
  return {
    title: t('hero.title'),
    description: t('hero.subtitle'),
  };
}

/**
 * `/` é a landing pública do RentFleet: um Server Component (bom pra SEO e first paint) que
 * renderiza o conteúdo de marketing sempre. Quem já está logado é tirado da landing por
 * `<AuthRedirect />`, um client component que só cuida do efeito de redirect (`/admin` pra
 * super_admin, `/dashboard` pro resto) — a decisão de mostrar a landing em si não depende de
 * nenhum estado do cliente. Ver LANDING.md.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);

  const t = await getTranslations('landing');
  const problemItems = t.raw('problem.items') as string[];
  const differentialItems = t.raw('differentials.items') as string[];

  return (
    <>
      <AuthRedirect />

      <div className="flex flex-col">
        <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center">
          <h1 className="text-3xl font-bold sm:text-5xl">{t('hero.title')}</h1>
          <p className="max-w-2xl text-lg text-foreground/70">{t('hero.subtitle')}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded bg-foreground px-6 py-3 font-medium text-background"
            >
              {t('hero.cta')}
            </Link>
            <a href="#features" className="text-sm font-medium underline underline-offset-4">
              {t('hero.ctaSecondary')}
            </a>
          </div>
        </section>

        <section className="border-t border-black/10 px-4 py-16 dark:border-white/10">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-semibold">{t('problem.title')}</h2>
            <ul className="mt-8 flex flex-col gap-3">
              {problemItems.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-lg bg-black/3 p-4 dark:bg-white/5"
                >
                  <span aria-hidden className="text-red-600 dark:text-red-400">
                    ✕
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="features" className="border-t border-black/10 px-4 py-16 dark:border-white/10">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-semibold">{t('features.title')}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURE_KEYS.map((key) => (
                <div
                  key={key}
                  className="flex flex-col gap-2 rounded-lg border border-black/10 p-5 dark:border-white/10"
                >
                  <h3 className="font-semibold">{t(`features.${key}.title`)}</h3>
                  <p className="text-sm text-foreground/70">{t(`features.${key}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 px-4 py-16 dark:border-white/10">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-semibold">{t('differentials.title')}</h2>
            <ul className="mt-8 flex flex-col gap-3">
              {differentialItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="text-green-600 dark:text-green-400">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-black/10 px-4 py-16 text-center dark:border-white/10">
          <h2 className="text-2xl font-semibold">{t('ctaFinal.title')}</h2>
          <Link
            href="/login"
            className="mt-6 inline-block rounded bg-foreground px-6 py-3 font-medium text-background"
          >
            {t('ctaFinal.cta')}
          </Link>
        </section>

        <footer className="border-t border-black/10 px-4 py-8 text-center text-sm text-foreground/60 dark:border-white/10">
          RentFleet © {new Date().getFullYear()} — {t('footer.rights')}
        </footer>
      </div>
    </>
  );
}
