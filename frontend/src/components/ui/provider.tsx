"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { ColorModeProvider } from "@/components/ui/color-mode"
import { Toaster } from "@/components/ui/toaster"
import App from "@/App"

export function Provider() {
  return (
    <ChakraProvider value={defaultSystem} >
      <ColorModeProvider>
        <App />
        <Toaster />
      </ColorModeProvider>
    </ChakraProvider>
  )
}
