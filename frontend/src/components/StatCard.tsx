import { Box, Text } from "@chakra-ui/react";

export default function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <Box 
      bg="bg.subtle" 
      borderRadius="md" 
      p={4} 
      minW="180px"
      border="1px solid"
      borderColor="border.subtle"
    >
      <Text color="fg.muted" fontSize="sm">{title}</Text>
      <Text color="fg" fontSize="2xl" fontWeight="bold">{value}</Text>
    </Box>
  );
}