import { Router } from "express";
import { trigger } from "../controllers/webhooks.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/:id/run", authMiddleware, trigger);

export default router;
