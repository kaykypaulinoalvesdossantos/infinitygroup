"use client"

import { useRef, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  Smartphone,
  Zap,
  Globe,
  Lock,
  Layers,
  RefreshCw,
  Star,
  Rocket,
  Cpu,
  Wifi,
  CheckCircle2,
  Bell,
  Fingerprint
} from "lucide-react"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import { OptimizedImage } from '@/components/ui/optimized-image'
import { TbBrandReactNative, TbBrandKotlin } from "react-icons/tb"
import { SiSwift, SiAwsamplify, SiFlutter, SiFirebase } from "react-icons/si"
import { BiLogoGraphql } from "react-icons/bi"

export default function AplicativosCelularPage() {
  const containerRef = useRef(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Efeito para a animação do dispositivo móvel (Neon Style)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 300
    canvas.height = 600

    function drawSmartphone() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Glow effect background
      const gradient = ctx.createRadialGradient(150, 300, 50, 150, 300, 300);
      gradient.addColorStop(0, "rgba(0, 184, 255, 0.05)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Body do Smartphone
      ctx.fillStyle = "rgba(18, 18, 30, 0.8)" // #12121E opacity
      ctx.strokeStyle = "#00B8FF" // Neon Blue
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(50, 50, 200, 400, 30) // More rounded corners
      ctx.fill()
      ctx.stroke()

      // Screen
      ctx.fillStyle = "#0B0B13"
      ctx.beginPath()
      ctx.roundRect(60, 70, 180, 360, 10)
      ctx.fill()

      // Notch/Dynamic Island area
      ctx.fillStyle = "#000"
      ctx.beginPath()
      ctx.roundRect(110, 75, 80, 20, 10)
      ctx.fill()

      // Animated Code/Content
      const now = Date.now()

      // Floating Elements inside screen
      ctx.fillStyle = "#00B8FF"
      ctx.font = "12px monospace"
      ctx.globalAlpha = 0.8

      // Matrix-like code rain or static code blocks
      for (let i = 0; i < 8; i++) {
        const y = 120 + i * 25
        const width = 100 + Math.sin(now / 1000 + i) * 50

        ctx.fillStyle = i % 2 === 0 ? "#00B8FF" : "#9C5DE7"
        ctx.fillRect(75, y, Math.min(width, 150), 8)
      }

      // App Icons Grid simulation
      const startY = 320
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          const x = 75 + col * 50
          const y = startY + row * 50

          ctx.globalAlpha = 0.5 + Math.sin(now / 800 + row + col) * 0.3
          ctx.fillStyle = (row + col) % 2 === 0 ? "#00B8FF" : "#9C5DE7"
          ctx.beginPath()
          ctx.roundRect(x, y, 35, 35, 8)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1.0

      requestAnimationFrame(drawSmartphone)
    }

    const animationId = requestAnimationFrame(drawSmartphone)
    return () => cancelAnimationFrame(animationId)
  }, [])

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
              <div className="inline-flex gap-3 mb-6">
                <div className="px-4 py-2 rounded-full bg-[#00B8FF]/10 border border-[#00B8FF]/20">
                  <span className="text-[#00B8FF] font-manrope font-bold text-sm tracking-wide uppercase flex items-center gap-2">
                    <Smartphone size={16} /> iOS & Android
                  </span>
                </div>
              </div>

              <h1 className="font-orbitron font-bold text-4xl md:text-6xl lg:text-7xl mb-8 text-white leading-tight">
                Apps Nativos de <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B8FF] to-[#9C5DE7]">Alta Performance</span>
              </h1>

              <p className="font-manrope text-lg md:text-xl text-[#AAB3C2] max-w-xl mb-10 leading-relaxed">
                Transformamos ideias complexas em experiências mobile fluidas e intuitivas. Aplicativos que engajam, convertem e rodam suavemente em qualquer dispositivo.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#00B8FF] hover:bg-[#00B8FF]/80 text-[#0B0B13] font-bold text-lg px-8 h-14 rounded-full relative overflow-hidden group shadow-[0_0_20px_rgba(0,184,255,0.3)] hover:shadow-[0_0_30px_rgba(0,184,255,0.5)] transition-all"
                >
                  <Link href="/orcamento">
                    <span className="relative z-10 flex items-center gap-2">
                      Iniciar Projeto <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-[#1F2937] text-white hover:bg-[#1F2937] hover:border-[#00B8FF]/50 font-manrope h-14 rounded-full px-8"
                >
                  <Link href="#tecnologias">
                    Nossas Tecnologias
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center items-center"
            >
              {/* Animated Device Container */}
              <motion.div
                className="relative z-10"
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <canvas ref={canvasRef} className="w-[300px] max-w-full h-[600px] drop-shadow-2xl" />

                {/* Floating Elements surrounding the phone */}
                <motion.div
                  className="absolute top-20 -right-10 bg-[#12121E]/90 backdrop-blur border border-[#1F2937] p-3 rounded-xl shadow-lg flex items-center gap-3"
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="bg-[#00B8FF]/20 p-2 rounded-lg text-[#00B8FF]"><Bell size={20} /></div>
                  <div className="text-white text-xs font-bold font-orbitron">Push <br />Notification</div>
                </motion.div>

                <motion.div
                  className="absolute bottom-40 -left-10 bg-[#12121E]/90 backdrop-blur border border-[#1F2937] p-3 rounded-xl shadow-lg flex items-center gap-3"
                  animate={{ x: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="bg-[#9C5DE7]/20 p-2 rounded-lg text-[#9C5DE7]"><Fingerprint size={20} /></div>
                  <div className="text-white text-xs font-bold font-orbitron">Biometria <br />Segura</div>
                </motion.div>
              </motion.div>

              {/* Background Glows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00B8FF]/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
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
              Por que investir em um <span className="text-[#00B8FF]">App Mobile?</span>
            </h2>
            <p className="font-manrope text-[#AAB3C2] text-lg max-w-2xl mx-auto">
              Esteja no bolso do seu cliente 24 horas por dia. Apps nativos oferecem recursos e performance que nenhum site consegue entregar.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap />}
              title="Performance Nativa"
              desc="Acesso direto ao hardware do dispositivo para máxima velocidade e fluidez nas animações."
            />
            <FeatureCard
              icon={<Globe />}
              title="Modo Offline"
              desc="Permita que seus usuários acessem funcionalidades vitais mesmo sem conexão com a internet."
            />
            <FeatureCard
              icon={<Lock />}
              title="Segurança Avançada"
              desc="Integração com FaceID, TouchID e armazenamento criptografado de dados sensíveis."
            />
            <FeatureCard
              icon={<Bell />}
              title="Engajamento Real"
              desc="Push Notifications personalizadas tem taxas de abertura 5x maiores que e-mail marketing."
            />
            <FeatureCard
              icon={<Layers />}
              title="UX/UI Premium"
              desc="Interfaces desenhadas especificamente para as diretrizes de design da Apple e Google."
            />
            <FeatureCard
              icon={<RefreshCw />}
              title="Escalabilidade"
              desc="Arquitetura modular pronta para receber novas features e milhares de usuários simultâneos."
            />
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="w-full py-24 bg-[#0B0B13] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-8 text-white">
                Do Conceito à <span className="text-[#9C5DE7]">App Store</span>
              </h2>
              <p className="font-manrope text-[#AAB3C2] text-lg leading-relaxed mb-8">
                Nossa esteira de desenvolvimento ágil garante entregas rápidas e qualidade de código impecável. Cuidamos de todo o processo de publicação e manutenção.
              </p>

              <ul className="space-y-6">
                <StepItem title="Discovery & Prototipagem" desc="Definição de escopo e Wireframes de alta fidelidade." delay={0} />
                <StepItem title="Desenvolvimento Sprint-based" desc="Entregas quinzenais para você acompanhar a evolução." delay={0.1} />
                <StepItem title="Quality Assurance (QA)" desc="Testes automatizados em dezenas de dispositivos reais." delay={0.2} />
                <StepItem title="Launch & Growth" desc="Publicação nas lojas e monitoramento de métricas." delay={0.3} />
              </ul>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Code Window */}
                <div className="col-span-2 relative h-[240px] rounded-2xl overflow-hidden border border-[#1F2937] bg-[#0E0E12] group hover:border-[#9C5DE7]/50 transition-colors shadow-2xl">
                  <div className="absolute top-0 left-0 right-0 h-9 bg-[#1F2937]/50 flex items-center px-4 gap-2 border-b border-[#1F2937]">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                    </div>
                    <div className="ml-4 text-xs text-[#555B66] font-mono flex items-center gap-2">
                      <span className="text-[#00B8FF]">⚛️</span> <span className="text-[#AAB3C2]">UserProfile.tsx</span>
                    </div>
                  </div>

                  <div className="p-4 pt-12 font-mono text-[10px] md:text-xs text-[#AAB3C2] opacity-90 leading-relaxed overflow-hidden relative z-10">
                    <div className="flex">
                      <span className="w-6 text-[#555B66] text-right mr-3 select-none">1</span>
                      <p><span className="text-[#C792EA]">import</span> React, {'{'} <span className="text-[#FFCB6B]">useState</span> {'}'} <span className="text-[#C792EA]">from</span> <span className="text-[#C3E88D]">'react'</span>;</p>
                    </div>
                    <div className="flex">
                      <span className="w-6 text-[#555B66] text-right mr-3 select-none">2</span>
                      <p><span className="text-[#C792EA]">import</span> {'{'} <span className="text-[#FFCB6B]">View</span>, <span className="text-[#FFCB6B]">Text</span>, <span className="text-[#FFCB6B]">Image</span> {'}'} <span className="text-[#C792EA]">from</span> <span className="text-[#C3E88D]">'react-native'</span>;</p>
                    </div>
                    <div className="flex">
                      <span className="w-6 text-[#555B66] text-right mr-3 select-none">3</span>
                      <p>&nbsp;</p>
                    </div>
                    <div className="flex">
                      <span className="w-6 text-[#555B66] text-right mr-3 select-none">4</span>
                      <p><span className="text-[#C792EA]">export default</span> <span className="text-[#C792EA]">function</span> <span className="text-[#82AAFF]">UserProfile</span>() {'{'}</p>
                    </div>
                    <div className="flex">
                      <span className="w-6 text-[#555B66] text-right mr-3 select-none">5</span>
                      <p className="pl-4"><span className="text-[#C792EA]">const</span> [<span className="text-[#FFCB6B]">user</span>] = <span className="text-[#82AAFF]">useAuth</span>();</p>
                    </div>
                    <div className="flex">
                      <span className="w-6 text-[#555B66] text-right mr-3 select-none">6</span>
                      <p className="pl-4"><span className="text-[#C792EA]">return</span> (</p>
                    </div>
                    <div className="flex">
                      <span className="w-6 text-[#555B66] text-right mr-3 select-none">7</span>
                      <p className="pl-8"><span className="text-[#89DDFF]">&lt;</span><span className="text-[#FFCB6B]">View</span> <span className="text-[#C792EA]">style</span>={'{'}styles.card{'}'}<span className="text-[#89DDFF]">&gt;</span></p>
                    </div>
                    <div className="flex">
                      <span className="w-6 text-[#555B66] text-right mr-3 select-none">8</span>
                      <p className="pl-12"><span className="text-[#89DDFF]">&lt;</span><span className="text-[#FFCB6B]">Image</span> <span className="text-[#C792EA]">source</span>={'{'}user.avatar{'}'} <span className="text-[#89DDFF]">/&gt;</span></p>
                    </div>
                    <div className="flex">
                      <span className="w-6 text-[#555B66] text-right mr-3 select-none">9</span>
                      <p className="pl-12"><span className="text-[#89DDFF]">&lt;</span><span className="text-[#FFCB6B]">Text</span><span className="text-[#89DDFF]">&gt;</span>{'{'}user.name{'}'}<span className="text-[#89DDFF]">&lt;/</span><span className="text-[#FFCB6B]">Text</span><span className="text-[#89DDFF]">&gt;</span></p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#9C5DE7]/10 rounded-full blur-3xl pointer-events-none"></div>
                </div>

                {/* UI Mockup */}
                <div className="h-[240px] rounded-2xl overflow-hidden border border-[#1F2937] bg-[#12121E] relative group hover:border-[#00B8FF]/50 transition-colors">
                  <OptimizedImage src="/images/ecommerce.webp" alt="UI Design" width={300} height={300} className="w-full h-full object-cover opacity-50 contrast-125" />
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-[#00B8FF] text-[#0B0B13] text-[10px] font-bold rounded uppercase tracking-wider shadow-lg">UI Design</div>
                </div>

                {/* Rating Card */}
                <div className="h-[240px] rounded-2xl overflow-hidden border border-[#1F2937] bg-[#12121E] relative flex flex-col items-center justify-center group hover:border-yellow-500/30 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-center relative z-10">
                    <h4 className="font-orbitron font-bold text-6xl text-white mb-3 tracking-tighter">5.0</h4>
                    <div className="flex text-yellow-500 justify-center gap-1.5 mb-2">
                      <Star size={18} fill="currentColor" strokeWidth={0} />
                      <Star size={18} fill="currentColor" strokeWidth={0} />
                      <Star size={18} fill="currentColor" strokeWidth={0} />
                      <Star size={18} fill="currentColor" strokeWidth={0} />
                      <Star size={18} fill="currentColor" strokeWidth={0} />
                    </div>
                    <span className="text-xs text-[#AAB3C2] font-manrope uppercase tracking-widest opacity-70">App Store</span>
                  </div>
                </div>

              </div>

              {/* Decorative blurred circles behind grid */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#9C5DE7]/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#00B8FF]/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section >

      {/* Technologies Section */}
      < section id="tecnologias" className="w-full py-24 bg-[#0E0E12] relative border-t border-[#1F2937]" >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-6 text-white">
              Stack <span className="text-[#9C5DE7]">Tecnológico</span>
            </h2>
            <p className="font-manrope text-[#AAB3C2] text-lg">
              Utilizamos as ferramentas mais modernas para garantir performance nativa e desenvolvimento ágil.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <TechCard name="React Native" desc="Apps Híbridos Potentes" icon={<TbBrandReactNative size={32} color="#61DAFB" />} />
            <TechCard name="Flutter" desc="UI do Google" icon={<SiFlutter size={32} color="#02569B" />} />
            <TechCard name="Swift (iOS)" desc="Nativo Apple" icon={<SiSwift size={32} color="#F05138" />} />
            <TechCard name="Kotlin (Android)" desc="Nativo Google" icon={<TbBrandKotlin size={32} color="#7F52FF" />} />
            <TechCard name="Firebase" desc="Backend Serverless" icon={<SiFirebase size={32} color="#FFCA28" />} />
            <TechCard name="AWS Amplify" desc="Cloud Scalable" icon={<SiAwsamplify size={32} color="#FF9900" />} />
            <TechCard name="GraphQL" desc="Dados Eficientes" icon={<BiLogoGraphql size={32} color="#E10098" />} />
            <TechCard name="Redux" desc="Gestão de Estado" icon={<Layers size={32} className="text-[#764ABC]" />} />
          </div>
        </div>
      </section >

      {/* CTA Section */}
      < section className="w-full py-24 bg-[#0B0B13] relative overflow-hidden" >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00B8FF]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-6 text-white">
            Tem uma ideia de <span className="text-[#00B8FF]">App?</span>
          </h2>
          <p className="font-manrope text-[#AAB3C2] text-xl max-w-2xl mx-auto mb-10">
            Não deixe para depois. O mercado mobile cresce todos os dias. Vamos tirar seu projeto do papel.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#9C5DE7] hover:bg-[#9C5DE7]/80 text-white font-bold text-lg px-10 h-16 rounded-full relative overflow-hidden group shadow-[0_0_20px_rgba(156,93,231,0.3)] hover:shadow-[0_0_40px_rgba(156,93,231,0.6)] transition-all transform hover:-translate-y-1"
          >
            <Link href="/orcamento">
              <span className="relative z-10 flex items-center gap-2">
                FALAR COM ESPECIALISTA <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </Button>
        </div>
      </section >
    </main >
  )
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-[#12121E] border border-[#1F2937] hover:border-[#00B8FF]/40 transition-all duration-300 group"
    >
      <div className="mb-6 inline-flex p-3 rounded-lg bg-[#00B8FF]/10 text-[#00B8FF] group-hover:bg-[#00B8FF] group-hover:text-[#0B0B13] transition-colors">
        {icon}
      </div>
      <h3 className="font-orbitron font-bold text-xl text-white mb-3">{title}</h3>
      <p className="font-manrope text-[#AAB3C2] leading-relaxed text-sm">
        {desc}
      </p>
    </motion.div>
  )
}

function StepItem({ title, desc, delay }: { title: string, desc: string, delay: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-start gap-4"
    >
      <div className="mt-1">
        <CheckCircle2 className="w-6 h-6 text-[#9C5DE7]" />
      </div>
      <div>
        <h4 className="font-orbitron font-bold text-white text-lg">{title}</h4>
        <p className="text-[#AAB3C2] text-sm">{desc}</p>
      </div>
    </motion.li>
  )
}

function TechCard({ name, desc, icon }: { name: string, desc: string, icon: any }) {
  return (
    <div className="bg-[#12121E] border border-[#1F2937] p-6 rounded-xl hover:border-[#9C5DE7]/40 transition-all group text-center flex flex-col items-center">
      <div className="mb-4 grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="font-orbitron font-bold text-lg text-white mb-1 group-hover:text-[#9C5DE7] transition-colors">{name}</h3>
      <p className="text-xs text-[#555B66]">{desc}</p>
    </div>
  )
}
