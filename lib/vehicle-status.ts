import type { VehicleStatus } from './types/vehicle';

/**
 * Cores de status compartilhadas entre o painel interno (`vehicles/page.tsx`) e o portfólio
 * público (`portfolio/[token]/page.tsx`) — a página pública só recebe `disponivel`/`alugado` do
 * backend (nunca `manutencao`/`inativo`, ver `getPublicPortfolio` no back), mas o tipo cobre os 4
 * valores possíveis de `VehicleStatus` pra evitar um `Record` parcial.
 */
export const STATUS_COLORS: Record<VehicleStatus, string> = {
  disponivel: 'text-success',
  alugado: 'text-info',
  manutencao: 'text-warning',
  inativo: 'text-foreground/50',
};
