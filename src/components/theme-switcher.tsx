"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type ThemeSwitcherProps = {
  className?: string
  tone?: "default" | "inverse"
}

export function ThemeSwitcher({ className, tone = "default" }: ThemeSwitcherProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const currentTheme = mounted && resolvedTheme === "light" ? "light" : "dark"
  const CurrentIcon = currentTheme === "light" ? Sun : Moon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "min-h-11 min-w-11 gap-2 px-3",
            tone === "inverse" && "text-white hover:bg-white/15 hover:text-white focus-visible:ring-white",
            className,
          )}
          data-theme-switcher="trigger"
          aria-label={mounted ? `Aparência, tema atual: ${currentTheme === "light" ? "Claro" : "Escuro"}` : "Aparência"}
          aria-haspopup="menu"
          disabled={!mounted}
        >
          <CurrentIcon className="size-4" aria-hidden="true" />
          <span>Aparência</span>
          <span className={tone === "inverse" ? "text-white/85" : "text-muted-foreground"} aria-hidden={!mounted}>
            {mounted ? (currentTheme === "light" ? "Claro" : "Escuro") : ""}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel>Aparência</DropdownMenuLabel>
        {mounted && (
          <DropdownMenuRadioGroup
            value={currentTheme}
            onValueChange={(theme) => setTheme(theme)}
          >
            <DropdownMenuRadioItem value="light" className="min-h-11">Claro</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark" className="min-h-11">Escuro</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
