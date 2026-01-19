import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  SimpleGrid,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Stack,
  HStack,
  VStack,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import { SearchIcon, InfoIcon } from "@chakra-ui/icons";
import Card from "../components/Card";

// Content 

const METRICS = [
  {
    key: "value",
    title: "Value",
    short: "Total portfolio value based on the latest available prices.",
    detail: {
      what: "Value is the sum of each holding’s current value (quantity × price).",
      how: [
        "For each holding: currentValue = quantity × price",
        "Total Value = sum(currentValue across holdings)",
      ],
      gotchas: [
        "If a holding has no price, it may show as missing and reduce total value.",
        "If you use historical pricing, value updates on the latest close/daily point.",
      ],
    },
  },
  {
    key: "profit",
    title: "Total Profit",
    short: "Your gain/loss relative to your cost basis.",
    detail: {
      what: "Profit compares current value vs what you paid (cost basis).",
      how: [
        "Cost Basis = quantity × avg cost",
        "Profit = currentValue − costBasis",
        "Profit % = Profit / costBasis × 100",
      ],
      gotchas: [
        "Negative profit is normal if price is below your average cost.",
        "If avg cost is wrong, profit will be wrong.",
      ],
    },
  },
  {
    key: "irr",
    title: "IRR",
    short: "Money-weighted annual return based on your cash flows.",
    detail: {
      what: "IRR accounts for timing of deposits/withdrawals. It is not the same as simple profit %.",
      how: [
        "IRR uses dated cash flows (buys/sells/deposits/withdrawals).",
        "It finds the rate that makes the net present value of flows equal to zero.",
      ],
      gotchas: [
        "IRR can change significantly after new deposits or withdrawals.",
        "If transactions are missing dates or amounts, IRR will be unreliable.",
      ],
    },
  },
  {
    key: "allocation",
    title: "Allocation %",
    short: "How much each holding contributes to total portfolio value.",
    detail: {
      what: "Allocation is each holding’s share of total value.",
      how: [
        "Allocation% = holdingCurrentValue / totalValue × 100",
        "Total should be ~100% (rounding may cause slight differences).",
      ],
      gotchas: [
        "If a holding has missing price, its allocation becomes 0% and others inflate.",
        "If total value is 0, allocation is 0% for everything.",
      ],
    },
  },
  {
    key: "income",
    title: "Passive Income",
    short: "Income you receive from distributions (dividends, interest, etc.).",
    detail: {
      what: "Passive income is tracked from transactions or distributions you log.",
      how: [
        "Add income events (dividends/interest) to calculate totals and trends.",
        "Some assets distribute irregularly; consistency varies by instrument.",
      ],
      gotchas: [
        "If you do not log income transactions, totals will be incomplete.",
        "Tax withholding can affect the net amount you receive.",
      ],
    },
  },
];

