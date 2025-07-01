import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import StatCard from "./StatCard";
import TrafficChart from "./TrafficChart";

export default function Dashboard() {
  const { colorMode } = useColorMode();

  return (
    <Box 
      flex="1" 
      bg={colorMode === 'dark' ? "#181A20" : "#ffffff"} 
      p={8} 
      minH="100vh"
    >
      <Heading 
        color={colorMode === 'dark' ? "#fff" : "#2d3748"} 
        mb={6}
      >
        概览
      </Heading>
      <SimpleGrid columns={4} gap={6} mb={6}>
        <StatCard title="上传" value="0 B/s" />
        <StatCard title="下载" value="0 B/s" />
        <StatCard title="上传总量" value="0 B" />
        <StatCard title="下载总量" value="0 B" />
        <StatCard title="活动连接" value="0" />
      </SimpleGrid>
      <TrafficChart />
    </Box>
  );
}