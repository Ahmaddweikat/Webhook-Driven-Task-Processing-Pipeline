import {
  findPendingRuns,
  updateRunStatus,
  insertDeliveryAttempt,
} from "../db/queries/run";
import {
  findPipelineById,
  findSubscribersByPipelineId,
} from "../db/queries/pipelines";
import { actions } from "../actions";
import { deliverToSubscriber } from "../services/delivery.service";

export async function processNextJobs() {
  const runs = await findPendingRuns();

  if (runs.length === 0) return;

  console.log(`Found ${runs.length} pending runs`);

  for (const run of runs) {
    await processRun(run);
  }
}

async function processRun(run: any) {
  console.log(`Processing run: ${run.id}`);

  await updateRunStatus(run.id, "processing");

  try {
    const pipeline = await findPipelineById(run.pipelineId);
    if (!pipeline) throw new Error("Pipeline not found");

    const action = actions[pipeline.actionType];
    if (!action) throw new Error(`Unknown action type: ${pipeline.actionType}`);

    const outputPayload = await action(
      run.inputPayload as Record<string, unknown>,
      pipeline.actionConfig as Record<string, unknown>,
    );

    await updateRunStatus(run.id, "done", { outputPayload });

    console.log(`Run ${run.id} completed successfully`);

    const subscribers = await findSubscribersByPipelineId(pipeline.id);
    for (const subscriber of subscribers) {
      await deliverToSubscriber(run.id, subscriber, outputPayload);
    }
  } catch (error: any) {
    console.error(`Run ${run.id} failed:`, error.message);
    await updateRunStatus(run.id, "failed", { errorMessage: error.message });
  }
}
