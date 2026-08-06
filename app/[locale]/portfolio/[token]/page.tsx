'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api-client';
import { formatCurrency } from '@/lib/currency';
import { STATUS_COLORS } from '@/lib/vehicle-status';
import { VehicleThumbnail } from '@/components/vehicles/vehicle-thumbnail';
import type { PublicPortfolioView } from '@/lib/types/portfolio';

type Step = 'loading' | 'notFound' | 'view';

function PortfolioPublicoPage({ token }: { token: string }) {
  const t = useTranslations('publicPortfolio');
  const tVehicles = useTranslations('vehicles');

  const [step, setStep] = useState<Step>('loading');
  const [view, setView] = useState<PublicPortfolioView | null>(null);

  useEffect(() => {
    apiFetch<PublicPortfolioView>(`/public/portfolio/${token}`)
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
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold">{view.locadora.nome}</h1>
        {(view.locadora.telefone || view.locadora.email) && (
          <p className="mt-1 flex flex-wrap gap-x-4 text-sm text-foreground/70">
            {view.locadora.telefone && <span>{view.locadora.telefone}</span>}
            {view.locadora.email && <span>{view.locadora.email}</span>}
          </p>
        )}
      </div>

      {view.veiculos.length === 0 && <p className="text-sm text-foreground/60">{t('empty')}</p>}

      {view.veiculos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {view.veiculos.map((veiculo) => (
            <div
              key={veiculo.id}
              className="flex flex-col gap-2 rounded-lg border border-black/10 p-3 dark:border-white/15"
            >
              <VehicleThumbnail
                fotos={veiculo.fotos}
                alt={`${veiculo.marca} ${veiculo.modelo}`}
                className="h-32 w-full sm:h-36"
              />

              <div>
                <p className="text-sm font-semibold">
                  {veiculo.marca} {veiculo.modelo}
                </p>
                <p className="text-xs text-foreground/60">
                  {t('vehicle.ano')}: {veiculo.ano}
                  {veiculo.cor ? ` · ${t('vehicle.cor')}: ${veiculo.cor}` : ''}
                </p>
              </div>

              {veiculo.status && (
                <span className={`w-fit text-xs font-medium ${STATUS_COLORS[veiculo.status]}`}>
                  {tVehicles(`status.${veiculo.status}`)}
                </span>
              )}

              {veiculo.valorDiariaReferencia != null && veiculo.moeda && (
                <p className="text-sm font-semibold">
                  {formatCurrency(veiculo.valorDiariaReferencia, veiculo.moeda)}
                  <span className="text-xs font-normal text-foreground/60"> {t('vehicle.priceSuffix')}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PortfolioPublicoPageWrapper({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <PortfolioPublicoPage token={token} />;
}
