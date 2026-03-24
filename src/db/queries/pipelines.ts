import { db } from "../client";
import { pipelines, subscribers } from "../schema";
import { eq } from "drizzle-orm";

export async function insertPipeline(data: {
  name: string;
  description?: string;
  sourceUrl: string;
  actionType: string;
  actionConfig: object;
}) {
  const [pipeline] = await db.insert(pipelines).values(data).returning();
  return pipeline;
}

export async function insertSubscribers(pipelineId: string, urls: string[]) {
  const values = urls.map((url) => ({ pipelineId, url }));
  return await db.insert(subscribers).values(values).returning();
}

export async function findAllPipelines() {
  return await db.select().from(pipelines);
}

export async function findPipelineById(id: string) {
  const [pipeline] = await db
    .select()
    .from(pipelines)
    .where(eq(pipelines.id, id));
  return pipeline;
}

export async function findSubscribersByPipelineId(pipelineId: string) {
  return await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.pipelineId, pipelineId));
}

export async function updatePipelineById(
  id: string,
  data: {
    name?: string;
    description?: string;
    actionType?: string;
    actionConfig?: object;
    status?: string;
  },
) {
  const [pipeline] = await db
    .update(pipelines)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pipelines.id, id))
    .returning();
  return pipeline;
}

export async function deletePipelineById(id: string) {
  await db.delete(pipelines).where(eq(pipelines.id, id));
}

export async function deleteSubscribersByPipelineId(pipelineId: string) {
  await db.delete(subscribers).where(eq(subscribers.pipelineId, pipelineId));
}
