'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { useDownloadReport } from '@/lib/use-download-report';
import { useAuthStore } from '@/stores/auth-store';
import { VehicleThumbnail } from '@/components/vehicles/vehicle-thumbnail';
import { SharePortfolioModal } from '@/components/vehicles/share-portfolio-modal';
import { STATUS_COLORS } from '@/lib/vehicle-status';
import type { Vehicle, VehicleStatus } from '@/lib/types/vehicle';

const STATUS_FILTERS: Array<VehicleStatus | 'todos'> = ['todos', 'disponivel', 'alugado', 'manutencao', 'inativo'];
const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

function VehiclesList() {
  const t = useTranslations('vehicles');
  const apiClient = useApiClient();
  const downloadReport = useDownloadReport();
  const isTenantAdmin = useAuthStore((state) => state.user?.role === 'tenant_admin');
  const [reportError, setReportError] = useState(false);

  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const initialStatus: VehicleStatus | 'todos' =
    statusParam && (STATUS_FILTERS as readonly string[]).includes(statusParam) ? (statusParam as VehicleStatus) : 'todos';

  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  // Inicializa a partir de `?status=` — permite deep-link direto pra um status filtrado (ex: os
  // cards do painel linkam pra cá com `?status=manutencao`), não só a navegação interna dos pills.
  const [status, setStatus] = useState<VehicleStatus | 'todos'>(initialStatus);
  const [error, setError] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    const query = status === 'todos' ? '' : `?status=${status}`;
    apiClient<Vehicle[]>(`/vehicles${query}`)
      .then(setVehicles)
      .catch(() => setError(true));
  }, [apiClient, status]);

  async function handleExportPdf() {
    setReportError(false);
    try {
      await downloadReport('/reports/frota', 'frota.pdf');
    } catch {
      setReportError(true);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl tracking-tight">{t('title')}</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            className={`rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-2 ${FOCUS_RING}`}
          >
            {t('exportPdf')}
          </button>
          {isTenantAdmin && (
            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className={`rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-2 ${FOCUS_RING}`}
            >
              {t('sharePortfolio')}
            </button>
          )}
          <Link
            href="/vehicles/new"
            className={`rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 ${FOCUS_RING}`}
          >
            {t('newVehicle')}
          </Link>
        </div>
      </div>

      {shareModalOpen && <SharePortfolioModal onClose={() => setShareModalOpen(false)} />}

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatus(option)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${FOCUS_RING} ${
              status === option ? 'bg-accent text-accent-foreground' : 'text-foreground-dim hover:bg-surface-2'
            }`}
          >
            {t(`statusFilter.${option}`)}
          </button>
        ))}
      </div>

      {reportError && <p className="text-sm text-danger">{t('exportError')}</p>}
      {error && <p className="text-sm text-danger">{t('loadError')}</p>}
      {vehicles && vehicles.length === 0 && <p className="text-sm text-foreground-dim">{t('empty')}</p>}

      {vehicles && vehicles.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 pl-4 font-medium text-foreground-dim">{t('table.foto')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.placa')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.marcaModelo')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.ano')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.status')}</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle._id} className="border-b border-border last:border-b-0 hover:bg-surface-2">
                  <td className="py-2.5 pr-4 pl-4">
                    <VehicleThumbnail fotos={vehicle.fotos} alt={`${vehicle.marca} ${vehicle.modelo}`} />
                  </td>
                  <td className="py-2.5 pr-4">
                    <Link
                      href={`/vehicles/${vehicle._id}`}
                      className={`rounded-xs font-mono font-medium tracking-wide hover:underline ${FOCUS_RING}`}
                    >
                      {vehicle.placa}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4">
                    {vehicle.marca} {vehicle.modelo}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-foreground-dim">{vehicle.ano}</td>
                  <td className={`py-2.5 pr-4 font-medium ${STATUS_COLORS[vehicle.status]}`}>
                    {t(`status.${vehicle.status}`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <RequireRole roles={TENANT_ROLES}>
      <Suspense fallback={null}>
        <VehiclesList />
      </Suspense>
    </RequireRole>
  );
}
