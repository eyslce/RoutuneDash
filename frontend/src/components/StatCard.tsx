import { Box, Text } from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";

export default function StatCard({ title, value }: { title: string, value: string }) {
  const { colorMode } = useColorMode();

  return (
    <Box 
      bg={colorMode === 'dark' ? "#23262F" : "#f7fafc"} 
      borderRadius="md" 
      p={4} 
      minW="180px"
      border="1px solid"
      borderColor={colorMode === 'dark' ? "#4a5568" : "#e2e8f0"}
    >
      <Text color={colorMode === 'dark' ? "#A0AEC0" : "#718096"} fontSize="sm">{title}</Text>
      <Text color={colorMode === 'dark' ? "#fff" : "#2d3748"} fontSize="2xl" fontWeight="bold">{value}</Text>
    </Box>
  );
}