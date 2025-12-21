import type React from "react"
import Link from "next/link"
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Github } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#05050A] text-[#AAB3C2] border-t border-[#1F2937] font-manrope relative z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="font-orbitron text-2xl font-bold text-white tracking-wider">
                Infinity<span className="text-[#00B8FF]">Group</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-[#8892A0]">
              Desenvolvemos soluções digitais de alta performance que transformam ideias em resultados escaláveis.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="https://instagram.com" icon={<Instagram className="h-5 w-5" />} />
              <SocialLink href="https://linkedin.com" icon={<Linkedin className="h-5 w-5" />} />
              <SocialLink href="https://github.com" icon={<Github className="h-5 w-5" />} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-orbitron font-bold text-white mb-6 tracking-wide">Links Rápidos</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/sobre">Sobre Nós</FooterLink>
              <FooterLink href="/servicos">Nossos Serviços</FooterLink>
              <FooterLink href="/portfolio">Portfólio</FooterLink>
              <FooterLink href="/orcamento">Solicitar Orçamento</FooterLink>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-orbitron font-bold text-white mb-6 tracking-wide">Expertise</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/servicos/websites">Desenvolvimento Web</FooterLink>
              <FooterLink href="/servicos/ecommerce">E-commerce High-End</FooterLink>
              <FooterLink href="/servicos/aplicativos-celular">Apps Mobile (iOS/Android)</FooterLink>
              <FooterLink href="/servicos/aplicativos-computador">Sistemas & Desktop</FooterLink>
              <FooterLink href="/servicos/automacoes">Automação & IA</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-orbitron font-bold text-white mb-6 tracking-wide">Contato</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start group">
                <Phone className="h-5 w-5 text-[#00B8FF] mr-3 shrink-0 group-hover:text-white transition-colors" />
                <span className="group-hover:text-white transition-colors">(11) 94533-2464</span>
              </li>
              <li className="flex items-start group">
                <Mail className="h-5 w-5 text-[#00B8FF] mr-3 shrink-0 group-hover:text-white transition-colors" />
                <span className="group-hover:text-white transition-colors">contato@infinitygroup.tech</span>
              </li>
              <li className="flex items-start group">
                <MapPin className="h-5 w-5 text-[#00B8FF] mr-3 shrink-0 group-hover:text-white transition-colors" />
                <span className="group-hover:text-white transition-colors">São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1F2937] mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#555B66]">
          <p>&copy; {currentYear} Infinity Groups. Todos os direitos reservados.</p>
          <div className="flex space-x-8">
            <Link href="/termos" className="hover:text-[#00B8FF] transition-colors">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="hover:text-[#00B8FF] transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="h-10 w-10 rounded-lg bg-[#0F0F1A] border border-[#1F2937] flex items-center justify-center text-[#AAB3C2] hover:bg-[#00B8FF] hover:text-white hover:border-[#00B8FF] transition-all duration-300"
    >
      {icon}
    </a>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-[#00B8FF] transition-colors flex items-center group">
        <span className="w-0 group-hover:w-2 h-0.5 bg-[#00B8FF] mr-0 group-hover:mr-2 transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
        {children}
      </Link>
    </li>
  )
}
