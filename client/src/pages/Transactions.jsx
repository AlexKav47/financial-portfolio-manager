import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  Box,
  Button,
  Heading,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
} from "@chakra-ui/react";

export default function Transactions() {
  const [tx, setTx] = useState([]);
  const [error, setError] = useState("");

  // Form state
  const [kind, setKind] = useState("deposit");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [amount, setAmount] = useState(1000);

  const [assetType, setAssetType] = useState("stock");
  const [symbol, setSymbol] = useState("AAPL");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(100);
  const [fees, setFees] = useState(0);

  async function load() {
    setError("");
    try {
      const res = await api.get("/transactions");
      setTx(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load transactions");
    }
  }

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

      <Box mt={6}>
        <Heading size="md">Add Transaction</Heading>

        <Stack direction={{ base: "column", md: "row" }} mt={3} spacing={3} align="center">
          <Select value={kind} onChange={(e) => setKind(e.target.value)} maxW="180px">
            <option value="deposit">deposit</option>
            <option value="withdrawal">withdrawal</option>
            <option value="buy">buy</option>
            <option value="sell">sell</option>
          </Select>

          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} maxW="180px" />

          {isCash && (
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (EUR)"
              maxW="200px"
            />
          )}

          {isTrade && (
            <>
              <Select value={assetType} onChange={(e) => setAssetType(e.target.value)} maxW="160px">
                <option value="stock">stock</option>
                <option value="crypto">crypto</option>
              </Select>

              <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol" maxW="140px" />
              <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Qty" maxW="120px" />
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" maxW="140px" />
              <Input type="number" value={fees} onChange={(e) => setFees(e.target.value)} placeholder="Fees" maxW="120px" />
            </>
          )}

          <Button onClick={addTx}>Add</Button>
        </Stack>
      </Box>

      <Box mt={8} overflowX="auto">
        <Table>
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Kind</Th>
              <Th>Asset</Th>
              <Th isNumeric>Cash Flow</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {tx.map((t) => (
              <Tr key={t._id}>
                <Td>{new Date(t.date).toLocaleDateString()}</Td>
                <Td>{t.kind}</Td>
                <Td>
                  {t.symbol ? `${t.symbol} (${t.assetType})` : "—"}
                </Td>
                <Td isNumeric>{t.cashFlow}</Td>
                <Td>
                  <Button size="sm" onClick={() => remove(t._id)}>
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
