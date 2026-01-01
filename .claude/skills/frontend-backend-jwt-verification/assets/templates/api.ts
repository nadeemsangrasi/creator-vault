import { auth } from "@/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await auth.api.getSession();

  if (!session?.token) {
    throw new Error("Not authenticated - please sign in");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired or invalid - sign out and redirect
    await auth.signOut();
    if (typeof window !== "undefined") {
      window.location.href = "/sign-in";
    }
    throw new Error("Session expired");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string) => authFetch<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body: unknown) =>
    authFetch<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    authFetch<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    authFetch<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    authFetch<T>(endpoint, { method: "DELETE" }),
};
