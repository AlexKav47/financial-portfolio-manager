import Holding from "../models/holding.js";

export async function listHoldings(req, res) {
  const holdings = await Holding.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(holdings);
}

export async function createHolding(req, res) {
  const { type, symbol, quantity, avgCost } = req.body;

  if (!type || !symbol || quantity == null || avgCost == null) {
    return res.status(400).json({ message: "type, symbol, quantity, avgCost are required" });
  }

  try {
    const holding = await Holding.create({
      userId: req.userId,
      type,
      symbol: symbol.toUpperCase(),
      quantity: Number(quantity),
      avgCost: Number(avgCost),
    });

    return res.status(201).json(holding);
  } catch (err) {
    // duplicate unique index
    if (err.code === 11000) {
      return res.status(409).json({ message: "Holding already exists for this user" });
    }
    return res.status(500).json({ message: "Failed to create holding", error: err.message });
  }
}

export async function updateHolding(req, res) {
  const { id } = req.params;

  const holding = await Holding.findOneAndUpdate(
    { _id: id, userId: req.userId },
    { $set: req.body },
    { new: true }
  );

  if (!holding) return res.status(404).json({ message: "Holding not found" });
  res.json(holding);
}

export async function deleteHolding(req, res) {
  const { id } = req.params;

  const result = await Holding.findOneAndDelete({ _id: id, userId: req.userId });
  if (!result) return res.status(404).json({ message: "Holding not found" });

  res.json({ message: "Deleted" });
}
