export type RentalContractStatus = 'ativo' | 'finalizado';

export interface RentalContract {
  id: string;
  tenantId: string;
  vehicleId: string;
  customerId: string;
  dataInicio: string;
  dataFim: string;
  status: RentalContractStatus;
}

export interface RentalContractAlert {
  diasRestantes: number;
  atrasado: boolean;
}

export interface RentalContractWithAlert {
  contract: RentalContract;
  alert: RentalContractAlert;
}
