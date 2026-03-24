import { randomUUID } from "crypto";
import {
  insertPipeline,
  insertSubscribers,
  findAllPipelines,
  findPipelineById,
  findSubscribersByPipelineId,
  updatePipelineById,
  deletePipelineById,
  deleteSubscribersByPipelineId,
} from "../db/queries/pipelines";

export async function createPipeline(data: {
  name: string;
  description?: string;
  actionType: string;
  actionConfig: object;
  subscriberUrls: string[];
}) {
  const sourceUrl = `webhooks/${randomUUID()}`;

  const pipeline = await insertPipeline({
    name: data.name,
    description: data.description,
    sourceUrl,
    actionType: data.actionType,
    actionConfig: data.actionConfig,
  });

  const subs = await insertSubscribers(pipeline.id, data.subscriberUrls);

  return { ...pipeline, subscribers: subs };
}

export async function getAllPipelines() {
  return await findAllPipelines();
}

export async function getPipelineById(id: string) {
  const pipeline = await findPipelineById(id);
  if (!pipeline) return null;

  const subs = await findSubscribersByPipelineId(id);
  return { ...pipeline, subscribers: subs };
}

export async function updatePipeline(
  id: string,
  data: {
    name?: string;
    description?: string;
    actionType?: string;
    actionConfig?: object;
    status?: string;
    subscriberUrls?: string[];
  },
) {
  const pipeline = await findPipelineById(id);
  if (!pipeline) return null;

  const updated = await updatePipelineById(id, data);

  if (data.subscriberUrls) {
    await deleteSubscribersByPipelineId(id);
    await insertSubscribers(id, data.subscriberUrls);
  }

  const subs = await findSubscribersByPipelineId(id);
  return { ...updated, subscribers: subs };
}

export async function deletePipeline(id: string) {
  const pipeline = await findPipelineById(id);
  if (!pipeline) return null;

  await deletePipelineById(id);
  return true;
}
