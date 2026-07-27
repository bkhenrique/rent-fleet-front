import type { Role } from '@/stores/auth-store';

/** Referências estáveis de módulo pra usar com <RequireRole roles={...}> (ver o componente). */
export const SUPER_ADMIN_ONLY: readonly Role[] = ['super_admin'];
export const TENANT_ROLES: readonly Role[] = ['tenant_admin', 'tenant_staff'];
export const TENANT_ADMIN_ONLY: readonly Role[] = ['tenant_admin'];
export const ALL_ROLES: readonly Role[] = ['super_admin', 'tenant_admin', 'tenant_staff'];
