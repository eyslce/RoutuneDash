import { Flex } from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Logs from "@/components/Logs";
import Connections from "@/components/Connections";
import Settings from "@/components/Settings";
import Rules from "@/components/Rules";
import Proxy from "@/components/Proxy";

export default function App() {
  const { t } = useTranslation();
  const [selectedMenu, setSelectedMenu] = useState(t("menu.overview"));

  const renderContent = () => {
    switch (selectedMenu) {
      case t("menu.overview"):
        return <Dashboard />;
      case t("menu.proxy"):
        return <Proxy />;
      case t("menu.rules"):
        return <Rules />;
      case t("menu.connections"):
        return <Connections />;
      case t("menu.settings"):
        return <Settings />;
      case t("menu.logs"):
        return <Logs />;
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