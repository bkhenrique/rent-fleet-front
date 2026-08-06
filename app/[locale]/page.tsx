import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LOCALES, type AppLocale } from '@/i18n/routing';
import { AuthRedirect } from '@/components/auth-redirect';
import { Reveal } from '@/components/reveal';
import { LeadForm } from '@/components/lead-form';
import { LandingLocaleSwitcher } from '@/components/landing-locale-switcher';
import { FleetMapPanel, type MapPin } from '@/components/landing-map-panel';
import { CountUp } from '@/components/count-up';
import { TiltCard } from '@/components/tilt-card';
import { CheckIcon, ContractIcon, DashboardIcon, LogoMarkIcon, TrackingIcon, VehicleIcon } from '@/components/landing-icons';
import './landing.css';

const FEATURES = [
  { key: 'vehicles', Icon: VehicleIcon },
  { key: 'tracking', Icon: TrackingIcon },
  { key: 'contracts', Icon: ContractIcon },
  { key: 'dashboard', Icon: DashboardIcon },
] as const;

const SMALL_PINS: MapPin[] = [
  { x: '22%', y: '30%', tone: 'success' },
  { x: '58%', y: '46%', tone: 'info' },
  { x: '40%', y: '72%', tone: 'success' },
  { x: '76%', y: '24%', tone: 'accent' },
];

const BIG_PIN_POS: Omit<MapPin, 'label'>[] = [
  { x: '20%', y: '24%', tone: 'success' },
  { x: '52%', y: '44%', tone: 'info' },
  { x: '30%', y: '70%', tone: 'success' },
  { x: '66%', y: '78%', tone: 'accent' },
  { x: '80%', y: '32%', tone: 'info' },
];

