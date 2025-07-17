import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Grid,
  Heading,
  createListCollection,
  For,
} from "@chakra-ui/react";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ColorModeSelect } from "@/components/ui/color-mode";

interface SettingsConfig {
  httpPort: string;
  socks5Port: string;
  mixedPort: string;
  redirPort: string;
  mode: string;
  logLevel: string;
  allowLan: boolean;
  sniSniffing: boolean;
}

export default function Settings() {
  const { t } = useTranslation();

  // 默认配置
  const defaultConfig: SettingsConfig = {
    httpPort: "0",
    socks5Port: "0",
    mixedPort: "7897",
    redirPort: "0",
    mode: "Rule",
    logLevel: "Info",
    allowLan: true,
    sniSniffing: true,
  };

  const [config, setConfig] = useState<SettingsConfig>(defaultConfig);

  const handleInputChange = (field: keyof SettingsConfig, value: string | boolean | string[]) => {
    const newValue = Array.isArray(value) ? value[0] : value
    setConfig(prev => ({
      ...prev,
      [field]: newValue
    }));
  };

  const handleSave = () => {
    // 这里可以添加保存配置的逻辑
    toaster.create({
      title: t("settings.saved"),
      type: "success",
      duration: 2000,
    });
  };

  const handleReset = () => {
    if (window.confirm(t("settings.reset_confirm"))) {
      setConfig(defaultConfig);
      toaster.create({
        title: "配置已重置",
        type: "info",
        duration: 2000,
      });
    }
  };

  // 创建选择器数据
  const modeOptions = createListCollection({
    items: [
      { label: "Rule", value: "Rule" },
      { label: "Global", value: "Global" },
      { label: "Direct", value: "Direct" },
    ],
  });

  const logLevelOptions = createListCollection({
    items: [
      { label: "Debug", value: "Debug" },
      { label: "Info", value: "Info" },
      { label: "Warning", value: "Warning" },
      { label: "Error", value: "Error" },
    ],
  });

  return (
    <Box flex={1} bg="bg" p={8} minH="100vh" color="fg">
      <VStack gap={8} align="stretch">
        <Heading size="lg" mb={4}>
          {t("settings.title")}
        </Heading>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          {/* 端口设置 */}
          <Box bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.subtle">
            <Box p={4} borderBottom="1px solid" borderColor="border.subtle">
              <Heading size="md">{t("settings.port_settings")}</Heading>
            </Box>
            <Box p={4}>
              <VStack gap={4}>
                <Box w="full">
                  <Text mb={2} fontSize="sm" fontWeight="medium">
                    {t("settings.http_port")}
                  </Text>
                  <Input
                    value={config.httpPort}
                    onChange={(e) => handleInputChange("httpPort", e.target.value)}
                    placeholder="0"
                    size="sm"
                  />
                </Box>
                <Box w="full">
                  <Text mb={2} fontSize="sm" fontWeight="medium">
                    {t("settings.socks5_port")}
                  </Text>
                  <Input
                    value={config.socks5Port}
                    onChange={(e) => handleInputChange("socks5Port", e.target.value)}
                    placeholder="0"
                    size="sm"
                  />
                </Box>
                <Box w="full">
                  <Text mb={2} fontSize="sm" fontWeight="medium">
                    {t("settings.mixed_port")}
                  </Text>
                  <Input
                    value={config.mixedPort}
                    onChange={(e) => handleInputChange("mixedPort", e.target.value)}
                    placeholder="7897"
                    size="sm"
                  />
                </Box>
                <Box w="full">
                  <Text mb={2} fontSize="sm" fontWeight="medium">
                    {t("settings.redir_port")}
                  </Text>
                  <Input
                    value={config.redirPort}
                    onChange={(e) => handleInputChange("redirPort", e.target.value)}
                    placeholder="0"
                    size="sm"
                  />
                </Box>
              </VStack>
            </Box>
          </Box>

          {/* 模式和日志级别设置 */}
          <Box bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.subtle">
            <Box p={4} borderBottom="1px solid" borderColor="border.subtle">
              <Heading size="md">{t("settings.mode_settings")}</Heading>
            </Box>
            <Box p={4}>
              <VStack gap={4}>
                <Box w="full">
                  <Text mb={2} fontSize="sm" fontWeight="medium">
                    {t("settings.mode")}
                  </Text>
                  <SelectRoot
                    collection={modeOptions}
                    size="sm"
                    value={[config.mode]}
                    onValueChange={(e) => handleInputChange("mode", e.value)}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="选择模式" />
                    </SelectTrigger>
                    <SelectContent>
                      <For each={modeOptions.items}>
                        {(item) => (
                          <SelectItem item={item} key={item.value}>
                            {item.label}
                          </SelectItem>
                        )}
                      </For>
                    </SelectContent>
                  </SelectRoot>
                </Box>
                <Box w="full">
                  <Text mb={2} fontSize="sm" fontWeight="medium">
                    {t("settings.log_level")}
                  </Text>
                  <SelectRoot
                    collection={logLevelOptions}
                    size="sm"
                    value={[config.logLevel]}
                    onValueChange={(e) => handleInputChange("logLevel", e.value)}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="选择日志级别" />
                    </SelectTrigger>
                    <SelectContent>
                      <For each={logLevelOptions.items}>
                        {(item) => (
                          <SelectItem item={item} key={item.value}>
                            {item.label}
                          </SelectItem>
                        )}
                      </For>
                    </SelectContent>
                  </SelectRoot>
                </Box>
              </VStack>
            </Box>
          </Box>
        </Grid>

        {/* 网络设置 */}
        <Box bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.subtle">
          <Box p={4} borderBottom="1px solid" borderColor="border.subtle">
            <Heading size="md">{t("settings.network_settings")}</Heading>
          </Box>
          <Box p={4}>
            <VStack gap={4}>
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" fontWeight="medium">
                  {t("settings.allow_lan")}
                </Text>
                <Switch
                  checked={config.allowLan}
                  onCheckedChange={(checked) => handleInputChange("allowLan", checked.checked)}
                />
              </HStack>
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" fontWeight="medium">
                  {t("settings.sni_sniffing")}
                </Text>
                <Switch
                  checked={config.sniSniffing}
                  onCheckedChange={(checked) => handleInputChange("sniSniffing", checked.checked)}
                />
              </HStack>
            </VStack>
          </Box>
        </Box>

        {/* 语言和主题设置 */}
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <Box bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.subtle">
            <Box p={4} borderBottom="1px solid" borderColor="border.subtle">
              <Heading size="md">{t("settings.language_settings")}</Heading>
            </Box>
            <Box p={4}>
              <VStack gap={4}>
                <Box w="full">
                  <Text mb={2} fontSize="sm" fontWeight="medium">
                    {t("settings.language")}
                  </Text>
                  <LanguageSwitcher variant="select" />
                </Box>
              </VStack>
            </Box>
          </Box>

          <Box bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.subtle">
            <Box p={4} borderBottom="1px solid" borderColor="border.subtle">
              <Heading size="md">{t("settings.theme_settings")}</Heading>
            </Box>
            <Box p={4}>
              <VStack gap={4}>
                <Box w="full">
                  <Text mb={2} fontSize="sm" fontWeight="medium">
                    {t("settings.theme")}
                  </Text>
                  <ColorModeSelect />
                </Box>
              </VStack>
            </Box>
          </Box>
        </Grid>

        {/* 操作按钮 */}
        <HStack gap={4} justify="flex-end">
          <Button variant="outline" onClick={handleReset}>
            {t("settings.reset")}
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            {t("settings.save")}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
} 