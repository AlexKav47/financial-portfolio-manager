import { getLastClosePrices } from "../services/stockservice.js";
import { getLastDailyCryptoPrices } from "../services/cryptoservice.js";

/**
 * GET /prices/last?type=stock&symbol=MSFT
 * GET /prices/last?type=crypto&cgId=ripple
 */
export async function getLastPrice(req, res) {
  try {
    // Normalize and validate the asset category from query parameters
    const type = String(req.query.type || "").toLowerCase();

    if (type !== "stock" && type !== "crypto") {
      return res.status(400).json({ message: "Invalid type. Use stock or crypto." });
    }

    // Logic for retrieving historical equity prices
    if (type === "stock") {
      const symbol = String(req.query.symbol || "").trim().toUpperCase();
      if (!symbol) return res.status(400).json({ message: "Missing symbol" });

      // Request current market closing data from the Stooq service
      const prices = await getLastClosePrices([symbol]);
      const price = prices[symbol] ?? null;

      return res.json({
        type,
        key: symbol,
        price,
        asOf: new Date().toISOString(),
        source: "stooq",
      });
    }

    // Logic for retrieving historical cryptocurrency prices
    const cgId = String(req.query.cgId || "").trim();
    if (!cgId) return res.status(400).json({ message: "Missing cgId" });

    // Request the most recent daily price point from the CoinGecko service
    const prices = await getLastDailyCryptoPrices([cgId]);
    const price = prices[cgId] ?? null;

    return res.json({
      type,
      key: cgId,
      price,
      asOf: new Date().toISOString(),
      source: "coingecko_market_chart",
    });
  } catch (err) {
    // Catch and report service-level failures or network errors
    return res.status(500).json({ message: "Failed to fetch last price", error: err.message });
  }
}