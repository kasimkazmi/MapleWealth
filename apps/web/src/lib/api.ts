export const API_URL = "http://localhost:3001/api";

const TOKEN_KEY = "maplewealth_session_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired. Please log in again.");
    this.name = "SessionExpiredError";
  }
}

// Performs a fetch and returns a friendly error message on failure — never throws
// a raw JSON-parse error, HTML body, or network exception straight at the UI.
// On success, returns the parsed JSON body.
export async function request(url: string, init: RequestInit = {}): Promise<{ ok: true; data: any } | { ok: false; message: string }> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    return { ok: false, message: "Can't reach the server. Check your connection and that the API is running, then try again." };
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

  let data: any;
  try {
    data = await res.json();
  } catch {
    return { ok: false, message: "The server sent a response that couldn't be read. Please try again." };
  }

  if (!res.ok) {
    const message = typeof data?.message === "string"
      ? data.message
      : Array.isArray(data?.message)
        ? data.message.join(", ")
        : res.status === 401
          ? "Invalid email or password."
          : res.status === 409
            ? "An account with this email already exists."
            : res.status >= 500
              ? "The server hit an unexpected error. Please try again shortly."
              : "Something went wrong. Please try again.";
    return { ok: false, message };
  }

  return { ok: true, data };
}

// Wraps fetch to attach the session token and redirect to /login on 401.
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  if (!token) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new SessionExpiredError();
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new SessionExpiredError();
  }

  return res;
}

export async function logout() {
  const token = getToken();
  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // best-effort — clear local token regardless of network outcome
    }
  }
  clearToken();
  if (typeof window !== "undefined") window.location.href = "/login";
}
