import Holding from "../models/holding.js";
import { getStockPrices } from "../services/stockservice.js";
import { getCryptoPrices, getCoinGeckoIdForHolding } from "../services/cryptoservice.js";
import Transaction from "../models/transaction.js";
import { xirr } from "../services/irrservice.js";

export async function getPortfolioSummary(req, res) {
  try {
    const holdings = await Holding.find({ userId: req.userId }).lean();
    const tx = await Transaction.find({ userId: req.userId }).select("cashFlow date").lean();
    const cashflows = tx.map(t => ({ amount: t.cashFlow, date: t.date }));
    const irr = xirr(cashflows); // decimal
    const stockSymbols = holdings.filter(h => h.type === "stock").map(h => h.symbol);
    const cryptoHoldings = holdings.filter(h => h.type === "crypto");

    const stockPrices = await getStockPrices(stockSymbols);

    // For crypto, we fetch in EUR keyed by CoinGecko id
    const cryptoPricesById = await getCryptoPrices(cryptoHoldings);

    // Build enriched holdings
    let totalValue = 0;
    let totalCost = 0;

    const enriched = [];
    for (const h of holdings) {
      const qty = Number(h.quantity);
      const costBasis = qty * Number(h.avgCost);

      let price = null;
      let priceSourceKey = null;

      if (h.type === "stock") {
        price = stockPrices[String(h.symbol).toUpperCase()] ?? null;
        priceSourceKey = h.symbol;
      } else {
        const id = await getCoinGeckoIdForHolding(h);
        priceSourceKey = id;
        price = id ? (cryptoPricesById[id] ?? null) : null;
      }

      const currentValue = price == null ? null : qty * price;
      const pnl = currentValue == null ? null : currentValue - costBasis;
      const pnlPct = currentValue == null || costBasis === 0 ? null : (pnl / costBasis) * 100;

      if (currentValue != null) totalValue += currentValue;
      totalCost += costBasis;

      enriched.push({
        ...h,
        price,
        priceKey: priceSourceKey,
        costBasis,
        currentValue,
        pnl,
        pnlPct,
      });
    }

    // Allocation %
    const withAllocation = enriched.map(e => ({
      ...e,
      allocationPct: e.currentValue == null || totalValue === 0 ? null : (e.currentValue / totalValue) * 100
    }));

    return res.json({
      totals: {
        totalValue,
        totalCost,
        totalPnl: totalValue - totalCost,
        totalPnlPct: totalCost === 0 ? null : ((totalValue - totalCost) / totalCost) * 100,
      },
      irrAnnualPct: irr == null ? null : irr * 100,
      holdings: withAllocation,
      currency: "EUR",
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to build summary", error: err.message });
  }
}
