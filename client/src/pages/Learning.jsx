import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import Card from "../components/Card";
import PortfolioTrackerCard from "../components/PortfolioTrackerCard";

function LearningSection({ title, children }) {
  return (
    <Box mt={6}>
      <Card>
        <Heading size="md" mb={4}>
          {title}
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {children}
        </SimpleGrid>
      </Card>
    </Box>
  );
}

function Term({ title, desc }) {
  return (
    <Box>
      <Text fontWeight="700" mb={1}>{title}</Text>
      <Text color="gray.600" fontSize="sm">{desc}</Text>
    </Box>
  );
}

function FAQItem({ q, a }) {
  return (
    <Box>
      <Text fontWeight="700">Q: {q}</Text>
      <Text color="gray.600" fontSize="sm" mt={1}>A: {a}</Text>
    </Box>
  );
}

export default function Learning() {
  return (
    <Box>
      {/* Hero */}
      <Card>
        <Heading size="lg" textAlign="center">Learning Center</Heading>
        <Text mt={2} textAlign="center" color="gray.600">
          A quick guide to using the tracker and understanding terms.
        </Text>
      </Card>
      
      <LearningSection title="Glossary">
        <Term title="Value" desc="The total value of your cash, stocks and crypto." />
        <Term title="IRR" desc="Internal Rate of Return..." />
        <Term title="Allocation %" desc="The percentage of your portfolio..." />
      </LearningSection>

      <LearningSection title="Crypto">
        <Term title="Staking" desc="Earning rewards for helping secure a network." />
        <Term title="Liquidity" desc="How easily an asset can be bought or sold." />
        <Term title="Gas Fees" desc="Transaction fees paid to process actions." />
      </LearningSection>

      <LearningSection title="Stocks">
        <Term title="Market Cap" desc="Company value: share price x shares." />
        <Term title="Dividend" desc="A cash payout from a company." />
        <Term title="ETF" desc="A basket of assets that trades like a stock." />
      </LearningSection>

      <LearningSection title="FAQ">
        <FAQItem q="Why is my profit negative?" a="Your value is below your cost basis." />
        <FAQItem q="Why does my IRR change?" a="IRR is money-weighted based on cash flows." />
        <FAQItem q="Why doesn't my allocation add up?" a="Rounding or missing live prices." />
      </LearningSection>

      <Box mt={6}>
        <PortfolioTrackerCard />
      </Box>
    </Box>
  );
}
