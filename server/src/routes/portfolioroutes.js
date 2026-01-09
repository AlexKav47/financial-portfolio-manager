import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getPortfolioSummary } from "../controllers/portfolioController.js";

const router = Router();

router.use(requireAuth);
router.get("/summary", getPortfolioSummary);

export default router;
