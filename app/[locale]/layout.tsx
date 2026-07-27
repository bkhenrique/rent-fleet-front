import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from 'next/font/google';
import { routing, type AppLocale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ServiceWorkerRegister } from '@/components/service-worker-register';
import '../globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'app' });
  return { title: t('name') };
}

/**
 * `app/[locale]/layout.tsx` É o root layout (define <html>/<body>) — não existe `app/layout.tsx`
 * separado. Padrão recomendado pelo next-intl pro App Router.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: requestedLocale } = await params;
  if (!hasLocale(routing.locales, requestedLocale)) {
    notFound();
  }
  const locale = requestedLocale as AppLocale;

  // habilita otimizações estáticas do next-intl pra este locale
  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'nav' });

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <ServiceWorkerRegister />
          <header className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
            <span className="font-semibold">RentFleet</span>
            <div className="flex items-center gap-4">
              <LocaleSwitcher />
              <Link
                href="/login"
                className="text-sm text-foreground/60 underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {t('login')}
              </Link>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
