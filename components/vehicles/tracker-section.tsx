'use client';

import { useEffect, useState, type FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import { useApiClient } from '@/lib/use-api-client';
import { useTenantSettings } from '@/lib/use-tenant-settings';
import { MAP_CENTER_BY_COUNTRY } from '@/lib/map-defaults';
import { ApiError } from '@/lib/api-client';
import type { CreateTrackerPayload, Tracker, TrackerType } from '@/lib/types/tracker';

const PositionPickerMap = dynamic(
  () => import('./position-picker-map').then((mod) => mod.PositionPickerMap),
  { ssr: false },
);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const TRACKER_TYPE_OPTIONS: TrackerType[] = ['traccar', 'owntracks_app', 'airtag_manual'];

interface TrackerSectionProps {
  vehicleId: string;
}

export function TrackerSection({ vehicleId }: TrackerSectionProps) {
  const t = useTranslations('vehicles');
  const locale = useLocale();
  const apiClient = useApiClient();
  const tenantSettings = useTenantSettings();

  const [tracker, setTracker] = useState<Tracker | null | undefined>(undefined);
  const [tipo, setTipo] = useState<TrackerType>('airtag_manual');
  const [uniqueId, setUniqueId] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [secret, setSecret] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [webhookUrlCopied, setWebhookUrlCopied] = useState(false);

  const [pickedPosition, setPickedPosition] = useState<[number, number] | null>(null);
  const [positionError, setPositionError] = useState<string | null>(null);
  const [savingPosition, setSavingPosition] = useState(false);

  useEffect(() => {
    apiClient<Tracker[]>('/trackers')
      .then((trackers) => {
        const found = trackers.find((item) => item.vehicleId === vehicleId) ?? null;
        setTracker(found);
        if (found?.ultimaPosicao) {
          setPickedPosition([found.ultimaPosicao.lat, found.ultimaPosicao.lng]);
        }
      })
      .catch(() => setTracker(null));
  }, [apiClient, vehicleId]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setCreateError(null);
    setCreating(true);

    const payload: CreateTrackerPayload = {
      vehicleId,
      tipo,
      uniqueId: tipo === 'traccar' ? uniqueId : undefined,
    };

    try {
      const created = await apiClient<Tracker>('/trackers', { method: 'POST', body: JSON.stringify(payload) });
      setTracker(created);
      setSecret(created.webhookSecret ?? null);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : t('tracker.genericError'));
    } finally {
      setCreating(false);
    }
  }

  async function handleReveal() {
    if (!tracker) return;
    setRevealing(true);
    try {
      const result = await apiClient<{ webhookSecret: string }>(`/trackers/${tracker._id}/reveal-secret`);
      setSecret(result.webhookSecret);
    } finally {
      setRevealing(false);
    }
  }

  async function handleUpdatePosition(event: FormEvent) {
    event.preventDefault();
    if (!tracker || !pickedPosition) return;
    setPositionError(null);
    setSavingPosition(true);
    try {
      const updated = await apiClient<Tracker>(`/trackers/${tracker._id}/manual-position`, {
        method: 'PATCH',
        body: JSON.stringify({ lat: pickedPosition[0], lng: pickedPosition[1] }),
      });
      setTracker(updated);
    } catch {
      setPositionError(t('tracker.genericError'));
    } finally {
      setSavingPosition(false);
    }
  }

  if (tracker === undefined) return null;

  const webhookUrl = tracker && secret ? `${API_URL}/trackers/${tracker._id}/position?secret=${secret}` : null;

  async function handleCopyWebhookUrl(value: string) {
    await navigator.clipboard.writeText(value);
    setWebhookUrlCopied(true);
    setTimeout(() => setWebhookUrlCopied(false), 2000);
  }

  return (
    <div className="rounded border border-black/10 p-4 dark:border-white/15">
      <h2 className="mb-3 text-sm font-semibold">{t('tracker.title')}</h2>

      {!tracker && (
        <div className="flex flex-col gap-3">
          <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium">{t('tracker.tipo')}</span>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TrackerType)}
                className="rounded border border-black/15 px-2 py-1 text-sm dark:border-white/25"
              >
                {TRACKER_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {t(`tracker.type.${option}`)}
                  </option>
                ))}
              </select>
            </label>

            {tipo === 'traccar' && (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium">{t('tracker.uniqueId')}</span>
                <input
                  required
                  value={uniqueId}
                  onChange={(e) => setUniqueId(e.target.value)}
                  className="rounded border border-black/15 px-2 py-1 text-sm dark:border-white/25"
                />
              </label>
            )}

            <button
              type="submit"
              disabled={creating}
              className="rounded bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-60"
            >
              {creating ? t('form.saving') : t('tracker.create')}
            </button>
          </form>
          <p className="max-w-md text-xs text-foreground/60">{t(`tracker.help.${tipo}`)}</p>
        </div>
      )}
      {createError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{createError}</p>}

      {tracker && (
        <div className="flex flex-col gap-3 text-sm">
          <p>
            <span className="font-medium">{t('tracker.tipo')}:</span> {t(`tracker.type.${tracker.tipo}`)}
            {tracker.uniqueId && ` (${tracker.uniqueId})`}
          </p>

          <p>
            <span className="font-medium">{t('tracker.lastPosition')}:</span>{' '}
            {tracker.ultimaPosicao
              ? `${tracker.ultimaPosicao.lat}, ${tracker.ultimaPosicao.lng} — ${new Date(
                  tracker.ultimaPosicao.timestamp,
                ).toLocaleString(locale)} (${t(`tracker.origem.${tracker.ultimaPosicao.origem}`)})`
              : t('tracker.noPosition')}
          </p>

          {tracker.tipo !== 'airtag_manual' && (
            <div>
              <p className="mb-2 max-w-md text-xs text-foreground/60">{t(`tracker.help.${tracker.tipo}`)}</p>
              {!webhookUrl && (
                <button
                  type="button"
                  onClick={handleReveal}
                  disabled={revealing}
                  className="rounded border border-black/15 px-3 py-1.5 text-sm font-medium disabled:opacity-60 dark:border-white/25"
                >
                  {revealing ? t('form.saving') : t('tracker.revealSecret')}
                </button>
              )}
              {webhookUrl && (
                <div className="flex items-start gap-2">
                  <p className="break-all rounded bg-foreground/5 p-2 text-xs">{webhookUrl}</p>
                  <button
                    type="button"
                    onClick={() => handleCopyWebhookUrl(webhookUrl)}
                    className="shrink-0 rounded border border-black/15 px-2 py-1 text-xs font-medium dark:border-white/25"
                  >
                    {webhookUrlCopied ? t('tracker.copied') : t('tracker.copy')}
                  </button>
                </div>
              )}
            </div>
          )}

          {tracker.tipo === 'airtag_manual' && (
            <form onSubmit={handleUpdatePosition} className="flex flex-col gap-2">
              <p className="text-xs text-foreground/60">{t('tracker.pickOnMap')}</p>
              <PositionPickerMap
                initialCenter={tenantSettings ? MAP_CENTER_BY_COUNTRY[tenantSettings.pais] : MAP_CENTER_BY_COUNTRY.BR}
                value={pickedPosition}
                onChange={setPickedPosition}
              />
              {pickedPosition && (
                <p className="text-xs text-foreground/60">
                  {t('tracker.lat')}: {pickedPosition[0].toFixed(6)} · {t('tracker.lng')}: {pickedPosition[1].toFixed(6)}
                </p>
              )}
              <button
                type="submit"
                disabled={savingPosition || !pickedPosition}
                className="self-start rounded bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-60"
              >
                {savingPosition ? t('form.saving') : t('tracker.updatePosition')}
              </button>
            </form>
          )}
          {positionError && <p className="text-sm text-red-600 dark:text-red-400">{positionError}</p>}
        </div>
      )}
    </div>
  );
}
