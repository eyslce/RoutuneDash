import { Button, MenuContent, MenuItem, MenuRoot, MenuTrigger, Box, createListCollection, For } from "@chakra-ui/react";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { FaLanguage } from "react-icons/fa";

interface LanguageSwitcherProps {
  variant?: 'icon' | 'select';
}

export function LanguageSwitcher({ variant = 'icon' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' },
  ];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  if (variant === 'select') {
    const languageOptions = createListCollection({
      items: languages.map(lang => ({ label: lang.name, value: lang.code })),
    });

    return (
      <SelectRoot
        collection={languageOptions}
        size="sm"
        value={[i18n.language]}
        onValueChange={(e) => handleLanguageChange(e.value as unknown as string)}
      >
        <SelectTrigger>
          <SelectValueText placeholder="选择语言" />
        </SelectTrigger>
        <SelectContent>
          <For each={languageOptions.items}>
            {(item) => (
              <SelectItem item={item} key={item.value}>
                {item.label}
              </SelectItem>
            )}
          </For>
        </SelectContent>
      </SelectRoot>
    );
  }

  return (
    <Box position="relative">
      <MenuRoot>
        <MenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            w="46px"
            h="46px"
            p={0}
            borderRadius="md"
            aria-label={t('common.language')}
            _hover={{ bg: "bg.subtle", color: "blue.500" }}
            _active={{ bg: "bg.subtle" }}
            color="fg"
            transition="all 0.2s"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FaLanguage size={24} />
          </Button>
        </MenuTrigger>
        <MenuContent 
          minW="100px"
          maxW="120px"
          bg="bg"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="md"
          boxShadow="lg"
          zIndex={1000}
          style={{ left: '48px' }}
        >
          {languages.map((lang) => (
            <MenuItem
              key={lang.code}
              value={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              bg={i18n.language === lang.code ? "blue.50" : "transparent"}
              color={i18n.language === lang.code ? "blue.600" : "fg"}
              _hover={{ bg: "bg.subtle" }}
              py={2}
              px={3}
              fontSize="sm"
              fontWeight={i18n.language === lang.code ? "medium" : "normal"}
            >
              {lang.name}
            </MenuItem>
          ))}
        </MenuContent>
      </MenuRoot>
    </Box>
  );
} 