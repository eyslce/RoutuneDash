import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import StatCard from "./StatCard";
import TrafficChart from "./TrafficChart";

export default function Dashboard() {
  const { t } = useTranslation();
  
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
        {t("dashboard.title")}
      </Heading>
      <SimpleGrid columns={4} gap={6} mb={6}>
        <StatCard title={t("dashboard.upload")} value="0 B/s" />
        <StatCard title={t("dashboard.download")} value="0 B/s" />
        <StatCard title={t("dashboard.upload") + " " + t("dashboard.bytes")} value="0 B" />
        <StatCard title={t("dashboard.download") + " " + t("dashboard.bytes")} value="0 B" />
        <StatCard title={t("dashboard.current_connections")} value="0" />
      </SimpleGrid>
      <TrafficChart />
    </Box>
  );
}