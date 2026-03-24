export async function fieldRenameAction(
  payload: Record<string, unknown>,
  config: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { remove } = config as { remove: string[] };
  const result = { ...payload };
  for (const field of remove) {
    delete result[field];
  }
  return result;
}
