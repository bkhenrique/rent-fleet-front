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

const ORIGIN_COLOR: Record<'tempo_real' | 'manual', string> = {
  tempo_real: '#16a34a',
  manual: '#f59e0b',
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
    <div className="rounded border border-black/10 dark:border-white/15">
      <div className="flex items-center justify-between px-4 py-2 text-sm">
        <h2 className="font-semibold">{t('title')}</h2>
        <span className={connected ? 'text-green-700 dark:text-green-400' : 'text-foreground/50'}>
          {connected ? t('live') : t('offline')}
        </span>
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
                    <Link href={`/vehicles/${vehicle._id}`} className="underline">
                      {t('viewDetails')}
                    </Link>
                  </>
                )}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      {withPosition.length === 0 && <p className="px-4 py-2 text-sm text-foreground/60">{t('empty')}</p>}
    </div>
  );
}