const TERMS = [
  // Stocks
  {
    key: "market-cap",
    category: "Stocks",
    title: "Market Cap",
    oneLiner: "Company size measured as share price × shares outstanding.",
    example: "If price is €50 and shares outstanding are 100M, market cap is €5B.",
    gotchas: ["Market cap does not equal cash in the company.", "Large cap does not always mean low risk."],
  },
  {
    key: "dividend",
    category: "Stocks",
    title: "Dividend",
    oneLiner: "A cash distribution paid to shareholders.",
    example: "A €0.50 dividend with 100 shares results in €50 before tax.",
    gotchas: ["Dividends can be cut.", "Yield can be misleading if price recently dropped."],
  },
  {
    key: "etf",
    category: "Stocks",
    title: "ETF",
    oneLiner: "A basket of assets traded like a stock.",
    example: "An S&P 500 ETF gives exposure to 500 companies in one position.",
    gotchas: ["ETF price can move with the market even if you did not trade it."],
  },

  // Crypto
  {
    key: "staking",
    category: "Crypto",
    title: "Staking",
    oneLiner: "Earning rewards by helping secure a network (Proof of Stake).",
    example: "Staking 100 units at 5% annual yield targets ~5 units/year (variable).",
    gotchas: ["Rewards are not guaranteed.", "Some staking has lock-up periods."],
  },
  {
    key: "liquidity",
    category: "Crypto",
    title: "Liquidity",
    oneLiner: "How easily an asset can be bought/sold without moving the price.",
    example: "High liquidity usually means tighter spreads and lower slippage.",
    gotchas: ["Low liquidity can cause large price impact on trades."],
  },
  {
    key: "gas-fees",
    category: "Crypto",
    title: "Gas Fees",
    oneLiner: "Network fees paid to process transactions.",
    example: "Sending tokens can cost a fee that varies with network congestion.",
    gotchas: ["Fees can spike suddenly.", "Fees are separate from exchange trading fees."],
  },

  // Troubleshooting / app-specific
  {
    key: "missing-prices",
    category: "Troubleshooting",
    title: "Why prices can be missing",
    oneLiner: "If an asset cannot be matched to a data source, value may show as unavailable.",
    example: "Some tickers require exchange suffixes. Some crypto needs a provider id (cgId).",
    gotchas: ["Missing prices cause allocation to skew.", "Historical mode updates on last close/daily point."],
  },
  {
    key: "avg-cost",
    category: "Troubleshooting",
    title: "Average Cost mistakes",
    oneLiner: "Avg cost drives profit calculations. Incorrect inputs will mislead results.",
    example: "If you paid €1000 for 2 shares, avg cost is €500 (not €1000).",
    gotchas: ["Make sure quantity is units, not currency.", "Include fees if you want true cost basis."],
  },
];

const FAQS = [
  {
    q: "Why is my profit negative?",
    a: [
      "Your current price is below your average cost (cost basis).",
      "Check that quantity is correct (units, not euros).",
      "Check that avg cost is per unit, not total paid.",
    ],
  },
  {
    q: "Why does IRR change after I add money?",
    a: [
      "IRR is money-weighted and sensitive to timing of cash flows.",
      "Adding a deposit changes the weighting of gains/losses.",
    ],
  },
  {
    q: "Why does allocation not add up to 100%?",
    a: [
      "Rounding can cause small differences.",
      "Missing prices can make some holdings show 0%, inflating the rest.",
    ],
  },
];

const GUIDES = [
  {
    title: "Add holdings correctly",
    bullets: [
      "Pick the right asset (stock symbol or crypto id).",
      "Enter quantity in units (shares/coins).",
      "Avg cost is per unit; include fees if you want true cost basis.",
      "If you use historical pricing, expect updates at the latest close/daily point.",
    ],
  },
  {
    title: "Read performance the right way",
    bullets: [
      "Profit is absolute change vs cost basis.",
      "Profit % normalizes profit by what you invested.",
      "IRR is timing-aware; it’s not the same as profit %.",
    ],
  },
  {
    title: "Fix missing prices fast",
    bullets: [
      "Stocks may need exchange suffixes depending on your data source.",
      "Crypto should store a provider id (CoinGecko id) for stable matching.",
      "Caching is normal; values may refresh on schedule in historical mode.",
    ],
  },
];

// UI helpers

function Section({ title, subtitle, children }) {
  return (
    <Box>
      <Heading size="md" mb={1}>
        {title}
      </Heading>
      {subtitle ? (
        <Text color="gray.600" mb={4}>
          {subtitle}
        </Text>
      ) : (
        <Box mb={4} />
      )}
      {children}
    </Box>
  );
}

