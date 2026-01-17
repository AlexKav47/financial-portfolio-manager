import { Box, Heading, Text } from "@chakra-ui/react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

/**
 * Helper to turn numbers into currency strings (1200 -> €1,200.00)
 */
function formatMoney(n, currency = "EUR") {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
}

/**
 * Portfolio Performance Graph
 * It takes snapshots of saved history points and draws a line over time
 */
export default function PortfolioValueLine({ snapshots = [], currency = "EUR" }) {
  const data = snapshots.map(s => ({
    date: new Date(s.date).toLocaleDateString(),
    value: s.totalValue,
  }));

  // Empty state if the user didnt record any history show instructions instead of an empty box
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
      {/* Container for the chart with fixed height is necessary for responsive container to work */}
      <Box mt={3} h="260px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              tickMargin={8} 
              fontSize={12} 
              tick={{ fill: '#718096' }} 
            />
            <YAxis 
              tickFormatter={(v) => formatMoney(v, currency)} 
              width={90} 
              fontSize={12}
              tick={{ fill: '#718096' }}
            />
            <Tooltip formatter={(v) => formatMoney(v, currency)} />
            <Line type="monotone" dataKey="value" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
