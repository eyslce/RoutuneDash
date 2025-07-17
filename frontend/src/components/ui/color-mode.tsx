"use client"

import type { IconButtonProps, SpanProps } from "@chakra-ui/react"
import { ClientOnly, IconButton, Skeleton, Span, createListCollection, For } from "@chakra-ui/react"
import { ThemeProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import * as React from "react"
import { LuMoon, LuSun } from "react-icons/lu"
import { useTranslation } from "react-i18next"
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from "@/components/ui/select"

export interface ColorModeProviderProps extends ThemeProviderProps {}

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem 
      disableTransitionOnChange 
      {...props} 
    />
  )
}

export type ColorMode = "light" | "dark" | "system"

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  const theme = useTheme()
  const [colorModeState, setColorModeState] = React.useState<ColorMode>("system")
  
  // 当theme.theme变化时更新colorModeState
  React.useEffect(() => {
    let newColorMode: ColorMode = "system"
    
    if (theme.theme && theme.theme !== "system") {
      newColorMode = theme.theme as ColorMode
    }
    
    setColorModeState(newColorMode)
  }, [theme.theme])
  
  const setColorMode = React.useCallback(
    (value: ColorMode) => {
      theme.setTheme(value)
      setColorModeState(value) // 立即更新本地状态
    },
    [theme],
  )
  
  const toggleColorMode = React.useCallback(() => {
    const newMode = theme.resolvedTheme === "dark" ? "light" : "dark"
    theme.setTheme(newMode)
    setColorModeState(newMode) // 立即更新本地状态
  }, [theme.resolvedTheme, theme])
  
  return {
    colorMode: colorModeState,
    setColorMode,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { resolvedTheme } = useTheme()
  return resolvedTheme === "dark" ? dark : light
}

export function ColorModeIcon() {
  const { resolvedTheme } = useTheme()
  return resolvedTheme === "dark" ? <LuMoon /> : <LuSun />
}

interface ColorModeButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode()
  return (
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <IconButton
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Toggle color mode"
        size="sm"
        ref={ref}
        {...props}
        css={{
          _icon: {
            width: "5",
            height: "5",
          },
        }}
      >
        <ColorModeIcon />
      </IconButton>
    </ClientOnly>
  )
})

export const ColorModeSelect = React.forwardRef<
  HTMLSelectElement,
  { size?: "sm" | "md" | "lg" }
>(function ColorModeSelect({ size = "sm", ...props }, ref) {
  const { colorMode, setColorMode } = useColorMode()
  const { t } = useTranslation()

  const themeOptions = createListCollection({
    items: [
      { value: "light", label: t("common.light") },
      { value: "dark", label: t("common.dark") },
      { value: "system", label: t("common.system") },
    ],
  })

  return (
    <ClientOnly fallback={<Skeleton height="32px" />}>
      <SelectRoot
        collection={themeOptions}
        size={size}
        value={[colorMode]}
        onValueChange={(e) => {
          if (Array.isArray(e.value) && e.value[0]) {
            setColorMode(e.value[0] as ColorMode)
          }
        }}
        {...props}
      >
        <SelectTrigger>
          <SelectValueText placeholder={t("settings.theme")} />
        </SelectTrigger>
        <SelectContent>
          <For each={themeOptions.items}>
            {(item) => (
              <SelectItem item={item} key={item.value}>
                {item.label}
              </SelectItem>
            )}
          </For>
        </SelectContent>
      </SelectRoot>
    </ClientOnly>
  )
})

export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function LightMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme light"
        colorPalette="gray"
        colorScheme="light"
        ref={ref}
        {...props}
      />
    )
  },
)

export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function DarkMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme dark"
        colorPalette="gray"
        colorScheme="dark"
        ref={ref}
        {...props}
      />
    )
  },
)
