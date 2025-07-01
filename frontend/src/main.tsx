import { createRoot } from 'react-dom/client'
import React from 'react'
import { Provider } from "@/components/ui/provider"

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider />
  </React.StrictMode>,
)
