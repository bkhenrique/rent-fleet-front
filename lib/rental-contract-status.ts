import type { DigitalSignatureStatus, RentalContractStatus } from './types/rental-contract';

/** Cores de status de contrato — fonte única pra lista e detalhe (`rental-contracts/page.tsx` e
 * `rental-contracts/[id]/page.tsx`), mesma convenção de `lib/vehicle-status.ts`: `ativo` (contrato
 * em andamento) usa `info` porque não é nem "bom" nem "ruim", só em curso; `finalizado` usa
 * `success` (ciclo completo sem pendência). */
export const CONTRACT_STATUS_COLORS: Record<RentalContractStatus, string> = {
  ativo: 'text-info',
  finalizado: 'text-success',
};

/** `aguardando_cliente`/`aguardando_locadora` dividem `warning` de propósito — mesmo nível de
 * urgência (falta assinar), a legenda ao lado já diz de quem é a vez. `assinado`/`assinado_manual`
 * dividem `success` pelo mesmo motivo: o resultado final é o mesmo, só o método difere. */
export const ASSINATURA_COLORS: Record<DigitalSignatureStatus, string> = {
  nao_iniciado: 'text-foreground-faint',
  aguardando_cliente: 'text-warning',
  aguardando_locadora: 'text-warning',
  assinado: 'text-success',
  assinado_manual: 'text-success',
};
