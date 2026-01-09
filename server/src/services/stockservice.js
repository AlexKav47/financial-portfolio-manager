import yahooFinance from "yahoo-finance2";
import { cacheGet, cacheSet } from "../utils/cache.js";

const TTL_MS = Number(process.env.PRICE_CACHE_TTL_MS || 60000);

export async function getStockPrices(symbols) {
  const results = {};
  const toFetch = [];

  for (const raw of symbols) {
    const symbol = String(raw).toUpperCase();
    const key = `stock:${symbol}`;
    const cached = cacheGet(key);
    if (cached != null) results[symbol] = cached;
    else toFetch.push(symbol);
  }

  // Fetch sequentially to be safe with rate limits; we can parallelise later.
  for (const symbol of toFetch) {
    try {
      const quote = await yahooFinance.quote(symbol);
      const price = quote?.regularMarketPrice ?? null;
      results[symbol] = price;
      cacheSet(`stock:${symbol}`, price, TTL_MS);
    } catch {
      results[symbol] = null;
    }
  }

  return results; // { AAPL: 123.45, ... }
}
