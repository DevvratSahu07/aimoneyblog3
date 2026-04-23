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

  // 🔥 IMPORTANT CHANGE HERE
  const res = await fetch(
    `${getApiBaseUrl()}${path}`, // ← call function dynamically
    { ...options, headers }
  );

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new Error(message);
  }

  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}