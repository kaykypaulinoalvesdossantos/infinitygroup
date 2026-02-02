"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, BarChart3, Code2, Smartphone, Zap, Cpu, Search, LayoutTemplate, ShieldCheck, Rocket, MessageSquare, Star, Globe, Mail, MapPin, Target, Award, Brain } from "lucide-react"
import { OptimizedImage } from '@/components/ui/optimized-image'
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SobrePage() {
  return (
    <main className="flex flex-col w-full bg-white text-[#1A1A1A] selection:bg-[#0076FF]/20 font-inter">

      {/* 1. HERO SECTION - Soluções Enterprise (Full Background Fixed) */}
      <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Full Background Image (Fixed) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/images/crm/dashboard-team.png')] bg-cover bg-center bg-fixed" />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="font-bold text-5xl lg:text-7xl text-white mb-6 leading-tight drop-shadow-lg">
              Sobre a <span className="text-[#0076FF]">Infinity Groups</span>
            </h1>
            <h2 className="text-xl md:text-2xl text-slate-200 font-medium mb-10 leading-relaxed drop-shadow-md max-w-3xl mx-auto">
              Não somos apenas uma empresa de tecnologia. Somos arquitetos de soluções digitais que transformam o impossível em código, design e resultado.
            </h2>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-[#0076FF] hover:bg-[#0060D0] text-white font-bold h-14 px-10 rounded-xl shadow-lg shadow-blue-500/20 text-lg border-0">
                <Link href="#jornada">Conheça nossa Jornada</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white hover:border-white/40 font-bold h-14 px-10 rounded-xl text-lg transition-all">
                <Link href="/contato">Falar com um Especialista</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* THE "SMILE" CURVE SEPARATOR */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-center pointer-events-none">
          {/* Left Filler */}
          <div className="flex-1 h-[70px] bg-[#F6F6F6] mr-[-1px]" />

          {/* The Curve Itself */}
          <div className="relative shrink-0 w-[505px] h-[70px] pointer-events-auto z-10">
            <a href="#idealizador" className="block relative w-full h-full">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 505.7 70.1"
                className="w-[101%] h-full ml-[-0.5%]"
                preserveAspectRatio="none"
              >
                <path
                  className="fill-[#F6F6F6]"
                  d="M351,32.6c-55.9,30.1-71.4,32.7-98.2,32.7s-42.3-2.6-98.2-32.7S28,0,28,0H0v70.1h28h449.6h28.1V0h-28.1C477.6,0,407,2.5,351,32.6z"
                />
              </svg>
              {/* Bouncing Arrow Indicator */}
              <div className="absolute top-[28px] left-1/2 transform -translate-x-1/2 -translate-y-full animate-bounce">
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12L0 0H20L10 12Z" fill="#F6F6F6" />
                </svg>
              </div>
            </a>
          </div>

          {/* Right Filler */}
          <div className="flex-1 h-[70px] bg-[#F6F6F6] ml-[-1px]" />
        </div>

        {/* Bottom Bar Extension to cover any pixel gaps */}
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-[#F6F6F6] z-30" />
      </section>

      {/* 2. O IDEALIZADOR (Founder Section) */}
      <section id="idealizador" className="w-full py-24 bg-[#F6F6F6]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#0076FF] font-bold uppercase tracking-widest text-sm mb-2 block">O Mente Por Trás</span>
              <h2 className="text-3xl md:text-5xl font-bold text-[#1A1A1A] mb-8">
                Conheça o <span className="text-[#0076FF]">Idealizador</span>
              </h2>

              <div className="space-y-6 text-[#4B4B4B] text-lg leading-relaxed">
                <p>
                  A Infinity Groups foi fundada por <strong className="text-[#1A1A1A]">Kayky Paulino</strong>, especialista em Engenharia de Software e Ciência da Computação, com atuação focada em produtos, arquitetura e automação empresarial.
                </p>
                <p>
                  Desde o início, o propósito foi claro: desenvolver soluções digitais que unem performance e propósito. A Infinity nasceu para transformar desafios corporativos em sistemas sob medida, integrações inteligentes e produtos proprietários que escalam negócios com consistência.
                </p>
                <p>
                  Atualmente, Kayky conduz a liderança técnica e estratégica da Infinity, assegurando qualidade de código, excelência em arquitetura e inovação contínua em cada projeto.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <SkillCard icon={<Code2 />} label="Full-Stack Developer" />
                <SkillCard icon={<Brain />} label="Arquiteto de Soluções" />
                <SkillCard icon={<Rocket />} label="Estrategista Digital" />
                <SkillCard icon={<Award />} label="Líder de Inovação" />
              </div>
            </motion.div>

            {/* Founder Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative flex justify-center"
            >
              <div className="relative w-full max-w-[500px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <OptimizedImage
                  src="/images/kayky.webp"
                  alt="Kayky Paulino - CEO Infinity Groups"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 pt-20">
                  <p className="text-white font-bold text-xl">Kayky Paulino</p>
                  <p className="text-[#0076FF] font-medium">CEO & Fundador Infinity Groups</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. NOSSA JORNADA (Timeline) */}
      <section id="jornada" className="w-full py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <span className="text-[#0076FF] font-bold uppercase tracking-widest text-sm mb-2 block">Nossa Trajetória</span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#1A1A1A] mb-4">Nossa Jornada</h2>
            <p className="text-[#4B4B4B] text-lg max-w-2xl mx-auto">
              De uma ideia ambiciosa a uma referência em tecnologia. Acompanhe nossa evolução rumo ao futuro.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12 relative">
            <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-1 bg-slate-100 md:-translate-x-1/2 rounded-full" />

            <TimelineItem year="2022" title="O Início" desc="Fundação da Infinity Groups com foco em desenvolvimento web de alta performance e arquitetura escalável." />
            <TimelineItem year="2023" title="Expansão Tecnológica" desc="Integração de Inteligência Artificial e Automação no portfólio, multiplicando o ROI de nossos parceiros." right />
            <TimelineItem year="2024" title="Novos Horizontes" desc="Consolidação como parceiro estratégico B2B, liderando transformações digitais em grandes corporações." />
            <TimelineItem year="2025" title="Softwares Exclusivos" desc="Início do desenvolvimento de softwares proprietários da Infinity Groups. Soluções criadas internamente para escalar negócios." right active />
            <TimelineItem year="2026" title="Inovações com IA" desc="Aplicação prática de Inteligência Artificial e lançamento de sistemas proprietários Infinity para o mercado." future />
          </div>
        </div>
      </section>

      {/* 4. CORPORATE DNA */}
      <section className="w-full py-24 bg-[#F6F6F6]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#0076FF] font-bold uppercase tracking-widest text-sm block mb-2">Nossa Cultura</span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#1A1A1A] mb-4">Corporate DNA</h2>
            <p className="text-[#4B4B4B] text-lg">Os códigos-fonte da nossa cultura organizacional.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Mission & Vision */}
            <div className="space-y-6">
              <DNA_Card title="Missão" text="Transformar complexidade em clareza, entregando tecnologia que impulsiona o progresso humano." icon={<Rocket className="text-[#0076FF]" />} />
              <DNA_Card title="Visão" text="Ser a infraestrutura intelectual por trás das empresas mais inovadoras do mundo." icon={<Target className="text-[#6E00FF]" />} />
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ValueBox title="Confiança Radical" desc="Transparência total em cada linha." />
              <ValueBox title="Inovação Técnica" desc="Sempre na borda da tecnologia." />
              <ValueBox title="Qualidade Obsessiva" desc="Não aceitamos 'mais ou menos'." />
              <ValueBox title="Foco no Cliente" desc="Seu sucesso é nosso compilador." />
            </div>
          </div>
        </div>
      </section>


      {/* 6. IMPACT & CTA */}
      <section className="w-full py-32 relative bg-[#0B0C10] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/products-hero-bg.png')] bg-cover bg-center opacity-20 filter grayscale mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0076FF]/90 to-[#0B0C10]/90" />

        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Pronto para transformar sua empresa?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            Junte-se às empresas que estão definindo o futuro com a Infinity Groups.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button asChild size="lg" className="bg-white text-[#0076FF] hover:bg-slate-100 font-bold h-14 px-10 rounded-xl text-lg box-shadow-xl">
              <Link href="/contato">Falar com um Especialista</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 font-bold h-14 px-10 rounded-xl text-lg">
              <Link href="/portfolio">Ver Nossos Projetos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 7. DEPOIMENTOS (Keep existing testimonials as social proof) */}
      <section className="w-full py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="A Infinity entrega soluções com excelência técnica e visão estratégica. É nossa parceira de longo prazo."
              author="Carlos Silva"
              role="CTO | TechCorp Systems"
            />
            <TestimonialCard
              quote="A equipe é excepcional. A transparência e agilidade são diferenciais que impactam diretamente nossos resultados."
              author="Mariana Santos"
              role="Diretora de TI | LogiSmart"
            />
            <TestimonialCard
              quote="Com a Infinity modernizamos toda nossa plataforma e otimizamos a operação em 40%."
              author="Roberto Oliveira"
              role="Gerente Digital | ViewConnect"
            />
          </div>
        </div>
      </section>

      {/* 8. FOOTER REMOVED - Usage of Global Footer */}

    </main>
  )
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

function SkillCard({ icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-[#0076FF] hover:shadow-md transition-all group">
      <div className="text-[#0076FF]">
        {icon}
      </div>
      <span className="text-[#1A1A1A] font-bold text-sm tracking-wide">{label}</span>
    </div>
  )
}

function TimelineItem({ year, title, desc, right = false, active = false, future = false }: { year: string, title: string, desc: string, right?: boolean, active?: boolean, future?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: right ? 30 : -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`flex items-center justify-between w-full md:gap-8 ${right ? 'md:flex-row-reverse' : ''}`}
    >
      <div className="hidden md:block flex-1" /> {/* Spacer */}

      {/* Center Node */}
      <div className="relative flex-shrink-0 z-10 mx-4 md:mx-0">
        <div className={`w-12 h-12 rounded-full border-4 ${active ? 'border-[#0076FF] bg-white' : (future ? 'border-purple-500 bg-white' : 'border-slate-200 bg-white')} flex items-center justify-center shadow-lg relative`}>
          <div className={`w-3 h-3 rounded-full ${active ? 'bg-[#0076FF]' : (future ? 'bg-purple-500' : 'bg-slate-300')}`} />
        </div>
      </div>

      <div className="flex-1 pb-8 md:pb-0">
        <div className={`p-8 rounded-2xl border ${active ? 'bg-blue-50 border-[#0076FF]/20 shadow-lg' : (future ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-100 shadow-md')} relative hover:-translate-y-1 transition-transform duration-300`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${active ? 'bg-[#0076FF] text-white' : 'bg-slate-100 text-slate-600'}`}>{year}</span>
            <h3 className={`font-bold text-xl ${active ? 'text-[#0076FF]' : 'text-[#1A1A1A]'}`}>{title}</h3>
          </div>
          <p className="text-[#4B4B4B] text-sm leading-relaxed">{desc}</p>
        </div>
      </div>
    </motion.div>
  )
}

function DNA_Card({ title, text, icon }: { title: string, text: string, icon: any }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-lg hover:shadow-xl hover:border-[#0076FF]/30 transition-all group">
      <div className="mb-6 p-4 rounded-xl bg-[#F6F6F6] w-fit group-hover:bg-[#0076FF]/10 transition-colors">{icon}</div>
      <h3 className="font-bold uppercase tracking-widest text-[#0076FF] text-sm mb-4">{title}</h3>
      <p className="text-xl text-[#1A1A1A] font-bold leading-relaxed">"{text}"</p>
    </div>
  )
}

function ValueBox({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#0076FF] hover:shadow-md transition-all">
      <div className="w-2 h-2 rounded-full bg-[#0076FF] mb-4" />
      <h4 className="text-[#1A1A1A] font-bold mb-2">{title}</h4>
      <p className="text-sm text-[#4B4B4B]">{desc}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, role }: { quote: string, author: string, role: string }) {
  return (
    <div className="bg-[#F6F6F6] p-8 rounded-2xl relative">
      <div className="flex gap-1 text-yellow-400 mb-4">
        <Star size={16} fill="currentColor" />
        <Star size={16} fill="currentColor" />
        <Star size={16} fill="currentColor" />
        <Star size={16} fill="currentColor" />
        <Star size={16} fill="currentColor" />
      </div>
      <p className="text-[#4B4B4B] italic mb-6 leading-relaxed">"{quote}"</p>
      <div>
        <h4 className="font-bold text-[#1A1A1A]">{author}</h4>
        <p className="text-sm text-[#0076FF]">{role}</p>
      </div>
    </div>
  )
}
