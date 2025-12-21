"use client"

import { useRef, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
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
  Globe,
  Rocket,
  CheckCircle,
  Zap,
  MousePointerClick
} from "lucide-react"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import { OptimizedImage } from '@/components/ui/optimized-image'
import { FaMeta, FaGoogle, FaLinkedin, FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa6"
import { SiGoogleanalytics, SiSemrush, SiHubspot, SiGoogleads } from "react-icons/si"

export default function MarketingPage() {
  const containerRef = useRef(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Efeito para a animação de Globo Digital (Global Reach / Tech)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set proper resolution
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    // We set internal dim to match CSS dim * dpr for sharpness
    // But for this specific container constraint (500x400), we stick to fixed or relative
    canvas.width = 500 * dpr
    canvas.height = 400 * dpr

    // Scale context to match
    ctx.scale(dpr, dpr)

    // Virtual width/height for calculations
    const width = 500
    const height = 400
    const globeRadius = 140

    // Generate Globe Points (Fibonacci Sphere for even distribution)
    const numPoints = 60
    const points: { x: number, y: number, z: number, theta: number, phi: number, originalX: number, originalY: number, originalZ: number }[] = []

    const phi = Math.PI * (3 - Math.sqrt(5)) // Golden angle

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2 // y goes from 1 to -1
      const radius = Math.sqrt(1 - y * y) // radius at y

      const theta = phi * i

      const x = Math.cos(theta) * radius
      const z = Math.sin(theta) * radius

      // Scale to globe radius
      points.push({
        x: x * globeRadius,
        y: y * globeRadius,
        z: z * globeRadius,
        theta,
        phi: Math.acos(y),
        originalX: x * globeRadius,
        originalY: y * globeRadius,
        originalZ: z * globeRadius
      })
    }

    let rotationX = 0
    let rotationY = 0

    function drawGlobe() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height)

      const centerX = width / 2
      const centerY = height / 2

      // Auto rotate
      rotationY += 0.003
      rotationX += 0.001

      // Projection Logic
      const projectedPoints = points.map(p => {
        // Rotate around Y
        let x = p.originalX * Math.cos(rotationY) - p.originalZ * Math.sin(rotationY)
        let z = p.originalX * Math.sin(rotationY) + p.originalZ * Math.cos(rotationY)

        // Rotate around X
        let y = p.originalY * Math.cos(rotationX) - z * Math.sin(rotationX)
        z = p.originalY * Math.sin(rotationX) + z * Math.cos(rotationX)

        // Perspective projection
        const scale = 300 / (300 + z) // Perspective factor
        const projX = x * scale + centerX
        const projY = y * scale + centerY
        const alpha = (z + globeRadius) / (2 * globeRadius) // Opacity based on depth (front = 1, back = 0)

        return { ...p, x: projX, y: projY, z, scale, alpha: Math.max(0.1, alpha) }
      })

      // Draw Connections (only if close and both in front-ish)
      ctx.lineWidth = 1
      for (let i = 0; i < projectedPoints.length; i++) {
        for (let j = i + 1; j < projectedPoints.length; j++) {
          const p1 = projectedPoints[i]
          const p2 = projectedPoints[j]

          // Euclidean distance in 3D (unrotated original) to find neighbors
          const dx = p1.originalX - p2.originalX
          const dy = p1.originalY - p2.originalY
          const dz = p1.originalZ - p2.originalZ
          const distSq = dx * dx + dy * dy + dz * dz

          // Only connect close neighbors on the sphere surface
          if (distSq < 2500) {
            // Fade out lines at back
            const avgAlpha = (p1.alpha + p2.alpha) / 2
            if (avgAlpha > 0.3) {
              ctx.beginPath()
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.strokeStyle = `rgba(0, 184, 255, ${avgAlpha * 0.3})` // Cyan lines
              ctx.stroke()
            }
          }
        }
      }

      // Draw Points
      projectedPoints.forEach(p => {
        // Draw glow/point
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3 * p.scale, 0, Math.PI * 2)

        // Color based on position (Front = Bright Cyan/Pink, Back = Dark)
        if (p.z > 0) {
          ctx.fillStyle = numPoints % 2 === 0 ? "#00B8FF" : "#E7A5DC"
        } else {
          ctx.fillStyle = "#1F2937"
        }

        ctx.globalAlpha = p.alpha
        ctx.fill()
        ctx.globalAlpha = 1

        // Extra glow for front points
        if (p.alpha > 0.8) {
          ctx.shadowBlur = 10
          ctx.shadowColor = "#00B8FF"
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })

      // Draw "Orbital" ring around
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, globeRadius * 1.4, globeRadius * 0.4, rotationY * 0.5, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(231, 165, 220, 0.2)"
      ctx.lineWidth = 2
      ctx.stroke()

      requestAnimationFrame(drawGlobe)
    }

    const animationId = requestAnimationFrame(drawGlobe)
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
                <div className="px-4 py-2 rounded-full bg-[#E7A5DC]/10 border border-[#E7A5DC]/20">
                  <span className="text-[#E7A5DC] font-manrope font-bold text-sm tracking-wide uppercase flex items-center gap-2">
                    <TrendingUp size={16} /> Growth Hacking & Performance
                  </span>
                </div>
              </div>

              <h1 className="font-orbitron font-bold text-3xl md:text-6xl lg:text-7xl mb-8 text-white leading-tight">
                Domine o <span className="text-[#00B8FF]">Digital.</span> <br />
                Venda com <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E7A5DC] to-[#9C5DE7]">Precisão.</span>
              </h1>

              <p className="font-manrope text-base md:text-xl text-[#AAB3C2] max-w-xl mb-10 leading-relaxed">
                Transformamos dados em receita. Nossas estratégias de tráfego pago, SEO e conteúdo são desenhadas para uma única meta: <span className="text-white font-bold">ROI Positivo.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-[#00B8FF] to-[#0057ff] hover:from-[#00B8FF]/80 hover:to-[#0057ff]/80 text-white font-bold text-lg px-8 h-14 rounded-full relative overflow-hidden group shadow-[0_0_20px_rgba(0,184,255,0.3)] hover:shadow-[0_0_30px_rgba(0,184,255,0.5)] transition-all w-full sm:w-auto"
                >
                  <Link href="/orcamento">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Acelerar Meu Negócio <Rocket className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-[#1F2937] text-white hover:bg-[#1F2937] hover:border-[#E7A5DC]/50 font-manrope h-14 rounded-full px-8 w-full sm:w-auto"
                >
                  <Link href="#servicos">
                    Ver Estratégias
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
              <div className="relative z-10 rounded-2xl overflow-hidden border border-[#E7A5DC]/20 bg-[#0E0E12]/80 backdrop-blur-sm shadow-[0_0_40px_rgba(231,165,220,0.1)] p-4 w-full max-w-[500px]">
                <canvas ref={canvasRef} className="w-full h-auto" />

                {/* Floating Badges */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-6 right-6 bg-[#1F2937]/90 p-3 rounded-lg border border-[#00B8FF]/30 backdrop-blur-md shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-[#00B8FF]/20 p-1 rounded">
                      <MousePointerClick size={16} className="text-[#00B8FF]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#AAB3C2] uppercase font-bold">CTR</div>
                      <div className="text-sm font-bold text-white">5.8%</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute bottom-6 left-6 bg-[#1F2937]/90 p-3 rounded-lg border border-[#E7A5DC]/30 backdrop-blur-md shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-[#E7A5DC]/20 p-1 rounded">
                      <TrendingUp size={16} className="text-[#E7A5DC]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#AAB3C2] uppercase font-bold">ROAS</div>
                      <div className="text-sm font-bold text-white">12x</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="servicos" className="w-full py-16 md:py-24 bg-[#0E0E12] relative border-t border-[#1F2937]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-6 text-white">
              Arsenal de <span className="text-[#E7A5DC]">Crescimento</span>
            </h2>
            <p className="font-manrope text-[#AAB3C2] max-w-2xl mx-auto text-lg leading-relaxed">
              Não atiramos no escuro. Utilizamos um mix de canais e estratégias validadas para encontrar seu cliente onde ele estiver.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Target className="h-8 w-8 text-[#00B8FF]" />, title: "Tráfego Pago (Ads)", desc: "Campanhas ultra-segmentadas no Meta Ads, Google Ads e TikTok para gerar leads qualificados instantaneamente." },
              { icon: <Search className="h-8 w-8 text-[#E7A5DC]" />, title: "SEO Técnico", desc: "Posicione seu site no topo do Google. Otimização on-page, link building e conteúdo que rankeia." },
              { icon: <Users className="h-8 w-8 text-[#00B8FF]" />, title: "Social Media", desc: "Gestão estratégica de redes sociais para criar comunidade, engajamento e autoridade para sua marca." },
              { icon: <Megaphone className="h-8 w-8 text-[#E7A5DC]" />, title: "Inbound Marketing", desc: "Atraia, converta e encante clientes com conteúdo relevante e fluxos de nutrição automatizados." },
              { icon: <BarChart3 className="h-8 w-8 text-[#00B8FF]" />, title: "B.I. & Analytics", desc: "Dashboards em tempo real para monitorar cada centavo investido e otimizar o custo por aquisição." },
              { icon: <Smartphone className="h-8 w-8 text-[#E7A5DC]" />, title: "Conversion (CRO)", desc: "Otimização de Landing Pages para transformar o máximo de visitantes em clientes pagantes." },
            ].map((service, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-[#12121E] p-8 rounded-2xl border border-[#1F2937] hover:border-[#00B8FF]/30 transition-all shadow-lg group"
              >
                <div className="w-14 h-14 bg-[#1F2937] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00B8FF]/10 transition-colors">
                  {service.icon}
                </div>
                <h3 className="font-orbitron font-bold text-xl text-white mb-4 group-hover:text-[#00B8FF] transition-colors">{service.title}</h3>
                <p className="text-[#AAB3C2] leading-relaxed text-sm">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="w-full py-24 bg-[#0B0B13] relative">
        <div className="container mx-auto px-4">
          <div className="bg-[#12121E] rounded-3xl overflow-hidden border border-[#1F2937] relative">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 flex flex-col justify-center order-2 lg:order-1">
                <div className="mb-6 flex gap-2">
                  <span className="px-3 py-1 rounded bg-[#E7A5DC]/20 text-[#E7A5DC] text-xs font-bold font-orbitron">THE FUNNEL</span>
                </div>
                <h2 className="font-orbitron font-bold text-3xl text-white mb-6">
                  O Método <span className="text-[#E7A5DC]">Infinity Growth.</span>
                </h2>
                <p className="text-[#AAB3C2] mb-8 leading-relaxed">
                  Não acreditamos em "hacks" mágicos. Acreditamos em processos. Nossa metodologia cobre toda a jornada do cliente, da descoberta à fidelização.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    { title: "Tração", desc: "Atrair visitantes qualificados em massa." },
                    { title: "Ativação", desc: "Fazer o visitante entender o valor do produto." },
                    { title: "Retenção", desc: "Manter o cliente comprando recorrentemente." }
                  ].map((li, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="mt-1 bg-[#1F2937] p-1 rounded-full">
                        <CheckCircle size={14} className="text-[#E7A5DC]" />
                      </div>
                      <div>
                        <strong className="text-white block">{li.title}</strong>
                        <span className="text-[#AAB3C2] text-sm">{li.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative min-h-[300px] lg:min-h-full bg-gradient-to-br from-[#1F2937] to-[#0B0B13] flex items-center justify-center p-8 order-1 lg:order-2 overflow-hidden">
                {/* Abstract Funnel Visualization */}
                <div className="relative z-10 w-full max-w-sm space-y-2">
                  {[100, 80, 60, 40].map((w, i) => (
                    <motion.div
                      key={i}
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${w}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className="h-16 mx-auto rounded-lg backdrop-blur-md border border-white/10 flex items-center justify-center text-white font-orbitron font-bold relative overflow-hidden"
                      style={{
                        background: `linear-gradient(90deg, rgba(231,165,220,${0.2 + i * 0.2}) 0%, rgba(0,184,255,${0.2 + i * 0.2}) 100%)`
                      }}
                    >
                      <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                      {["Aquisição", "Ativação", "Receita", "Referência"][i]}
                    </motion.div>
                  ))}
                </div>

                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#E7A5DC]/20 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="w-full py-24 bg-[#0E0E12] border-t border-[#1F2937]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-orbitron font-bold text-3xl mb-16 text-white">
            Plataformas que <span className="text-[#00B8FF]">Dominamos</span>
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center justify-items-center opacity-70">
            <FaMeta size={40} className="text-[#0668E1]" title="Meta Ads" />
            <FaGoogle size={40} className="text-[#EA4335]" title="Google" />
            <SiGoogleads size={40} className="text-[#4285F4]" title="Google Ads" />
            <FaTiktok size={40} className="text-white" title="TikTok" />
            <FaLinkedin size={40} className="text-[#0077B5]" title="LinkedIn" />
            <SiGoogleanalytics size={40} className="text-[#E37400]" title="GA4" />
            <SiSemrush size={40} className="text-[#EC5E06]" title="Semrush" />
            <SiHubspot size={40} className="text-[#FF7A59]" title="HubSpot" />
          </div>
        </div>
      </section>

      {/* High Conversion CTA Section */}
      <section className="w-full py-20 relative overflow-hidden bg-gradient-to-br from-[#12121E] to-[#0B0B13]">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E7A5DC]/10 rounded-full blur-[100px]"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-block px-6 py-2 rounded-full bg-[#FF5555]/10 border border-[#FF5555]/30 mb-8">
              <span className="text-[#FF5555] font-bold text-sm tracking-wider animate-pulse">
                ⚠️ PARE DE QUEIMAR ORÇAMENTO
              </span>
            </div>

            <h2 className="font-orbitron font-bold text-3xl md:text-5xl text-white mb-8 leading-tight">
              Quantos clientes você perdeu <br /> hoje por <span className="text-[#E7A5DC]">não ser visto?</span>
            </h2>

            <p className="font-manrope text-xl text-[#AAB3C2] mb-12 max-w-2xl mx-auto">
              Tráfego não é gasto, é investimento. Mas só se for feito do jeito certo. Vamos criar uma máquina de vendas para você.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 w-full sm:w-auto">
              <Button
                asChild
                size="lg"
                className="bg-[#E7A5DC] hover:bg-[#E7A5DC]/80 text-[#0B0B13] font-bold text-xl px-12 h-16 rounded-full shadow-[0_0_40px_rgba(231,165,220,0.4)] hover:shadow-[0_0_60px_rgba(231,165,220,0.6)] hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                <Link href="/orcamento">
                  Quero Escalar Minhas Vendas
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-transparent border-[#1F2937] text-white hover:bg-[#1F2937] hover:text-[#E7A5DC] border-2 font-manrope h-16 rounded-full px-10 text-lg w-full sm:w-auto"
              >
                <Link href="https://wa.me/5511945332464">
                  Consultoria Grátis
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  )
}
