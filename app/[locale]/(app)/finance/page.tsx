'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { useDownloadReport } from '@/lib/use-download-report';
import { useTenantSettings } from '@/lib/use-tenant-settings';
import { formatCurrency } from '@/lib/currency';
import type { Vehicle } from '@/lib/types/vehicle';
import type {
  CreateExpensePayload,
  Expense,
  ExpenseCategory,
  FinanceSummary,
  UpdateExpensePayload,
} from '@/lib/types/finance';

const EXPENSE_CATEGORIES: ExpenseCategory[] = ['manutencao', 'seguro', 'administrativo', 'outro'];
const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
const INPUT_CLASS = `rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent ${FOCUS_RING}`;

/** `YYYY-MM-DD` a partir dos componentes LOCAIS da data (não `toISOString()`, que converte pra UTC
 * e pode virar o dia errado dependendo do fuso horário e da hora do dia — ex: 23h de 6/8 no fuso
 * -3 vira 7/8 em UTC). */
function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 30 dias atrás, formato `YYYY-MM-DD` — janela padrão do resumo financeiro. Antes eram 12 meses
 * (~1 ano), que não fazia sentido como padrão de "visão geral recente" — ver bloco 45 do
 * MELHORIAS5.md. */
function defaultFrom(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return toDateInputValue(date);
}

function today(): string {
  return toDateInputValue(new Date());
}

function monthLabel(mes: string, locale: string): string {
  const [ano, mesNumero] = mes.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, { month: 'short', year: '2-digit' }).format(new Date(ano, mesNumero - 1, 1));
}

const EMPTY_FORM = { categoria: 'manutencao' as ExpenseCategory, valor: '', data: today(), descricao: '', vehicleId: '' };

