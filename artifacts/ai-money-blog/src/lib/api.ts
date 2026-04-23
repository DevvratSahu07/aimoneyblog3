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

/**
 * ✅ FIX 1: REQUIRED EXPORT (your build error)
 */
export function getApiOrigin(): string | null {
  return getConfiguredApiOrigin();
}

/**
 * ✅ FIX 2: BASE API URL
 */
export function getApiBaseUrl(): string {
  const origin = getConfiguredApiOrigin();

  if (origin) {
    return `${origin}/api`;
  }

  // fallback (local dev)
  return `${window.location.origin}/api`;
}

/**
 * ✅ FIX 3: REQUIRED EXPORT (your build error)
 */
export function buildApiUrl(path = ""): string {
  const normalizedPath = path
    ? path.startsWith("/")
      ? path
      : `/${path}`
    : "";

  return `${getApiBaseUrl()}${normalizedPath}`;
}