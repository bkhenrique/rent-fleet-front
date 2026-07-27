export type VehicleStatus = 'disponivel' | 'alugado' | 'manutencao' | 'inativo';
export type FuelType = 'gasolina' | 'diesel' | 'eletrico' | 'hibrido' | 'flex';
export type TransmissionType = 'manual' | 'automatico';

export interface SeguroInfo {
  validade: string | null;
  apolice: string | null;
  seguradora: string | null;
}

export interface DocumentoValidadeInfo {
  validade: string | null;
}

export interface VehicleDocumentos {
  seguro: SeguroInfo;
  itv: DocumentoValidadeInfo;
  licenciamento: DocumentoValidadeInfo;
}

export interface VehicleMaintenanceEntry {
  tipo: string;
  data: string;
  km: number | null;
  custo: number | null;
  oficina: string | null;
  createdAt: string;
}

export interface Vehicle {
  _id: string;
  tenantId: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string | null;
  chassi: string | null;
  cambio: TransmissionType | null;
  combustivel: FuelType | null;
  fotos: string[];
  documentos: VehicleDocumentos;
  manutencao: VehicleMaintenanceEntry[];
  proximaRevisaoEm: string | null;
  status: VehicleStatus;
  trackerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehiclePayload {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor?: string;
  chassi?: string;
  cambio?: TransmissionType;
  combustivel?: FuelType;
  documentos?: {
    seguro?: { validade?: string; apolice?: string; seguradora?: string };
    itv?: { validade?: string };
    licenciamento?: { validade?: string };
  };
}

export interface UpdateVehiclePayload extends Partial<CreateVehiclePayload> {
  status?: VehicleStatus;
  proximaRevisaoEm?: string;
}

export interface CreateMaintenancePayload {
  tipo: string;
  data: string;
  km?: number;
  custo?: number;
  oficina?: string;
  proximaRevisaoEm?: string;
}

export type VehicleAlertItem = 'seguro' | 'itv' | 'licenciamento' | 'revisao';

export interface VehicleAlert {
  item: VehicleAlertItem;
  validade: string;
  diasRestantes: number;
  vencido: boolean;
}

export interface VehicleWithAlerts {
  vehicle: Vehicle;
  alerts: VehicleAlert[];
}
