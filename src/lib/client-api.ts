'use client';

// Browser-side calls to the API, always through the same-origin /api proxy.
// The access token lives only in this module's memory: never localStorage,
// where any injected script could read it. A reload loses it, and the
// HttpOnly refresh cookie (which JS can't read) silently gets a new one.
let accessToken: string | null = null;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

// A blocked account (seat cancelled, suspended...) is reported by the API as
// a 403 with code ACCOUNT_*. The session registers what to do about it.
export type Blocked = { state: string; message: string; details?: { reason?: string | null; cancelledAt?: string | null } };
let onBlocked: (b: Blocked) => void = () => {};
export const setBlockedHandler = (fn: (b: Blocked) => void) => {
  onBlocked = fn;
};

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

type ErrorBody = { error?: { message?: string; code?: string; details?: unknown } };

// Validation errors arrive as [{ field, message }] or { field: [messages] }:
// show the first one, it says exactly what to fix.
function firstDetail(details: unknown): string | undefined {
  if (Array.isArray(details)) return (details[0] as { message?: string })?.message;
  if (details && typeof details === 'object') return Object.values(details as Record<string, string[]>)[0]?.[0];
}

async function toError(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => ({}))) as ErrorBody;
  const { message = 'Request failed', code, details } = body.error ?? {};
  if (code?.startsWith('ACCOUNT_')) {
    onBlocked({ state: code.slice('ACCOUNT_'.length), message, details: details as Blocked['details'] });
  }
  // The API writes its 4xx and 503 messages for people; a 500 says nothing useful
  const text =
    res.status === 429
      ? 'Too many tries. Please wait a few minutes and try again.'
      : res.status === 500
        ? 'Something went wrong on our side. Please try again.'
        : code === 'VALIDATION_ERROR'
        ? (firstDetail(details) ?? message)
        : message;
  return new ApiError(text, res.status, code, details);
}

// Refresh tokens are single-use and rotate on every refresh. If two callers
// refresh at once (StrictMode double-mount, two 401s in parallel), the second
// presents a used token and the API revokes the session. So all callers share
// ONE in-flight request.
let inflight: Promise<string | null> | null = null;

export function refresh(): Promise<string | null> {
  inflight ??= fetch('/api/auth/refresh-token', { method: 'POST', credentials: 'include' })
    .then(async (res) => {
      if (!res.ok) {
        await toError(res); // reports a blocked account; anything else just means "signed out"
        return null;
      }
      return ((await res.json()) as { data: { accessToken: string } }).data.accessToken;
    })
    .catch(() => null)
    .then((token) => (accessToken = token))
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

type Init = RequestInit & { json?: unknown };

// Every browser request: token header, and on 401 one refresh and one retry,
// never a loop. Throws the API's message on failure.
async function send(path: string, init: Init, retried = false): Promise<Response> {
  const { json, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`);
  if (json !== undefined) headers.set('content-type', 'application/json');

  const res = await fetch(`/api${path}`, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    credentials: 'include',
  });
  if (res.status === 401 && accessToken && !retried && (await refresh())) return send(path, init, true);
  if (!res.ok) throw await toError(res);
  return res;
}

// JSON in, the response's `data` out.
export async function api<T>(path: string, init: Init = {}): Promise<T> {
  return ((await (await send(path, init)).json()) as { data: T }).data;
}

// A file the API serves behind login (e.g. the Excel template): a plain link
// can't carry the token, so fetch it and hand the browser a local copy.
export async function download(path: string, filename: string) {
  const url = URL.createObjectURL(await (await send(path, {})).blob());
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
