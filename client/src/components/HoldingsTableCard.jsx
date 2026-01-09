import { useMemo, useState } from "react";
import {Box,Button,Flex,Heading,Input,InputGroup,InputLeftElement,Select,Table,Tbody,Td,Th,Thead,Tr,Text,Spacer,} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import Card from "./Card";

function formatMoney(n, currency = "EUR") {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
}

function formatPct(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n.toFixed(2)}%`;
}

/**
 * holdings rows expected from /portfolio/summary:
 * { _id, type, symbol, quantity, avgCost, costBasis, currentValue, pnl, allocationPct, ... }
 */
export default function HoldingsTableCard({
  title = "Cash", // change to "Holdings" if you prefer
  holdings = [],
  currency = "EUR",
  onDelete, // optional (id) => Promise
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all|stock|crypto
  const [sortBy, setSortBy] = useState("value_desc"); // value_desc|alloc_desc|pnl_desc|symbol_asc

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();

    let rows = holdings;

    if (typeFilter !== "all") {
      rows = rows.filter((h) => h.type === typeFilter);
    }

    if (q) {
      rows = rows.filter((h) => String(h.symbol).toUpperCase().includes(q));
    }

    const sorters = {
      value_desc: (a, b) => (b.currentValue || 0) - (a.currentValue || 0),
      alloc_desc: (a, b) => (b.allocationPct || 0) - (a.allocationPct || 0),
      pnl_desc: (a, b) => (b.pnl || 0) - (a.pnl || 0),
      symbol_asc: (a, b) => String(a.symbol).localeCompare(String(b.symbol)),
    };

    return [...rows].sort(sorters[sortBy] || sorters.value_desc);
  }, [holdings, query, typeFilter, sortBy]);

  const totals = useMemo(() => {
    const totalCost = filtered.reduce((acc, h) => acc + (h.costBasis || 0), 0);
    const totalValue = filtered.reduce((acc, h) => acc + (h.currentValue || 0), 0);
    const totalPnl = filtered.reduce((acc, h) => acc + (h.pnl || 0), 0);
    return { totalCost, totalValue, totalPnl };
  }, [filtered]);

  return (
    <Card p={0}>
      {/* Header + controls */}
      <Box px={5} pt={4} pb={3} borderBottom="1px solid" borderColor="gray.200">
        <Flex align="center" gap={3} wrap="wrap">
          <Heading size="sm">{title}</Heading>
          <Spacer />

          <InputGroup maxW="240px" size="sm">
            <InputLeftElement pointerEvents="none">
              <SearchIcon />
            </InputLeftElement>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
            />
          </InputGroup>

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

          <Select
            size="sm"
            maxW="190px"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="value_desc">Sort: Value (desc)</option>
            <option value="alloc_desc">Sort: Allocation (desc)</option>
            <option value="pnl_desc">Sort: Profit (desc)</option>
            <option value="symbol_asc">Sort: Symbol (A–Z)</option>
          </Select>

          <Button size="sm" variant="outline">
            Filter
          </Button>
        </Flex>
      </Box>

      {/* Table */}
      <Box px={5} pb={4} pt={3} overflowX="auto">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Currency</Th>
              <Th isNumeric>Balance</Th>
              <Th isNumeric>Avg Price</Th>
              <Th isNumeric>Cost Basis</Th>
              <Th isNumeric>Current Value</Th>
              <Th isNumeric>Total Profit</Th>
              <Th isNumeric>IRR</Th>
              <Th isNumeric>Share %</Th>
              {onDelete ? <Th></Th> : null}
            </Tr>
          </Thead>

          <Tbody>
            {filtered.map((h) => (
              <Tr key={h._id}>
                {/* Currency column in your mock: use Symbol */}
                <Td>
                  <Text fontWeight="600">{h.symbol}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {h.type}
                  </Text>
                </Td>

                {/* Balance = Quantity */}
                <Td isNumeric>{h.quantity ?? "—"}</Td>

                {/* Avg Price = avgCost */}
                <Td isNumeric>{formatMoney(h.avgCost, currency)}</Td>

                <Td isNumeric>{formatMoney(h.costBasis, currency)}</Td>
                <Td isNumeric>{formatMoney(h.currentValue, currency)}</Td>
                <Td isNumeric>{formatMoney(h.pnl, currency)}</Td>

                {/* Per-asset IRR not implemented yet */}
                <Td isNumeric>—</Td>

                <Td isNumeric>{formatPct(h.allocationPct)}</Td>

                {onDelete ? (
                  <Td isNumeric>
                    <Button size="xs" variant="ghost" onClick={() => onDelete(h._id)}>
                      Delete
                    </Button>
                  </Td>
                ) : null}
              </Tr>
            ))}

            {/* Totals row */}
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
              <Td isNumeric fontWeight="700">—</Td>
              <Td isNumeric fontWeight="700">—</Td>
              {onDelete ? <Td /> : null}
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Card>
  );
}
