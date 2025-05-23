"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle,
  Laptop,
  Database,
  Shield,
  Zap,
  Users,
  BarChart,
  Star,
  Cpu,
  Server,
  Monitor,
  HardDrive,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import { useRef, useEffect } from "react"

export default function AplicativosComputadorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Efeito para a animação do computador
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 600
    canvas.height = 400

    // Desenha um computador com efeito de "código" na tela
    function drawComputer() {
      if (!ctx || !canvas) return;
      // Limpa o canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Desenha o monitor
      ctx.fillStyle = "#212227"
      ctx.strokeStyle = "#5DC0E7"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(50, 50, 300, 200, 10)
      ctx.fill()
      ctx.stroke()

      // Desenha a tela
      ctx.fillStyle = "#0A0A0F"
      ctx.beginPath()
      ctx.roundRect(60, 60, 280, 180, 5)
      ctx.fill()

      // Desenha a base
      ctx.beginPath()
      ctx.moveTo(100, 250)
      ctx.lineTo(200, 250)
      ctx.lineTo(180, 300)
      ctx.lineTo(120, 300)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Desenha "código" na tela
      ctx.fillStyle = "#5DC0E7"
      ctx.font = "10px monospace"

      const now = Date.now()
      for (let i = 0; i < 20; i++) {
        const y = 80 + i * 16
        const offset = Math.sin(now / 1000 + i * 0.3) * 10
        ctx.fillText(`import { useState } from 'react';`.substring(0, 20 + offset), 80, y)
        ctx.fillText(`function App() {`.substring(0, 15 + offset), 140, y + 7)
      }

      // Desenha ícones de desktop
      const iconSize = 20
      const iconGap = 30
      const startX = 140
      const startY = 200

      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 5; col++) {
          const x = startX + col * (iconSize + iconGap)
          const y = startY + row * (iconSize + iconGap)

          ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`
          ctx.beginPath()
          ctx.roundRect(x, y, iconSize, iconSize, 3)
          ctx.fill()
        }
      }

      // Desenha o teclado
      ctx.fillStyle = "#212227"
      ctx.strokeStyle = "#5DC0E7"
      ctx.beginPath()
      ctx.roundRect(150, 350, 300, 30, 5)
      ctx.fill()
      ctx.stroke()

      // Desenha as teclas
      ctx.fillStyle = "#0A0A0F"
      for (let i = 0; i < 10; i++) {
        const x = 160 + i * 28
        ctx.beginPath()
        ctx.roundRect(x, 355, 20, 20, 2)
        ctx.fill()
      }

      requestAnimationFrame(drawComputer)
    }

    drawComputer()
  }, [])

  return (
    <main className="flex flex-col items-center justify-center w-full">
      {/* Hero Section - Space Theme with Desktop Elements */}
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
                Aplicativos para <span className="text-[#5DC0E7]">Computador</span>
              </h1>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Desenvolvimento de softwares desktop personalizados para Windows, macOS e Linux, com foco em
                produtividade, automação e gestão empresarial. Soluções sob medida para as necessidades do seu negócio.
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
                  rotateX: [0, -3, 0, 3, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <canvas ref={canvasRef} width={600} height={400} className="w-full h-auto" />
              </motion.div>

              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-[#5DC0E7]/10 rounded-full z-0"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#5DC0E7]/20 rounded-full z-0"></div>

              {/* Elementos flutuantes de desktop */}
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
                <Laptop className="text-[#5DC0E7] w-full h-full" />
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
                <Cpu className="text-[#5DC0E7] w-full h-full" />
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
                <HardDrive className="text-[#5DC0E7] w-full h-full" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Desktop App Circuit Board */}
      <section className="w-full py-20 bg-gradient-to-b from-[#0A0A0F] to-[#141420] text-[#FBFBFB] relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          {/* Circuit board pattern */}
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="#5DC0E7" strokeWidth="0.5" />
              <path d="M0,50 L100,50" stroke="#5DC0E7" strokeWidth="0.5" />
              <path d="M50,0 L50,100" stroke="#5DC0E7" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="3" fill="#5DC0E7" />
              <circle cx="0" cy="50" r="3" fill="#5DC0E7" />
              <circle cx="100" cy="50" r="3" fill="#5DC0E7" />
              <circle cx="50" cy="0" r="3" fill="#5DC0E7" />
              <circle cx="50" cy="100" r="3" fill="#5DC0E7" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit)" />
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
              Por que investir em <span className="text-[#5DC0E7]">software desktop</span>?
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#FBFBFB]/80">
              Aplicativos para computador oferecem maior controle, segurança e produtividade para operações empresariais
              complexas.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Laptop className="h-10 w-10" />,
                title: "Experiência Otimizada",
                description:
                  "Interface adaptada para uso com mouse e teclado, proporcionando maior produtividade em tarefas complexas.",
              },
              {
                icon: <Database className="h-10 w-10" />,
                title: "Processamento Local",
                description:
                  "Capacidade de processar grandes volumes de dados localmente, sem depender constantemente da internet.",
              },
              {
                icon: <Shield className="h-10 w-10" />,
                title: "Segurança Avançada",
                description:
                  "Maior controle sobre dados sensíveis, com possibilidade de implementar políticas de segurança robustas.",
              },
              {
                icon: <Zap className="h-10 w-10" />,
                title: "Performance Superior",
                description:
                  "Acesso direto aos recursos do sistema, resultando em melhor desempenho para operações intensivas.",
              },
              {
                icon: <Users className="h-10 w-10" />,
                title: "Colaboração em Rede",
                description: "Possibilidade de integração com sistemas de rede local para colaboração entre equipes.",
              },
              {
                icon: <BarChart className="h-10 w-10" />,
                title: "Análise de Dados",
                description: "Ferramentas avançadas para visualização e análise de dados empresariais em tempo real.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.03 }}
                className="bg-[#FBFBFB]/5 backdrop-blur-sm p-6 rounded-lg border border-[#5DC0E7]/20 hover:border-[#5DC0E7]/50 transition-all duration-300"
              >
                <div className="text-[#5DC0E7] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-[#FBFBFB]">{feature.title}</h3>
                <p className="text-[#FBFBFB]/80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach - Desktop App Architecture */}
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
              Nossa <span className="text-[#5DC0E7]">Abordagem</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#212227]/80">
              Desenvolvemos softwares desktop personalizados que atendem às necessidades específicas do seu negócio.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Arquitetura de software desktop */}
              <div className="relative z-10 bg-white rounded-lg shadow-2xl p-8 border-4 border-[#5DC0E7]/10">
                <h3 className="text-2xl font-bold mb-6 text-[#212227] text-center">Arquitetura de Software</h3>

                {/* Diagrama de arquitetura */}
                <div className="relative h-[400px]">
                  {/* Camada de Interface do Usuário */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-20 bg-[#5DC0E7]/20 rounded-lg flex items-center justify-center"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-center">
                      <Monitor className="h-8 w-8 text-[#5DC0E7] mx-auto mb-1" />
                      <h4 className="font-bold text-[#212227]">Interface do Usuário</h4>
                    </div>
                  </motion.div>

                  {/* Camada de Lógica de Negócios */}
                  <motion.div
                    className="absolute top-[100px] left-0 right-0 h-20 bg-[#5DC0E7]/30 rounded-lg flex items-center justify-center"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-center">
                      <Cpu className="h-8 w-8 text-[#5DC0E7] mx-auto mb-1" />
                      <h4 className="font-bold text-[#212227]">Lógica de Negócios</h4>
                    </div>
                  </motion.div>

                  {/* Camada de Acesso a Dados */}
                  <motion.div
                    className="absolute top-[200px] left-0 right-0 h-20 bg-[#5DC0E7]/40 rounded-lg flex items-center justify-center"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-center">
                      <Database className="h-8 w-8 text-[#5DC0E7] mx-auto mb-1" />
                      <h4 className="font-bold text-[#212227]">Acesso a Dados</h4>
                    </div>
                  </motion.div>

                  {/* Camada de Infraestrutura */}
                  <motion.div
                    className="absolute top-[300px] left-0 right-0 h-20 bg-[#5DC0E7]/50 rounded-lg flex items-center justify-center"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-center">
                      <Server className="h-8 w-8 text-[#5DC0E7] mx-auto mb-1" />
                      <h4 className="font-bold text-[#212227]">Infraestrutura</h4>
                    </div>
                  </motion.div>

                  {/* Linhas de conexão */}
                  <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                    <motion.line
                      x1="50%"
                      y1="60"
                      x2="50%"
                      y2="100"
                      stroke="#5DC0E7"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 1 }}
                      viewport={{ once: true }}
                    />
                    <motion.line
                      x1="50%"
                      y1="160"
                      x2="50%"
                      y2="200"
                      stroke="#5DC0E7"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 0.2 }}
                      viewport={{ once: true }}
                    />
                    <motion.line
                      x1="50%"
                      y1="260"
                      x2="50%"
                      y2="300"
                      stroke="#5DC0E7"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 0.4 }}
                      viewport={{ once: true }}
                    />
                  </svg>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-[#5DC0E7]/10 rounded-full z-0"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#5DC0E7]/20 rounded-full z-0"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6 text-[#212227]">Desenvolvimento Sob Medida</h3>
              <p className="text-lg mb-6 text-[#212227]/80">
                Criamos soluções personalizadas que se adaptam perfeitamente aos processos e necessidades específicas da
                sua empresa, aumentando a eficiência e produtividade.
              </p>

              <ul className="space-y-4">
                {[
                  "Análise detalhada dos processos e necessidades da empresa",
                  "Design de interface intuitivo e adaptado ao fluxo de trabalho",
                  "Desenvolvimento multiplataforma (Windows, macOS, Linux)",
                  "Integração com sistemas existentes (ERP, CRM, etc.)",
                  "Testes rigorosos de usabilidade e performance",
                  "Suporte técnico especializado e atualizações contínuas",
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

              {/* Gráfico de benefícios */}
              <motion.div
                className="mt-8 p-6 bg-[#F0F0F0] rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <h4 className="font-bold text-[#212227] mb-4">Benefícios Quantificáveis</h4>
                <div className="space-y-4">
                  {[
                    { label: "Aumento de Produtividade", value: 40 },
                    { label: "Redução de Custos", value: 30 },
                    { label: "Melhoria na Tomada de Decisão", value: 65 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#212227]/80">{item.label}</span>
                        <span className="font-bold text-[#5DC0E7]">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#5DC0E7]"
                          initial={{ width: "0%" }}
                          whileInView={{ width: `${item.value}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          viewport={{ once: true }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technologies - Desktop Tech Grid */}
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
              Trabalhamos com as tecnologias mais modernas para desenvolvimento de aplicativos desktop.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                name: "Electron",
                description: "Para apps multiplataforma com web tech",
                icon: "/images/logo/electron.png",
              },
              {
                name: ".NET",
                description: "Framework robusto da Microsoft",
                icon: "/images/logo/NET.png",
              },
              {
                name: "Java",
                description: "Linguagem multiplataforma",
                icon: "/images/logo/java.png",
              },
              {
                name: "Python",
                description: "Para aplicações de dados e IA",
                icon: "/images/logo/python.png",
              },
              {
                name: "Qt",
                description: "Framework C++ multiplataforma",
                icon: "/images/logo/qt.svg",
              },
              {
                name: "SQLite",
                description: "Banco de dados local",
                icon: "/images/logo/SQLite.webp",
              },
              {
                name: "PostgreSQL",
                description: "Banco de dados relacional",
                icon: "/images/logo/PostgreSQL.svg",
              },
              {
                name: "Docker",
                description: "Containerização para fácil distribuição",
                icon: "/images/logo/doker.png",
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
                Pronto para otimizar os processos da sua <span className="text-[#5DC0E7]">empresa</span>?
              </h2>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Entre em contato conosco e vamos desenvolver um software personalizado para o seu negócio.
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
