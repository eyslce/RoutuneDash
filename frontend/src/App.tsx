import { Flex, Box } from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Logs from "@/components/Logs";
import Connections from "@/components/Connections";
import Settings from "@/components/Settings";

export default function App() {
  const { t } = useTranslation();
  const [selectedMenu, setSelectedMenu] = useState(t("menu.overview"));

  const renderContent = () => {
    switch (selectedMenu) {
      case t("menu.overview"):
        return <Dashboard />;
      case t("menu.proxy"):
        return <Box flex={1} bg="bg" p={8} minH="100vh" color="fg">{t("pages.proxy_developing")}</Box>;
      case t("menu.rules"):
        return <Box flex={1} bg="bg" p={8} minH="100vh" color="fg">{t("pages.rules_developing")}</Box>;
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