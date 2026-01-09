import { cacheGet, cacheSet } from "../utils/cache.js";

const TTL_MS = 60_000; // 1 minute cache

// Minimal symbol->id fallback map (covers common cases)
const SYMBOL_TO_ID = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  ADA: "cardano",
  XRP: "ripple",
  DOGE: "dogecoin",
};

// Resolve a symbol to a CoinGecko id (best effort)
async function resolveCoinGeckoId(symbol) {
  const upper = String(symbol).toUpperCase();

  if (SYMBOL_TO_ID[upper]) return SYMBOL_TO_ID[upper];

  // Cache resolution results
  const key = `cg:resolve:${upper}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  // CoinGecko search endpoint
  const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(upper)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();

  const first = data?.coins?.[0];
  const id = first?.id ?? null;

  if (id) cacheSet(key, id, 24 * 60 * 60 * 1000); // cache 24h
  return id;
}

export async function getCryptoPrices(holdings) {
  // holdings: [{ symbol, cgId? }]
  const ids = [];

  for (const h of holdings) {
    const cgId = h.cgId ? String(h.cgId) : null;
    if (cgId) ids.push(cgId);
    else {
      const id = await resolveCoinGeckoId(h.symbol);
      if (id) ids.push(id);
    }
  }

  const uniqueIds = [...new Set(ids)];
  const results = {};

  // Try cache first
  const uncached = [];
  for (const id of uniqueIds) {
    const key = `crypto:${id}`;
    const cached = cacheGet(key);
    if (cached != null) results[id] = cached;
    else uncached.push(id);
  }

  if (uncached.length) {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
      uncached.join(",")
    )}&vs_currencies=eur`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json(); // { bitcoin: { eur: 123 }, ... }
      for (const id of uncached) {
        const price = data?.[id]?.eur ?? null;
        results[id] = price;
        cacheSet(`crypto:${id}`, price, TTL_MS);
      }
    } else {
      for (const id of uncached) results[id] = null;
    }
  }

  return results; // { bitcoin: 42000, ethereum: 2300, ... } in EUR
}

export async function getCoinGeckoIdForHolding(h) {
  return h.cgId ? String(h.cgId) : await resolveCoinGeckoId(h.symbol);
}
