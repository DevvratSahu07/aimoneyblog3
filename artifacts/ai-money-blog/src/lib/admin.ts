// src/lib/admin.ts

import { getApiBaseUrl } from "@/lib/api";

const TOKEN_KEY = "ai-money-blog-admin-token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function adminFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(options.headers);

  if (!headers.has("content-type") && options.body) {
    headers.set("content-type", "application/json");
  }

  if (token) headers.set("x-admin-token", token);

  // 🔥 FINAL CORRECT CALL
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new Error(message);
  }

  if (res.status === 204) return null as T;
  return res.json();
}