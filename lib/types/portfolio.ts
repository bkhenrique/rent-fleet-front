import type { Currency } from './tenant';
import type { VehicleStatus } from './vehicle';

/** Item de veículo devolvido por `GET /public/portfolio/:token` — nunca inclui placa/chassi/docs. */
export interface PublicPortfolioVehicle {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string | null;
  fotos: string[];
  /** Só presente se a locadora ativou "mostrarStatus" no portfólio. */
  status?: VehicleStatus;
  /** Só presente se "mostrarValor" está ativo E esse veículo específico tem valor cadastrado. */
  valorDiariaReferencia?: number;
  moeda?: Currency;
}

export interface PublicPortfolioView {
  locadora: {
    nome: string;
    telefone: string | null;
    email: string | null;
  };
  veiculos: PublicPortfolioVehicle[];
}
