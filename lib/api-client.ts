const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Erro específico pro 402 TENANT_ACCESS_BLOCKED — ver useApiClient pro redirect centralizado. */
export class TenantBlockedError extends ApiError {}

interface ApiFetchOptions extends RequestInit {
  token?: string | null;
}

interface ApiErrorBody {
  message?: string | string[];
  code?: string;
}

/**
 * Wrapper puro sobre fetch — sem dependência de React/navegação, pode ser chamado de qualquer
 * lugar (client component, ação, etc). O tratamento de navegação pro 402 fica em `useApiClient`.
 */
export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // corpo vazio ou não-JSON — segue com a mensagem genérica do status HTTP
    }
    const message = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? response.statusText);

    if (response.status === 402 && body.code === 'TENANT_ACCESS_BLOCKED') {
      throw new TenantBlockedError(response.status, body.code, message);
    }
    throw new ApiError(response.status, body.code, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
