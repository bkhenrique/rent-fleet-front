import type { Country } from './types/tenant';

/** Centro do mapa antes de qualquer posição real existir — usado só como fallback visual. */
export const MAP_CENTER_BY_COUNTRY: Record<Country, [number, number]> = {
  BR: [-15.793889, -47.882778], // Brasília
  ES: [40.4168, -3.7038], // Madri
  US: [39.8283, -98.5795], // centro geográfico do território continental
};

export const DEFAULT_MAP_CENTER: [number, number] = MAP_CENTER_BY_COUNTRY.BR;
