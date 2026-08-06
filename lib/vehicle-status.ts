import type { VehicleStatus } from './types/vehicle';

/**
 * Cores de status compartilhadas entre o painel interno (`vehicles/page.tsx`) e o portfólio
 * público (`portfolio/[token]/page.tsx`) — a página pública só recebe `disponivel`/`alugado` do
 * backend (nunca `manutencao`/`inativo`, ver `getPublicPortfolio` no back), mas o tipo cobre os 4
 * valores possíveis de `VehicleStatus` pra evitar um `Record` parcial.
 */
export const STATUS_COLORS: Record<VehicleStatus, string> = {
  disponivel: 'text-green-700 dark:text-green-400',
  alugado: 'text-blue-700 dark:text-blue-400',
  manutencao: 'text-amber-700 dark:text-amber-400',
  inativo: 'text-foreground/50',
};
