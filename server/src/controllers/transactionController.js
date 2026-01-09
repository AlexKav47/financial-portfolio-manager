import Transaction from "../models/transaction.js";

function computeCashFlow(body) {
  const { kind } = body;

  if (kind === "deposit") {
    const amt = Number(body.amount);
    if (!Number.isFinite(amt) || amt <= 0) throw new Error("Deposit amount must be > 0");
    return amt; // money in
  }

  if (kind === "withdrawal") {
    const amt = Number(body.amount);
    if (!Number.isFinite(amt) || amt <= 0) throw new Error("Withdrawal amount must be > 0");
    return -amt; // money out
  }

  // buy/sell
  const qty = Number(body.quantity);
  const price = Number(body.price);
  const fees = Number(body.fees || 0);

  if (!Number.isFinite(qty) || qty <= 0) throw new Error("Quantity must be > 0");
  if (!Number.isFinite(price) || price <= 0) throw new Error("Price must be > 0");
  if (!Number.isFinite(fees) || fees < 0) throw new Error("Fees must be >= 0");

  const gross = qty * price;

  if (kind === "buy") return -(gross + fees);
  if (kind === "sell") return +(gross - fees);

  throw new Error("Invalid transaction kind");
}

export async function listTransactions(req, res) {
  const tx = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
  res.json(tx);
}

export async function createTransaction(req, res) {
  try {
    const { kind, assetType, symbol, quantity, price, fees, amount, date } = req.body;

    if (!kind) return res.status(400).json({ message: "kind is required" });
    if (!date) return res.status(400).json({ message: "date is required" });

    // Basic validation for buy/sell asset metadata
    if ((kind === "buy" || kind === "sell")) {
      if (!assetType || !symbol) {
        return res.status(400).json({ message: "assetType and symbol are required for buy/sell" });
      }
    }

    const cashFlow = computeCashFlow(req.body);

    const created = await Transaction.create({
      userId: req.userId,
      kind,
      assetType: assetType || null,
      symbol: symbol ? String(symbol).toUpperCase() : null,
      quantity: quantity ?? null,
      price: price ?? null,
      fees: fees ?? 0,
      amount: amount ?? null,
      cashFlow,
      date: new Date(date),
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: "Invalid transaction", error: err.message });
  }
}

export async function deleteTransaction(req, res) {
  const deleted = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!deleted) return res.status(404).json({ message: "Transaction not found" });
  res.json({ message: "Deleted" });
}
