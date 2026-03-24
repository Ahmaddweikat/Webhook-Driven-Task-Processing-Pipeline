import { Response } from "express";
import { AuthRequest } from "../types";
import {
  createPipeline,
  getAllPipelines,
  getPipelineById,
  updatePipeline,
  deletePipeline,
} from "../services/pipeline.service";

const VALID_ACTION_TYPES = [
  "field_filter",
  "field_rename",
  "enrich",
  "ai_summary",
  "conditional_filter",
  "template_transform",
  "http_enrich",
  "json_to_xml",
];

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

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

    if (!VALID_ACTION_TYPES.includes(actionType)) {
      res.status(400).json({
        error: `Invalid actionType. Must be one of: ${VALID_ACTION_TYPES.join(", ")}`,
      });
      return;
    }

    const urls = Array.isArray(subscriberUrls)
      ? subscriberUrls
      : [subscriberUrls];
    for (const url of urls) {
      if (!isValidUrl(url)) {
        res.status(400).json({ error: `Invalid subscriber URL: ${url}` });
        return;
      }
    }

    if (urls.length === 0) {
      res
        .status(400)
        .json({ error: "At least one subscriber URL is required" });
      return;
    }

    const pipeline = await createPipeline({
      name,
      description,
      actionType,
      actionConfig,
      subscriberUrls,
    });
    res.status(201).json({
      message: "Pipeline created successfully",
      pipeline,
    });
  } catch (error: any) {
    if (error.code === "23505") {
      res.status(409).json({ error: "Pipeline name already exists" });
      return;
    }
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
