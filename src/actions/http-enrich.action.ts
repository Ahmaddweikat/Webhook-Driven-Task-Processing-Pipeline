export async function httpEnrichAction(
  payload: Record<string, unknown>,
  config: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { url, method, mergeKey } = config as {
    url: string;
    method: "GET" | "POST";
    mergeKey: string;
  };

  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (method === "POST") {
    options.body = JSON.stringify(payload);
  }

  const resolvedUrl = url.replace(/\{\{(\w+)\}\}/g, (_, field) => {
    return String(payload[field] ?? "");
  });

  const response = await fetch(resolvedUrl, options);

  if (!response.ok) {
    throw new Error(`HTTP enrich failed: ${response.status}`);
  }

  const data = await response.json();

  return {
    ...payload,
    [mergeKey]: data,
  };
}
