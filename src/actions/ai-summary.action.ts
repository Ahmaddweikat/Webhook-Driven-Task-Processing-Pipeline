import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config";

const client = new Anthropic({ apiKey: config.anthropicApiKey });

export async function aiSummaryAction(
  payload: Record<string, unknown>,
  _config: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `Summarize this webhook payload in one clear sentence for a non-technical user:\n\n${JSON.stringify(payload, null, 2)}`,
      },
    ],
  });

  const summary =
    response.content[0].type === "text" ? response.content[0].text : "";

  return {
    ...payload,
    ai_summary: summary,
  };
}
