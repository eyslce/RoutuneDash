import { Box, VStack, Icon, Text } from "@chakra-ui/react";
import { FaChartBar, FaGlobe, FaPencilRuler, FaLink, FaCog, FaBook } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const menuItems = [
  { icon: FaChartBar, key: "overview" },
  { icon: FaGlobe, key: "proxy" },
  { icon: FaPencilRuler, key: "rules" },
  { icon: FaLink, key: "connections" },
  { icon: FaCog, key: "settings" },
  { icon: FaBook, key: "logs" },
];

interface SidebarProps {
  selectedMenu: string;
  onMenuSelect: (menu: string) => void;
}

export default function Sidebar({ selectedMenu, onMenuSelect }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <Box 
      bg="bg.subtle" 
      w="70px" 
      h="100vh" 
      p={2} 
      position="relative"
      borderRight="1px solid"
      borderColor="border.subtle"
    >
      <VStack gap={6}>
        {menuItems.map((item) => {
          const label = t(`menu.${item.key}`);
          return (
            <Box 
              key={item.key} 
              w="full" 
              textAlign="center" 
              color={selectedMenu === label ? "blue.500" : "fg"}
              cursor="pointer"
              onClick={() => onMenuSelect(label)}
              _hover={{ color: "blue.500" }}
              transition="color 0.2s"
            >
              <Icon as={item.icon} boxSize={6} />
              <Text fontSize="sm">{label}</Text>
            </Box>
          );
        })}

      </VStack>
    </Box>
  );
}