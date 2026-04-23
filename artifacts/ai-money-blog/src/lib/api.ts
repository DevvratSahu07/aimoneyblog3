// src/lib/api.ts

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim() ?? "";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getConfiguredApiOrigin(): string | null {
  if (!configuredApiUrl) return null;

  const normalized = stripTrailingSlash(configuredApiUrl);
  return normalized.endsWith("/api")
    ? normalized.slice(0, -"/api".length)
    : normalized;
}

export function getApiBaseUrl(): string {
  const configuredOrigin = getConfiguredApiOrigin();

  if (configuredOrigin) {
    return `${configuredOrigin}/api`;
  }

  return `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;
}