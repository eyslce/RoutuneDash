import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import StatCard from "./StatCard";
import TrafficChart from "./TrafficChart";

export default function Dashboard() {
  return (
    <Box 
      flex="1" 
      bg="bg" 
      p={8} 
      minH="100vh"
    >
      <Heading 
        color="fg" 
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