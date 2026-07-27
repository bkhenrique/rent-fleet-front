'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { ApiError } from '@/lib/api-client';
import type { Vehicle } from '@/lib/types/vehicle';
import type { Customer } from '@/lib/types/customer';
import type { CreateRentalContractPayload, RentalContract } from '@/lib/types/rental-contract';

function NewRentalContractForm() {
  const t = useTranslations('rentalContracts');
  const router = useRouter();
  const apiClient = useApiClient();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [valor, setValor] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([apiClient<Vehicle[]>('/vehicles?status=disponivel'), apiClient<Customer[]>('/customers')]).then(
      ([vehiclesRes, customersRes]) => {
        setVehicles(vehiclesRes);
        setCustomers(customersRes);
        setVehicleId(vehiclesRes[0]?._id ?? '');
        setCustomerId(customersRes[0]?.id ?? '');
      },
    );
  }, [apiClient]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: CreateRentalContractPayload = {
      vehicleId,
      customerId,
      dataInicio,
      dataFim,
      valor: Number(valor),
    };

    try {
      const contract = await apiClient<RentalContract>('/rental-contracts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      router.push(`/rental-contracts/${contract.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('form.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold">{t('newContract')}</h1>

      {vehicles.length === 0 && <p className="mb-4 text-sm text-amber-700 dark:text-amber-400">{t('form.noVehicles')}</p>}
      {customers.length === 0 && <p className="mb-4 text-sm text-amber-700 dark:text-amber-400">{t('form.noCustomers')}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.vehicle')}</span>
          <select
            required
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
          >
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.placa} — {vehicle.marca} {vehicle.modelo}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.customer')}</span>
          <select
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.nome} — {customer.documento}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.dataInicio')}</span>
          <input
            type="date"
            required
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.dataFim')}</span>
          <input
            type="date"
            required
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.valor')}</span>
          <input
            type="number"
            min={0}
            step="0.01"
            required
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !vehicleId || !customerId}
            className="rounded bg-foreground px-4 py-2 font-medium text-background disabled:opacity-60"
          >
            {isSubmitting ? t('form.saving') : t('form.create')}
          </button>
          <button
            type="button"
            onClick={() => router.push('/rental-contracts')}
            className="rounded px-4 py-2 text-sm underline"
          >
            {t('form.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewRentalContractPage() {
  return (
    <RequireRole roles={TENANT_ROLES}>
      <NewRentalContractForm />
    </RequireRole>
  );
}
