import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Box, Button, Heading, Input, Stack, Text, Select } from "@chakra-ui/react";
import AsyncSelect from "react-select/async";
import HoldingsTableCard from "../components/HoldingsTableCard";

export default function AddHolding({ onHoldingAdded }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [holdings, setHoldings] = useState([]);

  // Control state for the asset search toggle between stocks and crypto
  const [searchType, setSearchType] = useState("stock");

  // State management for individual holding attributes
  const [assetType, setAssetType] = useState("stock");
  const [symbol, setSymbol] = useState("");
  const [cgId, setCgId] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [avgCost, setAvgCost] = useState("");

  // Remote data fetcher for the asynchronous asset selection dropdown
  const loadOptions = async (inputValue) => {
    if (!inputValue) return [];
    const res = await api.get(
      `/search?q=${encodeURIComponent(inputValue)}&type=${encodeURIComponent(searchType)}`
    );
    const data = Array.isArray(res.data) ? res.data : [];
    return data.filter((x) => x?.type === searchType);
  };

  // Retrieve the most recent market price for a specific asset selection
  async function fetchHistoricalPriceForSelection(opt) {
  try {
    if (!opt) return null;

    if (opt.type === "stock") {
      const sym = (opt.symbol || opt.value || "").toUpperCase();
      const url = `/prices/last?type=stock&symbol=${encodeURIComponent(sym)}`;
      const res = await api.get(url);
      console.log("LAST PRICE STOCK:", url, res.data);
      return res.data?.price ?? null;
    }

    const id = opt.cgId || opt.value;
    const url = `/prices/last?type=crypto&cgId=${encodeURIComponent(id)}`;
    const res = await api.get(url);
    console.log("LAST PRICE CRYPTO:", url, res.data);
    return res.data?.price ?? null;
  } catch (err) {
    console.error(
      "LAST PRICE FAILED:",
      err?.response?.status,
      err?.response?.data || err.message
    );
    setError(err?.response?.data?.message || "Failed to fetch historical price");
    return null;
  }
}

  // Synchronize component state when a new asset is selected from the dropdown
  const handleAssetChange = async (selectedOption) => {
    setSelectedAsset(selectedOption);

    if (!selectedOption) {
      setAssetType(searchType);
      setSymbol("");
      setCgId("");
      setAvgCost("");
      return;
    }

    setAssetType(selectedOption.type);

    if (selectedOption.type === "crypto") {
      setSymbol(selectedOption.symbol || "");
      setCgId(selectedOption.cgId || selectedOption.value || "");
    } else {
      setSymbol(selectedOption.symbol || selectedOption.value || "");
      setCgId("");
    }

    // Auto-populate average cost with the latest historical price upon selection
    const price = await fetchHistoricalPriceForSelection(selectedOption);
    setAvgCost(price != null ? String(price) : "");
  };

  // Manual trigger to refresh average cost with current market data
  const useCurrentPrice = async () => {
    if (!selectedAsset) return;
    const price = await fetchHistoricalPriceForSelection(selectedAsset);
    setAvgCost(price != null ? String(price) : "");
  };

  // Fetch the current portfolio summary from the API
  async function loadHoldings() {
    try {
      const res = await api.get("/portfolio/summary");
      setHoldings(res.data.holdings);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load holdings");
    }
  }

  // Submit new holding data to the server and reset local form state
  async function addHolding() {
    setError("");
    setSuccess("");

    try {
      await api.post("/holdings", {
        type: assetType,
        symbol,
        cgId: assetType === "crypto" ? cgId : null,
        quantity: Number(quantity || 0),
        avgCost: Number(avgCost || 0),
      });

      setSuccess();
      setSelectedAsset(null);
      setSymbol("");
      setCgId("");
      setQuantity("0");
      setAvgCost("");

      onHoldingAdded();
      loadHoldings();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          "Failed to add holding"
      );
    }
  }

  // Delete an existing holding by its unique identifier
  async function removeHolding(id) {
    setError("");
    try {
      await api.delete(`/holdings/${id}`);
      loadHoldings();
      onHoldingAdded();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete holding");
    }
  }

  // Initial data load on component mount
  useEffect(() => {
    loadHoldings();
  }, []);

  // Validation logic to determine if the form is ready for submission
  const canAdd =
    symbol &&
    Number(quantity) > 0 &&
    avgCost !== "" &&
    !Number.isNaN(Number(avgCost));

  return (
    <Box p={6}>
      {/* Error notification display */}
      {error && (
        <Box mt={4}>
          <Text color="red.500">{error}</Text>
        </Box>
      )}

      {/* Success notification display */}
      {success && (
        <Box mt={4}>
          <Text color="green.500">{success}</Text>
        </Box>
      )}

      <Box
        mt={6}
        p={5}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="lg"
        bg="white"
      >
        <Heading size="md" mb={4}>
          New Holding
        </Heading>

        <Stack direction={{ base: "column", md: "row" }} spacing={3} align="flex-end">
          {/* Toggle for switching between search modes */}
          <Box minW={{ base: "100%", md: "170px" }}>
            <Text fontSize="xs" fontWeight="bold" mb={1}>
              Asset Type
            </Text>
            <Select
              value={searchType}
              onChange={(e) => {
                const nextType = e.target.value;
                setSearchType(nextType);

                setSelectedAsset(null);
                setAssetType(nextType);
                setSymbol("");
                setCgId("");
                setAvgCost("");
              }}
            >
              <option value="stock">Stocks</option>
              <option value="crypto">Crypto</option>
            </Select>
          </Box>

          {/* Asynchronous search input for asset lookup */}
          <Box flex="1">
            <Text fontSize="xs" fontWeight="bold" mb={1}>
              Asset
            </Text>
            <AsyncSelect
              key={searchType}
              cacheOptions
              loadOptions={loadOptions}
              defaultOptions={false}
              onChange={handleAssetChange}
              value={selectedAsset}
              placeholder={searchType === "stock" ? "Search" : "Search"}
            />
          </Box>

          <Box>
            <Text fontSize="xs" fontWeight="bold" mb={1}>
              Qty
            </Text>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value ?? "")}
              maxW="100px"
            />
          </Box>

          <Box>
            <Text fontSize="xs" fontWeight="bold" mb={1}>
              Average Cost
            </Text>
            <Input
              type="number"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value ?? "")}
              maxW="140px"
            />
          </Box>

          {/* Controls for fetching data and submitting the form */}
          <Button variant="outline" onClick={useCurrentPrice} isDisabled={!selectedAsset}>
            Use last price
          </Button>

          <Button colorScheme="teal" onClick={addHolding} px={8} isDisabled={!canAdd}>
            Add
          </Button>
        </Stack>

        {selectedAsset && (
          <Box mt={2}>
            <Text fontSize="sm" color="gray.600">
              Pricing mode: historical (Stooq last close / CoinGecko last daily)
            </Text>
          </Box>
        )}
      </Box>

      {/* Table visualization of current holdings and deletion controls */}
      <Box mt={6}>
        <HoldingsTableCard title="Assets" holdings={holdings} onDelete={removeHolding} />
      </Box>
    </Box>
  );
}