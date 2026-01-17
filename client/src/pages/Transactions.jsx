import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Box, Button, Heading, Input, Select, Stack, Table, Tbody, Td, Th, Thead, Tr, Text, } from "@chakra-ui/react";

export default function Transactions() {
  const [tx, setTx] = useState([]);
  const [error, setError] = useState("");

  // The kind of transaction changes which inputs the user needs to see
  const [kind, setKind] = useState("deposit");

  // Default the date to 'Today' in YYYY-MM-DD format for the input field
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // State for Cash only movements Deposit and Withdrawal
  const [amount, setAmount] = useState(1000);

  // State for Trades Buy and Sell
  const [assetType, setAssetType] = useState("stock");
  const [symbol, setSymbol] = useState("AAPL");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(100);
  const [fees, setFees] = useState(0);

  // Fetches the full list of transactions from the server
  async function load() {
    setError("");
    try {
      const res = await api.get("/transactions");
      setTx(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load transactions");
    }
  }

  // Handles adding a new transaction
  async function addTx() {
    setError("");
    try {
      const payload =
        kind === "deposit" || kind === "withdrawal"
          ? { kind, amount: Number(amount), date }
          : {
              kind,
              assetType,
              symbol,
              quantity: Number(quantity),
              price: Number(price),
              fees: Number(fees),
              date,
            };

      await api.post("/transactions", payload);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || "Failed to add transaction");
    }
  }

  // Deletes a transaction and refreshes the list
  async function remove(id) {
    setError("");
    try {
      await api.delete(`/transactions/${id}`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete transaction");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const isCash = kind === "deposit" || kind === "withdrawal";
  const isTrade = kind === "buy" || kind === "sell";

  return (
    <Box p={6}>
      <Heading size="lg">Transactions</Heading>

      {error && (
        <Box mt={4}>
          <Text>{error}</Text>
        </Box>
      )}

      {/* ADD TRANSACTION FORM */}
      <Box mt={6} p={5} border="1px solid" borderColor="gray.200" borderRadius="lg" bg="white">
        <Heading size="md" mb={4}>New Record</Heading>

        <Stack direction={{ base: "column", md: "row" }} spacing={3} align="flex-end">
          {/* Select the Category */}
          <Box>
            <Text fontSize="xs" fontWeight="bold" mb={1}>Type</Text>
            <Select value={kind} onChange={(e) => setKind(e.target.value)} maxW="180px">
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="buy">Buy Asset</option>
              <option value="sell">Sell Asset</option>
            </Select>
          </Box>

          {/* Select the Date */}
          <Box>
            <Text fontSize="xs" fontWeight="bold" mb={1}>Date</Text>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} maxW="180px" />
          </Box>

          {/* Show Amount input ONLY for Deposits and Withdrawals */}
          {isCash && (
            <Box>
              <Text fontSize="xs" fontWeight="bold" mb={1}>Amount (€)</Text>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                maxW="200px"
              />
            </Box>
          )}

          {/* Show Asset details ONLY for Trades Buy and Sell */}
          {isTrade && (
            <>
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={1}>Asset</Text>
                <Select value={assetType} onChange={(e) => setAssetType(e.target.value)} maxW="120px">
                  <option value="stock">Stock</option>
                  <option value="crypto">Crypto</option>
                </Select>
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={1}>Ticker</Text>
                <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="AAPL" maxW="100px" />
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={1}>Qty</Text>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} maxW="100px" />
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={1}>Price</Text>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} maxW="120px" />
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={1}>Fees</Text>
                <Input type="number" value={fees} onChange={(e) => setFees(e.target.value)} maxW="100px" />
              </Box>
            </>
          )}

          <Button colorScheme="teal" onClick={addTx} px={8}>
            Add
          </Button>
        </Stack>
      </Box>

      {/*  Transaction History Table */}
      <Box mt={8} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.100" overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Asset Details</Th>
              <Th isNumeric>Cash Flow (€)</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {tx.map((t) => (
              <Tr key={t._id} _hover={{ bg: "gray.50" }}>
                <Td>{new Date(t.date).toLocaleDateString()}</Td>
                <Td>
                  <Text textTransform="capitalize" fontWeight="500">{t.kind}</Text>
                </Td>
                <Td>
                  {t.symbol ? (
                    <Text>{t.symbol} <Box as="span" color="gray.500" fontSize="xs">({t.assetType})</Box></Text>
                  ) : "—"}
                </Td>
                {/* Cash flow is calculated by the backend negative for buys and withdrawals */}
                <Td isNumeric fontWeight="600" color={t.cashFlow >= 0 ? "green.600" : "red.600"}>
                  {t.cashFlow?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Td>
                <Td>
                  <Button size="xs" colorScheme="red" variant="ghost" onClick={() => remove(t._id)}>
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}