function FinanceContent() {
  const t = useTranslations('finance');
  const locale = useLocale();
  const apiClient = useApiClient();
  const downloadReport = useDownloadReport();
  const tenantSettings = useTenantSettings();
  const [reportError, setReportError] = useState(false);

  const [dataInicio, setDataInicio] = useState(defaultFrom());
  const [dataFim, setDataFim] = useState(today());

  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [summaryError, setSummaryError] = useState(false);

  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [expensesError, setExpensesError] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function loadSummary() {
    apiClient<FinanceSummary>(`/finance/summary?dataInicio=${dataInicio}&dataFim=${dataFim}`)
      .then(setSummary)
      .catch(() => setSummaryError(true));
  }

  function loadExpenses() {
    apiClient<Expense[]>('/expenses')
      .then(setExpenses)
      .catch(() => setExpensesError(true));
  }

  useEffect(loadSummary, [apiClient, dataInicio, dataFim]);
  useEffect(loadExpenses, [apiClient]);
  useEffect(() => {
    apiClient<Vehicle[]>('/vehicles').then(setVehicles).catch(() => {});
  }, [apiClient]);

  async function handleExport(tipo: 'faturamento' | 'despesas') {
    setReportError(false);
    try {
      await downloadReport(`/reports/${tipo}?dataInicio=${dataInicio}&dataFim=${dataFim}`, `${tipo}.pdf`);
    } catch {
      setReportError(true);
    }
  }

  function openNewForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(expense: Expense) {
    setEditingId(expense.id);
    setForm({
      categoria: expense.categoria,
      valor: String(expense.valor),
      data: expense.data.slice(0, 10),
      descricao: expense.descricao ?? '',
      vehicleId: expense.vehicleId ?? '',
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSaving(true);

    const payload: CreateExpensePayload | UpdateExpensePayload = {
      categoria: form.categoria,
      valor: Number(form.valor),
      data: form.data,
      descricao: form.descricao || undefined,
      vehicleId: form.vehicleId || undefined,
    };

    try {
      if (editingId) {
        await apiClient<Expense>(`/expenses/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await apiClient<Expense>('/expenses', { method: 'POST', body: JSON.stringify(payload) });
      }
      setFormOpen(false);
      loadExpenses();
      loadSummary();
    } catch {
      setFormError(t('form.genericError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('deleteConfirm'))) return;
    try {
      await apiClient(`/expenses/${id}`, { method: 'DELETE' });
      loadExpenses();
      loadSummary();
    } catch {
      setExpensesError(true);
    }
  }

  const moeda = tenantSettings?.moeda ?? 'BRL';
  const money = (valor: number) => formatCurrency(valor, moeda);
  const maxMonthValue = summary ? Math.max(1, ...summary.porMes.flatMap((m) => [m.receita, m.despesa])) : 1;
  const vehiclesById = Object.fromEntries(vehicles.map((v) => [v._id, v]));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl tracking-tight">{t('title')}</h1>
        <button
          type="button"
          onClick={openNewForm}
          className={`rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 ${FOCUS_RING}`}
        >
          {t('newExpense')}
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-foreground-dim">
          {t('filters.dataInicio')}
          <input
            type="date"
            value={dataInicio}
            max={dataFim}
            onChange={(e) => setDataInicio(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-foreground-dim">
          {t('filters.dataFim')}
          <input
            type="date"
            value={dataFim}
            max={today()}
            onChange={(e) => setDataFim(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleExport('faturamento')}
            className={`rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-surface-2 ${FOCUS_RING}`}
          >
            {t('exportFaturamento')}
          </button>
          <button
            type="button"
            onClick={() => handleExport('despesas')}
            className={`rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-surface-2 ${FOCUS_RING}`}
          >
            {t('exportDespesas')}
          </button>
        </div>
      </div>

      {reportError && <p className="text-sm text-danger">{t('exportError')}</p>}
      {summaryError && <p className="text-sm text-danger">{t('loadError')}</p>}

      {summary && (
        <>
          <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-surface">
            <div className="px-5 py-4">
              <p className="font-mono text-3xl leading-none font-medium tracking-tight text-success">{money(summary.receita)}</p>
              <p className="mt-2 text-xs text-foreground-dim">{t('receita')}</p>
            </div>
            <div className="px-5 py-4">
              <p className="font-mono text-3xl leading-none font-medium tracking-tight text-danger">{money(summary.despesa)}</p>
              <p className="mt-2 text-xs text-foreground-dim">{t('despesa')}</p>
            </div>
            <div className="px-5 py-4">
              <p
                className={`font-mono text-3xl leading-none font-medium tracking-tight ${summary.saldo >= 0 ? 'text-success' : 'text-danger'}`}
              >
                {money(summary.saldo)}
              </p>
              <p className="mt-2 text-xs text-foreground-dim">{t('saldo')}</p>
            </div>
          </div>

          {summary.porMes.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-5">
              <h2 className="mb-4 text-sm font-semibold">{t('byMonth')}</h2>
              <div className="flex flex-col gap-3">
                {summary.porMes.map((month) => (
                  <div key={month.mes} className="flex items-center gap-3">
                    <span className="w-14 shrink-0 font-mono text-xs text-foreground-dim">{monthLabel(month.mes, locale)}</span>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="h-2 rounded-full bg-success" style={{ width: `${(month.receita / maxMonthValue) * 100}%` }} />
                      <div className="h-2 rounded-full bg-danger" style={{ width: `${(month.despesa / maxMonthValue) * 100}%` }} />
                    </div>
                    <span className="w-24 shrink-0 text-right font-mono text-xs text-foreground-dim">
                      {money(month.receita - month.despesa)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.porCategoria.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-5">
              <h2 className="mb-3 text-sm font-semibold">{t('byCategory')}</h2>
              <ul className="flex flex-col gap-2">
                {summary.porCategoria.map((entry) => (
                  <li key={entry.categoria} className="flex items-center justify-between text-sm">
                    <span className="text-foreground-dim">{t(`categoria.${entry.categoria}`)}</span>
                    <span className="font-mono">{money(entry.total)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {formOpen && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">{editingId ? t('form.editTitle') : t('form.newTitle')}</h2>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{t('form.categoria')}</span>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value as ExpenseCategory })}
                className={INPUT_CLASS}
              >
                {EXPENSE_CATEGORIES.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {t(`categoria.${categoria}`)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{t('form.valor')}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                className={INPUT_CLASS}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{t('form.data')}</span>
              <input
                type="date"
                required
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className={INPUT_CLASS}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{t('form.vehicleId')}</span>
              <select
                value={form.vehicleId}
                onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                className={INPUT_CLASS}
              >
                <option value="">{t('form.noVehicle')}</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.placa}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t('form.descricao')}</span>
            <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className={INPUT_CLASS} />
          </label>

          {formError && <p className="text-sm text-danger">{formError}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className={`rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 ${FOCUS_RING}`}
            >
              {saving ? t('form.saving') : t('form.save')}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className={`rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-2 ${FOCUS_RING}`}
            >
              {t('form.cancel')}
            </button>
          </div>
        </form>
      )}

      {expensesError && <p className="text-sm text-danger">{t('loadError')}</p>}
      {expenses && expenses.length === 0 && <p className="text-sm text-foreground-dim">{t('empty')}</p>}

      {expenses && expenses.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 pl-4 font-medium text-foreground-dim">{t('table.data')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.categoria')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.veiculo')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.descricao')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.valor')}</th>
                <th className="py-3 pr-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-border last:border-b-0 hover:bg-surface-2">
                  <td className="py-2.5 pr-4 pl-4 font-mono text-foreground-dim">
                    {new Date(expense.data).toLocaleDateString(locale)}
                  </td>
                  <td className="py-2.5 pr-4">{t(`categoria.${expense.categoria}`)}</td>
                  <td className="py-2.5 pr-4 font-mono text-foreground-dim">
                    {expense.vehicleId ? (vehiclesById[expense.vehicleId]?.placa ?? '—') : '—'}
                  </td>
                  <td className="py-2.5 pr-4 text-foreground-dim">{expense.descricao ?? '—'}</td>
                  <td className="py-2.5 pr-4 font-mono">{money(expense.valor)}</td>
                  <td className="py-2.5 pr-4 text-right">
                    <button
                      type="button"
                      onClick={() => openEditForm(expense)}
                      className={`rounded-xs text-xs text-foreground-dim underline ${FOCUS_RING}`}
                    >
                      {t('table.edit')}
                    </button>{' '}
                    <button
                      type="button"
                      onClick={() => handleDelete(expense.id)}
                      className={`rounded-xs text-xs text-danger underline ${FOCUS_RING}`}
                    >
                      {t('table.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function FinancePage() {
  return (
    <RequireRole roles={TENANT_ROLES}>
      <FinanceContent />
    </RequireRole>
  );
}
