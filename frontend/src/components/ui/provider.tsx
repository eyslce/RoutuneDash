"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { ColorModeProvider } from "@/components/ui/color-mode"
import App from "@/App"

export function Provider() {
  return (
    <ChakraProvider value={defaultSystem} >
      <ColorModeProvider>
        <App />
      </ColorModeProvider>
    </ChakraProvider>
  )
}
