import { db } from "../client";
import { pipelineRuns, deliveryAttempts } from "../schema";
import { eq, and } from "drizzle-orm";

export async function findPendingRuns() {
  return await db
    .select()
    .from(pipelineRuns)
    .where(eq(pipelineRuns.status, "pending"))
    .limit(10);
}

export async function updateRunStatus(
  id: string,
  status: string,
  data?: {
    outputPayload?: object;
    errorMessage?: string;
  },
) {
  const [run] = await db
    .update(pipelineRuns)
    .set({
      status,
      ...data,
      completedAt:
        status === "done" || status === "failed" ? new Date() : undefined,
    })
    .where(eq(pipelineRuns.id, id))
    .returning();
  return run;
}

export async function insertDeliveryAttempt(data: {
  pipelineRunId: string;
  subscriberId: string;
  attemptNumber: number;
  httpStatus?: number;
  errorMessage?: string;
  status: string;
}) {
  const [attempt] = await db.insert(deliveryAttempts).values(data).returning();
  return attempt;
}

export async function findRunsByUserId(userId: string) {
  return await db
    .select()
    .from(pipelineRuns)
    .where(eq(pipelineRuns.userId, userId));
}

export async function findRunById(id: string) {
  const [run] = await db
    .select()
    .from(pipelineRuns)
    .where(eq(pipelineRuns.id, id));
  return run;
}

export async function findDeliveryAttemptsByRunId(runId: string) {
  return await db
    .select()
    .from(deliveryAttempts)
    .where(eq(deliveryAttempts.pipelineRunId, runId));
}

export async function insertRun(data: {
  userId: string;
  pipelineId: string;
  inputPayload: object;
}) {
  const [run] = await db
    .insert(pipelineRuns)
    .values({
      userId: data.userId,
      pipelineId: data.pipelineId,
      inputPayload: data.inputPayload,
      status: "pending",
    })
    .returning();
  return run;
}
