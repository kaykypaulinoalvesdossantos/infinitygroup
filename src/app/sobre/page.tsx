"use client"

import { useRef, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { CheckCircle2, Target, Award, Zap, Code, Star, Rocket, Users, Brain, Globe, Boxes, Shield, Terminal, Fingerprint } from "lucide-react"
import SpaceBackground from "@/components/space-background"
import TechCarousel from "@/components/tech-carousel"
import { OptimizedImage } from '@/components/ui/optimized-image'

export default function SobrePage() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  return (
    <main ref={containerRef} className="flex flex-col items-center justify-center w-full bg-[#0B0B13] overflow-hidden">

      {/* Hero Section */}
      <section className="w-full min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden">
        <SpaceBackground />

        {/* Background Overlay & Noise */}
        <div className="absolute inset-0 z-0 bg-[#0B0B13]/80"></div>
        <div className="absolute inset-0 z-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>

        <div className="container mx-auto px-4 z-10 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-6">
              <div className="px-4 py-1.5 rounded-full border border-[#00B8FF]/30 bg-[#00B8FF]/10 backdrop-blur-md">
                <span className="text-[#00B8FF] text-sm font-semibold uppercase tracking-wider font-manrope">Nossa Essência</span>
              </div>
            </div>

            <h1 className="font-orbitron font-bold text-4xl md:text-6xl lg:text-7xl mb-8 text-white tracking-wider leading-tight">
              Sobre a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B8FF] to-white animate-pulse-slow">Infinity Groups</span>
            </h1>

            <p className="font-manrope text-lg md:text-xl text-[#AAB3C2] max-w-3xl mx-auto leading-relaxed">
              Não somos apenas uma agência de tecnologia. Somos arquitetos de soluções digitais que transformam o impossível em código, design e resultado.
            </p>
          </motion.div>
        </div>

      </section>

      {/* Founder Section */}
      <section className="w-full py-24 bg-[#0E0E12] relative z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00B8FF]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-0.5 w-12 bg-[#00B8FF]"></div>
                <span className="text-[#00B8FF] font-manrope font-bold uppercase tracking-widest text-sm">O Mente Por Trás</span>
              </div>

              <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-8 text-white">
                Conheça o <span className="text-[#00B8FF]">Idealizador</span>
              </h2>

              <div className="space-y-6 font-manrope text-[#C0C7D0] text-lg leading-relaxed">
                <p>
                  A Infinity Groups foi fundada por <strong className="text-white">Kayky Paulino</strong>, com formação em <span className="text-[#00B8FF]">Ciência da Computação</span> e atuação focada em produtos e engenharia de software.
                </p>
                <p>
                  O objetivo desde o início foi construir soluções digitais que resolvem problemas de negócio: sistemas sob medida, integrações, automações e produtos próprios com foco em performance, confiabilidade e escalabilidade.
                </p>
                <p>
                  Atualmente, Kayky conduz a liderança técnica e estratégica, assegurando consistência de arquitetura, qualidade de código e entregas alinhadas a metas claras.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
                <FounderBadge icon={<Code />} text="Full-Stack Developer" />
                <FounderBadge icon={<Brain />} text="Arquiteto de Soluções" />
                <FounderBadge icon={<Rocket />} text="Estrategista Digital" />
                <FounderBadge icon={<Award />} text="Líder de Inovação" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative order-1 lg:order-2 flex justify-center"
            >
              <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]">
                {/* Glowing Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-[#00B8FF]/20 animate-spin-slow-reverse" />
                <div className="absolute inset-4 rounded-full border border-[#00B8FF]/40 animate-spin-slow dashed-border" />

                <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-[#00B8FF]/20 shadow-[0_0_50px_rgba(0,184,255,0.1)] bg-[#0B0B13]">
                  <OptimizedImage
                    src="/images/kayky.webp"
                    alt="Kayky Paulino - CEO Infinity Groups"
                    width={800}
                    height={800}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* History Timeline Section */}
      <section className="w-full py-24 bg-[#0B0B13] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[800px] bg-[#00B8FF]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-6 text-white">Nossa <span className="text-[#00B8FF]">Jornada</span></h2>
            <p className="font-manrope text-[#AAB3C2] text-lg max-w-2xl mx-auto">
              De uma ideia ambiciosa a uma referência em tecnologia. Acompanhe nossa evolução rumo ao futuro.
            </p>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            {/* Neon Data Path - Vertical Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-[#1F2937]/50 md:-translate-x-1/2 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00B8FF]/0 via-[#00B8FF] to-[#00B8FF]/0 animate-pulse-slow"></div>
            </div>

            <div className="space-y-16">
              <TimelineItem
                year="2022"
                title="O Início"
                desc="Fundação da Infinity Groups com foco inicial em desenvolvimento web de alta performance e arquitetura escalável."
                side="left"
                icon={<Code size={20} />}
              />
              <TimelineItem
                year="2023"
                title="Expansão Tecnológica"
                desc="Integração de Inteligência Artificial e Automação no portfólio, multiplicando o ROI de nossos parceiros."
                side="right"
                icon={<Zap size={20} />}
              />
              <TimelineItem
                year="2024"
                title="Novos Horizontes"
                desc="Consolidação como parceiro estratégico B2B, liderando transformações digitais em grandes corporações."
                side="left"
                icon={<Globe size={20} />}
              />
              <TimelineItem
                year="2025"
                title="Softwares Exclusivos"
                desc="Início do desenvolvimento de softwares proprietários da Infinity Groups. Soluções exclusivas criadas internamente para escalar negócios."
                side="right"
                icon={<Rocket size={20} />}
              />
              <TimelineItem
                year="2026"
                title="Inovações com IA"
                desc="Inovações com Inteligência Artificial e lançamento de softwares proprietários da Infinity disponibilizados para o mercado."
                side="left"
                isFuture={true}
                icon={<Brain size={20} />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Corporate DNA - Bento Grid */}
      <section className="w-full py-32 bg-[#0B0B13] relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-3xl md:text-5xl text-white mb-4">Corporate <span className="text-[#00B8FF]">DNA</span></h2>
            <p className="text-[#AAB3C2]">Os códigos-fonte da nossa cultura organizacional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">

            {/* Mission - Large Box */}
            <motion.div
              className="md:col-span-2 md:row-span-2 bg-[#12121E] border border-[#1F2937] p-8 rounded-3xl relative overflow-hidden group hover:border-[#00B8FF]/30 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Target size={120} />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-full bg-[#00B8FF]/10 flex items-center justify-center text-[#00B8FF] mb-6">
                  <Rocket />
                </div>
                <div>
                  <h3 className="text-[#00B8FF] font-bold uppercase tracking-widest mb-4 text-sm">Missão</h3>
                  <p className="font-orbitron text-2xl md:text-3xl text-white font-bold leading-tight">
                    "Transformar complexidade em clareza, entregando tecnologia que impulsiona o progresso humano."
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Vision - Tall Box */}
            <motion.div
              className="md:col-span-2 bg-[#12121E] border border-[#1F2937] p-8 rounded-3xl relative overflow-hidden group hover:border-[#9C5DE7]/30 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-full bg-[#9C5DE7]/10 flex items-center justify-center text-[#9C5DE7]">
                  <Zap />
                </div>
                <h3 className="text-[#9C5DE7] font-bold uppercase tracking-widest text-sm">Visão</h3>
              </div>
              <p className="font-manrope text-xl text-[#AAB3C2] leading-relaxed">
                Ser a infraestrutura intelectual por trás das empresas mais inovadoras do mundo.
              </p>
            </motion.div>

            {/* Values - Grid of small boxes */}
            <div className="md:col-span-2 grid grid-cols-2 gap-6">
              <div className="bg-[#12121E] p-6 rounded-2xl border border-[#1F2937] hover:border-[#00B8FF]/30 transition-all hover:bg-[#1A1A2E] group h-full">
                <div className="text-[#00B8FF] mb-3 opacity-70 group-hover:opacity-100 transition-opacity"><Shield size={20} /></div>
                <h4 className="text-white font-bold mb-2 text-sm">Confiança Radical</h4>
                <p className="text-[#555B66] text-xs leading-relaxed group-hover:text-[#AAB3C2] transition-colors">Transparência total em cada linha.</p>
              </div>
              <div className="bg-[#12121E] p-6 rounded-2xl border border-[#1F2937] hover:border-[#00B8FF]/30 transition-all hover:bg-[#1A1A2E] group h-full">
                <div className="text-[#00B8FF] mb-3 opacity-70 group-hover:opacity-100 transition-opacity"><Terminal size={20} /></div>
                <h4 className="text-white font-bold mb-2 text-sm">Inovação Técnica</h4>
                <p className="text-[#555B66] text-xs leading-relaxed group-hover:text-[#AAB3C2] transition-colors">Sempre na borda da tecnologia.</p>
              </div>
              <div className="bg-[#12121E] p-6 rounded-2xl border border-[#1F2937] hover:border-[#00B8FF]/30 transition-all hover:bg-[#1A1A2E] group h-full">
                <div className="text-[#00B8FF] mb-3 opacity-70 group-hover:opacity-100 transition-opacity"><Star size={20} /></div>
                <h4 className="text-white font-bold mb-2 text-sm">Qualidade Obsessiva</h4>
                <p className="text-[#555B66] text-xs leading-relaxed group-hover:text-[#AAB3C2] transition-colors">Não aceitamos "mais ou menos".</p>
              </div>
              <div className="bg-[#12121E] p-6 rounded-2xl border border-[#1F2937] hover:border-[#00B8FF]/30 transition-all hover:bg-[#1A1A2E] group h-full">
                <div className="text-[#00B8FF] mb-3 opacity-70 group-hover:opacity-100 transition-opacity"><Users size={20} /></div>
                <h4 className="text-white font-bold mb-2 text-sm">Foco no Cliente</h4>
                <p className="text-[#555B66] text-xs leading-relaxed group-hover:text-[#AAB3C2] transition-colors">Seu sucesso é nosso compilador.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="w-full py-20 bg-[#0B0B13]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-orbitron font-bold text-2xl md:text-3xl mb-12 text-white">
            Powering the <span className="text-[#00B8FF]">Future</span>
          </h2>
          <TechCarousel />
        </div>
      </section>

    </main>
  )
}

