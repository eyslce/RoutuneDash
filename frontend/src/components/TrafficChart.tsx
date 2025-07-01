import { Box } from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const data = Array.from({ length: 20 }, (_, i) => ({
  name: i,
  upload: 0,
  download: 0,
}));

export default function TrafficChart() {
  const { colorMode } = useColorMode();

  return (
    <Box 
      bg={colorMode === 'dark' ? "#23262F" : "#f7fafc"} 
      borderRadius="md" 
      p={4} 
      mt={4}
      border="1px solid"
      borderColor={colorMode === 'dark' ? "#4a5568" : "#e2e8f0"}
    >
      <LineChart width={700} height={250} data={data}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={colorMode === 'dark' ? "#444" : "#e2e8f0"} 
        />
        <XAxis 
          dataKey="name" 
          stroke={colorMode === 'dark' ? "#A0AEC0" : "#4a5568"} 
        />
        <YAxis 
          stroke={colorMode === 'dark' ? "#A0AEC0" : "#4a5568"} 
        />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="upload" stroke="#90cdf4" name="上传" />
        <Line type="monotone" dataKey="download" stroke="#b9e97c" name="下载" />
      </LineChart>
    </Box>
  );
}