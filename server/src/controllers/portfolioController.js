import Holding from "../models/holding.js";
import { getLastClosePrices } from "../services/stockservice.js";
import { getCryptoPrices, getCoinGeckoIdForHolding } from "../services/cryptoservice.js";
import Transaction from "../models/transaction.js";
import { xirr } from "../services/irrservice.js";

export async function getPortfolioSummary(req, res) {
  try {
    // Retrieve user holdings and transaction history for performance metrics
    const holdings = await Holding.find({ userId: req.userId }).lean();
    const tx = await Transaction.find({ userId: req.userId })
      .select("cashFlow date")
      .lean();

    // Calculate Internal Rate of Return based on historical cash flows
    const cashflows = tx.map((t) => ({ amount: t.cashFlow, date: t.date }));
    const irr = xirr(cashflows);

    // Extract unique stock symbols and normalize to uppercase for API compatibility
    const stockSymbols = [
      ...new Set(
        holdings
          .filter((h) => h.type === "stock" && h.symbol)
          .map((h) => String(h.symbol).toUpperCase())
      ),
    ];

    const cryptoHoldings = holdings.filter((h) => h.type === "crypto");

    // Map CoinGecko IDs to crypto holdings to handle legacy data lacking explicit IDs
    const cryptoIdByHoldingId = new Map();
    await Promise.all(
      cryptoHoldings.map(async (h) => {
        const hid = String(h._id);
        let id = h.cgId ? String(h.cgId) : null;
        if (!id) {
          try {
            id = await getCoinGeckoIdForHolding(h);
          } catch {
            id = null;
          }
        }
        cryptoIdByHoldingId.set(hid, id);
      })
    );

    // Fetch batch prices for stocks from Stooq and crypto from CoinGecko
    const stockPrices = await getLastClosePrices(stockSymbols);
    const cryptoPricesById = await getCryptoPrices(cryptoHoldings);

    let totalValue = 0;
    let totalCost = 0;

    // Process each holding to calculate current valuation and performance gain/loss
    const enriched = holdings.map((h) => {
      const qty = Number(h.quantity || 0);
      const avg = Number(h.avgCost || 0);
      const costBasis = qty * avg;

      let price = null;
      let priceSourceKey = null;

      // Select appropriate price source based on asset classification
      if (h.type === "stock") {
        const sym = String(h.symbol || "").toUpperCase();
        priceSourceKey = sym;
        price = stockPrices?.[sym] ?? null;
      } else if (h.type === "crypto") {
        const id = cryptoIdByHoldingId.get(String(h._id)) || null;
        priceSourceKey = id;
        price = id ? (cryptoPricesById?.[id] ?? null) : null;
      }

      const currentValue = price == null ? null : qty * Number(price);
      const pnl = currentValue == null ? null : currentValue - costBasis;
      const pnlPct =
        currentValue == null || costBasis === 0 ? null : (pnl / costBasis) * 100;

      // Increment aggregate portfolio totals
      if (currentValue != null) totalValue += currentValue;
      totalCost += costBasis;

      return {
        ...h,
        price,
        priceKey: priceSourceKey,
        costBasis,
        currentValue,
        pnl,
        pnlPct,
      };
    });

    // Determine the percentage weight of each asset within the total portfolio value
    const withAllocation = enriched.map((e) => ({
      ...e,
      allocationPct:
        totalValue > 0 && e.currentValue != null ? (e.currentValue / totalValue) * 100 : 0,
    }));

    // Return comprehensive summary including global totals and individual asset performance
    return res.json({
      totals: {
        totalValue,
        totalCost,
        totalPnl: totalValue - totalCost,
        totalPnlPct:
          totalCost === 0 ? null : ((totalValue - totalCost) / totalCost) * 100,
      },
      irrAnnualPct: irr == null ? null : irr * 100,
      holdings: withAllocation,
      currency: "EUR",
      lastUpdated: new Date().toISOString(),
      pricingMode: "historical_last_close_and_last_daily",
    });
  } catch (err) {
    // Handle unexpected errors during the data enrichment process
    return res.status(500).json({
      message: "Failed to build summary",
      error: err.message,
    });
  }
}