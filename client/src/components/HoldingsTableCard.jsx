import { useMemo, useState } from "react";
import { Box, Button, Flex, Heading, Input, InputGroup, InputLeftElement, Select, Table, Tbody, Td, Th, Thead, Tr, Text, Spacer, } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
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

export default function HoldingsTableCard({
  title = "Cash",
  holdings = [],
  currency = "EUR",
  onDelete,
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("value_desc");

  // Calculate aggregate portfolio value for relative weight calculations
  const portfolioTotalValue = useMemo(() => {
    return (holdings || []).reduce((acc, h) => acc + (h.currentValue || 0), 0);
  }, [holdings]);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    let rows = holdings;

    // Apply category filter
    if (typeFilter !== "all") {
      rows = rows.filter((h) => h.type === typeFilter);
    }

    // Apply search query filter against symbols
    if (q) {
      rows = rows.filter((h) => String(h.symbol).toUpperCase().includes(q));
    }

    // Define sorting strategies for different column types
    const sorters = {
      value_desc: (a, b) => (b.currentValue || 0) - (a.currentValue || 0),
      alloc_desc: (a, b) =>
        ((b.currentValue || 0) / (portfolioTotalValue || 1)) -
        ((a.currentValue || 0) / (portfolioTotalValue || 1)),
      pnl_desc: (a, b) => (b.pnl || 0) - (a.pnl || 0),
      symbol_asc: (a, b) => String(a.symbol).localeCompare(String(b.symbol)),
    };

    return [...rows].sort(sorters[sortBy] || sorters.value_desc);
  }, [holdings, query, typeFilter, sortBy, portfolioTotalValue]);

  // Compute summary totals for the visible subset of holdings
  const totals = useMemo(() => {
    const totalCost = filtered.reduce((acc, h) => acc + (h.costBasis || 0), 0);
    const totalValue = filtered.reduce((acc, h) => acc + (h.currentValue || 0), 0);
    const totalPnl = filtered.reduce((acc, h) => acc + (h.pnl || 0), 0);
    return { totalCost, totalValue, totalPnl };
  }, [filtered]);

  return (
    <Card p={0}>
      {/* Header section containing title and control inputs */}
      <Box px={5} pt={4} pb={3} borderBottom="1px solid" borderColor="gray.200">
        <Flex align="center" gap={3} wrap="wrap">
          <Heading size="sm">{title}</Heading>
          <Spacer />
          
          <InputGroup maxW="240px" size="sm">
            <InputLeftElement pointerEvents="none">
              <SearchIcon />
            </InputLeftElement>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
          </InputGroup>

          {/* Asset type selection filter */}
          <Select
            size="sm"
            maxW="170px"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="stock">Stocks</option>
            <option value="crypto">Crypto</option>
          </Select>

          {/* Table sorting configuration */}
          <Select
            size="sm"
            maxW="190px"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="value_desc">Sort: Value (desc)</option>
            <option value="alloc_desc">Sort: Share % (desc)</option>
            <option value="pnl_desc">Sort: Profit (desc)</option>
            <option value="symbol_asc">Sort: Symbol (A–Z)</option>
          </Select>

          <Button size="sm" variant="outline">
            Filter
          </Button>
        </Flex>
      </Box>

      {/* Main data display table */}
      <Box px={5} pb={4} pt={3} overflowX="auto">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Currency</Th>
              <Th isNumeric>Shares</Th>
              <Th isNumeric>Avg Price</Th>
              <Th isNumeric>Cost Basis</Th>
              <Th isNumeric>Current Value</Th>
              <Th isNumeric>Total Profit</Th>
              <Th isNumeric>Share %</Th>
              {onDelete ? <Th /> : null}
            </Tr>
          </Thead>

          <Tbody>
            {filtered.map((h) => {
              const sharePct =
                portfolioTotalValue > 0 ? ((h.currentValue || 0) / portfolioTotalValue) * 100 : null;

              return (
                <Tr key={h._id}>
                  <Td>
                    <Text fontWeight="600">{h.symbol}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {h.type}
                    </Text>
                  </Td>

                  <Td isNumeric>{h.quantity ?? "—"}</Td>
                  <Td isNumeric>{formatMoney(h.avgCost, currency)}</Td>
                  <Td isNumeric>{formatMoney(h.costBasis, currency)}</Td>
                  <Td isNumeric>{formatMoney(h.currentValue, currency)}</Td>
                  <Td isNumeric>{formatMoney(h.pnl, currency)}</Td>
                  <Td isNumeric>{formatPct(sharePct)}</Td>

                  {onDelete ? (
                    <Td isNumeric>
                      <Button size="xs" variant="ghost" onClick={() => onDelete(h._id)}>
                        Delete
                      </Button>
                    </Td>
                  ) : null}
                </Tr>
              );
            })}

            {/* Footer row displaying aggregate sums */}
            <Tr>
              <Td fontWeight="700">Total</Td>
              <Td />
              <Td />
              <Td isNumeric fontWeight="700">
                {formatMoney(totals.totalCost, currency)}
              </Td>
              <Td isNumeric fontWeight="700">
                {formatMoney(totals.totalValue, currency)}
              </Td>
              <Td isNumeric fontWeight="700">
                {formatMoney(totals.totalPnl, currency)}
              </Td>
              <Td isNumeric fontWeight="700">100%</Td>
              {onDelete ? <Td /> : null}
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Card>
  );
}
