"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Globe, Zap, Search, Smartphone, Code, Rocket, CheckCircle2, Layout, Database, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import { OptimizedImage } from '@/components/ui/optimized-image'

export default function WebsitesPage() {
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

        <div className="container mx-auto px-4 z-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-4 py-2 rounded-full bg-[#00B8FF]/10 border border-[#00B8FF]/20 mb-6">
                <span className="text-[#00B8FF] font-manrope font-bold text-sm tracking-wide uppercase">Desenvolvimento Web Premium</span>
              </div>

              <h1 className="font-orbitron font-bold text-4xl md:text-6xl lg:text-7xl mb-8 text-white leading-tight">
                Websites que <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B8FF] to-white">Geram Resultados</span>
              </h1>

              <p className="font-manrope text-lg md:text-xl text-[#AAB3C2] max-w-xl mb-10 leading-relaxed">
                Não criamos apenas páginas na internet. Construímos plataformas digitais de alta performance projetadas para posicionar sua marca como autoridade e converter visitantes em clientes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#00B8FF] hover:bg-[#00B8FF]/80 text-[#0B0B13] font-bold text-lg px-8 h-14 rounded-full relative overflow-hidden group shadow-[0_0_20px_rgba(0,184,255,0.3)] hover:shadow-[0_0_30px_rgba(0,184,255,0.5)] transition-all"
                >
                  <Link href="/orcamento">
                    <span className="relative z-10 flex items-center gap-2">
                      Solicitar Orçamento <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-[#1F2937] text-white hover:bg-[#1F2937] hover:border-[#00B8FF]/50 font-manrope h-14 rounded-full px-8"
                >
                  <Link href="#portfolio">
                    Ver Projetos
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
              <div className="relative z-10 rounded-2xl overflow-hidden border border-[#1F2937] bg-[#12121E]/50 backdrop-blur-sm shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1F2937] bg-[#0E0E12]">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  <div className="ml-4 flex-1 h-6 rounded bg-[#1F2937]/50 text-[10px] text-[#555B66] flex items-center px-3 font-mono">
                    infinitygroup.tech/servicos
                  </div>
                </div>
                <div className="relative aspect-video">
                  {/* Placeholder for a code editor or website preview visual */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#12121E] to-[#0B0B13] p-6 font-mono text-sm leading-relaxed overflow-hidden">
                    <div className="text-[#555B66] mb-2">// High Performance Code</div>
                    <div className="pl-4">
                      <span className="text-[#9C5DE7]">const</span> <span className="text-[#00B8FF]">Website</span> <span className="text-white">=</span> <span className="text-[#FFD700]">&#123;</span>
                      <div className="pl-6 text-[#AAB3C2]">
                        performance: <span className="text-[#10B981]">'100/100'</span>,<br />
                        security: <span className="text-[#10B981]">'Enterprise Grade'</span>,<br />
                        design: <span className="text-[#10B981]">'Premium'</span>,<br />
                        seo: <span className="text-[#10B981]">'Optimized'</span>
                      </div>
                      <span className="text-[#FFD700]">&#125;</span>;
                    </div>
                    {/* Abstract Visual Elements */}
                    <div className="absolute top-1/2 right-10 w-32 h-32 bg-[#00B8FF]/10 rounded-full blur-2xl animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 bg-[#12121E] border border-[#1F2937] p-4 rounded-xl shadow-xl z-20 flex items-center gap-3"
              >
                <div className="bg-[#10B981]/10 p-2 rounded-lg text-[#10B981]">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-white font-bold font-orbitron">Ultra Rápido</div>
                  <div className="text-[#555B66] text-xs">Core Web Vitals Otimizados</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
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
              Por que escolher a <span className="text-[#00B8FF]">Infinity?</span>
            </h2>
            <p className="font-manrope text-[#AAB3C2] text-lg max-w-2xl mx-auto">
              Não entregamos apenas código. Entregamos uma ferramenta de vendas e posicionamento de marca robusta e escalável.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe />}
              title="Presença Global"
              desc="Seu negócio acessível 24/7 com infraestrutura de servidores distribuída globalmente para máxima disponibilidade."
            />
            <FeatureCard
              icon={<Search />}
              title="SEO Nativo"
              desc="Estrutura de código otimizada para o Google desde a primeira linha, garantindo melhor rankeamento orgânico."
            />
            <FeatureCard
              icon={<Smartphone />}
              title="Mobile First"
              desc="Design responsivo fluido que oferece uma experiência de navegação perfeita em qualquer dispositivo."
            />
            <FeatureCard
              icon={<Shield />}
              title="Segurança Máxima"
              desc="Proteção contra ataques DDoS, certificados SSL avançados e boas práticas de segurança implementadas por padrão."
            />
            <FeatureCard
              icon={<Layout />}
              title="UX/UI Premium"
              desc="Interfaces intuitivas e cativantes, desenhadas para guiar o usuário até a conversão sem fricção."
            />
            <FeatureCard
              icon={<Rocket />}
              title="Performance Extrema"
              desc="Carregamento instantâneo. Utilizamos as tecnologias mais modernas (Next.js, React) para velocidade superior."
            />
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="w-full py-24 bg-[#0B0B13] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2">
              <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-8 text-white">
                Do Conceito ao <span className="text-[#9C5DE7]">Lançamento</span>
              </h2>
              <p className="font-manrope text-[#AAB3C2] text-lg leading-relaxed mb-8">
                Nosso processo de desenvolvimento é ágil e transparente. Você acompanha cada etapa, garantindo que o resultado final supere suas expectativas.
              </p>

              <div className="space-y-8">
                <ProcessStep number="01" title="Briefing & Estratégia" desc="Análise profunda do seu negócio e objetivos." />
                <ProcessStep number="02" title="UI/UX Design" desc="Criação de protótipos de alta fidelidade para aprovação visual." />
                <ProcessStep number="03" title="Desenvolvimento Full-Code" desc="Programação limpa e estruturada utilizando Next.js e TypeScript." />
                <ProcessStep number="04" title="Testes & Deploy" desc="Validação rigorosa de performance e publicação em ambiente de produção." />
              </div>
            </div>

            <div className="md:w-1/2 relative">
              <div className="relative z-10 rounded-2xl overflow-hidden border border-[#1F2937] shadow-[0_0_50px_rgba(156,93,231,0.1)]">
                <OptimizedImage
                  src="/images/processodedesenvolvimentowebsite.webp"
                  alt="Processo de Desenvolvimento"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B13] via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 bg-[#0E0E12] relative overflow-hidden border-t border-[#1F2937]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00B8FF]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-6 text-white">
            Pronto para <span className="text-[#00B8FF]">Evoluir Digitalmente?</span>
          </h2>
          <p className="font-manrope text-[#AAB3C2] text-xl max-w-2xl mx-auto mb-10">
            Não deixe sua empresa no passado. Tenha um website que reflete a qualidade do seu negócio.
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
      className="p-8 rounded-2xl bg-[#12121E] border border-[#1F2937] hover:border-[#00B8FF]/40 transition-all duration-300 group"
    >
      <div className="mb-6 inline-flex p-3 rounded-lg bg-[#00B8FF]/10 text-[#00B8FF] group-hover:bg-[#00B8FF] group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="font-orbitron font-bold text-xl text-white mb-3">{title}</h3>
      <p className="font-manrope text-[#AAB3C2] leading-relaxed text-sm">
        {desc}
      </p>
    </motion.div>
  )
}

function ProcessStep({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-6 group">
      <div className="font-orbitron font-bold text-2xl text-[#1F2937] group-hover:text-[#9C5DE7] transition-colors pt-1">
        {number}
      </div>
      <div>
        <h4 className="font-orbitron font-bold text-lg text-white mb-2 group-hover:text-[#9C5DE7] transition-colors">{title}</h4>
        <p className="font-manrope text-[#555B66] group-hover:text-[#AAB3C2] transition-colors text-sm">
          {desc}
        </p>
      </div>
    </div>
  )
}
