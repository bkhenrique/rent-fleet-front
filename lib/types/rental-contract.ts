import type { Currency } from './tenant';

export type RentalContractStatus = 'ativo' | 'finalizado';

export type AttachmentPurpose = 'assinatura' | 'vistoria_entrega' | 'vistoria_devolucao';

export type FuelLevel = 'cheio' | 'tres_quartos' | 'metade' | 'um_quarto' | 'reserva';

export type DigitalSignatureStatus = 'nao_iniciado' | 'aguardando_cliente' | 'aguardando_locadora' | 'assinado';

export interface DigitalSignatureClienteInfo {
  assinadoEm: string;
  documentoFotoUrl: string;
  selfieFotoUrl: string;
  assinaturaImagemUrl: string;
}

export interface DigitalSignatureLocadoraInfo {
  assinadoEm: string;
  assinaturaImagemUrl: string;
}

export interface AssinaturaDigital {
  status: DigitalSignatureStatus;
  /** `true` quando existe um link de assinatura gerado, ainda não expirado e não usado pelo cliente. */
  linkAtivo: boolean;
  linkExpiraEm: string | null;
  cliente: DigitalSignatureClienteInfo | null;
  locadora: DigitalSignatureLocadoraInfo | null;
}

export interface GerarLinkAssinaturaResult {
  token: string;
  expiraEm: string;
}

/** Resumo mostrado na tela pública de assinatura (`GET /public/contratos/assinar/:token`, status `pendente`). */
export interface PublicSignatureSummary {
  veiculo: { placa: string; marca: string; modelo: string };
  dataInicio: string;
  dataFim: string;
  valor: number;
  moeda: Currency;
  clienteNome: string;
}

export type PublicSignatureView =
  | { status: 'ja_assinado' }
  | { status: 'expirado' }
  | { status: 'pendente'; resumo: PublicSignatureSummary };

export type PublicUploadPurpose = 'documento' | 'selfie' | 'assinatura';

export interface PublicSignPayload {
  documentoKey: string;
  selfieKey: string;
  assinaturaKey: string;
}

/** Resumo mostrado na tela pública de visualização do contrato final (`GET /public/contratos/visualizar/:token`). */
export interface PublicContractView {
  veiculo: { placa: string; marca: string; modelo: string };
  clienteNome: string;
  dataInicio: string;
  dataFim: string;
  valor: number;
  moeda: Currency;
  /** URL assinada de vida curta (15min), gerada na hora — nunca cachear, buscar de novo a cada load. */
  pdfUrl: string;
}

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
  veiculo: { placa: string; marca: string; modelo: string } | null;
  clienteNome: string | null;
  assinaturaDigital: AssinaturaDigital;
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
