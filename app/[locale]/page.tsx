import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { AuthRedirect } from '@/components/auth-redirect';
import { Reveal } from '@/components/reveal';
import { LeadForm } from '@/components/lead-form';
import {
  ClockAlertIcon,
  ContractIcon,
  DashboardIcon,
  DeviceIcon,
  DocumentAlertIcon,
  FleetMapIllustration,
  FrustrationIllustration,
  GlobeIcon,
  HeroIllustration,
  MapOffIcon,
  ShieldIcon,
  TrackingIcon,
  VehicleIcon,
} from '@/components/landing-icons';

const FEATURES = [
  { key: 'vehicles', Icon: VehicleIcon, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  { key: 'tracking', Icon: TrackingIcon, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { key: 'contracts', Icon: ContractIcon, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { key: 'dashboard', Icon: DashboardIcon, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
] as const;

const DIFFERENTIALS = [
  { key: 'languages', Icon: GlobeIcon },
  { key: 'pwa', Icon: DeviceIcon },
  { key: 'isolation', Icon: ShieldIcon },
] as const;

const PROBLEM_ICONS = [DocumentAlertIcon, ClockAlertIcon, MapOffIcon] as const;

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
 * `/` é a landing pública do RentFleet: Server Component sempre renderizado (bom pra SEO/first
 * paint). Quem já está logado é tirado dela por `<AuthRedirect />` — o login em si fica discreto,
 * só um link no header (`app/[locale]/layout.tsx`) e um botão fantasma no fim da página, nunca um
 * CTA gigante repetido. Ver LANDING.md.
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

      <div className="flex flex-col overflow-hidden">
        <section className="relative">
          <div
            aria-hidden
            className="bg-dot-grid absolute inset-0 -z-20 text-foreground/5"
          />
          <div
            aria-hidden
            className="animate-drift absolute -top-40 left-1/2 -z-10 h-128 w-lg -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:py-28 lg:grid-cols-2 lg:py-32">
            <div className="flex flex-col items-start gap-6 text-left">
              <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                {t('hero.badge')}
              </span>
              <h1 className="text-4xl leading-tight font-bold sm:text-5xl">{t('hero.title')}</h1>
              <p className="max-w-lg text-lg text-foreground/70">{t('hero.subtitle')}</p>
              <a
                href="#features"
                className="group inline-flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-accent"
              >
                {t('hero.scrollCta')}
                <span aria-hidden className="transition-transform group-hover:translate-y-0.5">
                  ↓
                </span>
              </a>
            </div>

            <Reveal className="transition-transform duration-500 hover:-rotate-1 hover:scale-[1.02]">
              <HeroIllustration />
            </Reveal>
          </div>
        </section>

        <section className="border-t border-black/10 px-4 py-20 dark:border-white/15">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
            <Reveal className="order-2 lg:order-1">
              <FrustrationIllustration />
            </Reveal>
            <Reveal delay={100} className="order-1 lg:order-2">
              <h2 className="text-2xl font-semibold sm:text-3xl">{t('problem.title')}</h2>
              <ul className="mt-8 flex flex-col gap-3">
                {problemItems.map((item, index) => {
                  const Icon = PROBLEM_ICONS[index];
                  return (
                    <li
                      key={item}
                      className="flex items-center gap-3 rounded-lg bg-black/3 p-4 transition-colors dark:bg-white/5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                        <Icon />
                      </span>
                      <span>{item}</span>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-black/10 px-4 py-20 dark:border-white/15">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
            <Reveal>
              <FleetMapIllustration liveLabel={t('hero.mapLive')} />
            </Reveal>
            <Reveal delay={100} className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold sm:text-3xl">{t('showcase.title')}</h2>
              <p className="text-foreground/70">{t('showcase.subtitle')}</p>
            </Reveal>
          </div>
        </section>

        <section id="features" className="border-t border-black/10 px-4 py-20 dark:border-white/15">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="text-center text-2xl font-semibold sm:text-3xl">{t('features.title')}</h2>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ key, Icon, color }, index) => (
                <Reveal key={key} delay={index * 80}>
                  <div className="group flex h-full flex-col gap-3 rounded-xl border border-black/10 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 dark:border-white/15">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${color}`}>
                      <Icon />
                    </span>
                    <h3 className="font-semibold">{t(`features.${key}.title`)}</h3>
                    <p className="text-sm text-foreground/70">{t(`features.${key}.description`)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 px-4 py-20 dark:border-white/15">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="text-center text-2xl font-semibold sm:text-3xl">{t('differentials.title')}</h2>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {DIFFERENTIALS.map(({ key, Icon }, index) => (
                <Reveal key={key} delay={index * 80}>
                  <div className="flex h-full flex-col items-center gap-3 rounded-xl border border-black/10 p-6 text-center dark:border-white/15">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                      <Icon />
                    </span>
                    <p className="text-sm text-foreground/70">{differentialItems[index]}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-black/10 px-4 py-24 text-center dark:border-white/15">
          <div
            aria-hidden
            className="animate-drift absolute bottom-0 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
          />
          <Reveal className="mx-auto flex max-w-xl flex-col items-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">{t('ctaFinal.title')}</h2>
            <p className="mt-3 text-foreground/70">{t('ctaFinal.subtitle')}</p>
            <div className="mt-8 flex justify-center">
              <LeadForm />
            </div>
            <p className="mt-10 text-sm text-foreground/60">
              {t('ctaFinal.existingCustomer')}{' '}
              <Link href="/login" className="font-medium text-foreground/80 underline-offset-4 hover:text-accent hover:underline">
                {t('ctaFinal.cta')}
              </Link>
            </p>
          </Reveal>
        </section>

        <footer className="border-t border-black/10 px-4 py-8 text-center text-sm text-foreground/60 dark:border-white/15">
          RentFleet © {new Date().getFullYear()} — {t('footer.rights')}
        </footer>
      </div>
    </>
  );
}
