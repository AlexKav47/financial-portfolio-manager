import Holding from "../models/holding.js";

/**
 * Read, get all assets for the logged-in user
 * Sort by createdAt so the newest additions appear first
 */
export async function listHoldings(req, res) {
  const holdings = await Holding.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(holdings);
}

/**
 * Create, add a new stock or crypto to the database
 */
export async function createHolding(req, res) {
  const { type, symbol, quantity, avgCost } = req.body;

  // Basic Validation, ensure no fields are empty
  if (!type || !symbol || quantity == null || avgCost == null) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Save to DB, force the symbol to Uppercase 'btc' -> 'BTC'
    const holding = await Holding.create({
      userId: req.userId,
      type,
      symbol: symbol.toUpperCase(),
      quantity: Number(quantity),
      avgCost: Number(avgCost),
    });

    return res.status(201).json(holding);
  } catch (err) {
    // Error Handling, catch if user tries to add the same symbol twice
    if (err.code === 11000) {
      return res.status(409).json({ message: "You already have this asset in your list" });
    }
    return res.status(500).json({ message: "Server error during creation" });
  }
}

/**
 * Update, change details of an existing asset 
 * { new: true } ensures the response contains the updated data, not the old version
 */
export async function updateHolding(req, res) {
  const { id } = req.params;

  const holding = await Holding.findOneAndUpdate(
    { _id: id, userId: req.userId }, // Security, must own the holding to edit it
    { $set: req.body },
    { new: true }
  );

  if (!holding) return res.status(404).json({ message: "Asset not found" });
  res.json(holding);
}

/**
 * Delete, remove an asset from the portfolio
 */
export async function deleteHolding(req, res) {
  const { id } = req.params;

  const result = await Holding.findOneAndDelete({ _id: id, userId: req.userId });
  if (!result) return res.status(404).json({ message: "Asset not found" });

  res.json({ message: "Deleted successfully" });
}
