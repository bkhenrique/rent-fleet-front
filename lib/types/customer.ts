export interface CustomerCnh {
  numero: string | null;
  categoria: string | null;
  validade: string | null;
}

export interface Customer {
  id: string;
  tenantId: string;
  nome: string;
  documento: string;
  cnh: CustomerCnh;
  endereco: string | null;
  dataNascimento: string | null;
  telefone: string | null;
  email: string | null;
  fotosDocumentoUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerPayload {
  nome: string;
  documento: string;
  cnh?: { numero?: string; categoria?: string; validade?: string };
  endereco?: string;
  dataNascimento?: string;
  telefone?: string;
  email?: string;
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;
