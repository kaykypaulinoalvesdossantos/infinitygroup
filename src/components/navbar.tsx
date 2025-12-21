/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Menu, X, Globe, ShoppingCart, Smartphone, Laptop, Code, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const servicesItems = [
  { name: "Web Sites", href: "/servicos/websites", icon: <Globe className="h-4 w-4" /> },
  { name: "E-commerce", href: "/servicos/ecommerce", icon: <ShoppingCart className="h-4 w-4" /> },
  {
    name: "Aplicativos Mobile",
    href: "/servicos/aplicativos-celular",
    icon: <Smartphone className="h-4 w-4" />,
  },
  {
    name: "Softwares Desktop",
    href: "/servicos/aplicativos-computador",
    icon: <Laptop className="h-4 w-4" />,
  },
  {
    name: "Automações & IA",
    href: "/servicos/automacoes",
    icon: <Code className="h-4 w-4" />,
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
      if (window.scrollY > 20) {
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

    const dpr = window.devicePixelRatio || 1
    const setSize = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    setSize()
    window.addEventListener("resize", setSize)

    // Animação "Premium Infinity" - Loop suave com partícula
    function getInfinityPoint(t: number, width: number, height: number) {
      const scale = Math.min(width, height) * 0.35 // Escala levemente ajustada
      const angle = t * 2 * Math.PI
      const den = 1 + Math.sin(angle) * Math.sin(angle)
      const x = (scale * Math.cos(angle)) / den
      const y = (scale * Math.cos(angle) * Math.sin(angle)) / den
      return {
        x: x + width / 2,
        y: y + height / 2
      }
    }

    let progress = 0
    let animationFrame: number

    function animate() {
      if (!ctx || !canvas) return

      const width = canvas.offsetWidth
      const height = canvas.offsetHeight

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Configuração do Brilho Neon
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      // 1. Caminho Principal (Neon) - Apenas o símbolo
      ctx.beginPath()
      ctx.strokeStyle = "#00B8FF"
      ctx.lineWidth = 3
      ctx.shadowColor = "#00B8FF"
      ctx.shadowBlur = 15
      for (let t = 0; t <= 1; t += 0.01) {
        const p = getInfinityPoint(t, width, height)
        if (t === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()

      // 2. A "Bolinha" (Partícula de Energia)
      const particlePos = getInfinityPoint(progress, width, height)

      // Rastro curto e limpo
      for (let i = 0; i < 8; i++) {
        const t = (progress - (i * 0.008) + 1) % 1
        const trailPos = getInfinityPoint(t, width, height)
        ctx.beginPath()
        ctx.arc(trailPos.x, trailPos.y, 2 - (i * 0.2), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 184, 255, ${0.6 - (i * 0.07)})`
        ctx.shadowBlur = 8
        ctx.fill()
      }

      // Partícula Principal (a que está viajando)
      ctx.beginPath()
      ctx.arc(particlePos.x, particlePos.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = "#FFFFFF"
      ctx.shadowBlur = 20
      ctx.shadowColor = "#FFFFFF"
      ctx.fill()

      // Incremento suave
      progress += 0.003
      if (progress > 1) progress = 0

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setSize)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#0B0B13]/95 backdrop-blur-xl border-b border-white/5 py-4 shadow-lg shadow-black/20"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <div className="relative h-14 w-24 mr-2 overflow-visible">
              <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-2xl text-white tracking-widest leading-none group-hover:text-[#00B8FF] transition-colors">
                INFINITY
              </span>
              <span className="font-manrope font-semibold text-[10px] text-[#AAB3C2] tracking-[0.4em] uppercase group-hover:text-white transition-colors">
                GROUPS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <NavLink href="/" active={pathname === "/"}>
              Home
            </NavLink>
            <NavLink href="/sobre" active={pathname === "/sobre"}>
              Sobre
            </NavLink>

            <div className="relative group">
              <button
                className={cn(
                  "flex items-center font-body text-sm font-medium transition-all duration-300",
                  "text-white/80 hover:text-[#00B8FF]",
                  pathname.startsWith("/servicos") && "text-[#00B8FF] shadow-[0_0_15px_rgba(0,184,255,0.3)] px-3 py-1 rounded-full border border-[#00B8FF]/20"
                )}
                onMouseEnter={() => setServicesOpen(true)}
                onClick={() => setServicesOpen(!servicesOpen)}
              >
                Serviços{" "}
                <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform duration-300", servicesOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-[#0B0B13]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                    onMouseLeave={() => setServicesOpen(false)}
                  >
                    <div className="p-2 space-y-1">
                      {servicesItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center px-4 py-3 rounded-xl text-sm transition-all duration-200 group/item",
                            "hover:bg-[#00B8FF]/10 text-white/80 hover:text-white",
                            pathname === item.href && "bg-[#00B8FF]/10 text-[#00B8FF]"
                          )}
                        >
                          <span className={cn("p-2 rounded-lg bg-white/5 mr-3 group-hover/item:bg-[#00B8FF]/20 transition-colors flex items-center justify-center", pathname === item.href && "bg-[#00B8FF]/20 text-[#00B8FF]")}>
                            {item.icon}
                          </span>
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink href="/marketing" active={pathname === "/marketing"}>
              Marketing
            </NavLink>

            <NavLink href="/produtos" active={pathname === "/produtos"}>
              Produtos
            </NavLink>

            <NavLink href="/portfolio" active={pathname.startsWith("/portfolio")}>
              Portfólio
            </NavLink>

            <Button
              asChild
              className="bg-[#00B8FF] hover:bg-[#0095CC] text-white font-heading font-bold tracking-wider px-6 shadow-[0_0_20px_rgba(0,184,255,0.3)] hover:shadow-[0_0_30px_rgba(0,184,255,0.5)] transition-all duration-300 hover:-translate-y-1"
            >
              <Link href="/orcamento" className="flex items-center gap-2">
                ORÇAMENTO <Rocket className="h-4 w-4" />
              </Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white hover:text-[#00B8FF] transition-colors"
            onClick={() => {
              if (!isOpen) {
                // Scroll to top before opening menu to avoid positioning bugs
                window.scrollTo({ top: 0, behavior: 'smooth' })
                // Wait a bit for scroll animation before opening
                setTimeout(() => setIsOpen(true), 300)
              } else {
                setIsOpen(false)
              }
            }}
          >
            {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed inset-0 z-40 bg-[#0B0B13]/95 backdrop-blur-xl border-t border-white/5 lg:hidden",
              scrolled ? "top-[88px]" : "top-[104px]" // Calcula baseado em py-4 vs py-6 + altura do conteúdo
            )}
          >
            <div className="container mx-auto px-6 py-8 flex flex-col h-full overflow-y-auto">
              <nav className="flex flex-col space-y-2">
                <MobileNavLink href="/" active={pathname === "/"} delay={0.1}>
                  Home
                </MobileNavLink>
                <MobileNavLink href="/sobre" active={pathname === "/sobre"} delay={0.15}>
                  Sobre Nós
                </MobileNavLink>

                <div className="py-2">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest pl-4 mb-2 block">Serviços</span>
                  <div className="space-y-1 pl-2 border-l border-white/10 ml-2">
                    {servicesItems.map((item, idx) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center py-3 px-4 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium",
                          pathname === item.href && "text-[#00B8FF] bg-[#00B8FF]/10"
                        )}
                      >
                        {item.icon} {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <MobileNavLink href="/marketing" active={pathname === "/marketing"} delay={0.25}>
                  Marketing Digital
                </MobileNavLink>

                <MobileNavLink href="/produtos" active={pathname === "/produtos"} delay={0.28}>
                  Produtos
                </MobileNavLink>

                <MobileNavLink href="/portfolio" active={pathname.startsWith("/portfolio")} delay={0.3}>
                  Portfólio
                </MobileNavLink>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-8 mt-auto mb-10"
                >
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-[#00B8FF] hover:bg-[#0095CC] text-white font-heading font-bold tracking-wider h-14 text-lg shadow-[0_0_20px_rgba(0,184,255,0.3)]"
                  >
                    <Link href="/orcamento" onClick={() => setIsOpen(false)}>
                      SOLICITAR ORÇAMENTO
                    </Link>
                  </Button>
                </motion.div>
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
        "relative py-1 px-1 font-body text-sm font-medium transition-colors duration-300",
        active ? "text-[#00B8FF]" : "text-white/80 hover:text-[#00B8FF]"
      )}
    >
      {children}
      {active && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00B8FF] to-transparent shadow-[0_0_10px_#00B8FF]"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  )
}

function MobileNavLink({ href, active, children, delay }: { href: string; active: boolean; children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <Link
        href={href}
        className={cn(
          "flex items-center justify-between p-4 rounded-xl text-lg font-heading font-medium transition-all duration-300",
          active
            ? "bg-[#00B8FF]/10 text-[#00B8FF] border border-[#00B8FF]/20"
            : "text-white hover:bg-white/5 active:scale-[0.98]"
        )}
      >
        {children}
        {active && <div className="w-2 h-2 rounded-full bg-[#00B8FF] shadow-[0_0_10px_#00B8FF]" />}
      </Link>
    </motion.div>
  )
}
