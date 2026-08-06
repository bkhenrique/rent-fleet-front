export type ExpenseCategory = 'manutencao' | 'seguro' | 'administrativo' | 'outro';

export interface Expense {
  id: string;
  tenantId: string;
  vehicleId: string | null;
  categoria: ExpenseCategory;
  valor: number;
  data: string;
  descricao: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpensePayload {
  vehicleId?: string;
  categoria: ExpenseCategory;
  valor: number;
  data: string;
  descricao?: string;
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export interface FinanceSummaryEntry {
  categoria: string;
  total: number;
}

export interface FinanceSummaryMonth {
  mes: string;
  receita: number;
  despesa: number;
}

export interface FinanceSummary {
  receita: number;
  despesa: number;
  saldo: number;
  porCategoria: FinanceSummaryEntry[];
  porMes: FinanceSummaryMonth[];
}
