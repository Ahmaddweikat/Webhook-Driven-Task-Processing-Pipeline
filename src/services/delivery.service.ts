import { insertDeliveryAttempt } from "../db/queries/run";

const MAX_RETRIES = 3;
const BACKOFF_MS = [1000, 2000, 4000];

export async function deliverToSubscriber(
  runId: string,
  subscriber: { id: string; url: string },
  payload: Record<string, unknown>,
) {
  let lastError = "";
  let httpStatus = 0;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Delivering to ${subscriber.url} attempt ${attempt}`);

      const response = await fetch(subscriber.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      httpStatus = response.status;

      if (response.ok) {
        await insertDeliveryAttempt({
          pipelineRunId: runId,
          subscriberId: subscriber.id,
          attemptNumber: attempt,
          httpStatus,
          status: "success",
        });

        console.log(`Delivered to ${subscriber.url} successfully`);
        return;
      }

      lastError = `HTTP ${httpStatus}`;
    } catch (error: any) {
      lastError = error.message;
      console.error(`Delivery attempt ${attempt} failed:`, lastError);
    }

    // wait before retrying
    if (attempt < MAX_RETRIES) {
      await sleep(BACKOFF_MS[attempt - 1]);
    }
  }

  await insertDeliveryAttempt({
    pipelineRunId: runId,
    subscriberId: subscriber.id,
    attemptNumber: MAX_RETRIES,
    httpStatus,
    errorMessage: lastError,
    status: "failed",
  });

  console.error(
    `Failed to deliver to ${subscriber.url} after ${MAX_RETRIES} attempts`,
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
