type Operator = "==" | "!=" | ">" | "<" | ">=" | "<=";

export async function conditionalFilterAction(
  payload: Record<string, unknown>,
  config: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { field, operator, value } = config as {
    field: string;
    operator: Operator;
    value: unknown;
  };

  const actual = payload[field];
  let passes = false;

  switch (operator) {
    case "==":
      passes = actual == value;
      break;
    case "!=":
      passes = actual != value;
      break;
    case ">":
      passes = (actual as number) > (value as number);
      break;
    case "<":
      passes = (actual as number) < (value as number);
      break;
    case ">=":
      passes = (actual as number) >= (value as number);
      break;
    case "<=":
      passes = (actual as number) <= (value as number);
      break;
  }

  if (!passes) {
    throw new Error(`Condition not met: ${field} ${operator} ${value}`);
  }

  return payload;
}
