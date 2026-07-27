export type RentalContractStatus = 'ativo' | 'finalizado';

export type AttachmentPurpose = 'assinatura' | 'vistoria_entrega' | 'vistoria_devolucao';

export type FuelLevel = 'cheio' | 'tres_quartos' | 'metade' | 'um_quarto' | 'reserva';

export interface VistoriaInfo {
  fotosUrls: string[];
  observacoes: string | null;
  quilometragem: number | null;
  combustivel: FuelLevel | null;
}

export interface CondutorAdicional {
  nome: string;
  documento: string;
  cnh: string | null;
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
  localRetirada: string | null;
  localDevolucao: string | null;
  franquiaKm: number | null;
  caucao: number | null;
  condutoresAdicionais: CondutorAdicional[];
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
  localRetirada?: string;
  localDevolucao?: string;
  franquiaKm?: number;
  caucao?: number;
  condutoresAdicionais?: CondutorAdicional[];
}

export interface RentalContractAlert {
  diasRestantes: number;
  atrasado: boolean;
}

export interface RentalContractWithAlert {
  contract: RentalContract;
  alert: RentalContractAlert;
}
