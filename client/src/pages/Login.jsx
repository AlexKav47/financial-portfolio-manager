import { useState } from "react";
import { api } from "../services/api";
import { Box, Button, Heading, Input, Stack, Text } from "@chakra-ui/react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  /**
   * Submits credentials to the backend
   * If successful, it stores the token and flips the authed switch in the parent
   */
  async function handleLogin() {
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      onLogin();
    } catch (e) {
      setError(e?.response?.data?.message || "Login failed");
    }
  }

  return (
    <Box p={6} maxW="420px">
      <Heading size="lg">Login</Heading>
      <Stack mt={4} spacing={3}>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        {error && <Text>{error}</Text>}
        <Button onClick={handleLogin}>Login</Button>
      </Stack>
    </Box>
  );
}
