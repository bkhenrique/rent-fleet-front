'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { useFleetSocket } from '@/lib/use-fleet-socket';
import { useTenantSettings } from '@/lib/use-tenant-settings';
import { MAP_CENTER_BY_COUNTRY } from '@/lib/map-defaults';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { AlertsList } from '@/components/dashboard/alerts-list';
import { Reveal } from '@/components/reveal';
import type { Vehicle, VehicleWithAlerts } from '@/lib/types/vehicle';
import type { RentalContractWithAlert } from '@/lib/types/rental-contract';
import type { Customer } from '@/lib/types/customer';

const FleetMap = dynamic(() => import('@/components/dashboard/fleet-map').then((mod) => mod.FleetMap), {
  ssr: false,
});

const VEHICLE_ALERT_DAYS = 30;
const CONTRACT_ALERT_DAYS = 5;

function DashboardContent() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const apiClient = useApiClient();
  const { positions, connected } = useFleetSocket();
  const tenantSettings = useTenantSettings();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleAlerts, setVehicleAlerts] = useState<VehicleWithAlerts[]>([]);
  const [contractAlerts, setContractAlerts] = useState<RentalContractWithAlert[]>([]);
  const [customersById, setCustomersById] = useState<Record<string, Customer>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      apiClient<Vehicle[]>('/vehicles'),
      apiClient<VehicleWithAlerts[]>(`/vehicles/alerts?dias=${VEHICLE_ALERT_DAYS}`),
      apiClient<RentalContractWithAlert[]>(`/rental-contracts/alerts?dias=${CONTRACT_ALERT_DAYS}`),
    ])
      .then(([vehiclesRes, vehicleAlertsRes, contractAlertsRes]) => {
        setVehicles(vehiclesRes);
        setVehicleAlerts(vehicleAlertsRes);
        setContractAlerts(contractAlertsRes);
        setLoading(false);

        const customerIds = Array.from(new Set(contractAlertsRes.map((row) => row.contract.customerId)));
        void Promise.all(customerIds.map((id) => apiClient<Customer>(`/customers/${id}`)))
          .then((customers) => {
            setCustomersById(Object.fromEntries(customers.map((customer) => [customer.id, customer])));
          })
          // Nomes de cliente são um complemento do alerta, não o dado principal — se essa busca falhar,
          // a lista já degrada bem sozinha (mostra o customerId cru, ver alerts-list.tsx); só evita
          // que a rejeição fique sem handler nenhum.
          .catch(() => {});
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [apiClient]);

  const vehiclesById = Object.fromEntries(vehicles.map((vehicle) => [vehicle._id, vehicle]));
  const today = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-14 pb-12 sm:px-6">
      <Reveal>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="mt-2 text-sm text-foreground-dim capitalize">
          {tenantSettings ? `${tenantSettings.nome} · ` : ''}
          {today}
        </p>
      </Reveal>

      {error && <p className="text-sm text-danger">{t('loadError')}</p>}

      {loading && !error && <p className="text-sm text-foreground-dim">{t('loading')}</p>}

      {!loading && !error && (
        <div className="flex flex-col gap-6">
          <Reveal delay={80}>
            <OverviewCards
              vehicles={vehicles}
              vehicleAlertCount={vehicleAlerts.length}
              contractAlertCount={contractAlerts.length}
            />
          </Reveal>

          <Reveal delay={160} className="grid items-start gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <FleetMap
                key={tenantSettings?.pais ?? 'loading'}
                positions={positions}
                vehiclesById={vehiclesById}
                connected={connected}
                fallbackCenter={tenantSettings ? MAP_CENTER_BY_COUNTRY[tenantSettings.pais] : undefined}
              />
            </div>

            <AlertsList
              vehicleAlerts={vehicleAlerts}
              contractAlerts={contractAlerts}
              vehiclesById={vehiclesById}
              customersById={customersById}
            />
          </Reveal>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireRole roles={TENANT_ROLES}>
      <DashboardContent />
    </RequireRole>
  );
}
