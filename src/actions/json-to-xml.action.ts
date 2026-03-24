export async function jsonToXmlAction(
  payload: Record<string, unknown>,
  _config: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const toXml = (obj: Record<string, unknown>, rootTag = "root"): string => {
    const convert = (data: unknown, tag: string): string => {
      if (data === null || data === undefined) {
        return `<${tag}></${tag}>`;
      }

      if (Array.isArray(data)) {
        return data.map((item) => convert(item, "item")).join("");
      }

      if (typeof data === "object") {
        const inner = Object.entries(data as Record<string, unknown>)
          .map(([key, value]) => convert(value, key))
          .join("");
        return `<${tag}>${inner}</${tag}>`;
      }

      return `<${tag}>${data}</${tag}>`;
    };

    return `<?xml version="1.0" encoding="UTF-8"?>${convert(obj, rootTag)}`;
  };

  const xml = toXml(payload);

  return {
    ...payload,
    xml_output: xml,
  };
}
