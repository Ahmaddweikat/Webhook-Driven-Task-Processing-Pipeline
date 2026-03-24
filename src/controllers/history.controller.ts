import { Response } from "express";
import { AuthRequest } from "../types";
import {
  findRunsByUserId,
  findRunById,
  findDeliveryAttemptsByRunId,
} from "../db/queries/run";

export async function getUserHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const runs = await findRunsByUserId(userId);
    res.status(200).json(runs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getRunById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const run = await findRunById(id);

    if (!run) {
      res.status(404).json({ error: "Run not found" });
      return;
    }

    if (run.userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.status(200).json(run);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getRunDeliveries(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const run = await findRunById(id);

    if (!run) {
      res.status(404).json({ error: "Run not found" });
      return;
    }

    if (run.userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const deliveries = await findDeliveryAttemptsByRunId(id);
    res.status(200).json(deliveries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
