import { Router } from "express";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/pipeline.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getAll);
router.get("/:id", getOne);
router.post("/", adminMiddleware, create);
router.put("/:id", adminMiddleware, update);
router.delete("/:id", adminMiddleware, remove);

export default router;
