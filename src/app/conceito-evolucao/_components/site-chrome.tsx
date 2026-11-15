"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Instagram, Linkedin, Menu, MessageCircle, X } from "lucide-react"
import { ScrollProgress } from "./motion-system"
import styles from "./chrome.module.css"

const links = [
  { label: "Produtos", href: "/conceito-evolucao/produtos" },
  { label: "Serviços", href: "/conceito-evolucao/servicos" },
  { label: "Portfólio", href: "/conceito-evolucao/portfolio" },
  { label: "Sobre", href: "/conceito-evolucao/sobre" },
]

export function EvoLogo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/conceito-evolucao" className={`${styles.logo} ${dark ? styles.logoDark : ""}`}>
      <img src="/images/logo-Infinity/logo-sem-escrita.svg" alt="" />
      <img src="/images/logo-Infinity/So-escrita.svg" alt="Infinity Groups" />
    </Link>
  )
}

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  const light = !transparent || scrolled
  return (
    <>
      <ScrollProgress />
      <header className={`${styles.header} ${light ? styles.headerSolid : styles.headerTransparent}`}>
        <EvoLogo dark={light} />
        <nav className={styles.desktopNav}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={pathname.startsWith(link.href) ? styles.active : ""}>{link.label}</Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <Link href="/conceito-evolucao/login" className={styles.clientLink}>Área do cliente</Link>
          <Link href="/conceito-evolucao/contato" className={styles.projectLink}>Iniciar projeto <ArrowRight /></Link>
        </div>
        <button className={styles.menuButton} onClick={() => setOpen((value) => !value)} aria-label={open ? "Fechar menu" : "Abrir menu"}>{open ? <X /> : <Menu />}</button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div className={styles.mobilePanel} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: .3 }}>
            {links.map((link, index) => <Link key={link.href} href={link.href}><span>0{index + 1}</span>{link.label}<ArrowRight /></Link>)}
            <Link href="/conceito-evolucao/login"><span>05</span>Área do cliente<ArrowRight /></Link>
            <Link href="/conceito-evolucao/contato" className={styles.mobileCta}>Iniciar um projeto</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLead}>
        <EvoLogo />
        <p>Tecnologia, design e estratégia para empresas que não querem parar.</p>
        <div className={styles.socials}><a aria-label="LinkedIn"><Linkedin /></a><a aria-label="Instagram"><Instagram /></a><a aria-label="WhatsApp"><MessageCircle /></a></div>
      </div>
      <div className={styles.footerColumn}><strong>Explorar</strong>{links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div>
      <div className={styles.footerColumn}><strong>Soluções</strong><Link href="/conceito-evolucao/servicos/software">Software sob medida</Link><Link href="/conceito-evolucao/servicos/automacoes">Automação & IA</Link><Link href="/conceito-evolucao/servicos/aplicativos">Aplicativos</Link><Link href="/conceito-evolucao/servicos/websites">Websites</Link></div>
      <div className={styles.footerColumn}><strong>Contato</strong><span>São Paulo · Brasil</span><span>contato@infinitygroup.tech</span><span>+55 11 94533-2464</span><Link href="/conceito-evolucao/contato" className={styles.footerCta}>Vamos conversar <ArrowRight /></Link></div>
      <div className={styles.footerBottom}><span>© 2026 Infinity Groups</span><span>Privacidade · Termos</span><span>Feito para continuar evoluindo.</span></div>
    </footer>
  )
}
