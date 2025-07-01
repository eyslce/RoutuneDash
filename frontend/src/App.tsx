import { Flex, Box } from "@chakra-ui/react";
import { useState } from "react";
import { useColorMode } from "@/components/ui/color-mode";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";

export default function App() {
  const [selectedMenu, setSelectedMenu] = useState("概览");
  const { colorMode } = useColorMode();

  const pageStyle = {
    flex: 1,
    backgroundColor: colorMode === 'dark' ? "#181A20" : "#ffffff",
    padding: "32px",
    minHeight: "100vh",
    color: colorMode === 'dark' ? "white" : "#2d3748"
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "概览":
        return <Dashboard />;
      case "代理":
        return <Box style={pageStyle}>代理页面 - 开发中</Box>;
      case "规则":
        return <Box style={pageStyle}>规则页面 - 开发中</Box>;
      case "连接":
        return <Box style={pageStyle}>连接页面 - 开发中</Box>;
      case "配置":
        return <Box style={pageStyle}>配置页面 - 开发中</Box>;
      case "日志":
        return <Box style={pageStyle}>日志页面 - 开发中</Box>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Flex bg={colorMode === 'dark' ? "#181A20" : "#f7fafc"} minH="100vh">
      <Sidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />
      {renderContent()}
    </Flex>
  );
}