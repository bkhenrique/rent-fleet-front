'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { RequireRole } from '@/components/require-role';
import { TENANT_ADMIN_ONLY } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { ApiError } from '@/lib/api-client';
import type { CreateUserPayload, User } from '@/lib/types/user';

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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold">{t('title')}</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-8 flex flex-col gap-4 rounded border border-black/10 p-4 dark:border-white/15"
      >
        <h2 className="text-sm font-semibold">{t('form.title')}</h2>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.name')}</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.email')}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            />
          </label>
        </div>

        <p className="text-xs text-foreground/60">{t('form.passwordNotice')}</p>

        {formError && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {formError}
          </p>
        )}
        {successMessage && <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="self-start rounded bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60"
        >
          {isSubmitting ? t('form.saving') : t('form.create')}
        </button>
      </form>

      {loadError && <p className="text-sm text-red-600 dark:text-red-400">{t('loadError')}</p>}
      {users && users.length === 0 && <p className="text-sm text-foreground/60">{t('empty')}</p>}

      {users && users.length > 0 && (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/15">
              <th className="py-2 pr-4 font-medium">{t('table.nome')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.email')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.status')}</th>
              <th className="py-2 pr-4 font-medium" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-4">{user.name}</td>
                <td className="py-2 pr-4">{user.email}</td>
                <td
                  className={`py-2 pr-4 font-medium ${
                    user.ativo ? 'text-green-700 dark:text-green-400' : 'text-foreground/50'
                  }`}
                >
                  {user.ativo ? t('status.ativo') : t('status.inativo')}
                </td>
                <td className="py-2 pr-4">
                  <button type="button" onClick={() => toggleStatus(user)} className="text-sm underline">
                    {user.ativo ? t('deactivate') : t('activate')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
