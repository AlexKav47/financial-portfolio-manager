import Snapshot from "../models/snapshot.js";
import Holding from "../models/holding.js";
import { getStockPrices } from "../services/stockservice.js";
import { getCryptoPrices, getCoinGeckoIdForHolding } from "../services/cryptoservice.js";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function createSnapshot(req, res) {
  try {
    const holdings = await Holding.find({ userId: req.userId }).lean();

    const stockSymbols = holdings.filter(h => h.type === "stock").map(h => h.symbol);
    const cryptoHoldings = holdings.filter(h => h.type === "crypto");

    const stockPrices = await getStockPrices(stockSymbols);
    const cryptoPricesById = await getCryptoPrices(cryptoHoldings);

    let totalValue = 0;

    for (const h of holdings) {
      const qty = Number(h.quantity);

      if (h.type === "stock") {
        const p = stockPrices[String(h.symbol).toUpperCase()] ?? null;
        if (p != null) totalValue += qty * p;
      } else {
        const id = await getCoinGeckoIdForHolding(h);
        const p = id ? (cryptoPricesById[id] ?? null) : null;
        if (p != null) totalValue += qty * p;
      }
    }

    const day = startOfDay(new Date());

    const snap = await Snapshot.findOneAndUpdate(
      { userId: req.userId, date: day },
      { $set: { totalValue, currency: "EUR" } },
      { upsert: true, new: true }
    );

    res.status(201).json(snap);
  } catch (err) {
    res.status(500).json({ message: "Failed to create snapshot", error: err.message });
  }
}

export async function listSnapshots(req, res) {
  const days = Number(req.query.days || 90);
  const from = new Date();
  from.setDate(from.getDate() - days);

  const snaps = await Snapshot.find({ userId: req.userId, date: { $gte: startOfDay(from) } })
    .sort({ date: 1 })
    .lean();

  res.json(snaps);
}
