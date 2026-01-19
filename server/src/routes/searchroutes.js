import express from "express";
import { searchAssets } from "../controllers/searchController.js";
import { getLastPrice } from "../controllers/priceController.js";

const router = express.Router();

// Because this router is mounted at /api/search
router.get("/", searchAssets);

// Because this router is mounted at /api/search
router.get("/prices/last", getLastPrice);

export default router;
