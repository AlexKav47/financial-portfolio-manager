import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import Card from "../components/Card";
import PortfolioTrackerCard from "../components/PortfolioTrackerCard";

function Term({ title, desc }) {
  return (
    <Box>
      <Text fontWeight="700" mb={1}>
        {title}
      </Text>
      <Text color="gray.600" fontSize="sm">
        {desc}
      </Text>
    </Box>
  );
}

function FAQItem({ q, a }) {
  return (
    <Box>
      <Text fontWeight="700">Q: {q}</Text>
      <Text color="gray.600" fontSize="sm" mt={1}>
        A: {a}
      </Text>
    </Box>
  );
}

export default function Learning() {
  return (
    <Box>
      {/* Hero / Learning Center */}
      <Card>
        <Heading size="lg" textAlign="center">
          Learning Center
        </Heading>
        <Text mt={2} textAlign="center" color="gray.600">
          A quick guide to using the tracker and understanding terms.
        </Text>
      </Card>

      {/* Glossary */}
      <Box mt={6}>
        <Card>
          <Heading size="md" mb={4}>
            Glossary
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Term
              title="Value"
              desc="The total value of your cash, stocks and crypto."
            />
            <Term
              title="IRR"
              desc="Internal Rate of Return, showing your annualised growth based on cash flows."
            />
            <Term
              title="Allocation %"
              desc="The percentage of your portfolio in each asset."
            />
          </SimpleGrid>
        </Card>
      </Box>

      {/* Crypto */}
      <Box mt={6}>
        <Card>
          <Heading size="md" mb={4}>
            Crypto
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Term
              title="Staking"
              desc="Earning rewards for helping secure a blockchain network."
            />
            <Term
              title="Liquidity"
              desc="How easily an asset can be bought or sold without affecting price."
            />
            <Term
              title="Gas Fees"
              desc="Transaction fees paid to process actions on a blockchain."
            />
          </SimpleGrid>
        </Card>
      </Box>

      {/* Stocks */}
      <Box mt={6}>
        <Card>
          <Heading size="md" mb={4}>
            Stocks
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Term
              title="Market Cap"
              desc="Company value: share price multiplied by shares outstanding."
            />
            <Term
              title="Dividend"
              desc="A cash payout from a company to shareholders, usually from profits."
            />
            <Term
              title="ETF"
              desc="Exchange Traded Fund: a basket of assets that trades like a stock."
            />
          </SimpleGrid>
        </Card>
      </Box>

      {/* FAQ */}
      <Box mt={6}>
        <Card>
          <Heading size="md" mb={4}>
            FAQ
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <FAQItem
              q="Why is my profit negative?"
              a="Your current value is below your cost basis (what you paid), or prices have fallen."
            />
            <FAQItem
              q="Why does my IRR change when I deposit money?"
              a="IRR is money-weighted; adding cash flows changes the return calculation."
            />
            <FAQItem
              q="Why doesn't my allocation add up?"
              a="Some assets may not have a live price yet, or rounding can affect totals."
            />
          </SimpleGrid>
        </Card>
      </Box>

      {/* Footer card (same as Main) */}
      <Box mt={6}>
        <PortfolioTrackerCard />
      </Box>
    </Box>
  );
}

