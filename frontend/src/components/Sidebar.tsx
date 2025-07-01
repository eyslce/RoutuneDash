import { Box, VStack, Icon, Text } from "@chakra-ui/react";
import { useColorMode, ColorModeButton } from "@/components/ui/color-mode";
import { FaChartBar, FaGlobe, FaPencilRuler, FaLink, FaCog, FaBook } from "react-icons/fa";

const menu = [
  { icon: FaChartBar, label: "概览" },
  { icon: FaGlobe, label: "代理" },
  { icon: FaPencilRuler, label: "规则" },
  { icon: FaLink, label: "连接" },
  { icon: FaCog, label: "配置" },
  { icon: FaBook, label: "日志" },
];

interface SidebarProps {
  selectedMenu: string;
  onMenuSelect: (menu: string) => void;
}

export default function Sidebar({ selectedMenu, onMenuSelect }: SidebarProps) {
  const { colorMode } = useColorMode();

  return (
    <Box 
      bg={colorMode === 'dark' ? "#181A20" : "#f7fafc"} 
      w="70px" 
      h="100vh" 
      p={2} 
      position="relative"
      borderRight="1px solid"
      borderColor={colorMode === 'dark' ? "#2d3748" : "#e2e8f0"}
    >
      <VStack gap={6}>
        {menu.map((item) => (
          <Box 
            key={item.label} 
            w="full" 
            textAlign="center" 
            color={selectedMenu === item.label ? "#3182ce" : (colorMode === 'dark' ? "#fff" : "#2d3748")}
            cursor="pointer"
            onClick={() => onMenuSelect(item.label)}
            _hover={{ color: "#3182ce" }}
            transition="color 0.2s"
          >
            <Icon as={item.icon} boxSize={6} />
            <Text fontSize="sm">{item.label}</Text>
          </Box>
        ))}
        <Box
          position="absolute"
          bottom={4}
          w="full"
          display="flex"
          justifyContent="center"
        >
          <ColorModeButton />
        </Box>
      </VStack>
    </Box>
  );
}