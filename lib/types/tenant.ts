export type TenantStatus = 'ativo' | 'inadimplente' | 'suspenso' | 'cortesia';
export type BillingCycle = 'mensal' | 'anual';
export type Country = 'BR' | 'ES' | 'US';
export type Currency = 'BRL' | 'EUR' | 'USD';

export interface Tenant {
  _id: string;
  nome: string;
  documento: string;
  status: TenantStatus;
  billing: {
    ciclo: BillingCycle;
    ativoAte: string;
    ultimoPagamentoEm: string | null;
    valor: number | null;
  };
  idiomaPadrao: 'pt' | 'en' | 'es';
  pais: Country;
  moeda: Currency;
  enderecoFiscal: string | null;
  telefone: string | null;
  email: string | null;
  totalVeiculos: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantPayload {
  nome: string;
  documento: string;
  ciclo: BillingCycle;
  pais: Country;
  moeda?: Currency;
  valor?: number;
  enderecoFiscal?: string;
  telefone?: string;
  email?: string;
  admin: {
    email: string;
    name: string;
  };
}

export interface UpdateTenantPayload {
  nome?: string;
  documento?: string;
  ciclo?: BillingCycle;
  pais?: Country;
  moeda?: Currency;
  valor?: number;
  enderecoFiscal?: string;
  telefone?: string;
  email?: string;
}
