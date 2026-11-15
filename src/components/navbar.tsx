"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const servicesRef = useRef<HTMLDivElement>(null)
  const servicesButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    // Sync initial state in case the page was loaded mid-scroll
    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setServicesOpen(false)
  }, [pathname])

  // Close the mobile menu when the viewport reaches the desktop breakpoint (rotation, resize)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileMenuOpen(false)
    }
    mediaQuery.addEventListener("change", handleBreakpointChange)
    return () => mediaQuery.removeEventListener("change", handleBreakpointChange)
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [mobileMenuOpen])

  // Desktop services dropdown: while open, Escape closes it (returning focus to the trigger) and outside clicks close it
  useEffect(() => {
    if (!servicesOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setServicesOpen(false)
        servicesButtonRef.current?.focus()
      }
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handlePointerDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handlePointerDown)
    }
  }, [servicesOpen])

  const services = [
    { name: "Desenvolvimento de Web Site", href: "/servicos/websites" },
    { name: "Aplicativos Móveis", href: "/servicos/aplicativos-celular" },
    { name: "Desenvolvimento de Software", href: "/servicos/aplicativos-computador" },
    { name: "Automações", href: "/servicos/automacoes" },
    { name: "E-commerce", href: "/servicos/ecommerce" },
    { name: "Marketing Digital", href: "/marketing" },
  ]

  const servicesActive = pathname.startsWith("/servicos") || services.some((service) => pathname === service.href)

  // Pages that need dark navbar text initially (because they have light background)
  const isLightPage = (pathname.startsWith("/portfolio/") && pathname.split('/').length > 2) || pathname === "/orcamento";

  // Dynamic classes based on scroll state or page type
  const navBgClass = isScrolled || isLightPage
    ? "bg-background/95 backdrop-blur-xl shadow-lg border-b border-border"
    : "bg-transparent border-transparent"

  const textColorClass = isScrolled || isLightPage
    ? "text-muted-foreground hover:text-link"
    : "text-white/90 hover:text-white"

  const activeColorClass = isScrolled || isLightPage
    ? "text-link"
    : "text-white font-bold"

  const logoFilterClass = isScrolled || isLightPage
    ? ""
    : "brightness-0 invert"

  const buttonClass = isScrolled || isLightPage
    ? "bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg"
    : "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"

  const hamburgerColor = isScrolled || isLightPage ? "text-foreground" : "text-white"

  return (
    <nav aria-label="Navegação principal" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBgClass}`}>
      <div className="container-premium">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link href="/" aria-label="Infinity Groups — página inicial" className="group relative z-50 flex min-w-0 items-center gap-2 lg:gap-3">
            <Image
              src="/images/logo-Infinity/infinity-symbol.webp"
              alt=""
              width={355}
              height={128}
              priority
              sizes="(max-width: 1023px) 90px, 112px"
              className={`h-8 w-auto lg:h-10 transition-all duration-300 dark:brightness-0 dark:invert ${logoFilterClass}`}
            />
            <Image
              src="/images/logo-Infinity/infinity-wordmark.webp"
              alt="Infinity Groups"
              width={546}
              height={128}
              priority
              sizes="(max-width: 1023px) 120px, 140px"
              className={`h-7 w-auto lg:h-8 transition-all duration-300 dark:brightness-0 dark:invert ${logoFilterClass}`}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <ThemeSwitcher tone={isScrolled || isLightPage ? "default" : "inverse"} />
            <Link
              href="/produtos"
              className={`whitespace-nowrap text-sm font-medium transition-colors duration-200 ${pathname === "/produtos" ? activeColorClass : textColorClass}`}
            >
              Produtos
            </Link>

            <Link
              href="/loja"
              className={`whitespace-nowrap text-sm font-medium transition-colors duration-200 ${pathname === "/loja" ? activeColorClass : textColorClass}`}
            >
              Loja
            </Link>

            {/* Services Dropdown */}
            <div
              ref={servicesRef}
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setServicesOpen(false)
                }
              }}
            >
              <button
                ref={servicesButtonRef}
                type="button"
                aria-expanded={servicesOpen}
                aria-controls={servicesOpen ? "services-menu" : undefined}
                onClick={() => setServicesOpen(true)}
                className={`whitespace-nowrap text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${servicesActive ? activeColorClass : textColorClass}`}
              >
                Serviços
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {servicesOpen && (
                  // Padding (not margin) bridges the gap to the trigger so the hover area stays continuous
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full w-64 pt-2"
                  >
                    <div id="services-menu" className="bg-popover text-popover-foreground rounded-2xl shadow-xl border border-border p-2">
                      {services.map((service) => (
                        <Link
                          key={service.href}
                          href={service.href}
                          className="block px-4 py-3 text-sm text-popover-foreground hover:text-link hover:bg-muted rounded-xl transition-all duration-200"
                        >
                          {service.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/portfolio"
              className={`whitespace-nowrap text-sm font-medium transition-colors duration-200 ${pathname === "/portfolio" ? activeColorClass : textColorClass}`}
            >
              Portfólio
            </Link>

            <Link
              href="/sobre"
              className={`whitespace-nowrap text-sm font-medium transition-colors duration-200 ${pathname === "/sobre" ? activeColorClass : textColorClass}`}
            >
              Sobre
            </Link>

            <Link
              href="/login"
              className={`whitespace-nowrap px-5 xl:px-6 py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-105 ${buttonClass}`}
            >
              Área do Cliente
            </Link>

            <Link
              href="/orcamento"
              className={`whitespace-nowrap px-5 xl:px-6 py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-105 ${buttonClass}`}
            >
              Falar conosco
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${hamburgerColor} transition-colors duration-300 hover:bg-white/10`}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            id="mobile-navigation"
            className="lg:hidden max-h-[calc(100svh-5rem)] overflow-y-auto bg-popover text-popover-foreground border-t border-border shadow-xl"
          >
            <div className="container-premium py-6 space-y-4">
              <div className="flex justify-end"><ThemeSwitcher /></div>
              <Link
                href="/produtos"
                className={`block py-3 text-sm font-medium ${pathname === "/produtos" ? "text-link" : "text-popover-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Produtos
              </Link>

              <Link
                href="/loja"
                className={`block py-3 text-sm font-medium ${pathname === "/loja" ? "text-link" : "text-popover-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Loja
              </Link>

              <div>
                <div className="text-sm font-medium text-popover-foreground mb-2">Serviços</div>
                <div className="pl-4 space-y-2">
                  {services.map((service) => (
                    <Link
                      key={service.href}
                      href={service.href}
                      className="block py-3 text-sm text-popover-foreground hover:text-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/portfolio"
                className={`block py-3 text-sm font-medium ${pathname === "/portfolio" ? "text-link" : "text-popover-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Portfólio
              </Link>

              <Link
                href="/sobre"
                className={`block py-3 text-sm font-medium ${pathname === "/sobre" ? "text-link" : "text-popover-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sobre
              </Link>

              <Link
                href="/login"
                className="block w-full text-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl mb-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                Área do Cliente
              </Link>

              <Link
                href="/orcamento"
                className="block w-full text-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                Falar conosco
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
