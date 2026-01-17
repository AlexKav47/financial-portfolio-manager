import { SimpleGrid, Box, Text, Heading } from "@chakra-ui/react";
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
 * Sub Component
 * Builds the visual tile
 * Different colors bg and text
 */
function KpiCard({ label, value, sub, bg }) {
  return (
    <Card
      bg={bg}
      color="white"
      borderRadius="lg"
      px={5}
      py={4}
      boxShadow="md"
      minH="92px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Text fontSize="sm" opacity={0.9} fontWeight="600">
        {label}
      </Text>
      <Heading size="lg" mt={1} lineHeight="1.1">
        {value}
      </Heading>
      {sub && (
        <Text fontSize="sm" mt={1} opacity={0.9}>
          {sub}
        </Text>
      )}
    </Card>
  );
}

/**
 * Main Component 
 * Takes the summary data from the backend and maps it into 4 specific cards.
 */
export default function KpiCards({ summary }) {
  const currency = summary?.currency || "EUR";

  const totalValue = summary?.totals?.totalValue ?? null;
  const totalPnl = summary?.totals?.totalPnl ?? null;
  const totalPnlPct = summary?.totals?.totalPnlPct ?? null;

  const irrPct = summary?.irrAnnualPct ?? null;

  // Placeholder for future logic to track dividends and interest
  const passiveIncome = summary?.passiveIncomeTotal ?? null;

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mt={6}>
      <KpiCard
        label="Value (€)"
        value={formatMoney(totalValue, currency)}
        sub="Live portfolio value"
        bg="teal.400"
      />

      <KpiCard
        label="Total Profit (€)"
        value={formatMoney(totalPnl, currency)}
        sub={`Return: ${formatPct(totalPnlPct)}`}
        bg="orange.400"
      />

      <KpiCard
        label="IRR"
        value={irrPct == null ? "—" : `${irrPct.toFixed(2)}%`}
        sub="Money-weighted return"
        bg="pink.400"
      />

      <KpiCard
        label="Passive Income (€)"
        value={formatMoney(passiveIncome, currency)}
        sub="Dividends/interest (coming next)"
        bg="purple.400"
      />
    </SimpleGrid>
  );
}
