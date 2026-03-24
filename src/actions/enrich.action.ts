export async function enrichAction(
  payload: Record<string, unknown>,
  config: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { fields } = config as { fields: Record<string, string> };

  const builtins: Record<string, unknown> = {
    enriched_at: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  };

  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields || {})) {
    extra[key] = value;
  }

  return {
    ...payload,
    ...extra,
    ...builtins,
  };
}
