import { findPipelineById } from "../db/queries/pipelines";
import { insertRun } from "../db/queries/run";

export async function triggerPipeline(
  userId: string,
  pipelineId: string,
  payload: object,
) {
  const pipeline = await findPipelineById(pipelineId);
  if (!pipeline) throw new Error("Pipeline not found");
  if (pipeline.status !== "active") throw new Error("Pipeline is not active");

  const run = await insertRun({
    userId,
    pipelineId,
    inputPayload: payload,
  });

  return run;
}
