"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { Toaster } from "sonner"

const THEME_COLORS = {
  light: "#F4F6F8",
  dark: "#0B1220",
} as const

const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

function ThemeColorSync() {
  const { resolvedTheme, forcedTheme } = useTheme()

  useIsomorphicLayoutEffect(() => {
    const effectiveTheme = forcedTheme ?? resolvedTheme
    if (effectiveTheme !== "light" && effectiveTheme !== "dark") return

    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(effectiveTheme)
    root.style.colorScheme = effectiveTheme

    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (themeColor) {
      themeColor.content = effectiveTheme === "light" && forcedTheme === "light"
        ? "#FFFFFF"
        : THEME_COLORS[effectiveTheme]
    }
  }, [forcedTheme, resolvedTheme])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  )
}

export function ThemedToaster(props: React.ComponentProps<typeof Toaster>) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  return <Toaster {...props} theme={mounted && resolvedTheme === "light" ? "light" : "dark"} />
}
