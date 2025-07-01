import { Flex, Box } from "@chakra-ui/react";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";

export default function App() {
  const [selectedMenu, setSelectedMenu] = useState("概览");

  const renderContent = () => {
    switch (selectedMenu) {
      case "概览":
        return <Dashboard />;
      case "代理":
        return <Box flex={1} bg="bg" p={8} minH="100vh" color="fg">代理页面 - 开发中</Box>;
      case "规则":
        return <Box flex={1} bg="bg" p={8} minH="100vh" color="fg">规则页面 - 开发中</Box>;
      case "连接":
        return <Box flex={1} bg="bg" p={8} minH="100vh" color="fg">连接页面 - 开发中</Box>;
      case "配置":
        return <Box flex={1} bg="bg" p={8} minH="100vh" color="fg">配置页面 - 开发中</Box>;
      case "日志":
        return <Box flex={1} bg="bg" p={8} minH="100vh" color="fg">日志页面 - 开发中</Box>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Flex bg="bg" minH="100vh">
      <Sidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />
      {renderContent()}
    </Flex>
  );
}