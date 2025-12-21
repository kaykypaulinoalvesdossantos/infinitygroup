"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle,
  Code,
  Clock,
  Zap,
  BarChart,
  RefreshCw,
  Workflow,
  Cpu,
  Settings,
  GitBranch,
  Cog,
  Database,
  Bell,
  Save,
  Bot
} from "lucide-react"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import { OptimizedImage } from '@/components/ui/optimized-image'
import { TbBrandZapier } from "react-icons/tb"
import { SiNodered, SiUipath, SiPython, SiOpenai } from "react-icons/si"
import { PiWebhooksLogoBold } from "react-icons/pi"

export default function AutomacoesPage() {
  const containerRef = useRef(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Efeito para a animação de automação (Digital Pipeline / Network)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 500
    canvas.height = 400

    // Node Types
    type Point = { x: number, y: number, label?: string, type: 'source' | 'process' | 'target' }
    const nodes: Point[] = [
      { x: 80, y: 100, label: "CRM", type: 'source' },
      { x: 80, y: 300, label: "Leads", type: 'source' },
      { x: 250, y: 200, label: "AI Engine", type: 'process' },
      { x: 420, y: 100, label: "Notion", type: 'target' },
      { x: 420, y: 300, label: "WhatsApp", type: 'target' }
    ]

    const connections = [
      { from: 0, to: 2 }, // CRM -> AI
      { from: 1, to: 2 }, // Leads -> AI
      { from: 2, to: 3 }, // AI -> Notion
      { from: 2, to: 4 }  // AI -> WhatsApp
    ]

    type Particle = { fromNode: number, toNode: number, progress: number, speed: number, color: string }
    let particles: Particle[] = []

    function drawNetwork() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const now = Date.now() / 1000

      // 1. Draw Connections
      connectionNodes(ctx, nodes, connections)

      // 2. Manage & Draw Particles
      // Add new particles randomly
      if (Math.random() < 0.05) {
        const connectionIdx = Math.floor(Math.random() * connections.length)
        particles.push({
          fromNode: connections[connectionIdx].from,
          toNode: connections[connectionIdx].to,
          progress: 0,
          speed: 0.01 + Math.random() * 0.01,
          color: Math.random() > 0.5 ? "#00B8FF" : "#9C5DE7"
        })
      }

      particles.forEach((p, idx) => {
        p.progress += p.speed
        if (p.progress >= 1) {
          particles.splice(idx, 1)
          return
        }

        const startNode = nodes[p.fromNode]
        const endNode = nodes[p.toNode]

        const x = startNode.x + (endNode.x - startNode.x) * p.progress
        const y = startNode.y + (endNode.y - startNode.y) * p.progress

        ctx.shadowBlur = 10
        ctx.shadowColor = p.color
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // 3. Draw Nodes
      nodes.forEach(node => {
        // Pulse effect
        const pulse = Math.sin(now * 3) * 3

        // Outer Glow
        ctx.shadowBlur = 15
        ctx.shadowColor = node.type === 'process' ? "#9C5DE7" : "#00B8FF"
        ctx.strokeStyle = node.type === 'process' ? "#9C5DE7" : "#00B8FF"
        ctx.lineWidth = 2

        ctx.beginPath()
        ctx.arc(node.x, node.y, 25 + pulse, 0, Math.PI * 2)
        ctx.stroke()
        ctx.shadowBlur = 0

        // Inner Circle
        ctx.fillStyle = "#0B0B13"
        ctx.beginPath()
        ctx.arc(node.x, node.y, 25, 0, Math.PI * 2)
        ctx.fill()

        // Icon/Dot
        ctx.fillStyle = node.type === 'process' ? "#9C5DE7" : "#00B8FF"
        ctx.beginPath()
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(drawNetwork)
    }

    function connectionNodes(ctx: CanvasRenderingContext2D, nodes: Point[], connections: { from: number, to: number }[]) {
      ctx.lineWidth = 1
      ctx.strokeStyle = "rgba(160, 160, 180, 0.2)"

      connections.forEach(conn => {
        const start = nodes[conn.from]
        const end = nodes[conn.to]
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.stroke()
      })
    }

    const animationId = requestAnimationFrame(drawNetwork)
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

            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex gap-3 mb-6">
                <div className="px-4 py-2 rounded-full bg-[#00B8FF]/10 border border-[#00B8FF]/20">
                  <span className="text-[#00B8FF] font-manrope font-bold text-sm tracking-wide uppercase flex items-center gap-2">
                    <Bot size={16} /> Automação Inteligente 2.0
                  </span>
                </div>
              </div>

              <h1 className="font-orbitron font-bold text-3xl md:text-6xl lg:text-7xl mb-8 text-white leading-tight">
                <span className="text-[#00B8FF]">Automatize</span> o Chato. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9C5DE7] to-[#00B8FF]">Escale o Lucro.</span>
              </h1>

              <p className="font-manrope text-base md:text-xl text-[#AAB3C2] max-w-xl mb-10 leading-relaxed">
                Deixamos seus robôs trabalharem 24/7 enquanto você foca no crescimento. Integre CRM, ERP e Marketing em um fluxo contínuo.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#00B8FF] hover:bg-[#00B8FF]/80 text-[#0B0B13] font-bold text-lg px-8 h-14 rounded-full relative overflow-hidden group shadow-[0_0_20px_rgba(0,184,255,0.3)] hover:shadow-[0_0_30px_rgba(0,184,255,0.5)] transition-all w-full sm:w-auto"
                >
                  <Link href="/orcamento">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Simular Economia <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-[#1F2937] text-white hover:bg-[#1F2937] hover:border-[#00B8FF]/50 font-manrope h-14 rounded-full px-8 w-full sm:w-auto"
                >
                  <Link href="#roi-calculator">
                    Ver ROI Estimado
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center items-center mt-12 lg:mt-0 w-full"
            >
              {/* Canvas Container */}
              <div className="relative z-10 rounded-2xl overflow-hidden border border-[#00B8FF]/20 bg-[#0E0E12]/80 backdrop-blur-sm shadow-[0_0_40px_rgba(0,184,255,0.1)] p-4 w-full max-w-[500px]">
                <canvas ref={canvasRef} className="w-full h-auto" />

                {/* Floating Badges */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-8 right-8 bg-[#1F2937]/90 p-3 rounded-lg border border-[#9C5DE7]/30"
                >
                  <TbBrandZapier size={24} className="text-[#9C5DE7]" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute bottom-8 left-8 bg-[#1F2937]/90 p-3 rounded-lg border border-[#00B8FF]/30"
                >
                  <SiUipath size={24} className="text-[#00B8FF]" />
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ROI & Benefits Section */}
      <section id="roi-calculator" className="w-full py-16 md:py-24 bg-[#0E0E12] relative border-t border-[#1F2937]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">

            {/* ROI Graphics - Interactive Dashboard */}
            <div className="lg:w-1/2 w-full">
              <div className="bg-[#12121E] p-8 rounded-3xl border border-[#1F2937] relative overflow-hidden group hover:border-[#00B8FF]/30 transition-colors shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B8FF]/5 rounded-full blur-3xl group-hover:bg-[#00B8FF]/10 transition-all"></div>

                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="font-orbitron font-bold text-2xl text-white mb-1">Economia Projetada</h3>
                    <p className="text-sm text-[#AAB3C2]">Comparativo: Manual vs Automação</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#00B8FF] font-bold uppercase tracking-wider mb-1">Economia Anual</div>
                    <div className="text-3xl font-manrope font-extrabold text-[#00B8FF]">R$ 84.000</div>
                  </div>
                </div>

                {/* Advanced SVG Chart */}
                <div className="relative h-[250px] md:h-[300px] w-full bg-[#0E0E12]/50 rounded-xl border border-[#1F2937] p-2 md:p-4 overflow-hidden">
                  {/* Grid Lines */}
                  <div className="absolute inset-4 flex flex-col justify-between pointer-events-none opacity-20">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-full h-[1px] bg-[#AAB3C2]"></div>
                    ))}
                  </div>

                  <svg className="w-full h-full" viewBox="0 0 500 300" preserveAspectRatio="none">
                    {/* Defs for Gradients */}
                    <defs>
                      <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00B8FF" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#00B8FF" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Manual Cost Line (High, Linear Increase) */}
                    {/* M 0,250 L 100%,50 */}
                    <motion.path
                      d="M 16 250 L 450 50"
                      fill="none"
                      stroke="#FF5555"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 2 }}
                    />

                    {/* Automation Cost Line (Low, Flat) */}
                    {/* M 0,250 L 100%, 200 */}
                    <motion.path
                      d="M 16 250 L 450 200"
                      fill="none"
                      stroke="#00B8FF"
                      strokeWidth="3"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 0.5 }}
                    />

                    {/* Savings Area (Polygon) */}
                    <motion.path
                      d="M 16 250 L 450 50 L 450 200 Z"
                      fill="url(#savingsGradient)"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 2 }}
                    />

                    {/* Points at the End */}
                    <motion.circle cx="450" cy="50" r="6" fill="#FF5555" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 2 }} />
                    <motion.circle cx="450" cy="200" r="6" fill="#00B8FF" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 2 }} />

                    {/* Labels inside SVG */}
                    <motion.text x="460" y="55" fill="#FF5555" fontSize="12" fontWeight="bold" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 2.2 }}>R$ 12k/mês</motion.text>
                    <motion.text x="460" y="205" fill="#00B8FF" fontSize="12" fontWeight="bold" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 2.2 }}>R$ 5k/mês</motion.text>
                  </svg>

                  {/* Axis Labels outside SVG for easier positioning */}
                  <div className="absolute left-0 bottom-0 top-0 w-8 flex flex-col justify-between text-[10px] text-[#555B66] py-4 pl-1">
                    <span>15k</span>
                    <span>10k</span>
                    <span>5k</span>
                    <span>0</span>
                  </div>
                  <div className="absolute left-8 right-0 bottom-0 h-6 flex justify-between text-[10px] text-[#555B66] px-2 pt-1">
                    <span>Jan</span>
                    <span>Mar</span>
                    <span>Mai</span>
                    <span>Jul</span>
                    <span>Set</span>
                    <span>Dez</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-6 mt-6 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5555]"></div>
                    <span className="text-sm text-[#AAB3C2]">Custo Manual (Salários/Erros)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#00B8FF]"></div>
                    <span className="text-sm text-[#AAB3C2]">Investimento em Automação</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits List - Enhanced */}
            <div className="lg:w-1/2 w-full">
              <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-8 text-white">
                Onde você <span className="text-[#00B8FF]">Ganha?</span>
              </h2>
              <div className="space-y-6">
                {[
                  { icon: <Clock className="text-[#00B8FF]" />, title: "30h+ Semanais Economizadas", desc: "Elimine Ctrl+C/Ctrl+V e foque em estratégia. Seu time agradece." },
                  { icon: <Zap className="text-[#9C5DE7]" />, title: "Zero Erro Humano", desc: "Robôs não ficam cansados, não erram digitação e não tiram férias." },
                  { icon: <BarChart className="text-[#00B8FF]" />, title: "Dados em Tempo Real", desc: "Dashboards atualizados automaticamente a cada venda ou lead." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 10, backgroundColor: "rgba(31, 41, 55, 0.5)" }}
                    className="flex items-start gap-4 p-4 rounded-xl transition-all border border-transparent hover:border-[#00B8FF]/20"
                  >
                    <div className="bg-[#1F2937] p-3 rounded-lg shadow-lg">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg mb-1">{item.title}</h4>
                      <p className="text-[#AAB3C2] text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology/Image Section */}
      <section className="w-full py-24 bg-[#0B0B13] relative">
        <div className="container mx-auto px-4">
          <div className="bg-[#12121E] rounded-3xl overflow-hidden border border-[#1F2937] relative">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 flex flex-col justify-center">
                <div className="mb-6 flex gap-2">
                  <span className="px-3 py-1 rounded bg-[#9C5DE7]/20 text-[#9C5DE7] text-xs font-bold font-orbitron">BPA</span>
                  <span className="px-3 py-1 rounded bg-[#00B8FF]/20 text-[#00B8FF] text-xs font-bold font-orbitron">RPA</span>
                </div>
                <h2 className="font-orbitron font-bold text-3xl text-white mb-6">
                  Mapeamos, Desenhamos e <span className="text-[#9C5DE7]">Implementamos.</span>
                </h2>
                <p className="text-[#AAB3C2] mb-8 leading-relaxed">
                  Não é apenas conectar APIs. Nós entendemos seu processo de negócio, identificamos gargalos e criamos uma arquitetura de dados que escala.
                </p>
                <ul className="space-y-3 mb-8">
                  {["Mapeamento de Processos (BPMN)", "Desenvolvimento de Scripts Python", "Monitoramento de Falhas 24/7"].map((li, i) => (
                    <li key={i} className="flex items-center gap-2 text-white">
                      <CheckCircle size={16} className="text-[#00B8FF]" /> {li}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative min-h-[300px] lg:min-h-[400px]">
                <OptimizedImage
                  src="/images/processoatomação.webp"
                  alt="Processo de Automação"
                  fill
                  className="object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#12121E] via-[#12121E]/50 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="w-full py-24 bg-[#0E0E12] border-t border-[#1F2937]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-orbitron font-bold text-3xl mb-16 text-white">
            Ferramentas de <span className="text-[#00B8FF]">Poder</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-70">
            <TbBrandZapier size={50} className="text-[#FF4F00]" title="Zapier" />
            <SiNodered size={50} className="text-[#8F0000]" title="Node-RED" />
            <SiUipath size={50} className="text-[#FA4616]" title="UiPath" />
            <SiPython size={50} className="text-[#3776AB]" title="Python" />
            <SiOpenai size={50} className="text-white" title="OpenAI API" />
            <PiWebhooksLogoBold size={50} className="text-[#00B8FF]" title="Webhooks" />
          </div>
        </div>
      </section>

      {/* High Conversion CTA Section */}
      <section className="w-full py-28 relative overflow-hidden bg-gradient-to-br from-[#0B0B13] to-[#12121E]">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00B8FF]/10 rounded-full blur-[120px]"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-block px-6 py-2 rounded-full bg-[#FF5555]/10 border border-[#FF5555]/30 mb-8">
              <span className="text-[#FF5555] font-bold text-sm tracking-wider animate-pulse">
                ⚠️ PARE DE PERDER DINHEIRO
              </span>
            </div>

            <h2 className="font-orbitron font-bold text-4xl md:text-6xl text-white mb-8 leading-tight">
              Sua concorrência já está <br /> <span className="text-[#00B8FF]">automatizada.</span> E você?
            </h2>

            <p className="font-manrope text-xl text-[#AAB3C2] mb-12 max-w-2xl mx-auto">
              Cada minuto gasto copiando dados de planilhas é um minuto a menos vendendo. Vamos transformar sua operação hoje.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button
                asChild
                size="lg"
                className="bg-[#00B8FF] hover:bg-[#00B8FF]/80 text-[#0B0B13] font-bold text-xl px-12 h-16 rounded-full shadow-[0_0_40px_rgba(0,184,255,0.4)] hover:shadow-[0_0_60px_rgba(0,184,255,0.6)] hover:scale-105 transition-all duration-300"
              >
                <Link href="/orcamento">
                  Quero Automatizar Tudo 🚀
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-transparent border-[#1F2937] text-white hover:bg-[#1F2937] hover:text-[#00B8FF] border-2 font-manrope h-16 rounded-full px-10 text-lg"
              >
                <Link href="https://wa.me/5511999999999">
                  Falar no WhatsApp
                </Link>
              </Button>
            </div>

            <p className="mt-8 text-sm text-[#555B66]">Currently booking slots for Q1 2026</p>
          </motion.div>
        </div>
      </section>

    </main>
  )
}
