import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listHoldings, createHolding, updateHolding, deleteHolding } from "../controllers/holdingController.js";

const router = Router();

router.use(requireAuth);

router.get("/", listHoldings);
router.post("/", createHolding);
router.put("/:id", updateHolding);
router.delete("/:id", deleteHolding);

export default router;
