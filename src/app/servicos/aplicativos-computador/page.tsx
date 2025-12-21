"use client"

import { useRef, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  Monitor,
  Database,
  Shield,
  Zap,
  Users,
  BarChart,
  HardDrive,
  Target,
  Layers,
  Code2,
  Cpu,
  Server,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import { OptimizedImage } from '@/components/ui/optimized-image'
import { IoLogoElectron } from "react-icons/io5"
import { SiDotnet, SiSqlite, SiPostgresql, SiDocker, SiPython } from "react-icons/si"
import { FaJava, FaWindows, FaLinux, FaApple } from "react-icons/fa"

export default function AplicativosComputadorPage() {
  const containerRef = useRef(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Canvas Animation: Neon Cyberpunk Computer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 600
    canvas.height = 400

    function drawComputer() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Monitor Frame
      ctx.fillStyle = "rgba(18, 18, 30, 0.9)" // #12121E
      ctx.strokeStyle = "#00B8FF" // Neon Blue
      ctx.lineWidth = 2
      ctx.shadowColor = "#00B8FF"
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.roundRect(50, 50, 400, 250, 10)
      ctx.fill()
      ctx.stroke()
      ctx.shadowBlur = 0

      // Screen Area
      ctx.fillStyle = "#0B0B13"
      ctx.beginPath()
      ctx.roundRect(65, 65, 370, 220, 4)
      ctx.fill()

      // Stand
      ctx.fillStyle = "#1F2937"
      ctx.beginPath()
      ctx.moveTo(200, 300)
      ctx.lineTo(300, 300)
      ctx.lineTo(280, 340)
      ctx.lineTo(220, 340)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Base
      ctx.beginPath()
      ctx.roundRect(180, 340, 140, 10, 4)
      ctx.fill()
      ctx.stroke()

      const now = Date.now()

      // Animated Code content on screen
      ctx.font = "10px monospace"
      for (let i = 0; i < 12; i++) {
        const y = 90 + i * 18
        const width = 100 + Math.sin(now / 800 + i) * 80

        ctx.fillStyle = i % 3 === 0 ? "#9C5DE7" : (i % 3 === 1 ? "#00B8FF" : "#555B66")
        ctx.fillText(`> process_thread_${i}: executing...`, 80, y)

        // Progress bars
        ctx.fillStyle = "#1F2937"
        ctx.fillRect(250, y - 8, 150, 6)

        ctx.fillStyle = i % 2 === 0 ? "#00B8FF" : "#9C5DE7"
        const progress = (Math.sin(now / 1000 + i) + 1) / 2 * 140
        ctx.fillRect(250, y - 8, progress, 6)
      }

      // Floating Holographic Elements
      // Database Cylinder
      const dbY = 150 + Math.sin(now / 1500) * 10
      ctx.strokeStyle = "#9C5DE7"
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.6

      // Top ellipse
      ctx.beginPath();
      ctx.ellipse(520, dbY, 30, 10, 0, 0, 2 * Math.PI);
      ctx.stroke();

      // Bottom ellipse
      ctx.beginPath();
      ctx.ellipse(520, dbY + 60, 30, 10, 0, 0, 2 * Math.PI);
      ctx.stroke();

      // Sides
      ctx.beginPath()
      ctx.moveTo(490, dbY)
      ctx.lineTo(490, dbY + 60)
      ctx.moveTo(550, dbY)
      ctx.lineTo(550, dbY + 60)
      ctx.stroke()

      // Data particles
      ctx.fillStyle = "#00B8FF"
      for (let k = 0; k < 5; k++) {
        const pY = dbY + 10 + k * 10 + (now % 1000) / 1000 * 10
        if (pY < dbY + 50) {
          ctx.fillRect(510, pY, 20, 2)
        }
      }

      ctx.globalAlpha = 1.0
      requestAnimationFrame(drawComputer)
    }

    const animationId = requestAnimationFrame(drawComputer)
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
                    <Monitor size={16} /> Windows • Mac • Linux
                  </span>
                </div>
              </div>

              <h1 className="font-orbitron font-bold text-4xl md:text-6xl lg:text-7xl mb-8 text-white leading-tight">
                Software Desktop de <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B8FF] to-[#9C5DE7]">Alta Performance</span>
              </h1>

              <p className="font-manrope text-lg md:text-xl text-[#AAB3C2] max-w-xl mb-10 leading-relaxed">
                Desenvolvemos soluções robustas que operam offline, integram-se profundamente ao hardware e processam dados massivos com eficiência inigualável.
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
                  <Link href="#tecnologias">
                    Nossas Stack
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center items-center mt-12 lg:mt-0"
            >
              {/* Animated Device Container */}
              <motion.div
                className="relative z-10 w-full max-w-[500px]"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <canvas ref={canvasRef} className="w-full h-auto drop-shadow-2xl max-w-full" />

                {/* Floating Tech Badges */}
                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 p-3 bg-[#1F2937]/90 backdrop-blur-md rounded-xl border border-[#00B8FF]/30 shadow-[0_0_15px_rgba(0,184,255,0.2)]"
                >
                  <SiDotnet size={32} className="text-[#512BD4]" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-20 -left-8 p-3 bg-[#1F2937]/90 backdrop-blur-md rounded-xl border border-[#9C5DE7]/30 shadow-[0_0_15px_rgba(156,93,231,0.2)]"
                >
                  <IoLogoElectron size={32} className="text-[#47848F]" />
                </motion.div>
              </motion.div>

              {/* Background Glows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00B8FF]/10 rounded-full blur-[100px] -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-24 bg-[#0E0E12] relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-6 text-white">
              Por que investir em <span className="text-[#00B8FF]">Desktop?</span>
            </h2>
            <p className="font-manrope text-[#AAB3C2] text-lg max-w-2xl mx-auto">
              Para operações críticas que exigem performance bruta, segurança local e estabilidade total, o software nativo ainda é a escolha superior.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Cpu className="text-[#00B8FF]" />, title: "Performance Bruta", desc: "Acesso direto à CPU e GPU para processamento pesado sem latência de rede." },
              { icon: <Lock className="text-[#9C5DE7]" />, title: "Segurança Máxima", desc: "Dados armazenados localmente ou em rede fechada, longe de vulnerabilidades web." },
              { icon: <HardDrive className="text-[#00B8FF]" />, title: "Modo Offline Real", desc: "Funcionalidade total mesmo sem conexão com a internet. Sincroniza quando possível." },
              { icon: <Target className="text-[#9C5DE7]" />, title: "Foco & Produtividade", desc: "Interfaces otimizadas para workflows complexos e uso intensivo de teclado/mouse." },
              { icon: <Layers className="text-[#00B8FF]" />, title: "Integração Profunda", desc: "Comunicação direta com impressoras, scanners e máquinas industriais." },
              { icon: <Code2 className="text-[#9C5DE7]" />, title: "Ciclo de Vida Longo", desc: "Softwares estáveis que não quebram com atualizações de navegador." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#12121E]/50 border border-[#1F2937] hover:border-[#00B8FF]/30 p-8 rounded-2xl backdrop-blur-sm group hover:bg-[#12121E] transition-all duration-300"
              >
                <div className="bg-[#1F2937]/50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-orbitron font-bold text-xl text-white mb-3">{item.title}</h3>
                <p className="font-manrope text-[#AAB3C2] leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="w-full py-24 bg-[#0B0B13] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">

            <div className="lg:w-1/2 relative">
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2 relative h-[260px] rounded-2xl overflow-hidden border border-[#1F2937] bg-[#0E0E12] group hover:border-[#00B8FF]/50 transition-colors shadow-2xl">
                  <OptimizedImage
                    src="/images/programador-pc.webp"
                    alt="Desenvolvimento Desktop"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] to-transparent"></div>
                  <div className="absolute bottom-6 left-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="px-2 py-1 bg-[#00B8FF]/20 backdrop-blur-md rounded border border-[#00B8FF]/30 text-[#00B8FF] text-xs font-mono">
                        System.Architecture
                      </div>
                    </div>
                    <h4 className="font-orbitron font-bold text-xl text-white">Engenharia de Software</h4>
                  </div>
                </div>

                <div className="h-[200px] rounded-2xl overflow-hidden border border-[#1F2937] bg-[#12121E] p-6 relative group hover:border-[#9C5DE7]/50 transition-colors">
                  <Database className="w-10 h-10 text-[#9C5DE7] mb-4" />
                  <h4 className="font-orbitron font-bold text-lg text-white mb-2">Banco de Dados</h4>
                  <p className="text-xs text-[#AAB3C2]">Arquitetura de dados para alta disponibilidade e integridade.</p>
                </div>

                <div className="h-[200px] rounded-2xl overflow-hidden border border-[#1F2937] bg-[#12121E] p-6 relative group hover:border-[#00B8FF]/50 transition-colors">
                  <Server className="w-10 h-10 text-[#00B8FF] mb-4" />
                  <h4 className="font-orbitron font-bold text-lg text-white mb-2">Infraestrutura</h4>
                  <p className="text-xs text-[#AAB3C2]">Deployment automatizado e manutenção remota.</p>
                </div>
              </div>
              {/* Decorative Blobs */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#00B8FF]/20 rounded-full blur-3xl -z-10"></div>
            </div>

            <div className="lg:w-1/2">
              <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-8 text-white">
                Ciclo de <span className="text-[#9C5DE7]">Vida Completo</span>
              </h2>
              <p className="font-manrope text-[#AAB3C2] text-lg leading-relaxed mb-8">
                Do levantamento de requisitos ao suporte pós-implementação, garantimos que seu software evolua junto com seu negócio.
              </p>

              <div className="space-y-6">
                {[
                  { step: "01", title: "Análise de Requisitos", text: "Mapeamento detalhado de fluxos de trabalho e regras de negócio." },
                  { step: "02", title: "Arquitetura & Prototipagem", text: "Definição de stack tecnológica e design de interface." },
                  { step: "03", title: "Desenvolvimento Ágil", text: "Sprints focadas em funcionalidades com entregas frequentes." },
                  { step: "04", title: "QA & Deploy", text: "Testes automatizados e instalação assistida." },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="font-orbitron font-bold text-[#00B8FF] text-xl opacity-60">{item.step}</div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-[#555B66] text-sm">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section id="tecnologias" className="w-full py-24 bg-[#0E0E12] border-t border-[#1F2937]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-6 text-white">
              Stack <span className="text-[#9C5DE7]">Poderosa</span>
            </h2>
            <p className="font-manrope text-[#AAB3C2] text-lg max-w-2xl mx-auto">
              Utilizamos as linguagens e frameworks mais estáveis do mercado para garantir longevidade e performance.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Electron", icon: <IoLogoElectron size={40} />, color: "text-[#47848F]" },
              { name: ".NET Core", icon: <SiDotnet size={40} />, color: "text-[#512BD4]" },
              { name: "Python", icon: <SiPython size={40} />, color: "text-[#3776AB]" },
              { name: "PostgreSQL", icon: <SiPostgresql size={40} />, color: "text-[#336791]" },
              { name: "SQLite", icon: <SiSqlite size={40} />, color: "text-[#003B57]" },
              { name: "Docker", icon: <SiDocker size={40} />, color: "text-[#2496ED]" },
            ].map((tech, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center justify-center p-6 bg-[#12121E] border border-[#1F2937] rounded-xl hover:border-[#00B8FF]/50 transition-colors group"
              >
                <div className={`mb-3 ${tech.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                  {tech.icon}
                </div>
                <span className="text-[#AAB3C2] font-mono text-sm group-hover:text-white transition-colors">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#00B8FF]/5"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-orbitron font-bold text-4xl md:text-6xl text-white mb-8">
            Pronto para Elevar <br />sua <span className="text-[#00B8FF]">Operação?</span>
          </h2>
          <p className="font-manrope text-xl text-[#AAB3C2] max-w-2xl mx-auto mb-12">
            Vamos construir o software que vai ser o coração da sua empresa. Performance, segurança e controle total.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#00B8FF] hover:bg-[#00B8FF]/80 text-[#0B0B13] font-bold text-xl px-12 h-16 rounded-full shadow-[0_0_30px_rgba(0,184,255,0.4)] hover:shadow-[0_0_50px_rgba(0,184,255,0.6)] transition-all"
          >
            <Link href="/orcamento">
              Falar com Especialista
            </Link>
          </Button>
        </div>
      </section>

    </main>
  )
}
