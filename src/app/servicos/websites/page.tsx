"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  Globe,
  Zap,
  Search,
  Smartphone,
  Shield,
  Layout,
  Rocket,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from '@/components/ui/optimized-image'

export default function WebsitesPage() {
  const benefits = [
    { icon: <Globe className="w-6 h-6" />, title: "Presença Global", desc: "Seu negócio acessível 24/7 com infraestrutura distribuída globalmente." },
    { icon: <Search className="w-6 h-6" />, title: "SEO Nativo", desc: "Estrutura otimizada para Google desde a primeira linha de código." },
    { icon: <Smartphone className="w-6 h-6" />, title: "Mobile First", desc: "Design responsivo que funciona perfeitamente em qualquer dispositivo." },
    { icon: <Shield className="w-6 h-6" />, title: "Segurança Máxima", desc: "Proteção contra ataques, SSL avançado e boas práticas de segurança." },
    { icon: <Layout className="w-6 h-6" />, title: "UX/UI Premium", desc: "Interfaces intuitivas desenhadas para guiar o usuário até a conversão." },
    { icon: <Zap className="w-6 h-6" />, title: "Performance Extrema", desc: "Carregamento instantâneo com Next.js, React e tecnologias modernas." },
  ]

  const steps = [
    { step: "01", title: "Briefing & Estratégia", text: "Análise profunda do seu negócio e objetivos." },
    { step: "02", title: "UI/UX Design", text: "Criação de protótipos de alta fidelidade para aprovação." },
    { step: "03", title: "Desenvolvimento Full-Code", text: "Programação limpa com Next.js e TypeScript." },
    { step: "04", title: "Testes & Deploy", text: "Validação rigorosa e publicação em produção." },
  ]

  return (
    <main className="flex flex-col w-full bg-white text-[#1A1A1A] font-inter selection:bg-[#0076FF]/20">

      {/* HERO SECTION */}
      <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Fixed Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/images/processodedesenvolvimentowebsite.webp')] bg-cover bg-center bg-fixed" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10]/95 via-[#0B0C10]/80 to-[#0B0C10]/60" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center justify-center min-h-[85vh] pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="font-bold text-5xl lg:text-7xl text-white mb-8 leading-tight drop-shadow-lg">
              Websites que <br />
              <span className="text-[#0076FF]">Geram Resultados</span>
            </h1>
            <p className="text-xl text-slate-200 font-medium mb-12 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              Construímos plataformas digitais de alta performance projetadas para posicionar sua marca como autoridade e converter visitantes em clientes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-[#0076FF] hover:bg-[#0060D0] text-white font-bold h-14 px-10 rounded-xl shadow-lg shadow-blue-500/30 text-lg border-0">
                <Link href="/orcamento">
                  Solicitar Orçamento <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white font-bold h-14 px-10 rounded-xl text-lg">
                <Link href="#beneficios">
                  Ver Benefícios
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

      {/* BENEFITS SECTION */}
      <section id="beneficios" className="w-full py-24 bg-[#F6F6F6]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0076FF]/10 border border-[#0076FF]/20 text-[#0076FF] font-bold text-sm uppercase tracking-wider mb-4">
              Diferenciais
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
              Por que escolher a <span className="text-[#0076FF]">Infinity?</span>
            </h2>
            <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
              Não entregamos apenas código. Entregamos uma ferramenta de vendas e posicionamento robusta e escalável.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((item, i) => (
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
                Processo
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-8">
                Do Conceito ao <span className="text-[#0076FF]">Lançamento</span>
              </h2>
              <p className="text-xl text-[#64748B] leading-relaxed mb-10">
                Nosso processo é ágil e transparente. Você acompanha cada etapa, garantindo que o resultado supere suas expectativas.
              </p>

              <div className="space-y-6">
                {steps.map((item, index) => (
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
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
                <OptimizedImage src="/images/processodedesenvolvimentowebsite.webp" alt="Processo de Desenvolvimento" width={600} height={400} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="inline-block px-3 py-1 bg-[#0076FF] text-white text-xs font-bold rounded-full mb-2">Next.js + TypeScript</span>
                  <h4 className="font-bold text-xl text-white">Código de Alta Performance</h4>
                </div>
              </div>

              {/* Feature Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3"
              >
                <div className="bg-green-500/10 p-2 rounded-lg text-green-500">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-[#1A1A1A]">100/100</div>
                  <div className="text-[#64748B] text-xs">Core Web Vitals</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="w-full py-24 bg-[#F6F6F6]">
        <div className="container mx-auto px-4">
          <div className="bg-[#0B0C10] rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0076FF]/20 to-transparent" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Pronto para <span className="text-[#0076FF]">Evoluir Digitalmente?</span>
              </h2>
              <p className="text-lg text-slate-300 mb-10 leading-relaxed">
                Não deixe sua empresa no passado. Tenha um website que reflete a qualidade do seu negócio.
              </p>
              <Button asChild size="lg" className="bg-white text-[#0076FF] hover:bg-slate-100 font-bold h-16 px-12 rounded-xl text-xl shadow-2xl">
                <Link href="/orcamento">Iniciar Projeto Agora <ArrowRight className="ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
