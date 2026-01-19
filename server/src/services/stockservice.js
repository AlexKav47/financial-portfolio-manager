import { cacheGet, cacheSet } from "../utils/cache.js";

// Retention period for historical daily close prices within the local cache
const PRICE_TTL_MS = 24 * 60 * 60 * 1000;

// Extract the most recent closing price from a standardized Stooq CSV response
function parseStooqCSV(csvText) {
  // Process raw text into lines and identify column indices from the header
  const lines = String(csvText || "").trim().split("\n");
  if (lines.length < 2) return null;

  const header = lines[0].split(",").map((s) => s.trim().toLowerCase());
  const closeIdx = header.indexOf("close");
  if (closeIdx === -1) return null;

  // Retrieve numeric value from the final data row in the CSV
  const lastRow = lines[lines.length - 1].split(",");
  const close = Number(lastRow[closeIdx]);

  return Number.isFinite(close) ? close : null;
}

// Perform an external request to Stooq for daily historical equity data
async function fetchStooqLastClose(symbol) {
  // Append exchange suffix required by Stooq for US-listed securities
  const stooqSymbol = `${symbol.toLowerCase()}.us`;

  // Query the daily historical download endpoint in CSV format
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(stooqSymbol)}&i=d`;

  const res = await fetch(url, { headers: { accept: "text/csv" } });
  if (!res.ok) return null;

  const text = await res.text();
  return parseStooqCSV(text);
}

// Batch retrieve equity prices with cache-first lookup and controlled concurrency
export async function getLastClosePrices(symbols = []) {
  const out = {};
  const unique = [...new Set((symbols || []).map((s) => String(s).toUpperCase()).filter(Boolean))];

  // Identify assets not present in the local cache for external fetching
  const toFetch = [];
  for (const sym of unique) {
    const key = `stooq:lastclose:${sym}`;
    const cached = cacheGet(key);
    if (cached != null) out[sym] = cached;
    else toFetch.push(sym);
  }

  // Manage parallel requests to maintain service stability and prevent rate limiting
  const CONCURRENCY = 4;
  let idx = 0;

  async function worker() {
    while (idx < toFetch.length) {
      const sym = toFetch[idx++];
      const key = `stooq:lastclose:${sym}`;

      try {
        const price = await fetchStooqLastClose(sym);
        out[sym] = price;
        cacheSet(key, price, PRICE_TTL_MS);
      } catch {
        out[sym] = null;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, toFetch.length) }, worker));
  return out;
}

// Alias for integration compatibility across the application
export const getStockPrices = getLastClosePrices;