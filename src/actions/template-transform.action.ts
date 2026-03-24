export async function templateTransformAction(
  payload: Record<string, unknown>,
  config: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { template } = config as { template: Record<string, string> };
  const result: Record<string, unknown> = {};

  for (const [key, tmpl] of Object.entries(template)) {
    result[key] = tmpl.replace(/\{\{(\w+)\}\}/g, (_, field) => {
      return String(payload[field] ?? "");
    });
  }

  return result;
}
