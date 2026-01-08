import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function App() {
  const [status, setStatus] = useState("loading...");
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("/api/health")
      .then((res) => setStatus(res.data.status))
      .catch((err) => {
        setStatus("error");
        setError(err?.message || String(err));
        console.error("API call failed:", err);
      });
  }, []);

  return (
    <Box p={6}>
      <Heading size="lg">Financial Portfolio Manager</Heading>
      <Text mt={4}>API status: {status}</Text>
      {error && <Text mt={2}>Error: {error}</Text>}
    </Box>
  );
}


