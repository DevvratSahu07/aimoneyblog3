// artifacts/ai-money-blog/src/lib/api.ts

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  // Production (Vercel)
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return "https://aimoneyinfo.onrender.com/api";
  }

  // Local
  return "http://localhost:8080/api";
}

// ✅ THIS IS WHAT YOUR BUILD IS MISSING
export function buildApiUrl(path = ""): string {
  const normalizedPath = path
    ? path.startsWith("/")
      ? path
      : `/${path}`
    : "";

  return `${stripTrailingSlash(getApiBaseUrl())}${normalizedPath}`;
}