export type VehicleStatus = 'disponivel' | 'alugado' | 'manutencao' | 'inativo';

export interface Vehicle {
  _id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string | null;
  status: VehicleStatus;
  trackerId: string | null;
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
