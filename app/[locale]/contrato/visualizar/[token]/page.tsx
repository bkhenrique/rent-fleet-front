'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { apiFetch } from '@/lib/api-client';
import { formatCurrency } from '@/lib/currency';
import type { PublicContractView } from '@/lib/types/rental-contract';

type Step = 'loading' | 'notFound' | 'view';

function PublicViewPage({ token }: { token: string }) {
  const t = useTranslations('publicContract.view');
  const locale = useLocale();

  const [step, setStep] = useState<Step>('loading');
  const [view, setView] = useState<PublicContractView | null>(null);

  useEffect(() => {
    apiFetch<PublicContractView>(`/public/contratos/visualizar/${token}`)
      .then((result) => {
        setView(result);
        setStep('view');
      })
      .catch(() => setStep('notFound'));
  }, [token]);

  if (step === 'loading') {
    return <p className="px-4 py-10 text-center text-sm text-foreground/60">{t('loading')}</p>;
  }

  if (step === 'notFound' || !view) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-lg font-semibold">{t('notFound.title')}</h1>
        <p className="mt-2 text-sm text-foreground/70">{t('notFound.message')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-lg font-semibold">{t('title')}</h1>
        <p className="mt-1 text-sm text-foreground/70">{t('subtitle')}</p>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 rounded border border-black/10 p-4 text-sm dark:border-white/15">
        <dt className="font-medium">{t('summary.cliente')}</dt>
        <dd>{view.clienteNome}</dd>
        <dt className="font-medium">{t('summary.veiculo')}</dt>
        <dd>
          {view.veiculo.placa} — {view.veiculo.marca} {view.veiculo.modelo}
        </dd>
        <dt className="font-medium">{t('summary.periodo')}</dt>
        <dd>
          {new Date(view.dataInicio).toLocaleDateString(locale)} — {new Date(view.dataFim).toLocaleDateString(locale)}
        </dd>
        <dt className="font-medium">{t('summary.valor')}</dt>
        <dd>{formatCurrency(view.valor, view.moeda)}</dd>
      </dl>

      <a
        href={view.pdfUrl}
        target="_blank"
        rel="noreferrer"
        className="self-start rounded bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
      >
        {t('download')}
      </a>
    </div>
  );
}

export default function PublicViewPageWrapper({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <PublicViewPage token={token} />;
}
