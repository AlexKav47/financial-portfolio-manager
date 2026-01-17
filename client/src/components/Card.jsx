import { Box } from "@chakra-ui/react";

/**
 * Universal wrapper component
 */
export default function Card({ children, ...props }) {
  return (
    <Box
      bg="white"
      borderRadius="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.200"
      p={4}
      {...props}
    >
      {children}
    </Box>
  );
}
