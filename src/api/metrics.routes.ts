import { Router } from "express";
import { metrics } from "../controllers/metrics.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, metrics);

export default router;
