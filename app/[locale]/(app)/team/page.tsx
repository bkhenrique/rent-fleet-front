'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { RequireRole } from '@/components/require-role';
import { TENANT_ADMIN_ONLY } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { ApiError } from '@/lib/api-client';
import type { CreateUserPayload, User } from '@/lib/types/user';

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
const INPUT_CLASS = `rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent ${FOCUS_RING}`;

function TeamList() {
  const t = useTranslations('team');
  const apiClient = useApiClient();

  const [users, setUsers] = useState<User[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadUsers() {
    apiClient<User[]>('/users')
      .then(setUsers)
      .catch(() => setLoadError(true));
  }

  useEffect(loadUsers, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const payload: CreateUserPayload = { name, email };

    try {
      await apiClient<User>('/users', { method: 'POST', body: JSON.stringify(payload) });
      setName('');
      setEmail('');
      setSuccessMessage(t('form.success'));
      loadUsers();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFormError(t('form.conflictError'));
      } else {
        setFormError(t('form.genericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleStatus(user: User) {
    try {
      const updated = await apiClient<User>(`/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ ativo: !user.ativo }),
      });
      setUsers((prev) => prev?.map((item) => (item.id === updated.id ? updated : item)) ?? prev);
    } catch {
      setLoadError(true);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-serif text-3xl tracking-tight">{t('title')}</h1>

      <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">{t('form.title')}</h2>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t('form.name')}</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASS} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t('form.email')}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
            />
          </label>
        </div>

        <p className="text-xs text-foreground-dim">{t('form.passwordNotice')}</p>

        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}
        {successMessage && <p className="text-sm text-success">{successMessage}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 ${FOCUS_RING}`}
        >
          {isSubmitting ? t('form.saving') : t('form.create')}
        </button>
      </form>

      {loadError && <p className="text-sm text-danger">{t('loadError')}</p>}
      {users && users.length === 0 && <p className="text-sm text-foreground-dim">{t('empty')}</p>}

      {users && users.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 pl-4 font-medium text-foreground-dim">{t('table.nome')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.email')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.status')}</th>
                <th className="py-3 pr-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-b-0 hover:bg-surface-2">
                  <td className="py-2.5 pr-4 pl-4">{user.name}</td>
                  <td className="py-2.5 pr-4 font-mono text-foreground-dim">{user.email}</td>
                  <td className={`py-2.5 pr-4 font-medium ${user.ativo ? 'text-success' : 'text-foreground-faint'}`}>
                    {user.ativo ? t('status.ativo') : t('status.inativo')}
                  </td>
                  <td className="py-2.5 pr-4">
                    <button
                      type="button"
                      onClick={() => toggleStatus(user)}
                      className={`rounded-xs text-sm underline ${FOCUS_RING}`}
                    >
                      {user.ativo ? t('deactivate') : t('activate')}
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

export default function TeamPage() {
  return (
    <RequireRole roles={TENANT_ADMIN_ONLY}>
      <TeamList />
    </RequireRole>
  );
}
