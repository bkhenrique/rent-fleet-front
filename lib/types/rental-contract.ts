export type RentalContractStatus = 'ativo' | 'finalizado';

export type AttachmentPurpose = 'assinatura' | 'vistoria_entrega' | 'vistoria_devolucao';

export interface VistoriaInfo {
  fotosUrls: string[];
  observacoes: string | null;
}

export interface RentalContract {
  id: string;
  tenantId: string;
  vehicleId: string;
  customerId: string;
  dataInicio: string;
  dataFim: string;
  dataDevolucaoReal: string | null;
  valor: number;
  status: RentalContractStatus;
  /** URL assinada da S3/MinIO, expira em 15min — sempre re-buscar o contrato antes de abrir. */
  contratoPdfUrl: string | null;
  contratoAssinadoFotoUrls: string[];
  vistoriaEntrega: VistoriaInfo;
  vistoriaDevolucao: VistoriaInfo;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRentalContractPayload {
  vehicleId: string;
  customerId: string;
  dataInicio: string;
  dataFim: string;
  valor: number;
}

export interface RentalContractAlert {
  diasRestantes: number;
  atrasado: boolean;
}

export interface RentalContractWithAlert {
  contract: RentalContract;
  alert: RentalContractAlert;
}
