import { cacheGet, cacheSet } from "../utils/cache.js";

// Duration to persist historical daily prices in the local cache
const PRICE_TTL_MS = 24 * 60 * 60 * 1000;

// Static lookup table for immediate resolution of high-volume assets
const SYMBOL_TO_ID = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  ADA: "cardano",
  XRP: "ripple",
  DOGE: "dogecoin",
};

// Convert asset symbols into unique CoinGecko identifiers via static map or API search
export async function resolveCoinGeckoId(symbol) {
  const upper = String(symbol).toUpperCase();
  if (SYMBOL_TO_ID[upper]) return SYMBOL_TO_ID[upper];

  const key = `cg:resolve:${upper}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(upper)}`;
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return null;

    const data = await res.json();
    const first = data?.coins?.[0];
    const id = first?.id ?? null;

    if (id) cacheSet(key, id, 24 * 60 * 60 * 1000);
    return id;
  } catch {
    return null;
  }
}

// Retrieve the most recent daily data point from the market chart endpoint
async function fetchLastDailyFromMarketChart(cgId) {
  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(
    cgId
  )}/market_chart?vs_currency=eur&days=30`;

  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) {
    // Return null on failure to allow the orchestration layer to handle missing data
    return null;
  }

  const data = await res.json();
  const prices = data?.prices; // Expects array of [timestamp, price] pairs
  if (!Array.isArray(prices) || prices.length === 0) return null;

  const last = prices[prices.length - 1];
  const price = Array.isArray(last) ? Number(last[1]) : null;

  return Number.isFinite(price) ? price : null;
}

// Batch processor for fetching multiple crypto prices with built-in concurrency limiting
export async function getLastDailyCryptoPrices(cgIds = []) {
  const out = {};
  const unique = [...new Set((cgIds || []).map((id) => String(id)).filter(Boolean))];

  const toFetch = [];
  for (const id of unique) {
    const key = `cg:lastdaily:${id}`;
    const cached = cacheGet(key);
    if (cached != null) out[id] = cached;
    else toFetch.push(id);
  }

  // Limit simultaneous outgoing requests to prevent IP-based rate limiting
  const CONCURRENCY = 3;
  let idx = 0;

  async function worker() {
    while (idx < toFetch.length) {
      const id = toFetch[idx++];
      const key = `cg:lastdaily:${id}`;

      try {
        const price = await fetchLastDailyFromMarketChart(id);
        out[id] = price;
        cacheSet(key, price, PRICE_TTL_MS);
      } catch {
        out[id] = null;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, toFetch.length) }, worker));
  return out;
}

// Orchestrator to map diverse holdings to CoinGecko IDs and fetch corresponding prices
export async function getCryptoPrices(holdings) {
  const ids = [];

  for (const h of holdings || []) {
    const cgId = h?.cgId ? String(h.cgId) : null;
    if (cgId) ids.push(cgId);
    else {
      const id = await resolveCoinGeckoId(h?.symbol);
      if (id) ids.push(id);
    }
  }

  const uniqueIds = [...new Set(ids)];
  return getLastDailyCryptoPrices(uniqueIds);
}

// Helper utility to retrieve the specific CoinGecko API identifier for a given holding
export async function getCoinGeckoIdForHolding(h) {
  return h?.cgId ? String(h.cgId) : await resolveCoinGeckoId(h?.symbol);
}