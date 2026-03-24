import { Response } from "express";
import { AuthRequest } from "../types";
import { triggerPipeline } from "../services/run.service";

export async function trigger(req: AuthRequest, res: Response) {
  try {
    const pipelineId = req.params.id as string;
    const userId = req.user!.userId;
    const payload = req.body;

    if (!payload || Object.keys(payload).length === 0) {
      res.status(400).json({ error: "Payload is required" });
      return;
    }

    const run = await triggerPipeline(userId, pipelineId, payload);

    res.status(202).json({
      message: "Pipeline triggered successfully",
      runId: run.id,
      status: run.status,
    });
  } catch (error: any) {
    if (error.message === "Pipeline not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: error.message });
  }
}
