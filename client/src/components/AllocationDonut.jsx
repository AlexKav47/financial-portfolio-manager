import { Heading, Text } from "@chakra-ui/react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Card from "./Card";

/**
 * Helper to turn numbers into currency strings (1200 -> €1,200.00)
 */
function formatMoney(n, currency = "EUR") {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
}

export default function AllocationDonut({ holdings = [], currency = "EUR" }) {

  // Prepare data for Recharts
  // Filter out anything with 0 and maps the holding data into the format Recharts Pie component
  const data = holdings
    .filter((h) => h.currentValue != null && h.currentValue > 0)
    .map((h) => ({
      name: `${h.symbol} (${h.type})`, // Ticker "BTC (Crypto)"
      value: h.currentValue,           // Size of Slice
      allocationPct: h.allocationPct,  // Stored here to show it in tooltip
    }));

  // If portdfolio is empty or unpriced, don't show an empty pie chart
  if (!data.length) {
    return (
      <Card>
        <Heading size="md">Allocation</Heading>
        <Text mt={2}>No priced holdings available yet.</Text>
      </Card>
    );
  }

  return (
    <Card>
      <Heading size="md">Allocation</Heading>

      <Card mt={3} h="320px">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={2}
              isAnimationActive={false}
            >
              {/* Individual cells for the slices can add fill props here for custom colors*/}
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Pie>

            {/* Customize the pop up box when you hover over a slice */}
            <Tooltip
              formatter={(value, name, props) => {
                const pct = props?.payload?.allocationPct;
                return [
                  `${formatMoney(value, currency)}${pct != null ? ` (${pct.toFixed(2)}%)` : ""}`,
                  name,
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </Card>
  );
}
