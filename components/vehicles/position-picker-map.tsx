'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

interface PositionPickerMapProps {
  initialCenter: [number, number];
  value: [number, number] | null;
  onChange: (position: [number, number]) => void;
}

/**
 * Ícone próprio em SVG inline em vez do PNG default do Leaflet — o caminho do asset default
 * (`marker-icon.png` dentro de `node_modules/leaflet`) não resolve de forma confiável com o
 * bundler do Next/Turbopack, então evitamos o problema inteiro não dependendo de imagem nenhuma.
 */
const pickerIcon = L.divIcon({
  html: '<div style="width:18px;height:18px;border-radius:50% 50% 50% 0;background:#4f46e5;border:2px solid white;transform:rotate(-45deg);box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>',
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 18],
});

function ClickHandler({ onChange }: { onChange: (position: [number, number]) => void }) {
  useMapEvents({
    click(event) {
      onChange([event.latlng.lat, event.latlng.lng]);
    },
  });
  return null;
}

/** Mapa clicável pra escolher uma posição — clique define o marcador, arrastar reajusta fino. */
export function PositionPickerMap({ initialCenter, value, onChange }: PositionPickerMapProps) {
  return (
    <MapContainer
      center={value ?? initialCenter}
      zoom={value ? 13 : 4}
      style={{ height: '260px', width: '100%' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={onChange} />
      {value && (
        <Marker
          position={value}
          icon={pickerIcon}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const position = (event.target as L.Marker).getLatLng();
              onChange([position.lat, position.lng]);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
