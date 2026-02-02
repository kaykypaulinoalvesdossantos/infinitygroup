"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  Target,
  TrendingUp,
  BarChart3,
  Users,
  Search,
  Megaphone,
  Smartphone,
  Rocket
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from '@/components/ui/optimized-image'
import { FaMeta, FaGoogle, FaLinkedin, FaTiktok } from "react-icons/fa6"
import { SiGoogleanalytics, SiSemrush, SiHubspot, SiGoogleads } from "react-icons/si"

export default function MarketingPage() {
  const services = [
    { icon: <Target className="h-6 w-6" />, title: "Tráfego Pago", desc: "Campanhas ultra-segmentadas no Meta e Google para gerar leads qualificados." },
    { icon: <Search className="h-6 w-6" />, title: "SEO Técnico", desc: "Posicionamento orgânico no Google com otimização on-page e conteúdo." },
    { icon: <Users className="h-6 w-6" />, title: "Social Media", desc: "Gestão estratégica para criar comunidade e autoridade para sua marca." },
    { icon: <Megaphone className="h-6 w-6" />, title: "Inbound Marketing", desc: "Atraia e converta leads com fluxos de nutrição automatizados." },
    { icon: <BarChart3 className="h-6 w-6" />, title: "B.I. & Analytics", desc: "Dashboards em tempo real para monitorar ROI e custo por aquisição." },
    { icon: <Smartphone className="h-6 w-6" />, title: "Conversion (CRO)", desc: "Otimização de páginas para transformar visitantes em clientes." },
  ]

  const methodology = [
    { step: "01", title: "Tração", text: "Atração de visitantes qualificados em massa via Ads e SEO." },
    { step: "02", title: "Ativação", text: "Experiência de onboarding que demonstra valor imediato." },
    { step: "03", title: "Retenção", text: "Estratégias de LTV para manter o cliente comprando." },
    { step: "04", title: "Receita", text: "Otimização de checkout e pricing para maximizar margem." },
  ]

  return (
    <main className="flex flex-col w-full bg-white text-[#1A1A1A] font-inter selection:bg-[#0076FF]/20">

      {/* HERO SECTION */}
      <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Fixed Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/images/coceitoapp.webp')] bg-cover bg-center bg-fixed" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10]/95 via-[#0B0C10]/80 to-[#0B0C10]/60" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center justify-center min-h-[85vh] pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 font-medium text-sm">
                <TrendingUp size={16} /> Growth & Performance
              </span>
            </div>

            <h1 className="font-bold text-5xl lg:text-7xl text-white mb-8 leading-tight drop-shadow-lg">
              Domine o <span className="text-[#0076FF]">Digital.</span> <br />
              Venda com Precisão.
            </h1>
            <p className="text-xl text-slate-200 font-medium mb-12 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              Transformamos dados em receita. Estratégias de tráfego, SEO e conteúdo desenhadas para uma única meta: ROI Positivo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-[#0076FF] hover:bg-[#0060D0] text-white font-bold h-14 px-10 rounded-xl shadow-lg shadow-blue-500/30 text-lg border-0">
                <Link href="/orcamento">
                  Acelerar Meu Negócio <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white font-bold h-14 px-10 rounded-xl text-lg">
                <Link href="#servicos">
                  Ver Estratégias
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Smile Curve Separator */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-center pointer-events-none">
          <div className="flex-1 h-[70px] bg-[#F6F6F6] mr-[-1px]" />
          <div className="relative shrink-0 w-[505px] h-[70px]">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 505.7 70.1" className="w-[101%] h-full ml-[-0.5%]" preserveAspectRatio="none">
              <path className="fill-[#F6F6F6]" d="M351,32.6c-55.9,30.1-71.4,32.7-98.2,32.7s-42.3-2.6-98.2-32.7S28,0,28,0H0v70.1h28h449.6h28.1V0h-28.1C477.6,0,407,2.5,351,32.6z" />
            </svg>
            <div className="absolute top-[28px] left-1/2 transform -translate-x-1/2 -translate-y-full animate-bounce">
              <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12L0 0H20L10 12Z" fill="#F6F6F6" />
              </svg>
            </div>
          </div>
          <div className="flex-1 h-[70px] bg-[#F6F6F6] ml-[-1px]" />
        </div>
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-[#F6F6F6] z-30" />
      </section>

      {/* SERVICES SECTION */}
      <section id="servicos" className="w-full py-24 bg-[#F6F6F6]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0076FF]/10 border border-[#0076FF]/20 text-[#0076FF] font-bold text-sm uppercase tracking-wider mb-4">
              Estratégias
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
              Arsenal de <span className="text-[#0076FF]">Crescimento</span>
            </h2>
            <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
              Utilizamos um mix de canais validados para encontrar seu cliente onde ele estiver.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#0076FF]/20 transition-all duration-300 group"
              >
                <div className="bg-[#0076FF]/10 text-[#0076FF] w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#0076FF] group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <h3 className="font-bold text-xl text-[#1A1A1A] mb-3">{item.title}</h3>
                <p className="text-[#64748B] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* METHODOLOGY SECTION */}
      <section className="w-full py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Steps */}
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#0076FF]/10 border border-[#0076FF]/20 text-[#0076FF] font-bold text-sm uppercase tracking-wider mb-4">
                Metodologia
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-8">
                O Funil de <span className="text-[#0076FF]">Vendas Infinito</span>
              </h2>
              <p className="text-xl text-[#64748B] leading-relaxed mb-10">
                Não acreditamos em mágica. Acreditamos em processos data-driven que cobrem toda a jornada do cliente.
              </p>

              <div className="space-y-6">
                {methodology.map((item, index) => (
                  <div key={index} className="flex gap-5 items-start group">
                    <div className="w-12 h-12 rounded-xl bg-[#0076FF]/10 text-[#0076FF] font-bold text-lg flex items-center justify-center shrink-0 group-hover:bg-[#0076FF] group-hover:text-white transition-all">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-[#1A1A1A] mb-1">{item.title}</h4>
                      <p className="text-[#64748B]">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Main Image */}
                <div className="col-span-2 relative h-[280px] rounded-2xl overflow-hidden shadow-xl">
                  {/* Using a generic business/growth image from existing assets if available, or placeholder */}
                  {/* Since I deleted many images, I should be careful. Using 'coceitoapp.webp' as placeholder for now or checking available images */}
                  <OptimizedImage
                    src="/images/marketing_funnel.png"
                    alt="Sales Funnel Growth"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute bottom-6 left-6 flex gap-2 z-10">
                    <span className="inline-block px-3 py-1 bg-[#0076FF] text-white text-xs font-bold rounded-full">ROAS 12x</span>
                    <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">CAC -40%</span>
                  </div>
                </div>

                {/* Stat Card 1 */}
                <div className="bg-[#F6F6F6] p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <h4 className="font-bold text-4xl text-[#0076FF] mb-2">+150%</h4>
                  <span className="text-sm text-[#64748B] font-medium">Leads Qualificados</span>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-[#F6F6F6] p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <TrendingUp className="w-10 h-10 text-[#0076FF] mb-2" />
                  <span className="text-sm text-[#64748B] font-medium">Escala Previsível</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNOLOGIES SECTION */}
      <section className="w-full py-24 bg-[#F6F6F6]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#1A1A1A] mb-8">
              Plataformas que <span className="text-[#0076FF]">Dominamos</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-80 max-w-4xl mx-auto grayscale hover:grayscale-0 transition-all duration-500">
              <FaMeta size={48} className="text-[#0668E1] hover:scale-110 transition-transform" title="Meta Ads" />
              <FaGoogle size={48} className="text-[#EA4335] hover:scale-110 transition-transform" title="Google" />
              <SiGoogleads size={48} className="text-[#4285F4] hover:scale-110 transition-transform" title="Google Ads" />
              <FaTiktok size={48} className="text-black hover:scale-110 transition-transform" title="TikTok" />
              <FaLinkedin size={48} className="text-[#0077B5] hover:scale-110 transition-transform" title="LinkedIn" />
              <SiGoogleanalytics size={48} className="text-[#E37400] hover:scale-110 transition-transform" title="GA4" />
              <SiSemrush size={48} className="text-[#EC5E06] hover:scale-110 transition-transform" title="Semrush" />
              <SiHubspot size={48} className="text-[#FF7A59] hover:scale-110 transition-transform" title="HubSpot" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="w-full py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-[#0B0C10] rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0076FF]/20 to-transparent" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="inline-block px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-sm mb-6">
                ⚠️ PARE DE QUEIMAR DINHEIRO
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Quantos clientes você perdeu <span className="text-[#0076FF]">hoje?</span>
              </h2>
              <p className="text-lg text-slate-300 mb-10 leading-relaxed">
                Tráfego sem estratégia é doação. Vamos criar uma máquina de vendas previsível para o seu negócio.
              </p>
              <Button asChild size="lg" className="bg-white text-[#0076FF] hover:bg-slate-100 font-bold h-16 px-12 rounded-xl text-xl shadow-2xl">
                <Link href="/orcamento">Quero Escalar Minhas Vendas <ArrowRight className="ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
