"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  Smartphone,
  Zap,
  Globe,
  Lock,
  Layers,
  RefreshCw,
  Bell,
  Fingerprint,
  Star,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from '@/components/ui/optimized-image'
import { TbBrandReactNative, TbBrandKotlin } from "react-icons/tb"
import { SiSwift, SiFlutter, SiFirebase } from "react-icons/si"
import { BiLogoGraphql } from "react-icons/bi"
import { FaApple, FaAndroid } from "react-icons/fa"

export default function AplicativosCelularPage() {
  const benefits = [
    { icon: <Zap className="w-6 h-6" />, title: "Performance Nativa", desc: "Acesso direto ao hardware do dispositivo para máxima velocidade e fluidez." },
    { icon: <Globe className="w-6 h-6" />, title: "Modo Offline", desc: "Funcionalidades vitais mesmo sem conexão com a internet." },
    { icon: <Lock className="w-6 h-6" />, title: "Segurança Avançada", desc: "Integração com FaceID, TouchID e armazenamento criptografado." },
    { icon: <Bell className="w-6 h-6" />, title: "Engajamento Real", desc: "Push Notifications com taxas de abertura 5x maiores que e-mail." },
    { icon: <Layers className="w-6 h-6" />, title: "UX/UI Premium", desc: "Interfaces seguindo as diretrizes de design Apple e Google." },
    { icon: <RefreshCw className="w-6 h-6" />, title: "Escalabilidade", desc: "Arquitetura modular pronta para milhares de usuários." },
  ]

  const technologies = [
    { name: "React Native", icon: <TbBrandReactNative size={36} className="text-[#61DAFB]" /> },
    { name: "Flutter", icon: <SiFlutter size={32} className="text-[#02569B]" /> },
    { name: "Swift (iOS)", icon: <SiSwift size={32} className="text-[#F05138]" /> },
    { name: "Kotlin", icon: <TbBrandKotlin size={32} className="text-[#7F52FF]" /> },
    { name: "Firebase", icon: <SiFirebase size={32} className="text-[#FFCA28]" /> },
  ]

  const steps = [
    { step: "01", title: "Discovery & Prototipagem", text: "Definição de escopo e Wireframes de alta fidelidade." },
    { step: "02", title: "Desenvolvimento Ágil", text: "Entregas quinzenais para acompanhar a evolução." },
    { step: "03", title: "Quality Assurance", text: "Testes automatizados em dezenas de dispositivos." },
    { step: "04", title: "Launch & Growth", text: "Publicação nas lojas e monitoramento de métricas." },
  ]

  return (
    <main className="flex flex-col w-full bg-white text-[#1A1A1A] font-inter selection:bg-[#0076FF]/20">

      {/* HERO SECTION */}
      <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Fixed Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/images/programadorapp.webp')] bg-cover bg-center bg-fixed" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10]/95 via-[#0B0C10]/80 to-[#0B0C10]/60" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Platform Badges */}
            <div className="flex justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-sm font-medium">
                <FaApple /> iOS
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-sm font-medium">
                <FaAndroid /> Android
              </div>
            </div>

            <h1 className="font-bold text-5xl lg:text-7xl text-white mb-8 leading-tight drop-shadow-lg">
              Apps Nativos de <br />
              <span className="text-[#0076FF]">Alta Performance</span>
            </h1>
            <p className="text-xl text-slate-200 font-medium mb-12 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              Transformamos ideias complexas em experiências mobile fluidas e intuitivas. Aplicativos que engajam, convertem e rodam suavemente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-[#0076FF] hover:bg-[#0060D0] text-white font-bold h-14 px-10 rounded-xl shadow-lg shadow-blue-500/30 text-lg border-0">
                <Link href="/orcamento">
                  Iniciar Projeto <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white font-bold h-14 px-10 rounded-xl text-lg">
                <Link href="#tecnologias">
                  Ver Tecnologias
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
      <section className="w-full py-24 bg-[#F6F6F6]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0076FF]/10 border border-[#0076FF]/20 text-[#0076FF] font-bold text-sm uppercase tracking-wider mb-4">
              Vantagens
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
              Por que investir em um <span className="text-[#0076FF]">App Mobile?</span>
            </h2>
            <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
              Esteja no bolso do seu cliente 24 horas por dia. Apps nativos oferecem recursos que nenhum site consegue.
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
                Metodologia
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-8">
                Do Conceito à <span className="text-[#0076FF]">App Store</span>
              </h2>
              <p className="text-xl text-[#64748B] leading-relaxed mb-10">
                Nossa esteira de desenvolvimento ágil garante entregas rápidas e qualidade de código impecável.
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
              <div className="grid grid-cols-2 gap-4">
                {/* Main Image */}
                <div className="col-span-2 relative h-[280px] rounded-2xl overflow-hidden shadow-xl">
                  <OptimizedImage src="/images/coceitoapp.webp" alt="App Development" width={600} height={400} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <span className="inline-block px-3 py-1 bg-[#0076FF] text-white text-xs font-bold rounded-full mb-2">React Native</span>
                    <h4 className="font-bold text-xl text-white">Desenvolvimento Mobile</h4>
                  </div>
                </div>

                {/* Rating Card */}
                <div className="bg-[#F6F6F6] p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <h4 className="font-bold text-5xl text-[#1A1A1A] mb-2">5.0</h4>
                  <div className="flex text-yellow-500 gap-1 mb-2">
                    <Star size={18} fill="currentColor" strokeWidth={0} />
                    <Star size={18} fill="currentColor" strokeWidth={0} />
                    <Star size={18} fill="currentColor" strokeWidth={0} />
                    <Star size={18} fill="currentColor" strokeWidth={0} />
                    <Star size={18} fill="currentColor" strokeWidth={0} />
                  </div>
                  <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">App Store</span>
                </div>

                {/* Feature Card */}
                <div className="bg-[#F6F6F6] p-6 rounded-2xl border border-slate-100">
                  <Fingerprint className="w-10 h-10 text-[#0076FF] mb-4" />
                  <h4 className="font-bold text-lg text-[#1A1A1A] mb-2">Biometria</h4>
                  <p className="text-sm text-[#64748B]">FaceID & TouchID</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNOLOGIES SECTION */}
      <section id="tecnologias" className="w-full py-24 bg-[#F6F6F6]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0076FF]/10 border border-[#0076FF]/20 text-[#0076FF] font-bold text-sm uppercase tracking-wider mb-4">
              Tecnologias
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
              Stack <span className="text-[#0076FF]">Tecnológico</span>
            </h2>
            <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
              Utilizamos as ferramentas mais modernas para performance nativa e desenvolvimento ágil.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {technologies.map((tech, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5, scale: 1.02 }}
                className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-[#0076FF]/20 transition-all group"
              >
                <div className="mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  {tech.icon}
                </div>
                <span className="text-[#64748B] font-medium text-sm group-hover:text-[#1A1A1A] transition-colors">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="w-full py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-[#0B0C10] rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0076FF]/20 to-transparent" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Tem uma ideia de <span className="text-[#0076FF]">App?</span>
              </h2>
              <p className="text-lg text-slate-300 mb-10 leading-relaxed">
                O mercado mobile cresce todos os dias. Não deixe para depois. Vamos tirar seu projeto do papel.
              </p>
              <Button asChild size="lg" className="bg-white text-[#0076FF] hover:bg-slate-100 font-bold h-16 px-12 rounded-xl text-xl shadow-2xl">
                <Link href="/orcamento">Falar com Especialista <ArrowRight className="ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
