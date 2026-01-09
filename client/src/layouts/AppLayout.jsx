import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Tabs,
  TabList,
  Tab,
  Container,
  Flex,
  Avatar,
  Heading,
  Spacer,
} from "@chakra-ui/react";
import Card from "../components/Card";

const tabs = [
  { label: "Main", path: "/" },
  { label: "Learning", path: "/learning" },
  { label: "Transactions", path: "/transactions" },
  { label: "Income", path: "/income" },
];

function tabIndexFromPath(pathname) {
  const exact = tabs.findIndex((t) => t.path === pathname);
  if (exact !== -1) return exact;

  // Supports nested routes later (e.g. /transactions/123)
  const prefix = tabs.findIndex((t) => t.path !== "/" && pathname.startsWith(t.path));
  return prefix !== -1 ? prefix : 0;
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const index = tabIndexFromPath(location.pathname);

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="6xl" pt={5} pb={3}>
        {/* Header Card (matches your top red box) */}
        <Card p={5}>
          <Flex align="center">
            <Avatar name="Alex" size="md" />
            <Spacer />
            <Heading size="md" textAlign="center">
              Financial Portfolio Manager
            </Heading>
            <Spacer />
            {/* spacer to balance the avatar visually */}
            <Box w="40px" />
          </Flex>

          <Box mt={4}>
            <Tabs
              index={index}
              onChange={(i) => navigate(tabs[i].path)}
              variant="enclosed"
            >
              <TabList>
                {tabs.map((t) => (
                  <Tab key={t.path}>{t.label}</Tab>
                ))}
              </TabList>
            </Tabs>
          </Box>
        </Card>
      </Container>

      {/* Page content */}
      <Container maxW="6xl" pb={8}>
        <Outlet />
      </Container>
    </Box>
  );
}
