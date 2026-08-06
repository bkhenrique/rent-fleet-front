'use client';

import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { TrackerPositionSummary } from '@/lib/types/tracker';
import { DEFAULT_MAP_CENTER } from '@/lib/map-defaults';

interface FleetMapProps {
  positions: TrackerPositionSummary[];
  vehiclesById: Record<string, { _id: string; placa: string; marca: string; modelo: string }>;
  connected: boolean;
  /** Centro exibido antes de qualquer posição real existir — default Brasil se omitido. */
  fallbackCenter?: [number, number];
}

/** Mesmos tons de `--success`/`--warning` (`app/globals.css`) — hex fixo porque o Leaflet aplica a
 * cor como atributo SVG, que não resolve `var(--token)` de forma confiável entre navegadores. Mantém
 * os dois em sincronia manualmente se os tokens mudarem. */
const ORIGIN_COLOR: Record<'tempo_real' | 'manual', string> = {
  tempo_real: '#15803d',
  manual: '#b45309',
};

export function FleetMap({ positions, vehiclesById, connected, fallbackCenter = DEFAULT_MAP_CENTER }: FleetMapProps) {
  const t = useTranslations('dashboard.map');

  const withPosition = positions.filter(
    (p): p is TrackerPositionSummary & { ultimaPosicao: NonNullable<TrackerPositionSummary['ultimaPosicao']> } =>
      p.ultimaPosicao !== null,
  );

  const center: [number, number] = withPosition[0]
    ? [withPosition[0].ultimaPosicao.lat, withPosition[0].ultimaPosicao.lng]
    : fallbackCenter;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold">{t('title')}</h2>
        <div className="flex items-center gap-4">
          {withPosition.length > 0 && (
            <div className="flex items-center gap-3 text-xs text-foreground-dim">
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ORIGIN_COLOR.tempo_real }} />
                {t('origem.tempo_real')}
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ORIGIN_COLOR.manual }} />
                {t('origem.manual')}
              </span>
            </div>
          )}
          <span
            className={`flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase ${connected ? 'text-success' : 'text-foreground-faint'}`}
          >
            {connected && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
            )}
            {connected ? t('live') : t('offline')}
          </span>
        </div>
      </div>
      <MapContainer center={center} zoom={withPosition.length > 0 ? 12 : 4} style={{ height: '420px', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withPosition.map((position) => {
          const vehicle = vehiclesById[position.vehicleId];
          return (
            <CircleMarker
              key={position.trackerId}
              center={[position.ultimaPosicao.lat, position.ultimaPosicao.lng]}
              radius={8}
              pathOptions={{ color: ORIGIN_COLOR[position.ultimaPosicao.origem], fillOpacity: 0.8 }}
            >
              <Popup>
                <span className="font-medium">
                  {vehicle ? `${vehicle.placa} — ${vehicle.marca} ${vehicle.modelo}` : position.vehicleId}
                </span>
                <br />
                {t(`origem.${position.ultimaPosicao.origem}`)}
                <br />
                {new Date(position.ultimaPosicao.timestamp).toLocaleString()}
                {vehicle && (
                  <>
                    <br />
                    <Link
                      href={`/vehicles/${vehicle._id}`}
                      className="rounded-xs underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {t('viewDetails')}
                    </Link>
                  </>
                )}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      {withPosition.length === 0 && <p className="px-5 py-3 text-sm text-foreground-dim">{t('empty')}</p>}
    </div>
  );
}
