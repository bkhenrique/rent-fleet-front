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

export interface Tracker {
  _id: string;
  tenantId: string;
  vehicleId: string;
  tipo: TrackerType;
  uniqueId: string | null;
  /** Só vem preenchido na resposta do POST /trackers (criação); demais leituras omitem. */
  webhookSecret?: string;
  ultimaPosicao: TrackerPosition | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrackerPayload {
  vehicleId: string;
  tipo: TrackerType;
  /** Obrigatório só para tipo 'traccar' (IMEI). */
  uniqueId?: string;
}

export interface ManualPositionPayload {
  lat: number;
  lng: number;
  timestamp?: string;
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
