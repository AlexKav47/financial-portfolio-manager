import { Heading, Text } from "@chakra-ui/react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Card from "./Card";

function formatMoney(n, currency = "EUR") {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
}

export default function AllocationDonut({ holdings = [], currency = "EUR" }) {
  // Only include holdings with a computed currentValue
  const data = holdings
    .filter((h) => h.currentValue != null && h.currentValue > 0)
    .map((h) => ({
      name: `${h.symbol} (${h.type})`,
      value: h.currentValue,
      allocationPct: h.allocationPct,
    }));

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
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Pie>

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
