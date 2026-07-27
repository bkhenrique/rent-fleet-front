'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import type { CreateVehiclePayload, Vehicle } from '@/lib/types/vehicle';

const CURRENT_YEAR = new Date().getFullYear();

function NewVehicleForm() {
  const t = useTranslations('vehicles');
  const router = useRouter();
  const apiClient = useApiClient();

  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState(CURRENT_YEAR);
  const [cor, setCor] = useState('');
  const [seguroValidade, setSeguroValidade] = useState('');
  const [itvValidade, setItvValidade] = useState('');
  const [licenciamentoValidade, setLicenciamentoValidade] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: CreateVehiclePayload = {
      placa,
      marca,
      modelo,
      ano,
      cor: cor || undefined,
      documentos: {
        seguro: seguroValidade ? { validade: seguroValidade } : undefined,
        itv: itvValidade ? { validade: itvValidade } : undefined,
        licenciamento: licenciamentoValidade ? { validade: licenciamentoValidade } : undefined,
      },
    };

    try {
      const vehicle = await apiClient<Vehicle>('/vehicles', { method: 'POST', body: JSON.stringify(payload) });
      router.push(`/vehicles/${vehicle._id}`);
    } catch {
      setError(t('form.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold">{t('newVehicle')}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <span className="text-sm font-medium">{t('form.ano')}</span>
          <input
            type="number"
            required
            min={1950}
            max={CURRENT_YEAR + 1}
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
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

        <fieldset className="flex flex-col gap-4 rounded border border-black/10 p-4 dark:border-white/15">
          <legend className="px-1 text-sm font-medium">{t('form.documentosSectionTitle')}</legend>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.seguroValidade')}</span>
            <input
              type="date"
              value={seguroValidade}
              onChange={(e) => setSeguroValidade(e.target.value)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.itvValidade')}</span>
            <input
              type="date"
              value={itvValidade}
              onChange={(e) => setItvValidade(e.target.value)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.licenciamentoValidade')}</span>
            <input
              type="date"
              value={licenciamentoValidade}
              onChange={(e) => setLicenciamentoValidade(e.target.value)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            />
          </label>
        </fieldset>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-foreground px-4 py-2 font-medium text-background disabled:opacity-60"
          >
            {isSubmitting ? t('form.saving') : t('form.create')}
          </button>
          <button type="button" onClick={() => router.push('/vehicles')} className="rounded px-4 py-2 text-sm underline">
            {t('form.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewVehiclePage() {
  return (
    <RequireRole roles={TENANT_ROLES}>
      <NewVehicleForm />
    </RequireRole>
  );
}
