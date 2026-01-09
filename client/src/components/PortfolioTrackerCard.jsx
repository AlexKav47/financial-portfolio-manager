import { Box, Flex, Heading, Link, SimpleGrid, Text } from "@chakra-ui/react";
import Card from "./Card";

export default function PortfolioTrackerCard() {
  return (
    <Card>
      <Flex align="flex-start" justify="space-between" wrap="wrap" gap={6}>
        <Box minW="220px">
          <Heading size="sm">Portfolio Tracker</Heading>
          <Text mt={3} fontWeight="600">Address:</Text>
          <Text>121 Main Street</Text>
          <Text>State Province, Country</Text>

          <Flex mt={4} gap={4}>
            <Link href="#" fontSize="sm">Twitter</Link>
            <Link href="#" fontSize="sm">Instagram</Link>
            <Link href="#" fontSize="sm">Facebook</Link>
          </Flex>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} flex="1" minW={{ base: "100%", md: "520px" }}>
          <Box>
            <Text fontWeight="700" mb={2}>Column one</Text>
            <Link display="block" href="#">Link one</Link>
            <Link display="block" href="#">Link two</Link>
            <Link display="block" href="#">Link three</Link>
            <Link display="block" href="#">Link four</Link>
          </Box>

          <Box>
            <Text fontWeight="700" mb={2}>Column two</Text>
            <Link display="block" href="#">Link six</Link>
            <Link display="block" href="#">Link six</Link>
            <Link display="block" href="#">Link seven</Link>
            <Link display="block" href="#">Link eight</Link>
          </Box>

          <Box>
            <Text fontWeight="700" mb={2}>Column three</Text>
            <Link display="block" href="#">Link two</Link>
            <Link display="block" href="#">Link fen</Link>
            <Link display="block" href="#">Link then</Link>
            <Link display="block" href="#">Link twelve</Link>
          </Box>
        </SimpleGrid>
      </Flex>

      <Box mt={6} pt={4} borderTop="1px solid" borderColor="gray.200">
        <Flex justify="space-between" wrap="wrap" gap={3}>
          <Text fontSize="sm" color="gray.600">© 2024 Your Website. All rights reserved.</Text>
          <Flex gap={4}>
            <Link href="#" fontSize="sm">Privacy Policy</Link>
            <Link href="#" fontSize="sm">Terms of Service</Link>
          </Flex>
        </Flex>
      </Box>
    </Card>
  );
}
