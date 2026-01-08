import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Box, Button, Heading, Input, Select, Stack, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";

export default function Dashboard({ onLogout }) {
  const [holdings, setHoldings] = useState([]);

  const [type, setType] = useState("stock");
  const [symbol, setSymbol] = useState("AAPL");
  const [quantity, setQuantity] = useState(1);
  const [avgCost, setAvgCost] = useState(100);

  async function loadHoldings() {
    const res = await api.get("/holdings");
    setHoldings(res.data);
  }

  async function addHolding() {
    await api.post("/holdings", { type, symbol, quantity: Number(quantity), avgCost: Number(avgCost) });
    await loadHoldings();
  }

  async function removeHolding(id) {
    await api.delete(`/holdings/${id}`);
    await loadHoldings();
  }

  useEffect(() => {
    loadHoldings();
  }, []);

  return (
    <Box p={6}>
      <Heading size="lg">Dashboard</Heading>

      <Stack direction={{ base: "column", md: "row" }} mt={4} spacing={3} align="center">
        <Select value={type} onChange={(e) => setType(e.target.value)} maxW="160px">
          <option value="stock">stock</option>
          <option value="crypto">crypto</option>
        </Select>
        <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol" maxW="160px" />
        <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" type="number" maxW="160px" />
        <Input value={avgCost} onChange={(e) => setAvgCost(e.target.value)} placeholder="Avg Cost" type="number" maxW="160px" />
        <Button onClick={addHolding}>Add</Button>
        <Button onClick={() => { localStorage.removeItem("token"); onLogout(); }}>Logout</Button>
      </Stack>

      <Box mt={6}>
        <Table>
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>Symbol</Th>
              <Th isNumeric>Qty</Th>
              <Th isNumeric>Avg Cost</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {holdings.map((h) => (
              <Tr key={h._id}>
                <Td>{h.type}</Td>
                <Td>{h.symbol}</Td>
                <Td isNumeric>{h.quantity}</Td>
                <Td isNumeric>{h.avgCost}</Td>
                <Td>
                  <Button size="sm" onClick={() => removeHolding(h._id)}>Delete</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}

