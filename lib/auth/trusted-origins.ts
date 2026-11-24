export function getTrustedOrigins() {
  const configuredOrigins =
    process.env.BETTER_AUTH_TRUSTED_ORIGINS
      ?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];
  const baseOrigin = process.env.BETTER_AUTH_URL
    ? new URL(process.env.BETTER_AUTH_URL).origin
    : null;

  return [...new Set([...configuredOrigins, baseOrigin].filter(
    (origin): origin is string => Boolean(origin),
  ).map((origin) => new URL(origin).origin))];
}

export function isTrustedRequestOrigin(origin: string | null) {
  if (!origin) return false;
  try {
    const parsedOrigin = new URL(origin);
    return parsedOrigin.origin === origin &&
      getTrustedOrigins().includes(parsedOrigin.origin);
  } catch {
    return false;
  }
}
