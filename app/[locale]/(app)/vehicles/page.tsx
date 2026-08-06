'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { useAuthStore } from '@/stores/auth-store';
import { VehicleThumbnail } from '@/components/vehicles/vehicle-thumbnail';
import { SharePortfolioModal } from '@/components/vehicles/share-portfolio-modal';
import { STATUS_COLORS } from '@/lib/vehicle-status';
import type { Vehicle, VehicleStatus } from '@/lib/types/vehicle';

const STATUS_FILTERS: Array<VehicleStatus | 'todos'> = ['todos', 'disponivel', 'alugado', 'manutencao', 'inativo'];

function VehiclesList() {
  const t = useTranslations('vehicles');
  const apiClient = useApiClient();
  const isTenantAdmin = useAuthStore((state) => state.user?.role === 'tenant_admin');

  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [status, setStatus] = useState<VehicleStatus | 'todos'>('todos');
  const [error, setError] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    const query = status === 'todos' ? '' : `?status=${status}`;
    apiClient<Vehicle[]>(`/vehicles${query}`)
      .then(setVehicles)
      .catch(() => setError(true));
  }, [apiClient, status]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <div className="flex gap-2">
          {isTenantAdmin && (
            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="rounded border border-black/15 px-4 py-2 text-sm font-medium hover:bg-foreground/5 dark:border-white/25"
            >
              {t('sharePortfolio')}
            </button>
          )}
          <Link href="/vehicles/new" className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
            {t('newVehicle')}
          </Link>
        </div>
      </div>

      {shareModalOpen && <SharePortfolioModal onClose={() => setShareModalOpen(false)} />}

      <div className="mb-4 flex gap-2">
        {STATUS_FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatus(option)}
            className={`rounded px-3 py-1 text-sm font-medium ${
              status === option ? 'bg-foreground text-background' : 'text-foreground/70 hover:bg-foreground/10'
            }`}
          >
            {t(`statusFilter.${option}`)}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{t('loadError')}</p>}
      {vehicles && vehicles.length === 0 && <p className="text-sm text-foreground/60">{t('empty')}</p>}

      {vehicles && vehicles.length > 0 && (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/15">
              <th className="py-2 pr-4 font-medium">{t('table.foto')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.placa')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.marcaModelo')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.ano')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.status')}</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle._id} className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-4">
                  <VehicleThumbnail fotos={vehicle.fotos} alt={`${vehicle.marca} ${vehicle.modelo}`} />
                </td>
                <td className="py-2 pr-4">
                  <Link href={`/vehicles/${vehicle._id}`} className="underline">
                    {vehicle.placa}
                  </Link>
                </td>
                <td className="py-2 pr-4">
                  {vehicle.marca} {vehicle.modelo}
                </td>
                <td className="py-2 pr-4">{vehicle.ano}</td>
                <td className={`py-2 pr-4 font-medium ${STATUS_COLORS[vehicle.status]}`}>
                  {t(`status.${vehicle.status}`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <RequireRole roles={TENANT_ROLES}>
      <VehiclesList />
    </RequireRole>
  );
}
