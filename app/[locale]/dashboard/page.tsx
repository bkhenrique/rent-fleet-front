'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { useFleetSocket } from '@/lib/use-fleet-socket';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { AlertsList } from '@/components/dashboard/alerts-list';
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
  const apiClient = useApiClient();
  const { positions, connected } = useFleetSocket();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleAlerts, setVehicleAlerts] = useState<VehicleWithAlerts[]>([]);
  const [contractAlerts, setContractAlerts] = useState<RentalContractWithAlert[]>([]);
  const [customersById, setCustomersById] = useState<Record<string, Customer>>({});
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

        const customerIds = Array.from(new Set(contractAlertsRes.map((row) => row.contract.customerId)));
        void Promise.all(customerIds.map((id) => apiClient<Customer>(`/customers/${id}`))).then((customers) => {
          setCustomersById(Object.fromEntries(customers.map((customer) => [customer.id, customer])));
        });
      })
      .catch(() => setError(true));
  }, [apiClient]);

  const vehiclesById = Object.fromEntries(vehicles.map((vehicle) => [vehicle._id, vehicle]));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <div className="flex gap-2">
          <Link href="/vehicles" className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background">
            {t('vehiclesLink')}
          </Link>
          <Link
            href="/customers"
            className="rounded border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/20"
          >
            {t('customersLink')}
          </Link>
          <Link
            href="/rental-contracts"
            className="rounded border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/20"
          >
            {t('contractsLink')}
          </Link>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{t('loadError')}</p>}

      <OverviewCards
        vehicles={vehicles}
        vehicleAlertCount={vehicleAlerts.length}
        contractAlertCount={contractAlerts.length}
      />

      <FleetMap positions={positions} vehiclesById={vehiclesById} connected={connected} />

      <AlertsList
        vehicleAlerts={vehicleAlerts}
        contractAlerts={contractAlerts}
        vehiclesById={vehiclesById}
        customersById={customersById}
      />
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
