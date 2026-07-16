import { authClient } from "./auth-client";

// Same-origin now that the API and frontend live in one Next.js app.
export const API_URL = "/api";

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired. Please log in again.");
    this.name = "SessionExpiredError";
  }
}

export interface ApiSuccess<T = Record<string, unknown>> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  message: string;
}

function extractMessage(data: unknown, status: number): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
  }
  if (status === 401) return "Invalid email or password.";
  if (status === 409) return "An account with this email already exists.";
  if (status >= 500) return "The server hit an unexpected error. Please try again shortly.";
  return "Something went wrong. Please try again.";
}

// Performs a fetch and returns a friendly error message on failure — never throws
// a raw JSON-parse error, HTML body, or network exception straight at the UI.
// On success, returns the parsed JSON body.
export async function request<T = Record<string, unknown>>(
  url: string,
  init: RequestInit = {},
): Promise<ApiSuccess<T> | ApiFailure> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    return { ok: false, message: "Can't reach the server. Check your connection, then try again." };
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    if (res.status === 404) {
      return { ok: false, message: "The server couldn't find this endpoint. It may not be running or is misconfigured." };
    }
    if (res.status >= 500) {
      return { ok: false, message: "The server hit an unexpected error. Please try again shortly." };
    }
    return { ok: false, message: `Unexpected response from the server (status ${res.status}).` };
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return { ok: false, message: "The server sent a response that couldn't be read. Please try again." };
  }

  if (!res.ok) {
    return { ok: false, message: extractMessage(data, res.status) };
  }

  return { ok: true, data: data as T };
}

// Wraps fetch for same-origin relative "/api/..." paths. Session is carried via the
// Better Auth cookie automatically (credentials default to "same-origin" for same-origin
// requests), so there's no token to attach here anymore. Redirects to /login on 401,
// same behavior as before under the old bearer-token scheme.
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, init);

  if (res.status === 401) {
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new SessionExpiredError();
  }

  return res;
}

export async function logout() {
  try {
    await authClient.signOut();
  } catch {
    // best-effort — redirect regardless of network outcome
  }
  if (typeof window !== "undefined") window.location.href = "/login";
}
