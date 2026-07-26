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
  /**
   * `persist` reidrata do localStorage de forma assíncrona (depois do primeiro render). Guards de
   * rota (ver RequireRole) precisam esperar isso ficar `true` antes de decidir redirecionar, senão
   * um usuário logado que dá F5 numa rota protegida é jogado pro /login por um instante achando
   * que `user` é `null` quando na verdade ainda não carregou.
   */
  hasHydrated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
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
      hasHydrated: false,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'rentfleet-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
