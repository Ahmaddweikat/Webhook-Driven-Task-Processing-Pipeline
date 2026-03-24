import express from "express";
import authRoutes from "./api/auth.routes";
import pipelineRoutes from "./api/pipelines.routes";
import webhookRoutes from "./api/webhooks.routes";
import historyRoutes from "./api/history.routes";

export const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/pipelines", pipelineRoutes);
app.use("/pipelines", webhookRoutes);
app.use("/history", historyRoutes);
