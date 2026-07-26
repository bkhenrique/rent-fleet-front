export type PositionOrigin = 'tempo_real' | 'manual';

export interface TrackerPosition {
  lat: number;
  lng: number;
  timestamp: string;
  origem: PositionOrigin;
}

export type TrackerType =
  | 'traccar'
  | 'owntracks_app'
  | 'airtag_manual'
  | 'nenhum';

export interface TrackerPositionSummary {
  vehicleId: string;
  trackerId: string;
  tipo: TrackerType;
  ultimaPosicao: TrackerPosition | null;
}

/** Payload do evento `position:update` emitido pelo TrackerGateway (bloco 4 do backend). */
export interface PositionUpdateEvent {
  vehicleId: string;
  trackerId: string;
  lat: number;
  lng: number;
  timestamp: string;
  origem: PositionOrigin;
}
