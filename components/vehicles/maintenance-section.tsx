'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useApiClient } from '@/lib/use-api-client';
import { useTenantSettings } from '@/lib/use-tenant-settings';
import { formatCurrency } from '@/lib/currency';
import type { CreateMaintenancePayload, Vehicle } from '@/lib/types/vehicle';

interface MaintenanceSectionProps {
  vehicleId: string;
  manutencao: Vehicle['manutencao'];
  onUpdated: (vehicle: Vehicle) => void;
}

export function MaintenanceSection({ vehicleId, manutencao, onUpdated }: MaintenanceSectionProps) {
  const t = useTranslations('vehicles');
  const locale = useLocale();
  const apiClient = useApiClient();
  const tenantSettings = useTenantSettings();

  const [tipo, setTipo] = useState('');
  const [data, setData] = useState('');
  const [km, setKm] = useState('');
  const [custo, setCusto] = useState('');
  const [oficina, setOficina] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: CreateMaintenancePayload = {
      tipo,
      data,
      km: km ? Number(km) : undefined,
      custo: custo ? Number(custo) : undefined,
      oficina: oficina || undefined,
    };

    try {
      const updated = await apiClient<Vehicle>(`/vehicles/${vehicleId}/maintenance`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      onUpdated(updated);
      setTipo('');
      setData('');
      setKm('');
      setCusto('');
      setOficina('');
    } catch {
      setError(t('form.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded border border-black/10 p-4 dark:border-white/10">
      <h2 className="mb-3 text-sm font-semibold">{t('maintenance.title')}</h2>

      {manutencao.length === 0 && <p className="text-sm text-foreground/60">{t('maintenance.empty')}</p>}

      {manutencao.length > 0 && (
        <table className="mb-4 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10">
              <th className="py-1 pr-3 font-medium">{t('maintenance.tipo')}</th>
              <th className="py-1 pr-3 font-medium">{t('maintenance.data')}</th>
              <th className="py-1 pr-3 font-medium">{t('maintenance.km')}</th>
              <th className="py-1 pr-3 font-medium">{t('maintenance.custo')}</th>
              <th className="py-1 pr-3 font-medium">{t('maintenance.oficina')}</th>
            </tr>
          </thead>
          <tbody>
            {manutencao
              .slice()
              .reverse()
              .map((entry, index) => (
                <tr key={index} className="border-b border-black/5 dark:border-white/5">
                  <td className="py-1 pr-3">{entry.tipo}</td>
                  <td className="py-1 pr-3">{new Date(entry.data).toLocaleDateString(locale)}</td>
                  <td className="py-1 pr-3">{entry.km ?? '—'}</td>
                  <td className="py-1 pr-3">
                    {entry.custo !== null && tenantSettings ? formatCurrency(entry.custo, tenantSettings.moeda) : (entry.custo ?? '—')}
                  </td>
                  <td className="py-1 pr-3">{entry.oficina ?? '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium">{t('maintenance.tipo')}</span>
          <input
            required
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="rounded border border-black/15 px-2 py-1 text-sm dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium">{t('maintenance.data')}</span>
          <input
            type="date"
            required
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="rounded border border-black/15 px-2 py-1 text-sm dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium">{t('maintenance.km')}</span>
          <input
            type="number"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            className="w-24 rounded border border-black/15 px-2 py-1 text-sm dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium">{t('maintenance.custo')}</span>
          <input
            type="number"
            value={custo}
            onChange={(e) => setCusto(e.target.value)}
            className="w-24 rounded border border-black/15 px-2 py-1 text-sm dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium">{t('maintenance.oficina')}</span>
          <input
            value={oficina}
            onChange={(e) => setOficina(e.target.value)}
            className="rounded border border-black/15 px-2 py-1 text-sm dark:border-white/20"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-60"
        >
          {isSubmitting ? t('form.saving') : t('maintenance.add')}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
