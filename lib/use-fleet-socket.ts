'use client';

import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';
import { useApiClient } from './use-api-client';
import type { PositionUpdateEvent, TrackerPositionSummary } from './types/tracker';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Carrega o estado inicial do mapa via REST (GET /trackers/positions) e depois conecta o
 * WebSocket pra receber `position:update` ao vivo, mesclando por trackerId. Igual ao
 * TrackerGateway do backend: token vai em `auth.token` no handshake.
 */
export function useFleetSocket() {
  const token = useAuthStore((state) => state.token);
  const apiFetch = useApiClient();
  const [positions, setPositions] = useState<Map<string, TrackerPositionSummary>>(new Map());
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      try {
        const initial = await apiFetch<TrackerPositionSummary[]>('/trackers/positions');
        if (!cancelled) {
          setPositions(new Map(initial.map((item) => [item.trackerId, item])));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, [apiFetch]);

  useEffect(() => {
    if (!token || !API_URL) {
      return;
    }

    const socket: Socket = io(API_URL, { auth: { token } });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('position:update', (event: PositionUpdateEvent) => {
      setPositions((prev) => {
        const next = new Map(prev);
        const existing = next.get(event.trackerId);
        next.set(event.trackerId, {
          vehicleId: event.vehicleId,
          trackerId: event.trackerId,
          tipo: existing?.tipo ?? 'nenhum',
          ultimaPosicao: {
            lat: event.lat,
            lng: event.lng,
            timestamp: event.timestamp,
            origem: event.origem,
          },
        });
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return { positions: Array.from(positions.values()), loading, connected };
}
