function daysBetween(a, b) {
  return (b - a) / (1000 * 60 * 60 * 24);
}

function xnpv(rate, cashflows) {
  const d0 = cashflows[0].date;
  return cashflows.reduce((acc, cf) => {
    const t = daysBetween(d0, cf.date) / 365;
    return acc + cf.amount / Math.pow(1 + rate, t);
  }, 0);
}

function dxnpv(rate, cashflows) {
  const d0 = cashflows[0].date;
  return cashflows.reduce((acc, cf) => {
    const t = daysBetween(d0, cf.date) / 365;
    return acc + (-t * cf.amount) / Math.pow(1 + rate, t + 1);
  }, 0);
}

/**
 * XIRR via Newton-Raphson with guardrails.
 * Returns annual rate as decimal (e.g. 0.12 = 12%), or null if not computable.
 */
export function xirr(cashflows) {
  if (!Array.isArray(cashflows) || cashflows.length < 2) return null;

  // Must have at least one negative and one positive cashflow
  const hasNeg = cashflows.some(c => c.amount < 0);
  const hasPos = cashflows.some(c => c.amount > 0);
  if (!hasNeg || !hasPos) return null;

  // Sort by date ascending
  const flows = cashflows
    .map(c => ({ amount: Number(c.amount), date: new Date(c.date) }))
    .sort((a, b) => a.date - b.date);

  // Initial guess
  let rate = 0.10;

  for (let i = 0; i < 50; i++) {
    const f = xnpv(rate, flows);
    const df = dxnpv(rate, flows);

    if (!Number.isFinite(f) || !Number.isFinite(df) || df === 0) break;

    const next = rate - f / df;

    // Guardrails: rate cannot be <= -1
    if (!Number.isFinite(next) || next <= -0.9999) break;

    // Converged
    if (Math.abs(next - rate) < 1e-8) {
      rate = next;
      return rate;
    }

    rate = next;
  }

  return null; // not converged safely
}
