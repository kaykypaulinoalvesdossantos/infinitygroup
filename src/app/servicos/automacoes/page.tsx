"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
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
  Star,
  Database,
  Bell,
  Save,
  Laptop,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef, useEffect } from "react"

// Componente SpaceBackground temporário
const SpaceBackground = () => {
  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[#0A0A0F]"></div>
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#5DC0E7]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
            animate={{
              y: [0, -Math.random() * 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function AutomacoesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Efeito para a animação de automação
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 500
    canvas.height = 400

    // Desenha um fluxograma de automação com engrenagens em movimento
    function drawAutomation() {
      if (!ctx || !canvas) return;
      // Limpa o canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const now = Date.now() / 1000
      
      // Desenha as conexões
      ctx.strokeStyle = "#5DC0E7"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(100, 100)
      ctx.lineTo(250, 100)
      ctx.lineTo(250, 200)
      ctx.lineTo(400, 200)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(100, 300)
      ctx.lineTo(250, 300)
      ctx.lineTo(250, 200)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(400, 200)
      ctx.lineTo(400, 300)
      ctx.stroke()

      // Desenha os nós
      function drawNode(x: number, y: number, label: string) {
        if (!ctx) return;
        ctx.fillStyle = "#212227"
        ctx.strokeStyle = "#5DC0E7"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(x - 50, y - 30, 100, 60, 10)
        ctx.fill()
        ctx.stroke()
        
        ctx.fillStyle = "#FBFBFB"
        ctx.font = "14px Arial"
        ctx.textAlign = "center"
        ctx.fillText(label, x, y + 5)
      }

      drawNode(100, 100, "Entrada")
      drawNode(100, 300, "Dados")
      drawNode(250, 200, "Processamento")
      drawNode(400, 300, "Saída")

      // Desenha engrenagens em movimento
      function drawGear(x: number, y: number, radius: number, teeth: number, rotation: number) {
        if (!ctx) return;
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rotation)
        
        ctx.beginPath()
        ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2)
        ctx.fillStyle = "#5DC0E7"
        ctx.fill()
        
        ctx.beginPath()
        for (let i = 0; i < teeth; i++) {
          const angle = (i / teeth) * Math.PI * 2
          const innerRadius = radius * 0.7
          const outerRadius = radius
          
          ctx.lineTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius)
          ctx.lineTo(Math.cos(angle + Math.PI / teeth) * outerRadius, Math.sin(angle + Math.PI / teeth) * outerRadius)
          ctx.lineTo(Math.cos(angle + Math.PI / teeth * 2) * innerRadius, Math.sin(angle + Math.PI / teeth * 2) * innerRadius)
        }
        ctx.closePath()
        ctx.fillStyle = "#5DC0E7"
        ctx.fill()
        
        ctx.beginPath()
        ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = "#212227"
        ctx.fill()
        
        ctx.restore()
      }

      // Desenha engrenagens em movimento
      drawGear(175, 100, 20, 8, now)
      drawGear(250, 150, 25, 10, -now * 0.8)
      drawGear(250, 250, 25, 10, now * 0.8)
      drawGear(325, 200, 20, 8, -now)
      drawGear(400, 250, 20, 8, now)

      // Desenha partículas de dados
      ctx.fillStyle = "#FBFBFB"
      for (let i = 0; i < 5; i++) {
        const t = (now * 0.5 + i * 0.2) % 1
        
        // Partículas de entrada para processamento
        const x1 = 100 + t * 150
        const y1 = 100
        ctx.beginPath()
        ctx.arc(x1, y1, 3, 0, Math.PI * 2)
        ctx.fill()
        
        // Partículas de dados para processamento
        const x2 = 100 + t * 150
        const y2 = 300 - t * 100
        ctx.beginPath()
        ctx.arc(x2, y2, 3, 0, Math.PI * 2)
        ctx.fill()
        
        // Partículas de processamento para saída
        const x3 = 250 + t * 150
        const y3 = 200 + t * 100
        ctx.beginPath()
        ctx.arc(x3, y3, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      requestAnimationFrame(drawAutomation)
    }

    drawAutomation()
  }, [])

  return (
    <main className="flex flex-col items-center justify-center w-full">
      {/* Hero Section - Space Theme with Automation Elements */}
      <section className="w-full min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden bg-[#0A0A0F] text-[#FBFBFB]">
        <SpaceBackground />

        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F]/90 to-[#0A0A0F]/80 z-10"></div>
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full opacity-20">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-[#5DC0E7]/20"></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 z-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#FBFBFB]">
                <span className="text-[#5DC0E7]">Automações</span> Inteligentes
              </h1>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Automatize tarefas repetitivas, integre sistemas e otimize processos para aumentar a produtividade e
                reduzir custos. Nossas soluções de automação são personalizadas para as necessidades específicas do seu
                negócio.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#5DC0E7] hover:bg-[#5DC0E7]/80 text-white relative overflow-hidden group"
              >
                <Link href="/orcamento">
                  <span className="relative z-10 flex items-center">
                    Solicitar Orçamento{" "}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative flex justify-center"
            >
              <motion.div
                className="relative z-10 rounded-lg overflow-hidden shadow-2xl border-4 border-[#5DC0E7]/30"
                animate={{ 
                  rotateY: [0, 3, 0, -3, 0],
                  rotateX: [0, -3, 0, 3, 0]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut" 
                }}
              >
                <canvas ref={canvasRef} width={500} height={400} className="w-full h-auto bg-[#0A0A0F]" />
              </motion.div>

              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-[#5DC0E7]/10 rounded-full z-0"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#5DC0E7]/20 rounded-full z-0"></div>

              {/* Elementos flutuantes de automação */}
              <motion.div
                className="absolute top-1/4 right-1/4 w-12 h-12 z-20"
                animate={{
                  y: [0, -15, 0],
                  rotate: 360,
                }}
                transition={{
                  y: {
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  },
                }}
              >
                <Settings className="text-[#5DC0E7] w-full h-full" />
              </motion.div>

              <motion.div
                className="absolute bottom-1/4 left-1/4 w-10 h-10 z-20"
                animate={{
                  y: [0, 15, 0],
                  rotate: -360,
                }}
                transition={{
                  y: {
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: 25,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  },
                }}
              >
                <Cog className="text-[#5DC0E7] w-full h-full" />
              </motion.div>

              <motion.div
                className="absolute top-2/3 right-1/3 w-8 h-8 z-20"
                animate={{
                  y: [0, 10, 0],
                  x: [0, 10, 0],
                }}
                transition={{
                  y: {
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  x: {
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                }}
              >
                <GitBranch className="text-[#5DC0E7] w-full h-full" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Automation Flow */}
      <section className="w-full py-20 bg-gradient-to-b from-[#0A0A0F] to-[#141420] text-[#FBFBFB] relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          {/* Padrão de fluxo de automação */}
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="flow" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0,50 L100,50" stroke="#5DC0E7" strokeWidth="0.5" strokeDasharray="5,5" />
              <path d="M50,0 L50,100" stroke="#5DC0E7" strokeWidth="0.5" strokeDasharray="5,5" />
              <circle cx="50" cy="50" r="3" fill="#5DC0E7" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#flow)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#FBFBFB]">
              Benefícios da <span className="text-[#5DC0E7]">Automação</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#FBFBFB]/80">
              Descubra como a automação de processos pode transformar sua empresa e impulsionar seus resultados.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="h-10 w-10" />,
                title: "Economia de Tempo",
                description:
                  "Reduza o tempo gasto em tarefas manuais e repetitivas, permitindo que sua equipe foque em atividades estratégicas.",
              },
              {
                icon: <Zap className="h-10 w-10" />,
                title: "Aumento de Produtividade",
                description:
                  "Processos automatizados são executados mais rapidamente e com maior consistência, aumentando a produtividade geral.",
              },
              {
                icon: <BarChart className="h-10 w-10" />,
                title: "Redução de Custos",
                description:
                  "Minimize custos operacionais ao reduzir a necessidade de intervenção manual e eliminar erros humanos.",
              },
              {
                icon: <RefreshCw className="h-10 w-10" />,
                title: "Escalabilidade",
                description:
                  "Sistemas automatizados podem lidar com volumes crescentes de trabalho sem a necessidade de recursos adicionais.",
              },
              {
                icon: <Code className="h-10 w-10" />,
                title: "Integração de Sistemas",
                description:
                  "Conecte diferentes sistemas e aplicativos para criar um fluxo de trabalho contínuo e eliminar silos de informação.",
              },
              {
                icon: <Workflow className="h-10 w-10" />,
                title: "Processos Padronizados",
                description:
                  "Garanta que os processos sejam executados de maneira consistente e de acordo com as melhores práticas.",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.03 }}
                className="bg-[#FBFBFB]/5 backdrop-blur-sm p-6 rounded-lg border border-[#5DC0E7]/20 hover:border-[#5DC0E7]/50 transition-all duration-300"
              >
                <div className="text-[#5DC0E7] mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-[#FBFBFB]">{benefit.title}</h3>
                <p className="text-[#FBFBFB]/80">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Solutions - Interactive Automation Flow */}
      <section className="w-full py-20 bg-[#FBFBFB] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#5DC0E7]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#5DC0E7]/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#212227]">
              Nossas <span className="text-[#5DC0E7]">Soluções</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#212227]/80">
              Oferecemos uma ampla gama de soluções de automação para diferentes áreas e necessidades de negócio.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6 text-[#212227]">Automação Personalizada</h3>
              <p className="text-lg mb-6 text-[#212227]/80">
                Desenvolvemos soluções de automação sob medida para as necessidades específicas do seu negócio,
                integrando diferentes sistemas e otimizando seus processos.
              </p>

              <ul className="space-y-4">
                {[
                  "Automação de processos de negócio (BPA)",
                  "Integração entre sistemas (API, webhooks, etc.)",
                  "Robotic Process Automation (RPA)",
                  "Automação de marketing e vendas",
                  "Automação de atendimento ao cliente",
                  "Automação de relatórios e análises",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 5 }}
                  >
                    <CheckCircle className="h-5 w-5 text-[#5DC0E7] mr-2 shrink-0 mt-0.5" />
                    <span className="text-[#212227]/80">{item}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Diagrama interativo de ROI */}
              <motion.div
                className="mt-8 p-6 bg-[#F0F0F0] rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <h4 className="font-bold text-[#212227] mb-4">Retorno sobre Investimento (ROI)</h4>
                <div className="relative h-[200px]">
                  {/* Eixo X */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#212227]/20"></div>
                  {/* Eixo Y */}
                  <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-[#212227]/20"></div>
                  
                  {/* Linha de custo sem automação */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-[#FF5555] origin-left"
                    style={{ transform: "rotate(-5deg)", transformOrigin: "bottom left" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true }}
                  ></motion.div>
                  
                  {/* Linha de custo com automação */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-[#5DC0E7] origin-left"
                    style={{ transform: "rotate(-30deg)", transformOrigin: "bottom left" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    viewport={{ once: true }}
                  ></motion.div>
                  
                  {/* Área de economia */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-[#5DC0E7]/10"
                    style={{ height: "40%" }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    viewport={{ once: true }}
                  ></motion.div>
                  
                  {/* Legendas */}
                  <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                    <div className="flex items-center">
                      <div className="w-4 h-1 bg-[#FF5555] mr-2"></div>
                      <span className="text-xs text-[#212227]/80">Sem automação</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-1 bg-[#5DC0E7] mr-2"></div>
                      <span className="text-xs text-[#212227]/80">Com automação</span>
                    </div>
                  </div>
                  
                  {/* Ponto de equilíbrio */}
                  <motion.div
                    className="absolute left-1/3 bottom-0 w-0.5 h-full bg-[#212227]/20 dashed"
                    initial={{ height: 0 }}
                    whileInView={{ height: "100%" }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                    viewport={{ once: true }}
                  ></motion.div>
                  <motion.div
                    className="absolute left-1/3 top-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 2 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-xs bg-[#5DC0E7] text-white px-2 py-1 rounded">Ponto de equilíbrio</span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Fluxograma de automação interativo */}
              <div className="relative z-10 bg-white rounded-lg shadow-2xl p-4 sm:p-8 border-4 border-[#5DC0E7]/10 w-full max-w-[600px] mx-auto">
                <h3 className="text-2xl font-bold mb-6 text-[#212227] text-center">Fluxo de Automação</h3>
                
                <div className="relative h-[400px] w-full">
                  {/* Nós do fluxograma */}
                  {[
                    { id: 1, x: "50%", y: 50, label: "Entrada de Dados", icon: <Database className="h-6 w-6" /> },
                    { id: 2, x: "25%", y: 150, label: "Validação", icon: <CheckCircle className="h-6 w-6" /> },
                    { id: 3, x: "75%", y: 150, label: "Transformação", icon: <RefreshCw className="h-6 w-6" /> },
                    { id: 4, x: "50%", y: 250, label: "Processamento", icon: <Cpu className="h-6 w-6" /> },
                    { id: 5, x: "25%", y: 350, label: "Notificação", icon: <Bell className="h-6 w-6" /> },
                    { id: 6, x: "75%", y: 350, label: "Armazenamento", icon: <Save className="h-6 w-6" /> },
                  ].map((node) => (
                    <motion.div
                      key={node.id}
                      className="absolute w-28 sm:w-32 h-16 bg-[#5DC0E7]/10 rounded-lg flex flex-col items-center justify-center border border-[#5DC0E7]/30"
                      style={{ 
                        left: `calc(${node.x} - 4rem)`,
                        top: node.y - 25
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: node.id * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(93, 192, 231, 0.2)" }}
                    >
                      <div className="text-[#5DC0E7]">{node.icon}</div>
                      <div className="text-xs font-medium text-[#212227] mt-1 text-center">{node.label}</div>
                    </motion.div>
                  ))}
                  
                  {/* Conexões entre os nós */}
                  <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }} viewBox="0 0 100 100" preserveAspectRatio="none">
                    {[
                      { from: { x: 50, y: 12.5 }, to: { x: 25, y: 31.25 } },
                      { from: { x: 50, y: 12.5 }, to: { x: 75, y: 31.25 } },
                      { from: { x: 25, y: 43.75 }, to: { x: 50, y: 56.25 } },
                      { from: { x: 75, y: 43.75 }, to: { x: 50, y: 56.25 } },
                      { from: { x: 50, y: 68.75 }, to: { x: 25, y: 81.25 } },
                      { from: { x: 50, y: 68.75 }, to: { x: 75, y: 81.25 } },
                    ].map((connection, index) => (
                      <motion.path
                        key={index}
                        d={`M${connection.from.x},${connection.from.y} L${connection.to.x},${connection.to.y}`}
                        stroke="#5DC0E7"
                        strokeWidth="0.5"
                        strokeDasharray="1,1"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        viewport={{ once: true }}
                      />
                    ))}
                  </svg>
                  
                  {/* Partículas de dados fluindo */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-[#5DC0E7]"
                      initial={{ top: "12.5%", left: "50%", scale: 0 }}
                      animate={{
                        top: ["12.5%", "31.25%", "56.25%", "81.25%"],
                        left: ["50%", i % 2 === 0 ? "25%" : "75%", "50%", i % 2 === 0 ? "25%" : "75%"],
                        scale: [0, 1, 1, 0],
                      }}
                      transition={{
                        duration: 4,
                        delay: i * 0.8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-[#5DC0E7]/10 rounded-full z-0"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#5DC0E7]/20 rounded-full z-0"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technologies - Automation Tech Grid */}
      <section className="w-full py-20 bg-[#0A0A0F] text-[#FBFBFB] relative overflow-hidden">
        <SpaceBackground />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#FBFBFB]">
              Tecnologias que <span className="text-[#5DC0E7]">utilizamos</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#FBFBFB]/80">
              Trabalhamos com as tecnologias mais modernas para automação de processos e integração de sistemas.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                name: "Zapier",
                description: "Integração entre mais de 3.000 apps",
                icon: "/images/logo/Zapier.webp",
              },
              {
                name: "Make (Integromat)",
                description: "Automação visual de processos",
                icon: "/images/logo/Make (Integromat).webp",
              },
              {
                name: "Node-RED",
                description: "Automação de fluxos de trabalho",
                icon: "/images/logo/node-red.png",
              },
              {
                name: "UiPath",
                description: "Plataforma líder em RPA",
                icon: "/images/logo/uipath.png",
              },
              {
                name: "Power Automate",
                description: "Automação da Microsoft",
                icon: "/images/logo/Power Automate.png",
              },
              {
                name: "Python",
                description: "Automação com scripts personalizados",
                icon: "/images/logo/python.png",
              },
              {
                name: "REST APIs",
                description: "Integração entre sistemas",
                icon: "/images/logo/REST APIs.png",
              },
              {
                name: "Webhooks",
                description: "Comunicação em tempo real",
                icon: "/images/logo/Webhooks.png",
              },
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-[#FBFBFB]/5 backdrop-blur-sm p-6 rounded-lg border border-[#5DC0E7]/20 hover:border-[#5DC0E7]/50 transition-all duration-300 flex flex-col items-center text-center"
              >
                <Image
                  src={tech.icon}
                  alt={tech.name}
                  width={60}
                  height={60}
                  className="mb-4"
                />
                <h3 className="text-xl font-bold mb-2 text-[#5DC0E7]">{tech.name}</h3>
                <p className="text-[#FBFBFB]/80 text-sm">{tech.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies - Interactive Cards */}
      {/* <section className="w-full py-20 bg-gradient-to-b from-[#0A0A0F] to-[#FBFBFB]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#FBFBFB]">
              Casos de <span className="text-[#5DC0E7]">Sucesso</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#FBFBFB]/80">
              Conheça alguns dos resultados que alcançamos com nossas soluções de automação.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Automação de Processos Internos",
                client: "ACC Telecom",
                description:
                  "Redução de 70% no tempo gasto em tarefas administrativas e aumento de 200% na conversão de leads.",
                image: "/placeholder.svg?height=400&width=600",
                link: "/portfolio/acc-telecom",
              },
              {
                title: "Integração de Sistemas",
                client: "Tech Solutions",
                description:
                  "Integração entre ERP, CRM e e-commerce, eliminando a necessidade de entrada manual de dados e reduzindo erros em 95%.",
                image: "/placeholder.svg?height=400&width=600",
                link: "/portfolio",
              },
              {
                title: "Automação de Relatórios",
                client: "Smart Factory",
                description:
                  "Geração automática de relatórios de produção, economizando 20 horas semanais da equipe de gestão.",
                image: "/placeholder.svg?height=400&width=600",
                link: "/portfolio/smart-factory",
              },
            ].map((case_study, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -15, scale: 1.02 }}
                className="bg-white rounded-lg overflow-hidden shadow-xl"
              >
                <div className="relative">
                  <Image
                    src={case_study.image}
                    alt={case_study.title}
                    width={600}
                    height={400}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#212227] to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <div className="text-sm text-[#5DC0E7] mb-2">Cliente: {case_study.client}</div>
                  <h3 className="text-xl font-bold mb-2 text-[#212227]">{case_study.title}</h3>
                  <p className="text-[#212227]/80 mb-4">{case_study.description}</p>
                  <Link
                    href={case_study.link}
                    className="text-[#5DC0E7] font-medium hover:text-[#5DC0E7]/80 flex items-center"
                  >
                    Ver detalhes <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section - Space Theme */}
      <section className="w-full py-20 bg-gradient-to-r from-[#0A0A0F] to-[#141420] text-[#FBFBFB] relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0A0A0F]/50"></div>
          <div className="absolute inset-0">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-[#5DC0E7]"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 1}px`,
                  height: `${Math.random() * 4 + 1}px`,
                  opacity: Math.random() * 0.5 + 0.3,
                }}
                animate={{
                  y: [0, -Math.random() * 100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#FBFBFB]">
                Pronto para <span className="text-[#5DC0E7]">automatizar</span> seus processos?
              </h2>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Entre em contato conosco e descubra como podemos ajudar sua empresa a se tornar mais eficiente e
                produtiva.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#5DC0E7] hover:bg-[#5DC0E7]/80 text-white relative overflow-hidden group"
              >
                <Link href="/orcamento">
                  <span className="relative z-10 flex items-center">
                    Solicitar Orçamento{" "}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

         {/* Elementos flutuantes */}
         <motion.div
          className="absolute bottom-10 left-10 w-16 h-16 z-10"
          animate={{
            y: [0, -20, 0],
            rotate: 360,
          }}
          transition={{
            y: {
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            rotate: {
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
          }}
        >
          <Laptop className="text-[#5DC0E7] w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute top-10 right-10 w-20 h-20 z-10"
          animate={{
            y: [0, 20, 0],
            rotate: -360,
          }}
          transition={{
            y: {
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            rotate: {
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
          }}
        >
          <Star className="text-[#5DC0E7]/30 w-full h-full" />
        </motion.div>
      </section>
    </main>
  )
}
