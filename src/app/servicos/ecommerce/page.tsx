"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  Package,
  Shield,
  Truck,
  Rocket,
  CheckCircle2,
  DollarSign,
  BarChart,
  Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import { OptimizedImage } from '@/components/ui/optimized-image'
import { ImPaypal } from "react-icons/im"

export default function EcommercePage() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  return (
    <main ref={containerRef} className="flex flex-col items-center justify-center w-full bg-[#0B0B13] overflow-hidden">
      {/* Hero Section */}
      <section className="w-full min-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden">
        <SpaceBackground />

        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 bg-[#0B0B13]/80"></div>
        <div className="absolute inset-0 z-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>

        <div className="container mx-auto px-4 z-10 relative pt-32 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-4 py-2 rounded-full bg-[#9C5DE7]/10 border border-[#9C5DE7]/20 mb-6">
                <span className="text-[#9C5DE7] font-manrope font-bold text-sm tracking-wide uppercase">E-commerce Solutions</span>
              </div>

              <h1 className="font-orbitron font-bold text-4xl md:text-6xl lg:text-7xl mb-8 text-white leading-tight">
                Venda Mais com <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9C5DE7] to-[#00B8FF]">Inteligência Digital</span>
              </h1>

              <p className="font-manrope text-lg md:text-xl text-[#AAB3C2] max-w-xl mb-10 leading-relaxed">
                Desenvolvemos lojas virtuais de alta conversão, integradas às melhores ferramentas do mercado e otimizadas para escalar suas vendas desde o primeiro dia.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#9C5DE7] hover:bg-[#9C5DE7]/80 text-white font-bold text-lg px-8 h-14 rounded-full relative overflow-hidden group shadow-[0_0_20px_rgba(156,93,231,0.3)] hover:shadow-[0_0_30px_rgba(156,93,231,0.5)] transition-all"
                >
                  <Link href="/orcamento">
                    <span className="relative z-10 flex items-center gap-2">
                      Criar Minha Loja <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-[#1F2937] text-white hover:bg-[#1F2937] hover:border-[#9C5DE7]/50 font-manrope h-14 rounded-full px-8"
                >
                  <Link href="#tecnologias">
                    Ver Tecnologias
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative block mt-12 lg:mt-0"
            >
              <div className="relative z-10 rounded-2xl overflow-hidden border border-[#1F2937] bg-[#12121E]/50 backdrop-blur-sm shadow-2xl group max-w-2xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-b from-[#9C5DE7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <OptimizedImage
                    src="/images/ecommerce.webp"
                    alt="E-commerce Dashboard"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover opacity-90"
                  />

                  {/* Floating Metrics */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="absolute top-8 right-8 bg-[#0B0B13]/90 backdrop-blur-md border border-[#1F2937] p-4 rounded-xl shadow-xl min-w-[150px]"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                      <span className="text-[#AAB3C2] text-xs font-bold uppercase">Vendas Hoje</span>
                    </div>
                    <div className="text-white font-orbitron font-bold text-xl">R$ 12.450,00</div>
                    <div className="text-[#10B981] text-xs flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" /> +15.3%
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-8 left-8 bg-[#0B0B13]/90 backdrop-blur-md border border-[#1F2937] p-4 rounded-xl shadow-xl flex items-center gap-3"
                  >
                    <div className="bg-[#9C5DE7]/20 p-2 rounded-lg text-[#9C5DE7]">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-white font-bold font-orbitron">Checkout Seguro</div>
                      <div className="text-[#555B66] text-xs">Conversão Otimizada</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Invest Section */}
      <section className="w-full py-24 bg-[#0E0E12] relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-6 text-white">
              Por que investir em um <span className="text-[#9C5DE7]">E-commerce Próprio?</span>
            </h2>
            <p className="font-manrope text-[#AAB3C2] text-lg max-w-2xl mx-auto">
              Depender apenas de marketplaces limita seu crescimento. Tenha total controle sobre sua marca, seus dados e seus lucros.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShoppingCart />}
              title="Experiência de Compra"
              desc="Interface intuitiva e user-friendly projetada para reduzir o atrito e aumentar a taxa de conversão."
            />
            <FeatureCard
              icon={<CreditCard />}
              title="Pagamentos Flexíveis"
              desc="Integração com múltiplos gateways (Stripe, Pagar.me, Mercado Pago) para facilitar a venda."
            />
            <FeatureCard
              icon={<TrendingUp />}
              title="Escalabilidade"
              desc="Arquitetura robusta preparada para suportar picos de tráfego (Black Friday) sem queda de performance."
            />
            <FeatureCard
              icon={<Package />}
              title="Gestão de Estoque"
              desc="Controle total do seu inventário com alertas automáticos e integração com sistemas de ERP."
            />
            <FeatureCard
              icon={<Shield />}
              title="Blindagem de Segurança"
              desc="Certificados SSL, proteção contra fraudes e conformidade total com a LGPD e PCI DSS."
            />
            <FeatureCard
              icon={<Truck />}
              title="Logística Inteligente"
              desc="Cálculo automático de frete e integração com as principais transportadoras e Correios."
            />
          </div>
        </div>
      </section>

      {/* Approach / Flowchart Section */}
      <section className="w-full py-24 bg-[#0B0B13] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#9C5DE7] to-[#00B8FF] rounded-2xl opacity-20 blur-lg"></div>
                <div className="relative bg-[#12121E] border border-[#1F2937] rounded-2xl p-8 overflow-hidden">
                  {/* Neon Flowchart Visualization */}
                  <div className="flex flex-col gap-6 relative z-10">
                    <FlowStep icon={<Globe />} title="Loja Online" color="#00B8FF" />
                    <div className="h-8 w-0.5 bg-gradient-to-b from-[#00B8FF] to-[#9C5DE7] mx-auto ml-6 opacity-30"></div>
                    <FlowStep icon={<ShoppingCart />} title="Carrinho & Checkout" color="#9C5DE7" />
                    <div className="h-8 w-0.5 bg-gradient-to-b from-[#9C5DE7] to-[#10B981] mx-auto ml-6 opacity-30"></div>
                    <FlowStep icon={<DollarSign />} title="Pagamento Aprovado" color="#10B981" />
                    <div className="h-8 w-0.5 bg-gradient-to-b from-[#10B981] to-[#F59E0B] mx-auto ml-6 opacity-30"></div>
                    <FlowStep icon={<Truck />} title="Entrega Realizada" color="#F59E0B" />
                  </div>

                  {/* Decorative background lines */}
                  <svg className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="0.5" fill="none" />
                    <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="0.5" fill="none" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-8 text-white">
                Do Visitante ao <span className="text-[#9C5DE7]">Cliente Fiel</span>
              </h2>
              <p className="font-manrope text-[#AAB3C2] text-lg leading-relaxed mb-8">
                Nossa metodologia foca em cada etapa da jornada de compra. Criamos um ecossistema digital que não apenas recebe visitas, mas guia o usuário intuitivamente até a finalização da compra.
              </p>

              <ul className="space-y-4">
                <CheckItem text="Design Centrado no Usuário (UX/UI)" />
                <CheckItem text="Velocidade de Carregamento Otimizada" />
                <CheckItem text="Recuperação de Carrinhos Abandonados" />
                <CheckItem text="Estratégias de Upsell e Cross-sell" />
                <CheckItem text="Painel Administrativo Intuitivo" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section id="tecnologias" className="w-full py-24 bg-[#0E0E12] relative border-t border-[#1F2937]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-6 text-white">
              Tecnologias de <span className="text-[#00B8FF]">Ponta</span>
            </h2>
            <p className="font-manrope text-[#AAB3C2] text-lg">
              Integramos seu e-commerce com as plataformas e serviços mais robustos do mundo.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <TechCard name="Shopify" desc="Plataforma Líder Global" />
            <TechCard name="WooCommerce" desc="Flexibilidade WordPress" />
            <TechCard name="VTEX" desc="Solução Enterprise" />
            <TechCard name="Magento" desc="Open Source Robusto" />
            <TechCard name="Stripe" desc="Pagamentos Globais" />
            <TechCard name="PayPal" desc="Segurança em Transações" />
            <TechCard name="Google Analytics" desc="Dados e Inteligência" />
            <TechCard name="Correios / Jadlog" desc="Logística Integrada" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 bg-[#0B0B13] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#9C5DE7]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-6 text-white">
            Pronto para <span className="text-[#9C5DE7]">Escalar suas Vendas?</span>
          </h2>
          <p className="font-manrope text-[#AAB3C2] text-xl max-w-2xl mx-auto mb-10">
            Transforme sua ideia em uma máquina de vendas online. Agende uma consultoria gratuita.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#00B8FF] hover:bg-[#00B8FF]/80 text-[#0B0B13] font-bold text-lg px-10 h-16 rounded-full relative overflow-hidden group shadow-[0_0_20px_rgba(0,184,255,0.3)] hover:shadow-[0_0_40px_rgba(0,184,255,0.6)] transition-all transform hover:-translate-y-1"
          >
            <Link href="/orcamento">
              <span className="relative z-10 flex items-center gap-2">
                INICIAR PROJETO AGORA <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-[#12121E] border border-[#1F2937] hover:border-[#9C5DE7]/40 transition-all duration-300 group"
    >
      <div className="mb-6 inline-flex p-3 rounded-lg bg-[#9C5DE7]/10 text-[#9C5DE7] group-hover:bg-[#9C5DE7] group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="font-orbitron font-bold text-xl text-white mb-3">{title}</h3>
      <p className="font-manrope text-[#AAB3C2] leading-relaxed text-sm">
        {desc}
      </p>
    </motion.div>
  )
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" />
      <span className="text-[#AAB3C2] font-manrope">{text}</span>
    </li>
  )
}

function FlowStep({ icon, title, color }: { icon: any, title: string, color: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <span className="font-orbitron font-bold text-white text-lg">{title}</span>
    </div>
  )
}

function TechCard({ name, desc }: { name: string, desc: string }) {
  return (
    <div className="bg-[#12121E] border border-[#1F2937] p-6 rounded-xl hover:border-[#00B8FF]/40 transition-all group text-center">
      <h3 className="font-orbitron font-bold text-lg text-white mb-1 group-hover:text-[#00B8FF] transition-colors">{name}</h3>
      <p className="text-xs text-[#555B66]">{desc}</p>
    </div>
  )
}
