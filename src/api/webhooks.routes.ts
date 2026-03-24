import { Router } from "express";
import { trigger } from "../controllers/webhooks.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { triggerRateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

router.post("/:id/run", authMiddleware, triggerRateLimit, trigger);

export default router;
