export interface Customer {
  id: string;
  tenantId: string;
  nome: string;
  documento: string;
  cnh: string | null;
  telefone: string | null;
  email: string | null;
  fotosDocumentoUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerPayload {
  nome: string;
  documento: string;
  cnh?: string;
  telefone?: string;
  email?: string;
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;
