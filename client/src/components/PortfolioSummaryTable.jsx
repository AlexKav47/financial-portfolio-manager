import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import Card from "./Card";

function formatMoney(n, currency = "EUR") {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
}

function formatPct(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n.toFixed(2)}%`;
}

export default function PortfolioSummaryTable({ holdings = [], currency = "EUR" }) {
  const rows = holdings
    .filter((h) => h.currentValue != null)
    .sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0))
    .slice(0, 6);

  return (
    <Card>
      <Heading size="sm" mb={3}>
        Portfolio
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
              <Td>{h.symbol}</Td>
              <Td isNumeric>
                {formatMoney(h.currentValue, currency)} / {formatMoney(h.costBasis, currency)}
              </Td>
              <Td isNumeric>{formatMoney(h.pnl, currency)}</Td>
              <Td isNumeric>{formatPct(h.allocationPct)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {!rows.length && (
        <Box mt={3} fontSize="sm" color="gray.600">
          No holdings to summarise yet.
        </Box>
      )}
    </Card>
  );
}
