import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listTransactions, createTransaction, deleteTransaction } from "../controllers/transactionController.js";

const router = Router();

router.use(requireAuth);

router.get("/", listTransactions);
router.post("/", createTransaction);
router.delete("/:id", deleteTransaction);

export default router;
