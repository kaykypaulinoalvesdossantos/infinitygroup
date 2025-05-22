import type React from "react"
import Link from "next/link"
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#212227] text-[#FBFBFB]/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-[#FBFBFB]">
                Infinity<span className="text-[#5DC0E7]">Group</span>
              </span>
            </Link>
            <p className="mb-4">Desenvolvemos soluções digitais personalizadas que transformam ideias em realidade.</p>
            <div className="flex space-x-4">
              <SocialLink href="https://facebook.com" icon={<Facebook className="h-5 w-5" />} />
              <SocialLink href="https://instagram.com" icon={<Instagram className="h-5 w-5" />} />
              <SocialLink href="https://linkedin.com" icon={<Linkedin className="h-5 w-5" />} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-[#FBFBFB]">Links Rápidos</h3>
            <ul className="space-y-2">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/sobre">Sobre</FooterLink>
              <FooterLink href="/servicos">Serviços</FooterLink>
              <FooterLink href="/portfolio">Portfólio</FooterLink>
              <FooterLink href="/depoimentos">Depoimentos</FooterLink>
              <FooterLink href="/orcamento">Orçamento</FooterLink>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-[#FBFBFB]">Serviços</h3>
            <ul className="space-y-2">
              <FooterLink href="/servicos/websites">Web Sites</FooterLink>
              <FooterLink href="/servicos/ecommerce">E-commerce</FooterLink>
              <FooterLink href="/servicos/aplicativos-celular">Aplicativos para Celular</FooterLink>
              <FooterLink href="/servicos/aplicativos-computador">Aplicativos para Computador</FooterLink>
              <FooterLink href="/servicos/automacoes-consultoria">Automações e Consultoria</FooterLink>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-[#FBFBFB]">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-[#5DC0E7] mr-3 shrink-0 mt-0.5" />
                <span>(11) 94533-2464</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-[#5DC0E7] mr-3 shrink-0 mt-0.5" />
                <span>gerenciainfinitygroup@gmail.com</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-[#5DC0E7] mr-3 shrink-0 mt-0.5" />
                <span>São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#FBFBFB]/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-4 md:mb-0">&copy; {currentYear} Infinity Group. Todos os direitos reservados.</p>
          <div className="flex space-x-6">
            <Link href="/termos" className="text-sm hover:text-[#5DC0E7] transition-colors">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="text-sm hover:text-[#5DC0E7] transition-colors">
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
      className="h-10 w-10 rounded-full bg-[#FBFBFB]/10 flex items-center justify-center hover:bg-[#5DC0E7] transition-colors"
    >
      {icon}
    </a>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-[#5DC0E7] transition-colors">
        {children}
      </Link>
    </li>
  )
}
