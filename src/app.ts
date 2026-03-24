import express from "express";
import * as swaggerUi from "swagger-ui-express";
import authRoutes from "./api/auth.routes";
import pipelineRoutes from "./api/pipelines.routes";
import webhookRoutes from "./api/webhooks.routes";
import historyRoutes from "./api/history.routes";
import { swaggerDocument } from "./docs/swagger";
import { globalRateLimit } from "./middleware/rate-limit.middleware";
import metricsRoutes from "./api/metrics.routes";

export const app = express();

app.use(express.json());
app.use(globalRateLimit);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/metrics", metricsRoutes);
app.use("/auth", authRoutes);
app.use("/pipelines", pipelineRoutes);
app.use("/pipelines", webhookRoutes);
app.use("/history", historyRoutes);
