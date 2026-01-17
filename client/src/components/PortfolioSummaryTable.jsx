import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import Card from "./Card";

/**
 * Helper to turn numbers into currency strings (1200 -> €1,200.00)
 */
function formatMoney(n, currency = "EUR") {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
}

/**
 * Helper to format numbers as percentages (0.05 -> 5.00%)
 */
function formatPct(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n.toFixed(2)}%`;
}

/**
 * A simplified table showing only the top holdings
 */
export default function PortfolioSummaryTable({ holdings = [], currency = "EUR" }) {

  // Data preperation filter, sort, slice
  const rows = holdings
    .filter((h) => h.currentValue != null) // Only shows assets that have a current market value
    .sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0)) // Puts most valuable assets at the top
    .slice(0, 6); // Top 6 holding shown only

  return (
    <Card>
      <Heading size="sm" mb={3}>
        Portfolio Snapshot
      </Heading>

      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th isNumeric>Value/Invested</Th>
            <Th isNumeric>Gain</Th>
            <Th isNumeric>Allocation %</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((h) => (
            <Tr key={h._id}>
              {/* Asset Ticker AAPL or BTC */}
              <Td>{h.symbol}</Td>
              {/* Shows current value vs what you originally paid side by side */}
              <Td isNumeric>
                {formatMoney(h.currentValue, currency)} / {formatMoney(h.costBasis, currency)}
              </Td>

              {/* Total PnL for this specific asset */}
              <Td isNumeric>{formatMoney(h.pnl, currency)}</Td>
              {/* How much of your total pie this asset takes up */}
              <Td isNumeric>{formatPct(h.allocationPct)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      
      {/* Empty State shows if the user didnt add any data yet */}
      {!rows.length && (
        <Box mt={3} fontSize="sm" color="gray.600">
          No holdings to summarise yet.
        </Box>
      )}
    </Card>
  );
}
