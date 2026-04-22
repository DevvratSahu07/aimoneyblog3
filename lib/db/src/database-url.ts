function redactDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = "***";
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function describeDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.username || "<user>"}:***@${parsed.host}${parsed.pathname}${parsed.search}`;
  } catch {
    return redactDatabaseUrl(url);
  }
}

export function getDatabaseUrl(): string {
  const value = process.env.DATABASE_URL;

  if (!value) {
    throw new Error(
      "DATABASE_URL must be set. Add it to the repo root .env file before running DB commands.",
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error(
      `DATABASE_URL is not a valid URL: ${redactDatabaseUrl(value)}`,
    );
  }

  if (!parsed.password) {
    throw new Error(
      "DATABASE_URL is missing a password. Use the format " +
        "'postgres://USERNAME:PASSWORD@HOST:5432/DATABASE'. " +
        `Current value: ${redactDatabaseUrl(value)}`,
    );
  }

  if (
    parsed.hostname.includes("pooler.supabase.com") &&
    !parsed.searchParams.has("sslmode")
  ) {
    throw new Error(
      "DATABASE_URL points to a Supabase pooler host but has no sslmode set. " +
        "Use a pooler URL like " +
        "'postgresql://USER:PASSWORD@HOST:6543/postgres?sslmode=no-verify' " +
        "or your provider's recommended SSL settings.",
    );
  }

  return value;
}
