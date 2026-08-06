import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { routing, type AppLocale } from '@/i18n/routing';
import { ServiceWorkerRegister } from '@/components/service-worker-register';
import '../globals.css';

/**
 * Trio tipográfico da marca (antes carregado só dentro de `app/[locale]/page.tsx`, a landing) —
 * subiu pro layout raiz porque o rebrand estende a mesma identidade "asfalto" pro app autenticado
 * inteiro, não só a landing (ver PRODUCT.md, seção Brand Commitments). Substitui Geist/Geist Mono,
 * que nunca eram realmente usados (o `body` de `globals.css` sempre sobrescreveu com Arial).
 */
const inter = Inter({ variable: '--font-inter', subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['italic', 'normal'],
});
const jetbrainsMono = JetBrains_Mono({ variable: '--font-jetbrains-mono', subsets: ['latin'], weight: ['400', '500'] });

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

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <ServiceWorkerRegister />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
