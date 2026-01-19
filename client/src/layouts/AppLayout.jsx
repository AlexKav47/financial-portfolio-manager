import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Tabs, TabList, Tab, Container, Flex, Avatar, Heading, Spacer, } from "@chakra-ui/react";
import Card from "../components/Card";
import Footer from "../components/Footer";

/**
 * Navigation configuration
 * Makes it easy to add new pages later
 */
const tabs = [
  { label: "Main", path: "/" },
  { label: "Learning", path: "/learning" },
  { label: "Holdings", path: "/transactions" },
  { label: "Income", path: "/income" },
];

/**
 * Helper Path to Tab Syncer
 * This function looks at the URL and tells the Tabs component
 * which tab should be highlighted 
 */
function tabIndexFromPath(pathname) {
  const exact = tabs.findIndex((t) => t.path === pathname);
  if (exact !== -1) return exact;

  // Logic for nested routes if you are at /transactions/edit
  const prefix = tabs.findIndex((t) => t.path !== "/" && pathname.startsWith(t.path));
  return prefix !== -1 ? prefix : 0;
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation(); // Watches the URL bar for changes

  const index = tabIndexFromPath(location.pathname);

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="6xl" pt={5} pb={3}>
        {/* Header Section */}
        <Card p={5}>
          <Flex align="center">
            {/* User Profile shortcut */}
            <Avatar name="" size="md" />
            <Spacer />
            <Heading size="md" textAlign="center">
              Financial Portfolio Tracker
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

      {/* Main Page content */}
      <Container maxW="6xl" pb={8}>
        <Outlet />
      </Container>

      {/* Footer */}
      <Container maxW="6xl" pb={8}>
        <Footer />
      </Container>
    </Box>
  );
}
