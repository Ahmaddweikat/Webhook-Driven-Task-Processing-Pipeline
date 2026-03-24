import { Response } from "express";
import { AuthRequest } from "../types";
import { getMetrics } from "../services/metrics.service";

export async function metrics(req: AuthRequest, res: Response) {
  try {
    const data = await getMetrics();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
