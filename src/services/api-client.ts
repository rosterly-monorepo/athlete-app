/**
 * API client for FastAPI backend requests.
 *
 * Two variants:
 * - apiClient()         → for Client Components (gets token from Clerk's useAuth)
 * - serverApiClient()   → for Server Components / Route Handlers (gets token from auth())
 *
 * Both attach the Clerk JWT as a Bearer token so FastAPI's ClerkHTTPBearer
 * middleware can validate it.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

async function _fetch<T>(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Attach Clerk JWT if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const body = await response.text().catch(() => "Unknown error");
    throw new ApiClientError(`${response.status}: ${body}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Client-side API client.
 *
 * Usage in hooks:
 *   const { getToken } = useAuth();
 *   const token = await getToken();
 *   const data = await apiClient<Athlete>("/api/v1/athletes/me/profile", token);
 */
export async function apiClient<T>(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  return _fetch<T>(endpoint, token, options);
}

/**
 * Server-side API client for Server Components and Route Handlers.
 *
 * Usage:
 *   import { auth } from "@clerk/nextjs/server";
 *   const { getToken } = await auth();
 *   const token = await getToken();
 *   const data = await serverApiClient<Athlete>("/api/v1/athletes/me/profile", token);
 */
export async function serverApiClient<T>(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  return _fetch<T>(endpoint, token, options);
}
