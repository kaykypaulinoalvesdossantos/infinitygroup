/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Menu, X, Globe, ShoppingCart, Smartphone, Laptop, Code, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const servicesItems = [
  { name: "Web Sites", href: "/servicos/websites", icon: <Globe className="h-5 w-5 mr-2" /> },
  { name: "E-commerce", href: "/servicos/ecommerce", icon: <ShoppingCart className="h-5 w-5 mr-2" /> },
  {
    name: "Aplicativos para Celular",
    href: "/servicos/aplicativos-celular",
    icon: <Smartphone className="h-5 w-5 mr-2" />,
  },
  {
    name: "Aplicativos para Computador",
    href: "/servicos/aplicativos-computador",
    icon: <Laptop className="h-5 w-5 mr-2" />,
  },
  {
    name: "Automações e Consultoria",
    href: "/servicos/automacoes-consultoria",
    icon: <Code className="h-5 w-5 mr-2" />,
  },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
    setServicesOpen(false)
  }, [pathname])

  // Efeito para animar o símbolo do infinito
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Ajusta o canvas para a resolução do dispositivo
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.scale(dpr, dpr)

    // Função para redimensionar o canvas
    function resizeCanvas() {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    window.addEventListener("resize", resizeCanvas)

    // Fórmula refinada para a curva do infinito
    function getInfinityPoint(t: number, scale = 1, offsetX = 0, offsetY = 0) {
      if (!canvas) return { x: 0, y: 0 };
      const angle = t * 2 * Math.PI
      const x = scale * Math.sin(angle)
      const y = scale * Math.sin(angle) * Math.cos(angle)
      return {
        x: x * (canvas.offsetWidth * 0.25) + offsetX,
        y: y * (canvas.offsetHeight * 0.15) + offsetY,
      }
    }

    let progress = 0
    let glowPulse = 0

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const centerX = canvas.offsetWidth / 2
      const centerY = canvas.offsetHeight / 2

      // Desenha o símbolo ∞
      ctx.beginPath()
      for (let i = 0; i <= 1; i += 0.01) {
        const { x, y } = getInfinityPoint(i, 1, centerX, centerY)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = "#3ec6f0"
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      ctx.stroke()

      // Bolinha de energia com brilho pulsante
      const { x, y } = getInfinityPoint(progress, 1, centerX, centerY)
      const pulse = 1 + Math.sin(glowPulse) * 0.3 // brilho varia suavemente
      const glowRadius = 8 * pulse

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius)
      gradient.addColorStop(0, "rgba(255,255,255,1)")
      gradient.addColorStop(0.4, "rgba(255,255,255,0.5)")
      gradient.addColorStop(1, "rgba(255,255,255,0)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()

      progress += 0.0025
      if (progress >= 1) progress = 0

      glowPulse += 0.1

      requestAnimationFrame(animate)
    }

    const animationFrame = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-[#0A0A0F]/95 backdrop-blur-sm py-4 shadow-lg" : "bg-[#0A0A0F]/80 backdrop-blur-sm py-6",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="relative h-16 w-20 mr-3">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
            <span className="text-[#FBFBFB] font-bold text-2xl">Infinity</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <NavLink href="/" active={pathname === "/"}>
              Home
            </NavLink>
            <NavLink href="/sobre" active={pathname === "/sobre"}>
              Sobre
            </NavLink>

            <div className="relative">
              <button
                className={cn(
                  "flex items-center text-[#FBFBFB] hover:text-[#5DC0E7] transition-colors",
                  pathname.startsWith("/servicos") && "text-[#5DC0E7]",
                )}
                onClick={() => setServicesOpen(!servicesOpen)}
              >
                Serviços{" "}
                <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", servicesOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-[#0A0A0F] rounded-lg shadow-xl border border-[#5DC0E7]/20 overflow-hidden z-50"
                  >
                    <div className="py-2">
                      {servicesItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center px-4 py-3 hover:bg-[#5DC0E7]/10 text-[#FBFBFB]",
                            pathname === item.href && "bg-[#5DC0E7]/10 text-[#5DC0E7]",
                          )}
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink href="/portfolio" active={pathname === "/portfolio"}>
              Portfólio
            </NavLink>

            <Button
                    asChild
                    size="lg"
                    className="bg-[#5DC0E7] hover:bg-[#5DC0E7]/80 text-white shadow-[0_0_15px_rgba(93,192,231,0.5)]"
                  >
                    <Link href="/orcamento">
                      Solicitar Orçamento 
                    </Link>
                  </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="lg:hidden text-[#FBFBFB] hover:text-[#5DC0E7]" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-[#0A0A0F] overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                <MobileNavLink href="/" active={pathname === "/"}>
                  Home
                </MobileNavLink>
                <MobileNavLink href="/sobre" active={pathname === "/sobre"}>
                  Sobre
                </MobileNavLink>

                <div>
                  <button
                    className={cn(
                      "flex items-center justify-between w-full py-2 text-[#FBFBFB] hover:text-[#5DC0E7] transition-colors",
                      pathname.startsWith("/servicos") && "text-[#5DC0E7]",
                    )}
                    onClick={() => setServicesOpen(!servicesOpen)}
                  >
                    Serviços{" "}
                    <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", servicesOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-4 mt-2 border-l-2 border-[#5DC0E7]/20"
                      >
                        {servicesItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                              "flex items-center py-2 text-[#FBFBFB] hover:text-[#5DC0E7]",
                              pathname === item.href && "text-[#5DC0E7]",
                            )}
                          >
                            {item.icon}
                            {item.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <MobileNavLink href="/portfolio" active={pathname === "/portfolio"}>
                  Portfólio
                </MobileNavLink>

                <div className="pt-2">
                  <Button asChild className="w-full">
                    <Link href="/orcamento">Solicitar Orçamento</Link>
                  </Button>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "text-[#FBFBFB] hover:text-[#5DC0E7] transition-colors relative font-medium",
        active && "text-[#5DC0E7]",
      )}
    >
      {children}
      {active && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#5DC0E7]"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  )
}

function MobileNavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn("py-2 text-[#FBFBFB] hover:text-[#5DC0E7] transition-colors", active && "text-[#5DC0E7]")}
    >
      {children}
    </Link>
  )
}
