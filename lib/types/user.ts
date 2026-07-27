import type { Role } from '@/stores/auth-store';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string | null;
  ativo: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
}
