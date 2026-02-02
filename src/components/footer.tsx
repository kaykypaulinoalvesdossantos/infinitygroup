
import Link from "next/link"
import { Linkedin, Instagram, MessageCircle } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0B0B13] text-[#AAB3C2] border-t border-[#1F2937]">
      <div className="container-premium py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand Column */}
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="inline-block">
              <img
                src="/images/logo-Infinity/logo.svg"
                alt="Infinity Groups Logo"
                className="h-24 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Transformamos complexidade em resultado. A parceira estratégica de tecnologia para empresas que lideram seus mercados.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 pt-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1F2937] flex items-center justify-center text-white hover:bg-[#00B8FF] hover:scale-110 transition-all duration-300"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1F2937] flex items-center justify-center text-white hover:bg-[#E1306C] hover:scale-110 transition-all duration-300"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://wa.me/5511945332464"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1F2937] flex items-center justify-center text-white hover:bg-[#25D366] hover:scale-110 transition-all duration-300"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Solutions Column */}
          <div>
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Soluções</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/servicos/desenvolvimento-software" className="hover:text-[#00B8FF] transition-colors duration-200">
                  Desenvolvimento Sob Medida
                </Link>
              </li>
              <li>
                <Link href="/servicos/aplicativos-celular" className="hover:text-[#00B8FF] transition-colors duration-200">
                  Aplicativos Web & Mobile
                </Link>
              </li>
              <li>
                <Link href="/servicos/automacoes" className="hover:text-[#00B8FF] transition-colors duration-200">
                  Automação & IA
                </Link>
              </li>
              <li>
                <Link href="/servicos/ecommerce" className="hover:text-[#00B8FF] transition-colors duration-200">
                  E-commerce Enterprise
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Column */}
          <div>
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Institucional</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/sobre" className="hover:text-[#00B8FF] transition-colors duration-200">
                  Sobre a Infinity
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-[#00B8FF] transition-colors duration-200">
                  Cases de Sucesso
                </Link>
              </li>
              <li>
                <Link href="/carreiras" className="hover:text-[#00B8FF] transition-colors duration-200">
                  Trabalhe Conosco
                </Link>
              </li>
              <li>
                <Link href="https://wa.me/5511945332464" className="hover:text-[#00B8FF] transition-colors duration-200">
                  Fale com um Consultor
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact/Address Column */}
          <div>
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Contato</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-white font-medium">São Paulo, SP</span>
              </li>
              <li>
                Av. Paulista, 1106 - Bela Vista
              </li>
              <li>
                <a href="mailto:contato@infinitygroup.tech" className="hover:text-[#00B8FF] transition-colors">
                  contato@infinitygroup.tech
                </a>
              </li>
              <li>
                <a href="tel:+5511945332464" className="hover:text-[#00B8FF] transition-colors">
                  +55 (11) 94533-2464
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1F2937] mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium opacity-60">
          <p>&copy; {currentYear} Infinity Groups Tecnologia LTDA. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/termos" className="hover:text-white transition-colors">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
