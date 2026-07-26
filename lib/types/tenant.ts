export type TenantStatus = 'ativo' | 'inadimplente' | 'suspenso' | 'cortesia';
export type BillingCycle = 'mensal' | 'anual';

export interface Tenant {
  _id: string;
  nome: string;
  documento: string;
  status: TenantStatus;
  billing: {
    ciclo: BillingCycle;
    ativoAte: string;
    ultimoPagamentoEm: string | null;
  };
  idiomaPadrao: 'pt' | 'en' | 'es';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantPayload {
  nome: string;
  documento: string;
  ciclo: BillingCycle;
  admin: {
    email: string;
    password: string;
    name: string;
  };
}

export interface UpdateTenantPayload {
  nome?: string;
  documento?: string;
  ciclo?: BillingCycle;
}
