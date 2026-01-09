import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createSnapshot, listSnapshots } from "../controllers/snapshotController.js";

const router = Router();

router.use(requireAuth);
router.post("/", createSnapshot);
router.get("/", listSnapshots);

export default router;
