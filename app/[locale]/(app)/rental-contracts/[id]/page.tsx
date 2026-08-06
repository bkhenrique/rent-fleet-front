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
import { DigitalSignatureSection } from '@/components/rental-contracts/digital-signature-section';
import { ASSINATURA_COLORS, CONTRACT_STATUS_COLORS } from '@/lib/rental-contract-status';
import type { FuelLevel, RentalContract } from '@/lib/types/rental-contract';

const FUEL_LEVEL_OPTIONS: FuelLevel[] = ['cheio', 'tres_quartos', 'metade', 'um_quarto', 'reserva'];

function RentalContractDetail({ id }: { id: string }) {
  const t = useTranslations('rentalContracts');
  const locale = useLocale();
  const apiClient = useApiClient();
  const tenantSettings = useTenantSettings();

  const [contract, setContract] = useState<RentalContract | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [vistoriaEntregaObs, setVistoriaEntregaObs] = useState('');
  const [entregaKm, setEntregaKm] = useState('');
  const [entregaCombustivel, setEntregaCombustivel] = useState<FuelLevel | ''>('');
  const [savingVistoriaEntrega, setSavingVistoriaEntrega] = useState(false);

  const [devolucaoObs, setDevolucaoObs] = useState('');
  const [devolucaoKm, setDevolucaoKm] = useState('');
  const [devolucaoCombustivel, setDevolucaoCombustivel] = useState<FuelLevel | ''>('');
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
        body: JSON.stringify({
          observacoes: vistoriaEntregaObs,
          quilometragem: entregaKm ? Number(entregaKm) : undefined,
          combustivel: entregaCombustivel || undefined,
        }),
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
        body: JSON.stringify({
          observacoes: devolucaoObs || undefined,
          quilometragem: devolucaoKm ? Number(devolucaoKm) : undefined,
          combustivel: devolucaoCombustivel || undefined,
        }),
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
        <p className="text-sm text-danger">{t('loadError')}</p>
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
        <dd className={`font-medium ${CONTRACT_STATUS_COLORS[contract.status]}`}>{t(`status.${contract.status}`)}</dd>
        <dt className="font-medium">{t('table.assinatura')}</dt>
        <dd className={ASSINATURA_COLORS[contract.assinaturaDigital.status]}>
          {t(`detail.assinaturaDigital.statusLabel.${contract.assinaturaDigital.status}`)}
        </dd>
        {contract.dataDevolucaoReal && (
          <>
            <dt className="font-medium">{t('detail.dataDevolucaoReal')}</dt>
            <dd>{new Date(contract.dataDevolucaoReal).toLocaleDateString(locale)}</dd>
          </>
        )}
        <dt className="font-medium">{t('detail.localRetirada')}</dt>
        <dd>{contract.localRetirada ?? '—'}</dd>
        <dt className="font-medium">{t('detail.localDevolucao')}</dt>
        <dd>{contract.localDevolucao ?? '—'}</dd>
        <dt className="font-medium">{t('detail.franquiaKm')}</dt>
        <dd>{contract.franquiaKm !== null ? `${contract.franquiaKm} km` : t('detail.ilimitada')}</dd>
        <dt className="font-medium">{t('detail.caucao')}</dt>
        <dd>
          {contract.caucao !== null && tenantSettings
            ? formatCurrency(contract.caucao, tenantSettings.moeda)
            : (contract.caucao ?? t('detail.naoExigida'))}
        </dd>
      </dl>

      {contract.condutoresAdicionais.length > 0 && (
        <div className="rounded border border-border p-4">
          <h2 className="mb-2 text-sm font-semibold">{t('detail.condutoresTitle')}</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {contract.condutoresAdicionais.map((condutor, index) => (
              <li key={index}>
                {condutor.nome} — {condutor.documento}
                {condutor.cnh ? ` — CNH: ${condutor.cnh}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {contract.contratoPdfUrl && (
        <a
          href={contract.contratoPdfUrl}
          target="_blank"
          rel="noreferrer"
          className="self-start rounded border border-border px-4 py-2 text-sm font-medium"
        >
          {t('detail.openPdf')}
        </a>
      )}

      <DigitalSignatureSection
        contractId={contract.id}
        assinaturaDigital={contract.assinaturaDigital}
        contratoAssinadoFotoUrls={contract.contratoAssinadoFotoUrls}
        onUpdated={loadContract}
      />

      <div className="rounded border border-border p-4">
        <h2 className="mb-3 text-sm font-semibold">{t('detail.assinaturaTitle')}</h2>
        <AttachmentUpload
          contractId={contract.id}
          purpose="assinatura"
          fotosUrls={contract.contratoAssinadoFotoUrls}
          onUploaded={loadContract}
        />
      </div>

      <div className="rounded border border-border p-4">
        <h2 className="mb-3 text-sm font-semibold">{t('detail.vistoriaEntregaTitle')}</h2>
        <AttachmentUpload
          contractId={contract.id}
          purpose="vistoria_entrega"
          fotosUrls={contract.vistoriaEntrega.fotosUrls}
          onUploaded={loadContract}
        />
        {(contract.vistoriaEntrega.quilometragem !== null || contract.vistoriaEntrega.combustivel !== null) && (
          <p className="mt-2 text-sm text-foreground-dim">
            {contract.vistoriaEntrega.quilometragem !== null && `${contract.vistoriaEntrega.quilometragem} km`}
            {contract.vistoriaEntrega.combustivel !== null &&
              ` — ${t(`detail.fuelLevel.${contract.vistoriaEntrega.combustivel}`)}`}
          </p>
        )}
        <form onSubmit={handleSaveVistoriaEntrega} className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-medium">{t('detail.observacoes')}</span>
            <input
              value={vistoriaEntregaObs}
              onChange={(e) => setVistoriaEntregaObs(e.target.value)}
              className="rounded border border-border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium">{t('detail.quilometragem')}</span>
            <input
              type="number"
              min={0}
              value={entregaKm}
              onChange={(e) => setEntregaKm(e.target.value)}
              className="w-28 rounded border border-border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium">{t('detail.combustivel')}</span>
            <select
              value={entregaCombustivel}
              onChange={(e) => setEntregaCombustivel(e.target.value as FuelLevel | '')}
              className="rounded border border-border px-2 py-1.5 text-sm"
            >
              <option value="">{t('detail.naoInformado')}</option>
              {FUEL_LEVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(`detail.fuelLevel.${option}`)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={savingVistoriaEntrega}
            className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground disabled:opacity-60"
          >
            {savingVistoriaEntrega ? t('detail.saving') : t('detail.save')}
          </button>
        </form>
      </div>

      <div className="rounded border border-border p-4">
        <h2 className="mb-3 text-sm font-semibold">{t('detail.vistoriaDevolucaoTitle')}</h2>
        <AttachmentUpload
          contractId={contract.id}
          purpose="vistoria_devolucao"
          fotosUrls={contract.vistoriaDevolucao.fotosUrls}
          onUploaded={loadContract}
        />
        {contract.vistoriaDevolucao.observacoes && (
          <p className="mt-2 text-sm text-foreground-dim">{contract.vistoriaDevolucao.observacoes}</p>
        )}
        {(contract.vistoriaDevolucao.quilometragem !== null || contract.vistoriaDevolucao.combustivel !== null) && (
          <p className="mt-1 text-sm text-foreground-dim">
            {contract.vistoriaDevolucao.quilometragem !== null && `${contract.vistoriaDevolucao.quilometragem} km`}
            {contract.vistoriaDevolucao.combustivel !== null &&
              ` — ${t(`detail.fuelLevel.${contract.vistoriaDevolucao.combustivel}`)}`}
          </p>
        )}

        {isActive && (
          <form onSubmit={handleReturn} className="mt-3 flex flex-wrap items-end gap-3">
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-medium">{t('detail.observacoes')}</span>
              <input
                value={devolucaoObs}
                onChange={(e) => setDevolucaoObs(e.target.value)}
                className="rounded border border-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium">{t('detail.quilometragem')}</span>
              <input
                type="number"
                min={0}
                value={devolucaoKm}
                onChange={(e) => setDevolucaoKm(e.target.value)}
                className="w-28 rounded border border-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium">{t('detail.combustivel')}</span>
              <select
                value={devolucaoCombustivel}
                onChange={(e) => setDevolucaoCombustivel(e.target.value as FuelLevel | '')}
                className="rounded border border-border px-2 py-1.5 text-sm"
              >
                <option value="">{t('detail.naoInformado')}</option>
                {FUEL_LEVEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {t(`detail.fuelLevel.${option}`)}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={returning}
              className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground disabled:opacity-60"
            >
              {returning ? t('detail.returning') : t('detail.returnVehicle')}
            </button>
          </form>
        )}
      </div>

      {actionError && <p className="text-sm text-danger">{actionError}</p>}
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
