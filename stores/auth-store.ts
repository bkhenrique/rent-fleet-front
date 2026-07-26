import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'super_admin' | 'tenant_admin' | 'tenant_staff';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

/**
 * JWT em localStorage (via persist) — trade-off consciente pro MVP: mais simples que cookie
 * httpOnly (que exigiria a API e o front no mesmo domínio, ou um proxy de rotas do Next só pra
 * isso). Fica mais exposto a XSS; endurecer isso é um item natural de v2, não bloqueia o MVP.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'rentfleet-auth' },
  ),
);
