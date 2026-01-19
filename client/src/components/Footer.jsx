import { Box, Flex, Heading, Link, SimpleGrid, Text } from "@chakra-ui/react";
import Card from "./Card";

/**
 * Footer component used to display site info,
 * links, and social media at the bottom of the dashboard
 */
export default function Footer() {
  return (
    <Card>
      <Flex align="flex-start" justify="space-between" wrap="wrap" gap={6}>

          {/* Branding and Address */}
        <Box minW="220px">
          <Heading size="sm">Portfolio Tracker</Heading>
          <Text mt={3} fontWeight="600">Address:</Text>
          <Text>121 Main Street</Text>
          <Text>State Province, Country</Text>

          {/* Social Media Links row */}
          <Flex mt={4} gap={4}>
            <Link href="#" fontSize="sm">Twitter</Link>
            <Link href="#" fontSize="sm">Instagram</Link>
            <Link href="#" fontSize="sm">Facebook</Link>
          </Flex>
        </Box>

        {/* Link Directory */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} flex="1" minW={{ base: "100%", md: "520px" }}>
          {/* Column One */}
          <Box>
            <Text fontWeight="700" mb={2}>Resources</Text>
            <Link display="block" href="#" py={1}>Help Center</Link>
            <Link display="block" href="#" py={1}>API Docs</Link>
            <Link display="block" href="#" py={1}>Community</Link>
            <Link display="block" href="#" py={1}>Blog</Link>
          </Box>

          {/* Column Two */}
          <Box>
            <Text fontWeight="700" mb={2}>Company</Text>
            <Link display="block" href="#" py={1}>About Us</Link>
            <Link display="block" href="#" py={1}>Careers</Link>
            <Link display="block" href="#" py={1}>Press</Link>
            <Link display="block" href="#" py={1}>Contact</Link>
          </Box>

          {/* Column Three */}
          <Box>
            <Text fontWeight="700" mb={2}>Legal</Text>
            <Link display="block" href="#" py={1}>Privacy</Link>
            <Link display="block" href="#" py={1}>Security</Link>
            <Link display="block" href="#" py={1}>Compliance</Link>
            <Link display="block" href="#" py={1}>Cookies</Link>
          </Box>
        </SimpleGrid>
      </Flex>

      {/* Footer Bottom Copyright and Legal links */}
      <Box mt={6} pt={4} borderTop="1px solid" borderColor="gray.200">
        <Flex justify="space-between" wrap="wrap" gap={3}>
          <Text fontSize="sm" color="gray.600">
            © {new Date().getFullYear()} Your Website. All rights reserved.
          </Text>
          <Flex gap={4}>
            <Link href="#" fontSize="sm">Privacy Policy</Link>
            <Link href="#" fontSize="sm">Terms of Service</Link>
          </Flex>
        </Flex>
      </Box>
    </Card>
  );
}