// Components auxiliares para manter o código limpo

function FounderBadge({ icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-3 bg-[#12121E] border border-[#1F2937] p-3 rounded-lg hover:border-[#00B8FF]/40 transition-colors group">
      <div className="p-2 rounded-md bg-[#00B8FF]/10 text-[#00B8FF] group-hover:bg-[#00B8FF] group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className="font-manrope text-sm text-[#AAB3C2] font-semibold">{text}</span>
    </div>
  )
}

function FloatingIcon({ icon, angle, delay }: { icon: any, angle: number, delay: number }) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 rounded-full bg-[#12121E] border border-[#00B8FF]/30 flex items-center justify-center shadow-lg z-20"
      animate={{
        x: [
          Math.cos(angle * (Math.PI / 180)) * 140,
          Math.cos(angle * (Math.PI / 180)) * 130, // leve movimento
          Math.cos(angle * (Math.PI / 180)) * 140
        ],
        y: [
          Math.sin(angle * (Math.PI / 180)) * 140,
          Math.sin(angle * (Math.PI / 180)) * 130,
          Math.sin(angle * (Math.PI / 180)) * 140
        ]
      }}
      transition={{ duration: 3, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      {icon}
    </motion.div>
  )
}

function TimelineItem({ year, title, desc, side, isFuture = false, icon }: { year: string, title: string, desc: string, side: 'left' | 'right', isFuture?: boolean, icon: any }) {
  const isLeft = side === 'left';

  // Cores dinâmicas para futuro vs presente
  const accentColor = isFuture ? '#9C5DE7' : '#00B8FF';
  const glowColor = isFuture ? 'rgba(156, 93, 231, 0.5)' : 'rgba(0, 184, 255, 0.5)';
  const badgeBg = isFuture ? 'bg-[#9C5DE7]/20' : 'bg-[#00B8FF]/20';
  const badgeText = isFuture ? 'text-[#9C5DE7]' : 'text-[#00B8FF]';
  const borderColor = isFuture ? 'hover:border-[#9C5DE7]/50' : 'hover:border-[#00B8FF]/50';

  const CardContent = () => (
    <div className={`p-8 rounded-2xl bg-[#12121E]/80 backdrop-blur-xl border border-[#1F2937] ${borderColor} transition-all duration-300 shadow-xl group-hover:shadow-[0_0_30px_${glowColor}] relative overflow-hidden`}>
      {isFuture && <div className="absolute inset-0 bg-gradient-to-br from-[#9C5DE7]/10 to-transparent opacity-50"></div>}
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4 relative z-10">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${badgeBg} ${badgeText} font-bold text-sm tracking-wider`}>
          {icon} {year}
        </div>
        {isFuture && <span className="text-[10px] uppercase tracking-widest text-[#AAB3C2] animate-pulse">Loading Future...</span>}
      </div>
      <h3 className="font-orbitron font-bold text-2xl text-white mb-3 relative z-10">{title}</h3>
      <p className="font-manrope text-[#AAB3C2] text-sm leading-relaxed relative z-10">{desc}</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative group"
    >
      {/* Desktop Layout - Alternating */}
      <div className={`hidden md:flex items-center gap-8 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Left/Right Content */}
        <div className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}>
          <CardContent />
        </div>

        {/* Center Node */}
        <div className="relative z-20 flex items-center justify-center flex-shrink-0">
          <div style={{ borderColor: accentColor, boxShadow: `0 0 20px ${glowColor}` }} className="w-6 h-6 rounded-full border-2 bg-[#0B0B13] z-20 relative flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
            <div style={{ backgroundColor: accentColor }} className="w-2 h-2 rounded-full animate-pulse"></div>
          </div>
          {/* Pulsing Ripple */}
          <div style={{ backgroundColor: isFuture ? 'rgba(156, 93, 231, 0.3)' : 'rgba(0, 184, 255, 0.3)' }} className="absolute inset-0 rounded-full animate-ping opacity-20"></div>
        </div>

        {/* Empty Space on opposite side */}
        <div className="flex-1"></div>
      </div>

      {/* Mobile Layout - Simple Vertical */}
      <div className="md:hidden flex items-start gap-4">
        {/* Node */}
        <div className="relative z-20 flex items-center justify-center flex-shrink-0 mt-2">
          <div style={{ borderColor: accentColor, boxShadow: `0 0 20px ${glowColor}` }} className="w-5 h-5 rounded-full border-2 bg-[#0B0B13] z-20 relative flex items-center justify-center">
            <div style={{ backgroundColor: accentColor }} className="w-1.5 h-1.5 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <CardContent />
        </div>
      </div>
    </motion.div>
  )
}

function ValueCard({ icon, title, desc, isList = false, items = [] }: { icon: any, title: string, desc?: string, isList?: boolean, items?: string[] }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-[#0E0E12] border border-[#1F2937] hover:border-[#00B8FF]/30 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,184,255,0.05)] group h-full"
    >
      <div className="mb-6 p-4 rounded-full bg-[#12121E] inline-block border border-[#1F2937] group-hover:border-[#00B8FF]/20 transition-colors">
        {icon}
      </div>
      <h3 className="font-orbitron font-bold text-2xl text-white mb-4">{title}</h3>

      {isList ? (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-[#AAB3C2] font-manrope">
              <CheckCircle2 className="w-5 h-5 text-[#00B8FF]" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-manrope text-[#AAB3C2] leading-relaxed">
          {desc}
        </p>
      )}
    </motion.div>
  )
}
