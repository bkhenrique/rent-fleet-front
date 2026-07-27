import type { Currency } from './types/tenant';

const CURRENCY_LOCALE: Record<Currency, string> = {
  BRL: 'pt-BR',
  EUR: 'es-ES',
  USD: 'en-US',
};

/** Formata valores monetários na moeda da locadora, independente do idioma da interface. */
export function formatCurrency(valor: number, moeda: Currency): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE[moeda], {
    style: 'currency',
    currency: moeda,
  }).format(valor);
}
