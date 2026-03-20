import { Router } from "express";
import {
  getUserHistory,
  getRunById,
  getRunDeliveries,
} from "../controllers/history.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getUserHistory);
router.get("/:id", getRunById);
router.get("/:id/deliveries", getRunDeliveries);

export default router;
