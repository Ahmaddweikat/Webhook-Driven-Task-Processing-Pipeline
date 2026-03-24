import express from "express";
import authRoutes from "./api/auth.routes";
import pipelineRoutes from "./api/pipelines.routes";

export const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/pipelines", pipelineRoutes);
