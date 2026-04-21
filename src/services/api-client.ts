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

// ── Error types ──

export interface FieldError {
  field: string;
  message: string;
}

/** Raw Pydantic validation error item (FastAPI default 422 format). */
interface PydanticErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: unknown;
}

/**
 * API error response body.
 *
 * Handles two formats:
 * - Normalized: `{detail: string, field_errors: [{field, message}]}`
 * - FastAPI default: `{detail: [{loc, msg, type}]}`
 */
export interface ApiErrorBody {
  detail: string | PydanticErrorItem[];
  field_errors?: FieldError[];
}

export class ApiClientError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(message: string, status: number, body: ApiErrorBody | null) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.body = body;
  }

  /** True when the backend returned field-level validation errors (422). */
  get isValidationError(): boolean {
    if (this.status !== 422) return false;
    // Normalized format
    if (Array.isArray(this.body?.field_errors)) return true;
    // FastAPI default format (detail is an array of Pydantic errors)
    if (Array.isArray(this.body?.detail)) return true;
    return false;
  }

  /** Human-readable detail string for toast messages. */
  get userMessage(): string {
    if (!this.body?.detail) return "Something went wrong. Please try again.";
    // Normalized format: detail is a string
    if (typeof this.body.detail === "string") return this.body.detail;
    // FastAPI default format: detail is an array — summarize
    if (Array.isArray(this.body.detail)) return "Please fix the highlighted fields.";
    return "Something went wrong. Please try again.";
  }

  /** Extract field-level errors as a Record for React Hook Form's setError. */
  get fieldErrors(): Record<string, string> {
    // Normalized format: use field_errors array
    if (Array.isArray(this.body?.field_errors)) {
      return Object.fromEntries(this.body!.field_errors.map((e) => [e.field, e.message]));
    }
    // FastAPI default format: parse from detail array
    if (this.status === 422 && Array.isArray(this.body?.detail)) {
      const errors: Record<string, string> = {};
      for (const item of this.body!.detail as PydanticErrorItem[]) {
        const fieldPath = item.loc.filter((s) => s !== "body" && s !== "query" && s !== "path");
        const fieldName = fieldPath.join(".") || "__root__";
        errors[fieldName] = item.msg;
      }
      return errors;
    }
    return {};
  }
}

// ── Fetch wrapper ──

function _buildHeaders(
  token: string | null,
  overrides: HeadersInit | undefined
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(overrides as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function _throwIfError(response: Response): Promise<void> {
  if (response.ok) return;
  let body: ApiErrorBody | null = null;
  let rawText = "Unknown error";
  try {
    body = (await response.json()) as ApiErrorBody;
    rawText = JSON.stringify(body);
  } catch {
    rawText = await response.text().catch(() => "Unknown error");
  }
  throw new ApiClientError(rawText, response.status, body);
}

async function _fetch<T>(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = _buildHeaders(token, options.headers);

  const response = await fetch(url, { ...options, headers });
  await _throwIfError(response);

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

/**
 * Client-side API helper for endpoints that return a binary file body
 * (e.g. CSV / XLSX downloads via `StreamingResponse`).
 *
 * Returns the blob plus the server-provided filename parsed from
 * `Content-Disposition`, so callers can trigger a browser download
 * with the backend's intended filename.
 */
export async function apiClientBlob(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<{ blob: Blob; filename: string | null }> {
  const url = `${API_BASE}${endpoint}`;
  const headers = _buildHeaders(token, options.headers);

  const response = await fetch(url, { ...options, headers });
  await _throwIfError(response);

  const blob = await response.blob();
  const filename = parseContentDispositionFilename(response.headers.get("Content-Disposition"));
  return { blob, filename };
}

function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) return null;
  // RFC 5987 `filename*=UTF-8''...` takes precedence over plain `filename="..."`.
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1]);
    } catch {
      return utf8[1];
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain ? plain[1] : null;
}
