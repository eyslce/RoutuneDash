import { Box } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const data = Array.from({ length: 20 }, (_, i) => ({
  name: i,
  upload: 0,
  download: 0,
}));

export default function TrafficChart() {
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <Box 
      bg="bg.subtle" 
      borderRadius="md" 
      p={4} 
      mt={4}
      border="1px solid"
      borderColor="border.subtle"
    >
      <LineChart width={700} height={250} data={data}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={resolvedTheme === 'dark' ? "#444" : "#e2e8f0"} 
        />
        <XAxis 
          dataKey="name" 
          stroke={resolvedTheme === 'dark' ? "#A0AEC0" : "#4a5568"} 
        />
        <YAxis 
          stroke={resolvedTheme === 'dark' ? "#A0AEC0" : "#4a5568"} 
        />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="upload" stroke="#90cdf4" name={t("dashboard.upload")} />
        <Line type="monotone" dataKey="download" stroke="#b9e97c" name={t("dashboard.download")} />
      </LineChart>
    </Box>
  );
}