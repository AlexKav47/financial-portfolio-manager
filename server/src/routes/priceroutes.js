import express from "express";
import { getLastPrice } from "../controllers/priceController.js";

const router = express.Router();

// GET /api/prices/last?type=stock&symbol=MSFT
// GET /api/prices/last?type=crypto&cgId=bitcoin
router.get("/last", getLastPrice);

export default router;
