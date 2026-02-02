"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown } from "lucide-react"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const services = [
    { name: "Desenvolvimento de Web Site", href: "/servicos/websites" },
    { name: "Aplicativos Móveis", href: "/servicos/aplicativos-celular" },
    { name: "Desenvolvimento de Software", href: "/servicos/aplicativos-computador" },
    { name: "Automações", href: "/servicos/automacoes" },
    { name: "E-commerce", href: "/servicos/ecommerce" },
    { name: "Marketing Digital", href: "/marketing" },
  ]

  // Pages that need dark navbar text initially (because they have light background)
  const isLightPage = (pathname.startsWith("/portfolio/") && pathname.split('/').length > 2) || pathname === "/orcamento";

  // Dynamic classes based on scroll state or page type
  const navBgClass = isScrolled || isLightPage
    ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-[#E4E7EC]"
    : "bg-transparent border-transparent"

  const textColorClass = isScrolled || isLightPage
    ? "text-[#475569] hover:text-[#2563EB]"
    : "text-white/90 hover:text-white"

  const activeColorClass = isScrolled || isLightPage
    ? "text-[#2563EB]"
    : "text-white font-bold"

  const logoFilterClass = isScrolled || isLightPage
    ? ""
    : "brightness-0 invert"

  const buttonClass = isScrolled || isLightPage
    ? "bg-[#2563EB] text-white hover:bg-[#1E40AF] shadow-lg"
    : "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"

  const hamburgerColor = isScrolled || isLightPage ? "text-[#0F172A]" : "text-white"

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBgClass}`}>
      <div className="container-premium">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group relative z-50">
            <img
              src="/images/logo-Infinity/logo-sem-escrita.svg"
              alt="Infinity Group Icon"
              className={`h-16 w-auto transition-all duration-300 ${logoFilterClass}`}
            />
            <img
              src="/images/logo-Infinity/So-escrita.svg"
              alt="Infinity Group Text"
              className={`h-20 w-auto transition-all duration-300 ${logoFilterClass}`}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              href="/produtos"
              className={`text-sm font-medium transition-colors duration-200 ${pathname === "/produtos" ? activeColorClass : textColorClass}`}
            >
              Produtos
            </Link>

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                className={`text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${pathname.startsWith("/servicos") ? activeColorClass : textColorClass}`}
              >
                Serviços
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E4E7EC] p-2"
                  >
                    {services.map((service, index) => (
                      <Link
                        key={index}
                        href={service.href}
                        className="block px-4 py-3 text-sm text-[#475569] hover:text-[#2563EB] hover:bg-[#F8FAFF] rounded-xl transition-all duration-200"
                      >
                        {service.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/portfolio"
              className={`text-sm font-medium transition-colors duration-200 ${pathname === "/portfolio" ? activeColorClass : textColorClass}`}
            >
              Portfólio
            </Link>

            <Link
              href="/sobre"
              className={`text-sm font-medium transition-colors duration-200 ${pathname === "/sobre" ? activeColorClass : textColorClass}`}
            >
              Sobre
            </Link>

            <Link
              href="/login"
              className={`px-6 py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-105 ${buttonClass}`}
            >
              Área do Cliente
            </Link>

            <Link
              href="/orcamento"
              className={`px-6 py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-105 ${buttonClass}`}
            >
              Falar conosco
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 ${hamburgerColor} transition-colors duration-300`}
            aria-label="Toggle menu"
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
            className="lg:hidden bg-white border-t border-[#E4E7EC] shadow-xl overflow-hidden"
          >
            <div className="container-premium py-6 space-y-4">
              <Link
                href="/produtos"
                className={`block py-2 text-sm font-medium ${pathname === "/produtos" ? "text-[#2563EB]" : "text-[#475569]"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Produtos
              </Link>

              <div>
                <div className="text-sm font-medium text-[#0F172A] mb-2">Serviços</div>
                <div className="pl-4 space-y-2">
                  {services.map((service, index) => (
                    <Link
                      key={index}
                      href={service.href}
                      className="block py-2 text-sm text-[#475569] hover:text-[#2563EB]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/portfolio"
                className={`block py-2 text-sm font-medium ${pathname === "/portfolio" ? "text-[#2563EB]" : "text-[#475569]"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Portfólio
              </Link>

              <Link
                href="/sobre"
                className={`block py-2 text-sm font-medium ${pathname === "/sobre" ? "text-[#2563EB]" : "text-[#475569]"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sobre
              </Link>

              <Link
                href="/login"
                className="block w-full text-center px-6 py-3 bg-[#2563EB] text-white font-semibold rounded-xl mb-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                Área do Cliente
              </Link>

              <Link
                href="/orcamento"
                className="block w-full text-center px-6 py-3 bg-[#2563EB] text-white font-semibold rounded-xl"
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
