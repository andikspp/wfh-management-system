export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';
const TOKEN_KEY = 'dexa_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Dipanggil saat token kedaluwarsa / tidak valid (401) */
let onUnauthorized: () => void = () => undefined;
export const setUnauthorizedHandler = (fn: () => void) => (onUnauthorized = fn);

type Query = Record<string, string | number | undefined | null>;

export async function request<T>(
  method: string,
  path: string,
  options: { body?: unknown; query?: Query } = {},
): Promise<T> {
  const url = new URL(`${API_URL}/api${path}`);
  Object.entries(options.query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });

  const headers: Record<string, string> = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body; // browser mengatur Content-Type multipart sendiri
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  let res: Response;
  try {
    res = await fetch(url, { method, headers, body });
  } catch {
    throw new ApiError(0, 'Tidak dapat terhubung ke server');
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    const msg = data?.message;
    throw new ApiError(res.status, Array.isArray(msg) ? msg.join(', ') : msg || `Request gagal (${res.status})`);
  }
  return data as T;
}

/** URL lengkap untuk file yang disajikan gateway, mis. /uploads/xxx.png */
export const fileUrl = (path: string) => `${API_URL}${path}`;
