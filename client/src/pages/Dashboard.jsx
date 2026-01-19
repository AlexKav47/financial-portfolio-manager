import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Box, Button, Stack, Text, Grid, GridItem, } from "@chakra-ui/react";

import KpiCards from "../components/KpiCards";
import AllocationDonut from "../components/AllocationDonut";
import PortfolioSummaryTable from "../components/PortfolioSummaryTable";

export default function Dashboard({ onLogout, refreshKey }) {
  const [summary, setSummary] = useState(null);               // Main Portfolio data
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState("");

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

  // Initial loading of dashboard
  useEffect(() => {
    loadSummary();
  }, [refreshKey]);

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
    </Box>
  );
}
