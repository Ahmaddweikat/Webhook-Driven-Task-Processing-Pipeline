import { db } from "../client";
import { pipelines, pipelineRuns, deliveryAttempts } from "../schema";
import { eq, sql } from "drizzle-orm";

export async function getTotalPipelines() {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(pipelines);
  return Number(result.count);
}

export async function getTotalRuns() {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(pipelineRuns);
  return Number(result.count);
}

export async function getRunsByStatus() {
  const results = await db
    .select({
      status: pipelineRuns.status,
      count: sql<number>`count(*)`,
    })
    .from(pipelineRuns)
    .groupBy(pipelineRuns.status);
  return results;
}

export async function getAverageProcessingTime() {
  const [result] = await db
    .select({
      avg: sql<number>`
        AVG(EXTRACT(EPOCH FROM (completed_at - triggered_at)))
      `,
    })
    .from(pipelineRuns)
    .where(eq(pipelineRuns.status, "done"));
  return result.avg ? Number(result.avg).toFixed(2) : "0";
}

export async function getDeliveryStats() {
  const results = await db
    .select({
      status: deliveryAttempts.status,
      count: sql<number>`count(*)`,
    })
    .from(deliveryAttempts)
    .groupBy(deliveryAttempts.status);
  return results;
}

export async function getRunsPerPipeline() {
  const results = await db
    .select({
      pipelineId: pipelineRuns.pipelineId,
      name: pipelines.name,
      count: sql<number>`count(*)`,
    })
    .from(pipelineRuns)
    .leftJoin(pipelines, eq(pipelineRuns.pipelineId, pipelines.id))
    .groupBy(pipelineRuns.pipelineId, pipelines.name);
  return results;
}