const STATUS_TONE_CLASS: Record<string, string> = { success: 'success', info: 'info', warn: 'warn' };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing' });
  const title = `${t('hero.titleLine1')} ${t('hero.titleLine2')}`;
  const description = t('hero.subtitle');

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...Object.fromEntries(LOCALES.map((loc) => [loc, `/${loc}`])),
        'x-default': '/pt',
      },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      siteName: 'RentFleet',
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * `/` é a landing pública do RentFleet — visual próprio ("asfalto", dark fixo), importado de um
 * mockup feito no claude.ai/design (`RentFleet Landing.dc.html`, ver LANDING.md). Fora do grupo de
 * rotas `(app)`, então não herda o `SiteHeader` das telas autenticadas — tem seu próprio header e
 * footer. Login continua discreto (link no header + linha no fim), o CTA principal é o formulário
 * de lead (`LeadForm` → `POST /leads`), não login.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);

  const t = await getTranslations('landing');
  const tNav = await getTranslations('nav');

  const rows = t.raw('mockup.rows') as { plate: string; model: string; status: string; tone: string }[];
  const pains = t.raw('cost.pains') as { n: string; title: string; body: string; fix: string }[];
  const trackers = t.raw('map.trackers') as { tag: string; label: string }[];
  const mapPinLabels = t.raw('map.pins') as { plate: string; time: string }[];
  const scaleItems = t.raw('scale.items') as { tag: string; body: string }[];

  const bigPins: MapPin[] = BIG_PIN_POS.map((pos, index) => ({
    ...pos,
    label: `${mapPinLabels[index].plate} · ${mapPinLabels[index].time}`,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RentFleet',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: t('hero.subtitle'),
    url: `${SITE_URL}/${locale}`,
    availableLanguage: LOCALES,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AuthRedirect />

      <div className="rf-landing" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backdropFilter: 'blur(14px)',
            background: 'rgba(8,9,11,.78)',
            borderBottom: '1px solid var(--hairline)',
          }}
        >
          <div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-3 sm:gap-7 sm:px-7">
            <div className="mr-auto flex items-center gap-2.5">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #FFB020, #FF8A1F)',
                  color: '#10120f',
                  boxShadow: '0 4px 14px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,.35)',
                }}
              >
                <LogoMarkIcon />
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' }}>RentFleet</span>
            </div>

            <nav className="dim hidden items-center gap-5 text-[13px] md:flex">
              <a href="#custo">{t('nav.custo')}</a>
              <a href="#mapa">{t('nav.mapa')}</a>
              <a href="#recursos">{t('nav.recursos')}</a>
            </nav>

            <LandingLocaleSwitcher />

            <div className="flex items-center gap-2.5">
              <Link href="/login" className="btn btn-ghost">
                {tNav('login')}
              </Link>
              <span className="hidden sm:inline-flex">
                <a
                  href="#contato"
                  className="btn btn-primary"
                  style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-fg)', boxShadow: '0 8px 24px var(--accent-glow)' }}
                >
                  {t('header.ctaPrimary')}
                </a>
              </span>
            </div>
          </div>
        </header>

        <section className="relative px-4 pt-24 pb-10 sm:px-7">
          <div
            aria-hidden
            className="grid-bg"
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.55,
              maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 20%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 20%, transparent 75%)',
              pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: -240,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 940,
              height: 540,
              background: 'radial-gradient(ellipse at center, var(--accent-glow), transparent 68%)',
              filter: 'blur(34px)',
              opacity: 0.6,
              pointerEvents: 'none',
            }}
          />

          <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            <span className="badge" style={{ padding: '5px 12px', fontSize: 12, background: 'var(--accent-soft)', borderColor: 'rgba(255,176,32,.28)', color: 'var(--accent-strong)' }}>
              <span className="dot" style={{ background: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-soft)' }} />
              {t('hero.badge')}
            </span>
            <h1 style={{ fontSize: 'clamp(40px, 6.4vw, 80px)', letterSpacing: '-0.04em', lineHeight: 1.02 }}>
              {t('hero.titleLine1')}
              <br />
              <span
                className="serif"
                style={{
                  fontStyle: 'italic',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(120deg, #FFF 10%, #FFC24D 55%, #FF8A1F 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {t('hero.titleLine2')}
              </span>
            </h1>
            <p className="dim max-w-xl" style={{ fontSize: 18, lineHeight: 1.55 }}>
              {t('hero.subtitle')}
            </p>
            <div className="mt-1 flex flex-wrap justify-center gap-3">
              <a
                href="#contato"
                className="btn btn-primary btn-lg"
                style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-fg)', boxShadow: '0 10px 30px var(--accent-glow)' }}
              >
                {t('hero.ctaPrimary')}
              </a>
              <a href="#recursos" className="btn btn-outline btn-lg">
                {t('hero.ctaSecondary')} ↓
              </a>
            </div>
            <div className="mono faint mt-2 flex flex-wrap justify-center gap-5" style={{ fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              <span>{t('hero.meta1')}</span>
              <span style={{ color: 'var(--border-strong)' }}>/</span>
              <span>{t('hero.meta2')}</span>
              <span style={{ color: 'var(--border-strong)' }}>/</span>
              <span>{t('hero.meta3')}</span>
            </div>
          </div>

          <TiltCard className="anim-rise relative mx-auto mt-14 max-w-5xl">
            <div className="surface" style={{ padding: 10, boxShadow: '0 40px 120px -34px var(--accent-glow), var(--shadow-lg)', overflow: 'hidden' }}>
              <div className="flex items-center gap-2" style={{ padding: '6px 8px 12px' }}>
                <span className="dot" style={{ background: '#ff5f57' }} />
                <span className="dot" style={{ background: '#febc2e' }} />
                <span className="dot" style={{ background: '#28c840' }} />
                <span className="mono faint" style={{ marginLeft: 10, fontSize: 11 }}>
                  {t('mockup.windowLabel')}
                </span>
              </div>

              <div className="grid gap-2.5 lg:grid-cols-[1.35fr_1fr]">
                <div style={{ background: 'var(--bg-2)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius)', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{t('mockup.fleetNow')}</span>
                    <span className="badge success">
                      <span className="dot success" />
                      {t('mockup.live')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                      <div className="mono" style={{ fontSize: 26, letterSpacing: '-0.03em', color: 'var(--success)' }}>
                        <CountUp value={Number(t('mockup.stat1Value'))} />
                      </div>
                      <div className="dim" style={{ fontSize: 11 }}>
                        {t('mockup.stat1Label')}
                      </div>
                    </div>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                      <div className="mono" style={{ fontSize: 26, letterSpacing: '-0.03em', color: 'var(--info)' }}>
                        <CountUp value={Number(t('mockup.stat2Value'))} />
                      </div>
                      <div className="dim" style={{ fontSize: 11 }}>
                        {t('mockup.stat2Label')}
                      </div>
                    </div>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                      <div className="mono" style={{ fontSize: 26, letterSpacing: '-0.03em', color: 'var(--accent)' }}>
                        <CountUp value={Number(t('mockup.stat3Value'))} />
                      </div>
                      <div className="dim" style={{ fontSize: 11 }}>
                        {t('mockup.stat3Label')}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {rows.map((row) => (
                      <div key={row.plate} className="flex items-center gap-3" style={{ padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                        <span className="mono" style={{ fontSize: 12, letterSpacing: '.02em', minWidth: 74 }}>
                          {row.plate}
                        </span>
                        <span className="dim" style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.model}
                        </span>
                        <span className={`badge ${STATUS_TONE_CLASS[row.tone]}`}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <FleetMapPanel pins={SMALL_PINS} caption={t('mockup.mapCaption')} />
              </div>
            </div>
          </TiltCard>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-7">
          <div className="grid gap-3 sm:h-75 sm:grid-cols-[1.6fr_1fr_1fr]">
            <Reveal className="relative h-48 overflow-hidden sm:h-auto" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <Image src="/gallery/carrospatio.jpeg" alt={t('gallery.caption')} fill sizes="(min-width: 640px) 45vw, 100vw" style={{ objectFit: 'cover' }} />
            </Reveal>
            <Reveal delay={80} className="relative h-40 overflow-hidden sm:h-auto" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <Image src="/gallery/chavenamao.jpg" alt={t('gallery.slot2')} fill sizes="(min-width: 640px) 22vw, 50vw" style={{ objectFit: 'cover' }} />
            </Reveal>
            <div className="grid grid-rows-2 gap-3">
              <Reveal delay={140} className="relative h-40 overflow-hidden sm:h-auto" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <Image src="/gallery/painelcarro.webp" alt={t('gallery.slot3')} fill sizes="(min-width: 640px) 22vw, 50vw" style={{ objectFit: 'cover' }} />
              </Reveal>
              <Reveal delay={200} className="relative h-40 overflow-hidden sm:h-auto" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <Image src="/gallery/carronaestrada.avif" alt={t('gallery.slot4')} fill sizes="(min-width: 640px) 22vw, 50vw" style={{ objectFit: 'cover' }} />
              </Reveal>
            </div>
          </div>
        </section>

        <section id="custo" className="mx-auto max-w-6xl px-4 py-20 sm:px-7 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
              <span className="eyebrow">{t('cost.eyebrow')}</span>
              <h2 className="max-w-sm">{t('cost.title')}</h2>
              <p className="dim max-w-sm" style={{ fontSize: 16, lineHeight: 1.6 }}>
                {t('cost.body')}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {pains.map((pain, index) => (
                <Reveal key={pain.n} delay={index * 80}>
                  <div
                    className="surface card-hover grid grid-cols-[40px_1fr] items-start gap-4"
                    style={{ padding: '24px 26px', borderLeft: '3px solid var(--accent)' }}
                  >
                    <span className="mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
                      {pain.n}
                    </span>
                    <div className="flex flex-col gap-2">
                      <span style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.015em' }}>{pain.title}</span>
                      <span className="dim" style={{ fontSize: 16, lineHeight: 1.55 }}>
                        {pain.body}
                      </span>
                      <span className="mt-1.5 flex items-center gap-1.5" style={{ fontSize: 15, fontWeight: 500, color: 'var(--success)' }}>
                        <CheckIcon />
                        {pain.fix}
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section
          id="mapa"
          className="px-4 py-22 sm:px-7"
          style={{ position: 'relative', borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', background: 'var(--bg-2)' }}
        >
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-14">
            <Reveal className="flex flex-col gap-4">
              <span className="badge" style={{ alignSelf: 'flex-start', background: 'rgba(34,211,238,.12)', borderColor: 'rgba(34,211,238,.28)', color: 'var(--info)' }}>
                <span className="dot" style={{ background: 'var(--info)', boxShadow: '0 0 0 3px rgba(34,211,238,.18)' }} />
                {t('map.badge')}
              </span>
              <h2>{t('map.title')}</h2>
              <p className="dim max-w-md" style={{ fontSize: 16, lineHeight: 1.65 }}>
                {t('map.body')}
              </p>
              <div className="mt-1 flex flex-col gap-2.5">
                {trackers.map((tracker) => (
                  <div key={tracker.tag} className="flex items-center gap-3" style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <span className="badge mono" style={{ minWidth: 66, justifyContent: 'center', background: 'rgba(34,211,238,.1)', borderColor: 'rgba(34,211,238,.25)', color: 'var(--info)' }}>
                      {tracker.tag}
                    </span>
                    <span className="dim" style={{ fontSize: 13 }}>
                      {tracker.label}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={100}>
              <FleetMapPanel pins={bigPins} size="large" />
            </Reveal>
          </div>
        </section>

        <section id="recursos" className="mx-auto max-w-6xl px-4 py-20 sm:px-7 sm:py-24">
          <div className="mb-10 flex max-w-xl flex-col gap-3">
            <span className="eyebrow">{t('features.eyebrow')}</span>
            <h2>{t('features.title')}</h2>
          </div>
          <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {FEATURES.map(({ key, Icon }, index) => (
              <Reveal key={key} delay={index * 80}>
                <div className="surface card-hover flex h-full flex-col gap-3" style={{ padding: '26px 24px', minHeight: 220 }}>
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      background: 'var(--accent-soft)',
                      border: '1px solid rgba(255,176,32,.28)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-strong)',
                    }}
                  >
                    <Icon />
                  </span>
                  <span className="mt-1" style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>
                    {t(`features.${key}.title`)}
                  </span>
                  <span className="dim" style={{ fontSize: 16, lineHeight: 1.6 }}>
                    {t(`features.${key}.body`)}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-7 sm:pb-24">
          <Reveal
            className="surface grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12"
            style={{ padding: 36, background: 'linear-gradient(160deg, var(--surface), var(--bg-2))' }}
          >
            <h2 className="max-w-xs">{t('scale.title')}</h2>
            <div className="grid gap-7" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
              {scaleItems.map((item) => (
                <div key={item.tag} className="flex flex-col gap-2" style={{ borderTop: '1px solid var(--accent)', paddingTop: 16 }}>
                  <span className="mono" style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent-strong)' }}>
                    {item.tag}
                  </span>
                  <span className="dim" style={{ fontSize: 16, lineHeight: 1.6 }}>
                    {item.body}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <section
          id="contato"
          className="px-4 pt-24 pb-26 sm:px-7"
          style={{ position: 'relative', borderTop: '1px solid var(--hairline)', overflow: 'hidden' }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 860,
              height: 420,
              background: 'radial-gradient(ellipse at center, var(--accent-glow), transparent 70%)',
              filter: 'blur(44px)',
              opacity: 0.55,
              pointerEvents: 'none',
            }}
          />
          <Reveal className="relative mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
            <h2 style={{ fontSize: 'clamp(32px, 4.6vw, 54px)', letterSpacing: '-0.035em' }}>{t('contact.title')}</h2>
            <p className="dim" style={{ fontSize: 16 }}>
              {t('contact.subtitle')}
            </p>
            <LeadForm />
            <span className="faint" style={{ fontSize: 13 }}>
              {t('contact.note')} {t('contact.existingCustomer')}{' '}
              <Link href="/login">{tNav('login')}</Link>
            </span>
          </Reveal>
        </section>

        <footer style={{ borderTop: '1px solid var(--hairline)', background: 'var(--bg-2)' }}>
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-7 sm:px-7">
            <div className="mr-auto flex items-center gap-2">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, #FFB020, #FF8A1F)',
                  color: '#10120f',
                }}
              >
                <LogoMarkIcon size={12} />
              </span>
              <span className="dim" style={{ fontSize: 13 }}>
                RentFleet © {new Date().getFullYear()} — {t('footer.rights')}
              </span>
            </div>
            <div className="faint flex gap-5" style={{ fontSize: 13 }}>
              <a href="#custo">{t('nav.custo')}</a>
              <a href="#mapa">{t('nav.mapa')}</a>
              <a href="#recursos">{t('nav.recursos')}</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
