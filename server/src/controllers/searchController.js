import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// In-memory store for asset metadata to reduce external API overhead
const searchCache = new Map(); // key -> { expiresAt, data }
const SEARCH_TTL_MS = 30_000;

// Retrieve valid entry from cache if within the time-to-live window
function cacheGet(map, key) {
  const hit = map.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    map.delete(key);
    return null;
  }
  return hit.data;
}

// Store search results with a specific expiration timestamp
function cacheSet(map, key, data, ttlMs) {
  map.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// Main handler for cross-asset search requests
export async function searchAssets(req, res) {
  const query = req.query.q?.trim();
  const type = String(req.query.type || "all").toLowerCase(); // stock | crypto | all

  if (!query) return res.status(400).json({ message: "Missing search query" });

  const cacheKey = `${type}:${query.toLowerCase()}`;
  const cached = cacheGet(searchCache, cacheKey);
  if (cached) return res.json(cached);

  try {
    let results = [];

    // Branching logic to execute specific or concurrent searches based on asset type
    if (type === "stock") {
      results = await searchStocks(query);
    } else if (type === "crypto") {
      results = await searchCryptos(query);
    } else {
      // Execute searches in parallel to minimize response latency
      const [stockResults, cryptoResults] = await Promise.allSettled([
        searchStocks(query),
        searchCryptos(query),
      ]);

      const stocks = stockResults.status === "fulfilled" ? stockResults.value : [];
      const cryptos = cryptoResults.status === "fulfilled" ? cryptoResults.value : [];
      results = [...stocks, ...cryptos];
    }

    cacheSet(searchCache, cacheKey, results, SEARCH_TTL_MS);
    return res.json(results);
  } catch (error) {
    console.error("Search failed", error);
    return res.status(500).json({ message: "Search failed" });
  }
}

// Internal function to query equity symbols from Yahoo Finance
async function searchStocks(query) {
  try {
    // Fetch asset metadata with fuzzy matching enabled for better UX
    const searchRes = await yahooFinance.search(query, {
      quotesCount: 10,
      newsCount: 0,
      enableFuzzyQuery: true,
      region: "IE",
      lang: "en-IE",
    });

    const quotes = searchRes?.quotes ?? [];

    // Filter and map raw API response to standardized frontend-friendly objects
    const candidates = quotes
      .filter((q) => (q.shortname || q.longname) && q.symbol)
      .slice(0, 10)
      .map((q) => {
        const sym = String(q.symbol).toUpperCase();
        const name = q.shortname || q.longname;
        return {
          value: sym,
          label: `${name} (${sym})`,
          type: "stock",
          symbol: sym,
          // Valuation is intentionally omitted to keep search payloads lightweight
          price: null,
        };
      });

    return candidates;
  } catch (error) {
    console.error("Stock search failed (details):", error);
    return [];
  }
}

// Internal function to query cryptocurrency metadata from CoinGecko
async function searchCryptos(query) {
  try {
    const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`CoinGecko search failed: ${res.status}`);

    const data = await res.json();
    const coins = (data?.coins ?? []).slice(0, 10);

    // Map CoinGecko specific data to the application's unified asset schema
    return coins.map((c) => ({
      value: c.id, // Primary identifier for subsequent price lookups
      label: `${c.name} (${(c.symbol ?? "").toUpperCase()})`,
      type: "crypto",
      cgId: c.id,
      symbol: (c.symbol ?? "").toUpperCase(),
      price: null,
    }));
  } catch (error) {
    console.error("Crypto search failed (details):", error);
    return [];
  }
}