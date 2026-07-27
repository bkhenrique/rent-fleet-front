'use client';

import { use, useEffect, useState, type FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { useTenantSettings } from '@/lib/use-tenant-settings';
import { formatCurrency } from '@/lib/currency';
import { AttachmentUpload } from '@/components/rental-contracts/attachment-upload';
import type { RentalContract } from '@/lib/types/rental-contract';

function RentalContractDetail({ id }: { id: string }) {
  const t = useTranslations('rentalContracts');
  const locale = useLocale();
  const apiClient = useApiClient();
  const tenantSettings = useTenantSettings();

  const [contract, setContract] = useState<RentalContract | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [vistoriaEntregaObs, setVistoriaEntregaObs] = useState('');
  const [savingVistoriaEntrega, setSavingVistoriaEntrega] = useState(false);

  const [devolucaoObs, setDevolucaoObs] = useState('');
  const [returning, setReturning] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function loadContract() {
    apiClient<RentalContract>(`/rental-contracts/${id}`)
      .then((found) => {
        setContract(found);
        setVistoriaEntregaObs(found.vistoriaEntrega.observacoes ?? '');
      })
      .catch(() => setLoadError(true));
  }

  useEffect(loadContract, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSaveVistoriaEntrega(event: FormEvent) {
    event.preventDefault();
    setSavingVistoriaEntrega(true);
    setActionError(null);
    try {
      const updated = await apiClient<RentalContract>(`/rental-contracts/${id}/vistoria-entrega`, {
        method: 'PATCH',
        body: JSON.stringify({ observacoes: vistoriaEntregaObs }),
      });
      setContract(updated);
    } catch {
      setActionError(t('detail.genericError'));
    } finally {
      setSavingVistoriaEntrega(false);
    }
  }

  async function handleReturn(event: FormEvent) {
    event.preventDefault();
    setReturning(true);
    setActionError(null);
    try {
      const updated = await apiClient<RentalContract>(`/rental-contracts/${id}/devolver`, {
        method: 'POST',
        body: JSON.stringify({ observacoes: devolucaoObs || undefined }),
      });
      setContract(updated);
    } catch {
      setActionError(t('detail.genericError'));
    } finally {
      setReturning(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-red-600 dark:text-red-400">{t('loadError')}</p>
        <Link href="/rental-contracts" className="mt-4 inline-block text-sm underline">
          {t('backToList')}
        </Link>
      </div>
    );
  }

  if (!contract) return null;

  const isActive = contract.status === 'ativo';

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <div>
        <Link href="/rental-contracts" className="text-sm underline">
          {t('backToList')}
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{t('detail.title')}</h1>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="font-medium">{t('table.dataInicio')}</dt>
        <dd>{new Date(contract.dataInicio).toLocaleDateString(locale)}</dd>
        <dt className="font-medium">{t('table.dataFim')}</dt>
        <dd>{new Date(contract.dataFim).toLocaleDateString(locale)}</dd>
        <dt className="font-medium">{t('table.valor')}</dt>
        <dd>{tenantSettings ? formatCurrency(contract.valor, tenantSettings.moeda) : contract.valor}</dd>
        <dt className="font-medium">{t('table.status')}</dt>
        <dd>{t(`status.${contract.status}`)}</dd>
        {contract.dataDevolucaoReal && (
          <>
            <dt className="font-medium">{t('detail.dataDevolucaoReal')}</dt>
            <dd>{new Date(contract.dataDevolucaoReal).toLocaleDateString(locale)}</dd>
          </>
        )}
      </dl>

      {contract.contratoPdfUrl && (
        <a
          href={contract.contratoPdfUrl}
          target="_blank"
          rel="noreferrer"
          className="self-start rounded border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/20"
        >
          {t('detail.openPdf')}
        </a>
      )}

      <div className="rounded border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 text-sm font-semibold">{t('detail.assinaturaTitle')}</h2>
        <AttachmentUpload
          contractId={contract.id}
          purpose="assinatura"
          fotosUrls={contract.contratoAssinadoFotoUrls}
          onUploaded={loadContract}
        />
      </div>

      <div className="rounded border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 text-sm font-semibold">{t('detail.vistoriaEntregaTitle')}</h2>
        <AttachmentUpload
          contractId={contract.id}
          purpose="vistoria_entrega"
          fotosUrls={contract.vistoriaEntrega.fotosUrls}
          onUploaded={loadContract}
        />
        <form onSubmit={handleSaveVistoriaEntrega} className="mt-3 flex items-end gap-3">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-medium">{t('detail.observacoes')}</span>
            <input
              value={vistoriaEntregaObs}
              onChange={(e) => setVistoriaEntregaObs(e.target.value)}
              className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/20"
            />
          </label>
          <button
            type="submit"
            disabled={savingVistoriaEntrega}
            className="rounded bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-60"
          >
            {savingVistoriaEntrega ? t('detail.saving') : t('detail.save')}
          </button>
        </form>
      </div>

      <div className="rounded border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 text-sm font-semibold">{t('detail.vistoriaDevolucaoTitle')}</h2>
        <AttachmentUpload
          contractId={contract.id}
          purpose="vistoria_devolucao"
          fotosUrls={contract.vistoriaDevolucao.fotosUrls}
          onUploaded={loadContract}
        />
        {contract.vistoriaDevolucao.observacoes && (
          <p className="mt-2 text-sm text-foreground/70">{contract.vistoriaDevolucao.observacoes}</p>
        )}

        {isActive && (
          <form onSubmit={handleReturn} className="mt-3 flex items-end gap-3">
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-medium">{t('detail.observacoes')}</span>
              <input
                value={devolucaoObs}
                onChange={(e) => setDevolucaoObs(e.target.value)}
                className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/20"
              />
            </label>
            <button
              type="submit"
              disabled={returning}
              className="rounded bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-60"
            >
              {returning ? t('detail.returning') : t('detail.returnVehicle')}
            </button>
          </form>
        )}
      </div>

      {actionError && <p className="text-sm text-red-600 dark:text-red-400">{actionError}</p>}
    </div>
  );
}

export default function RentalContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireRole roles={TENANT_ROLES}>
      <RentalContractDetail id={id} />
    </RequireRole>
  );
}
