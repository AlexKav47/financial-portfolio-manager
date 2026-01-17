import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Box, Button,Heading, Input, Select, Stack, Text, Grid, GridItem, } from "@chakra-ui/react";

import KpiCards from "../components/KpiCards";
import Card from "../components/Card";
import AllocationDonut from "../components/AllocationDonut";
import PortfolioSummaryTable from "../components/PortfolioSummaryTable";
import PortfolioValueLine from "../components/PortfolioValueLine";
import HoldingsTableCard from "../components/HoldingsTableCard";
import PortfolioTrackerCard from "../components/PortfolioTrackerCard";

export default function Dashboard({ onLogout }) {
  const [summary, setSummary] = useState(null);               // Main Portfolio data
  const [snapshots, setSnapshots] = useState([]);             // Historical data for charts
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState("");

  // Add-holding form state
  const [type, setType] = useState("stock");
  const [symbol, setSymbol] = useState("AAPL");
  const [quantity, setQuantity] = useState(1);
  const [avgCost, setAvgCost] = useState(100);

  const currency = summary?.currency || "EUR";

  // API Logic
  // Fetches the latest calculated portfolio stats PnL, Value
  async function loadSummary() {
    setLoadingSummary(true);
    setError("");
    try {
      const res = await api.get("/portfolio/summary");
      setSummary(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load portfolio summary");
    } finally {
      setLoadingSummary(false);
    }
  }

  // Fetches the last 90 days of value history for the line chart
  async function loadSnapshots() {
    try {
      const res = await api.get("/snapshots?days=90");
      setSnapshots(res.data);
    } catch {
      // If snapshots fails, dont show the chart
    }
  }

  // Saves the current total value to the database history
  async function takeSnapshot() {
    setError("");
    try {
      await api.post("/snapshots");
      await loadSnapshots(); // Refresh the chart after taking a new point
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to take snapshot");
    }
  }

  // Sends a new asset Stock or Crypto to the backend
  async function addHolding() {
    setError("");
    try {
      await api.post("/holdings", {
        type,
        symbol,
        quantity: Number(quantity),
        avgCost: Number(avgCost),
      });
      await loadSummary(); // Refresh dashbaord
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to add holding");
    }
  }

  // Deletes an asset by its Database ID
  async function removeHolding(id) {
    setError("");
    try {
      await api.delete(`/holdings/${id}`);
      await loadSummary(); // Refresh dashbaord
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete holding");
    }
  }

  // Initial loading of dashboard
  useEffect(() => {
    loadSummary();
    loadSnapshots();
  }, []);

  return (
    <Box>
      {/* Refresh and Logout */}
      <Stack
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
        justify="space-between"
        gap={3}
      >

        <Stack direction="row" spacing={3}>
          <Button onClick={loadSummary} isLoading={loadingSummary}>
            Refresh
          </Button>
            <Button
            onClick={async () => {
              try {
                await api.post("/auth/logout"); 
              } catch (err) {
                console.error("Logout failed on server", err);
              } finally {
                onLogout(); 
              }
            }}
          >
            Logout
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Box mt={4}>
          <Text>{error}</Text>
        </Box>
      )}

      {/* KPI cards */}
      <KpiCards summary={summary} />

      {/* Portfolio block donut and table */}
      <Grid mt={6} templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4}>
        <GridItem>
            <AllocationDonut holdings={summary?.holdings || []} currency={currency} />
        </GridItem>

        <GridItem>
          <PortfolioSummaryTable holdings={summary?.holdings || []} currency={currency} />
        </GridItem>
      </Grid>

      {/* Value history */}
      <Box mt={6}>
        <Card>
          <Stack
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "flex-start" }}
            gap={4}
          >
            <Box flex="1">
              <PortfolioValueLine snapshots={snapshots} currency={currency} />
            </Box>

            <Button onClick={takeSnapshot}>
              Take Snapshot
            </Button>
          </Stack>
        </Card>
      </Box>

      {/* Add holding */}
      <Box mt={6}>
        <Card>
          <Heading size="md">Add Holding</Heading>

          <Stack
            direction={{ base: "column", md: "row" }}
            mt={4}
            spacing={3}
            align="center"
          >
            <Select value={type} onChange={(e) => setType(e.target.value)} maxW="160px">
              <option value="stock">stock</option>
              <option value="crypto">crypto</option>
            </Select>

            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Symbol (e.g., AAPL, BTC)"
              maxW="220px"
            />

            <Input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity"
              type="number"
              maxW="160px"
            />

            <Input
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
              placeholder="Avg Cost"
              type="number"
              maxW="160px"
            />

            <Button onClick={addHolding}>Add</Button>
          </Stack>
        </Card>
      </Box>

      {/* Holdings / Cash block */}
      <Box mt={6}>
        <HoldingsTableCard
          title="Cash"
          holdings={summary?.holdings || []}
          currency={currency}
          onDelete={removeHolding}
        />

        <Text mt={3} fontSize="sm" color="gray.600">
          Last updated:{" "}
          {summary?.lastUpdated ? new Date(summary.lastUpdated).toLocaleString() : "—"}
        </Text>
      </Box>

      {/* Footer / Portfolio Tracker card */}
      <Box mt={6}>
        <PortfolioTrackerCard />
      </Box>
    </Box>
  );
}
