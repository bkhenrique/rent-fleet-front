'use client';

import { use, useEffect, useMemo, useState, type FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { useFleetSocket } from '@/lib/use-fleet-socket';
import { useTenantSettings } from '@/lib/use-tenant-settings';
import { MAP_CENTER_BY_COUNTRY } from '@/lib/map-defaults';
import { MaintenanceSection } from '@/components/vehicles/maintenance-section';
import { PhotosSection } from '@/components/vehicles/photos-section';
import { TrackerSection } from '@/components/vehicles/tracker-section';
import type { FuelType, TransmissionType, UpdateVehiclePayload, Vehicle, VehicleStatus } from '@/lib/types/vehicle';

const FleetMap = dynamic(() => import('@/components/dashboard/fleet-map').then((mod) => mod.FleetMap), {
  ssr: false,
});

const STATUS_OPTIONS: VehicleStatus[] = ['disponivel', 'alugado', 'manutencao', 'inativo'];
const TRANSMISSION_OPTIONS: TransmissionType[] = ['manual', 'automatico'];
const FUEL_OPTIONS: FuelType[] = ['gasolina', 'diesel', 'eletrico', 'hibrido', 'flex'];
const DOC_WARNING_DAYS = 30;

function daysRemaining(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diffMs = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function docClassName(dateStr: string | null): string {
  const dias = daysRemaining(dateStr);
  if (dias === null) return '';
  if (dias < 0) return 'text-red-700 dark:text-red-400 font-medium';
  if (dias <= DOC_WARNING_DAYS) return 'text-amber-700 dark:text-amber-400 font-medium';
  return '';
}

function VehicleDetail({ id }: { id: string }) {
  const t = useTranslations('vehicles');
  const locale = useLocale();
  const apiClient = useApiClient();
  const { positions, connected } = useFleetSocket();
  const tenantSettings = useTenantSettings();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState(0);
  const [cor, setCor] = useState('');
  const [chassi, setChassi] = useState('');
  const [cambio, setCambio] = useState<TransmissionType | ''>('');
  const [combustivel, setCombustivel] = useState<FuelType | ''>('');
  const [status, setStatus] = useState<VehicleStatus>('disponivel');
  const [seguroValidade, setSeguroValidade] = useState('');
  const [seguroApolice, setSeguroApolice] = useState('');
  const [seguroSeguradora, setSeguroSeguradora] = useState('');
  const [itvValidade, setItvValidade] = useState('');
  const [licenciamentoValidade, setLicenciamentoValidade] = useState('');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function applyVehicle(found: Vehicle) {
    setVehicle(found);
    setPlaca(found.placa);
    setMarca(found.marca);
    setModelo(found.modelo);
    setAno(found.ano);
    setCor(found.cor ?? '');
    setChassi(found.chassi ?? '');
    setCambio(found.cambio ?? '');
    setCombustivel(found.combustivel ?? '');
    setStatus(found.status);
    setSeguroValidade(found.documentos.seguro.validade?.slice(0, 10) ?? '');
    setSeguroApolice(found.documentos.seguro.apolice ?? '');
    setSeguroSeguradora(found.documentos.seguro.seguradora ?? '');
    setItvValidade(found.documentos.itv.validade?.slice(0, 10) ?? '');
    setLicenciamentoValidade(found.documentos.licenciamento.validade?.slice(0, 10) ?? '');
  }

  useEffect(() => {
    apiClient<Vehicle>(`/vehicles/${id}`)
      .then(applyVehicle)
      .catch(() => setLoadError(true));
  }, [apiClient, id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSaving(true);

    const payload: UpdateVehiclePayload = {
      placa,
      marca,
      modelo,
      ano,
      cor: cor || undefined,
      chassi: chassi || undefined,
      cambio: cambio || undefined,
      combustivel: combustivel || undefined,
      status,
      documentos: {
        seguro: {
          validade: seguroValidade || undefined,
          apolice: seguroApolice || undefined,
          seguradora: seguroSeguradora || undefined,
        },
        itv: itvValidade ? { validade: itvValidade } : undefined,
        licenciamento: licenciamentoValidade ? { validade: licenciamentoValidade } : undefined,
      },
    };

    try {
      const updated = await apiClient<Vehicle>(`/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      applyVehicle(updated);
    } catch {
      setFormError(t('form.genericError'));
    } finally {
      setSaving(false);
    }
  }

  const vehiclesById = useMemo(
    () => (vehicle ? { [vehicle._id]: vehicle } : {}),
    [vehicle],
  );
  const vehiclePositions = useMemo(
    () => positions.filter((position) => position.vehicleId === vehicle?._id),
    [positions, vehicle],
  );

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-red-600 dark:text-red-400">{t('loadError')}</p>
        <Link href="/vehicles" className="mt-4 inline-block text-sm underline">
          {t('backToList')}
        </Link>
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <div>
        <Link href="/vehicles" className="text-sm underline">
          {t('backToList')}
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{vehicle.placa}</h1>
        <Link href={`/rental-contracts?vehicleId=${vehicle._id}`} className="text-sm underline">
          {t('viewRentalHistory')}
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.placa')}</span>
            <input
              required
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.ano')}</span>
            <input
              type="number"
              required
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.marca')}</span>
            <input
              required
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.modelo')}</span>
            <input
              required
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.cor')}</span>
            <input
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.chassi')}</span>
            <input
              value={chassi}
              onChange={(e) => setChassi(e.target.value)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.cambio')}</span>
            <select
              value={cambio}
              onChange={(e) => setCambio(e.target.value as TransmissionType | '')}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            >
              <option value="">{t('form.naoInformado')}</option>
              {TRANSMISSION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(`cambioOptions.${option}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.combustivel')}</span>
            <select
              value={combustivel}
              onChange={(e) => setCombustivel(e.target.value as FuelType | '')}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            >
              <option value="">{t('form.naoInformado')}</option>
              {FUEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(`combustivelOptions.${option}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.status')}</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VehicleStatus)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(`status.${option}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="flex flex-col gap-4 rounded border border-black/10 p-4 dark:border-white/15">
          <legend className="px-1 text-sm font-medium">{t('form.documentosSectionTitle')}</legend>

          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className={`text-xs font-medium ${docClassName(vehicle.documentos.seguro.validade)}`}>
                {t('form.seguroValidade')}
              </span>
              <input
                type="date"
                value={seguroValidade}
                onChange={(e) => setSeguroValidade(e.target.value)}
                className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/25"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium">{t('form.seguroApolice')}</span>
              <input
                value={seguroApolice}
                onChange={(e) => setSeguroApolice(e.target.value)}
                className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/25"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium">{t('form.seguroSeguradora')}</span>
              <input
                value={seguroSeguradora}
                onChange={(e) => setSeguroSeguradora(e.target.value)}
                className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/25"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className={`text-xs font-medium ${docClassName(vehicle.documentos.itv.validade)}`}>
                {t('form.itvValidade')}
              </span>
              <input
                type="date"
                value={itvValidade}
                onChange={(e) => setItvValidade(e.target.value)}
                className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/25"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={`text-xs font-medium ${docClassName(vehicle.documentos.licenciamento.validade)}`}>
                {t('form.licenciamentoValidade')}
              </span>
              <input
                type="date"
                value={licenciamentoValidade}
                onChange={(e) => setLicenciamentoValidade(e.target.value)}
                className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/25"
              />
            </label>
          </div>
        </fieldset>

        {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

        <button
          type="submit"
          disabled={saving}
          className="self-start rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
        >
          {saving ? t('form.saving') : t('form.save')}
        </button>
      </form>

      <FleetMap
        key={tenantSettings?.pais ?? 'loading'}
        positions={vehiclePositions}
        vehiclesById={vehiclesById}
        connected={connected}
        fallbackCenter={tenantSettings ? MAP_CENTER_BY_COUNTRY[tenantSettings.pais] : undefined}
      />

      <TrackerSection vehicleId={vehicle._id} />

      <MaintenanceSection vehicleId={vehicle._id} manutencao={vehicle.manutencao} onUpdated={applyVehicle} />

      <PhotosSection
        vehicleId={vehicle._id}
        fotos={vehicle.fotos}
        onPhotoAdded={(url) => setVehicle((prev) => (prev ? { ...prev, fotos: [...prev.fotos, url] } : prev))}
      />

      <p className="text-xs text-foreground/40">
        {t('lastUpdated', { date: new Date(vehicle.updatedAt).toLocaleString(locale) })}
      </p>
    </div>
  );
}

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireRole roles={TENANT_ROLES}>
      <VehicleDetail id={id} />
    </RequireRole>
  );
}
