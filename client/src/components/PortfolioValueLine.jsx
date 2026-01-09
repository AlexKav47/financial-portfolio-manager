import { Box, Heading, Text } from "@chakra-ui/react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

function formatMoney(n, currency = "EUR") {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
}

export default function PortfolioValueLine({ snapshots = [], currency = "EUR" }) {
  const data = snapshots.map(s => ({
    date: new Date(s.date).toLocaleDateString(),
    value: s.totalValue,
  }));

  if (!data.length) {
    return (
      <Box>
        <Heading size="md">Portfolio Value History</Heading>
        <Text mt={2}>No snapshots yet. Click “Take Snapshot”.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md">Portfolio Value History</Heading>
      <Box mt={3} h="260px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" tickMargin={8} />
            <YAxis tickFormatter={(v) => formatMoney(v, currency)} width={90} />
            <Tooltip formatter={(v) => formatMoney(v, currency)} />
            <Line type="monotone" dataKey="value" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
