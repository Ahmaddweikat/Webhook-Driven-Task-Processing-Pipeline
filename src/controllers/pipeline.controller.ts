import { Response } from "express";
import { AuthRequest } from "../types";
import {
  createPipeline,
  getAllPipelines,
  getPipelineById,
  updatePipeline,
  deletePipeline,
} from "../services/pipeline.service";

export async function create(req: AuthRequest, res: Response) {
  try {
    const { name, description, actionType, actionConfig, subscriberUrls } =
      req.body;
    if (!name || !actionType || !actionConfig || !subscriberUrls) {
      res.status(400).json({
        error: "name, actionType, actionConfig and subscriberUrls are required",
      });
      return;
    }
    const pipeline = await createPipeline({
      name,
      description,
      actionType,
      actionConfig,
      subscriberUrls,
    });
    res.status(201).json(pipeline);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAll(req: AuthRequest, res: Response) {
  try {
    const pipelines = await getAllPipelines();
    res.status(200).json(pipelines);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getOne(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const pipeline = await getPipelineById(id);
    res.status(200).json(pipeline);
  } catch (error: any) {
    if (error.message === "Pipeline not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: error.message });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const pipeline = await updatePipeline(id, req.body);
    res.status(200).json(pipeline);
  } catch (error: any) {
    if (error.message === "Pipeline not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: error.message });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    await deletePipeline(id);
    res.status(200).json({ message: "Pipeline deleted successfully" });
  } catch (error: any) {
    if (error.message === "Pipeline not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: error.message });
  }
}