export default function LearningCenter({ insights }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalItem, setModalItem] = useState(null);

  const normalized = search.trim().toLowerCase();

  const filteredTerms = useMemo(() => {
    if (!normalized) return TERMS;
    return TERMS.filter((t) => {
      return (
        t.title.toLowerCase().includes(normalized) ||
        t.oneLiner.toLowerCase().includes(normalized) ||
        t.category.toLowerCase().includes(normalized) ||
        t.key.toLowerCase().includes(normalized)
      );
    });
  }, [normalized]);

  const filteredMetrics = useMemo(() => {
    if (!normalized) return METRICS;
    return METRICS.filter((m) => {
      const blob = `${m.title} ${m.short} ${m.detail?.what || ""}`.toLowerCase();
      return blob.includes(normalized);
    });
  }, [normalized]);

  function openDetail(item) {
    setModalItem(item);
    onOpen();
  }

  function quickOpen(key) {
    const metric = METRICS.find((m) => m.key === key);
    if (metric) return openDetail({ kind: "metric", ...metric });

    const term = TERMS.find((t) => t.key === key);
    if (term) return openDetail({ kind: "term", ...term });
  }

  return (
    <Box px={{ base: 4, md: 6 }} py={6}>
      {/* Hero */}
      <Card p={{ base: 4, md: 6 }} mb={6}>
        <Flex direction={{ base: "column", md: "row" }} gap={4} align="center">
          <Box flex="1">
            <Heading size="lg">Learning Center</Heading>
            <Text color="gray.600" mt={1}>
              Understand your dashboard metrics, fix common issues, and learn key concepts in minutes.
            </Text>

            {/* Optional personalized hint */}
            {insights?.recommended?.length ? (
              <HStack mt={3} spacing={2} wrap="wrap">
                <Text fontSize="sm" color="gray.600">
                  Suggested:
                </Text>
                {insights.recommended.slice(0, 3).map((k) => (
                  <Button key={k} size="xs" variant="outline" onClick={() => quickOpen(k)}>
                    {String(k).replace("-", " ")}
                  </Button>
                ))}
              </HStack>
            ) : null}
          </Box>

          <Box w={{ base: "100%", md: "420px" }}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.500" />
              </InputLeftElement>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value ?? "")}
                placeholder="Search metrics, terms, or troubleshooting..."
                bg="gray.50"
              />
            </InputGroup>

            <HStack mt={3} spacing={2} wrap="wrap">
              <Button size="sm" variant="solid" onClick={() => quickOpen("allocation")}>
                Allocation %
              </Button>
              <Button size="sm" variant="outline" onClick={() => quickOpen("irr")}>
                IRR
              </Button>
              <Button size="sm" variant="outline" onClick={() => quickOpen("missing-prices")}>
                Missing prices
              </Button>
            </HStack>
          </Box>
        </Flex>
      </Card>

      {/* DASHBOARD METRICS */}
      <Section
        title="Your dashboard metrics"
        subtitle="These definitions match the KPIs and tables in your app."
      >
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {filteredMetrics.map((m) => (
            <Card key={m.key} p={4}>
              <HStack justify="space-between" align="start">
                <Box>
                  <HStack spacing={2}>
                    <Heading size="sm">{m.title}</Heading>
                    <Badge colorScheme="gray" variant="subtle">
                      Metric
                    </Badge>
                  </HStack>
                  <Text mt={2} color="gray.600">
                    {m.short}
                  </Text>
                </Box>

                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<InfoIcon />}
                  onClick={() => openDetail({ kind: "metric", ...m })}
                >
                  Details
                </Button>
              </HStack>
            </Card>
          ))}
        </SimpleGrid>
      </Section>

      <Divider my={8} />

      {/* TABS */}
      <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" colorScheme="teal">
        <TabList>
          <Tab>Glossary</Tab>
          <Tab>Stocks</Tab>
          <Tab>Crypto</Tab>
          <Tab>Troubleshooting</Tab>
          <Tab>FAQ</Tab>
          <Tab>Mini guides</Tab>
        </TabList>

        <TabPanels mt={4}>
          {/* Glossary */}
          <TabPanel px={0}>
            <TermGrid items={filteredTerms} onOpen={openDetail} />
            {filteredTerms.length === 0 ? (
              <Text mt={4} color="gray.600">
                No results found. Try searching for “allocation”, “dividend”, or “gas fees”.
              </Text>
            ) : null}
          </TabPanel>

          {/* Stocks */}
          <TabPanel px={0}>
            <TermGrid
              items={filteredTerms.filter((t) => t.category === "Stocks")}
              onOpen={openDetail}
            />
          </TabPanel>

          {/* Crypto */}
          <TabPanel px={0}>
            <TermGrid
              items={filteredTerms.filter((t) => t.category === "Crypto")}
              onOpen={openDetail}
            />
          </TabPanel>

          {/* Troubleshooting */}
          <TabPanel px={0}>
            <TermGrid
              items={filteredTerms.filter((t) => t.category === "Troubleshooting")}
              onOpen={openDetail}
            />

            <Card p={4} mt={4}>
              <Heading size="sm" mb={2}>
                Common checks (fast)
              </Heading>
              <Stack spacing={2} color="gray.700">
                <Text>1) Quantity is units (shares/coins), not currency.</Text>
                <Text>2) Avg cost is per unit, not total paid.</Text>
                <Text>3) If allocation looks wrong, verify every holding has a price.</Text>
                <Text>4) In historical mode, prices update on the last close/daily point.</Text>
              </Stack>
            </Card>
          </TabPanel>

          {/* FAQ */}
          <TabPanel px={0}>
            <Card p={2}>
              <Accordion allowMultiple>
                {FAQS.map((f) => (
                  <AccordionItem key={f.q} border="none">
                    <AccordionButton px={4} py={3}>
                      <Box flex="1" textAlign="left" fontWeight="600">
                        {f.q}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel px={4} pb={4} color="gray.700">
                      <Stack spacing={2}>
                        {f.a.map((line, idx) => (
                          <Text key={idx}>{line}</Text>
                        ))}
                      </Stack>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </TabPanel>

          {/* Mini guides */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
              {GUIDES.map((g) => (
                <Card key={g.title} p={4}>
                  <Heading size="sm">{g.title}</Heading>
                  <Stack mt={3} spacing={2} color="gray.700">
                    {g.bullets.map((b, idx) => (
                      <Text key={idx}>• {b}</Text>
                    ))}
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Detail modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalItem?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {modalItem?.kind === "metric" ? (
              <MetricDetail item={modalItem} />
            ) : modalItem?.kind === "term" ? (
              <TermDetail item={modalItem} />
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function TermGrid({ items, onOpen }) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
      {items.map((t) => (
        <Card key={t.key} p={4}>
          <HStack justify="space-between" align="start">
            <Box>
              <HStack spacing={2} wrap="wrap">
                <Heading size="sm">{t.title}</Heading>
                <Badge variant="subtle">{t.category}</Badge>
              </HStack>
              <Text mt={2} color="gray.600">
                {t.oneLiner}
              </Text>
            </Box>

            <Button size="sm" variant="ghost" onClick={() => onOpen({ kind: "term", ...t })}>
              Expand
            </Button>
          </HStack>
        </Card>
      ))}
      {items.length === 0 ? <Text color="gray.600">No items to show.</Text> : null}
    </SimpleGrid>
  );
}

function MetricDetail({ item }) {
  return (
    <VStack align="stretch" spacing={4}>
      <Text color="gray.700">{item.short}</Text>

      <Box>
        <Heading size="xs" mb={2}>
          What it means
        </Heading>
        <Text color="gray.700">{item.detail?.what}</Text>
      </Box>

      <Box>
        <Heading size="xs" mb={2}>
          How it’s calculated
        </Heading>
        <Stack spacing={1} color="gray.700">
          {(item.detail?.how || []).map((x, idx) => (
            <Text key={idx}>• {x}</Text>
          ))}
        </Stack>
      </Box>

      <Box>
        <Heading size="xs" mb={2}>
          Common gotchas
        </Heading>
        <Stack spacing={1} color="gray.700">
          {(item.detail?.gotchas || []).map((x, idx) => (
            <Text key={idx}>• {x}</Text>
          ))}
        </Stack>
      </Box>
    </VStack>
  );
}

function TermDetail({ item }) {
  return (
    <VStack align="stretch" spacing={4}>
      <Text color="gray.700">{item.oneLiner}</Text>

      <Box>
        <Heading size="xs" mb={2}>
          Example
        </Heading>
        <Text color="gray.700">{item.example}</Text>
      </Box>

      <Box>
        <Heading size="xs" mb={2}>
          Common gotchas
        </Heading>
        <Stack spacing={1} color="gray.700">
          {(item.gotchas || []).map((x, idx) => (
            <Text key={idx}>• {x}</Text>
          ))}
        </Stack>
      </Box>
    </VStack>
  );
}
