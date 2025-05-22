"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle,
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import { useRef, useEffect } from "react"

export default function AplicativosCelularPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Efeito para a animação do dispositivo móvel
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 300
    canvas.height = 600

    // Desenha um smartphone com efeito de "código" dentro
    function drawSmartphone() {
      if (!ctx || !canvas) return;
      // Limpa o canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Desenha o corpo do smartphone
      ctx.fillStyle = "#212227"
      ctx.strokeStyle = "#5DC0E7"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(50, 50, 200, 400, 20)
      ctx.fill()
      ctx.stroke()

      // Desenha a tela
      ctx.fillStyle = "#0A0A0F"
      ctx.beginPath()
      ctx.roundRect(60, 70, 180, 350, 5)
      ctx.fill()

      // Desenha o botão home
      ctx.fillStyle = "#5DC0E7"
      ctx.beginPath()
      ctx.arc(150, 440, 15, 0, Math.PI * 2)
      ctx.fill()

      // Desenha "código" na tela
      ctx.fillStyle = "#5DC0E7"
      ctx.font = "10px monospace"

      const now = Date.now()
      for (let i = 0; i < 20; i++) {
        const y = 90 + i * 16
        const offset = Math.sin(now / 1000 + i * 0.3) * 10
        ctx.fillText(`import { useState } from 'react';`.substring(0, 20 + offset), 70, y)
        ctx.fillText(`function App() {`.substring(0, 15 + offset), 70, y + 8)
      }

      // Desenha ícones de app
      const iconSize = 30
      const iconGap = 15
      const startX = 70
      const startY = 250

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          const x = startX + col * (iconSize + iconGap)
          const y = startY + row * (iconSize + iconGap)

          ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`
          ctx.beginPath()
          ctx.roundRect(x, y, iconSize, iconSize, 5)
          ctx.fill()
        }
      }

      requestAnimationFrame(drawSmartphone)
    }

    drawSmartphone()
  }, [])

  return (
    <main className="flex flex-col items-center justify-center w-full">
      {/* Hero Section - Space Theme with Mobile Elements */}
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
                Aplicativos para <span className="text-[#5DC0E7]">Celular</span>
              </h1>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Desenvolvimento de aplicativos mobile nativos e híbridos para Android e iOS, com foco em experiência do
                usuário e performance. Transformamos sua ideia em um aplicativo funcional e intuitivo.
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
                className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#5DC0E7]/30"
                animate={{
                  rotateY: [0, 5, 0, -5, 0],
                  rotateX: [0, -5, 0, 5, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <canvas ref={canvasRef} width={300} height={600} className="w-[300px] h-[600px]" />
              </motion.div>

              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-[#5DC0E7]/10 rounded-full z-0"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#5DC0E7]/20 rounded-full z-0"></div>

              {/* Elementos flutuantes de mobile */}
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
                <Smartphone className="text-[#5DC0E7] w-full h-full" />
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
                <Wifi className="text-[#5DC0E7] w-full h-full" />
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
                <Cpu className="text-[#5DC0E7] w-full h-full" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Mobile App Orbit */}
      <section className="w-full py-20 bg-gradient-to-b from-[#0A0A0F] to-[#141420] text-[#FBFBFB] relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#5DC0E7]/30 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#5DC0E7]/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[#5DC0E7]/10 rounded-full"></div>
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
              Por que desenvolver um <span className="text-[#5DC0E7]">aplicativo mobile</span>?
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#FBFBFB]/80">
              Aplicativos mobile oferecem uma experiência personalizada e direta com seus clientes, aumentando o
              engajamento e a fidelização.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Smartphone className="h-10 w-10" />,
                title: "Presença no Bolso do Cliente",
                description:
                  "Seu negócio disponível 24/7 no dispositivo que seus clientes mais utilizam durante o dia.",
              },
              {
                icon: <Zap className="h-10 w-10" />,
                title: "Performance Otimizada",
                description:
                  "Aplicativos nativos oferecem melhor desempenho e acesso a recursos do dispositivo como câmera e GPS.",
              },
              {
                icon: <Globe className="h-10 w-10" />,
                title: "Funcionamento Offline",
                description:
                  "Diferente de sites, aplicativos podem funcionar mesmo sem conexão com a internet, dependendo das funcionalidades.",
              },
              {
                icon: <Lock className="h-10 w-10" />,
                title: "Segurança Avançada",
                description:
                  "Implementação de recursos de segurança como autenticação biométrica e criptografia de dados.",
              },
              {
                icon: <Layers className="h-10 w-10" />,
                title: "Experiência Personalizada",
                description: "Interface e funcionalidades adaptadas às necessidades específicas dos seus usuários.",
              },
              {
                icon: <RefreshCw className="h-10 w-10" />,
                title: "Atualizações Constantes",
                description:
                  "Possibilidade de evoluir o aplicativo continuamente, adicionando novas funcionalidades e melhorias.",
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

      {/* Our Approach - Mobile App Screens */}
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
              Nossa <span className="text-[#5DC0E7]">Metodologia</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#212227]/80">
              Desenvolvemos aplicativos mobile seguindo uma metodologia ágil e centrada no usuário.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6 text-[#212227]">Do Conceito à Loja de Aplicativos</h3>
              <p className="text-lg mb-6 text-[#212227]/80">
                Nossa abordagem abrange todo o ciclo de desenvolvimento, desde a concepção da ideia até a publicação nas
                lojas de aplicativos e o suporte contínuo.
              </p>

              <ul className="space-y-4">
                {[
                  "Análise de requisitos e definição do escopo",
                  "Prototipagem e design de interface (UI/UX)",
                  "Desenvolvimento nativo ou híbrido",
                  "Testes rigorosos em diferentes dispositivos",
                  "Publicação nas lojas (App Store e Google Play)",
                  "Monitoramento e atualizações contínuas",
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

            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Mockups de aplicativos móveis */}
              <div className="relative z-10 flex justify-center">
                {/* Mockup 1 */}
                <motion.div
                  className="absolute left-0 top-10 w-48 h-96 bg-[#212227] rounded-3xl overflow-hidden shadow-xl border-4 border-[#5DC0E7]/10 z-10"
                  initial={{ x: -100, opacity: 0, rotateY: -30 }}
                  whileInView={{ x: 0, opacity: 1, rotateY: -15 }}
                  transition={{ duration: 0.7 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <div className="w-full h-full bg-gradient-to-b from-[#5DC0E7]/20 to-[#212227] p-2">
                    <div className="w-full h-full bg-[#0A0A0F] rounded-2xl p-2">
                      <div className="w-8 h-1 bg-[#5DC0E7]/50 rounded-full mx-auto mb-2"></div>
                      <div className="w-full h-40 bg-[#5DC0E7]/10 rounded-lg mb-2"></div>
                      <div className="space-y-2">
                        <div className="w-full h-8 bg-[#5DC0E7]/10 rounded-lg"></div>
                        <div className="w-3/4 h-8 bg-[#5DC0E7]/10 rounded-lg"></div>
                        <div className="w-full h-20 bg-[#5DC0E7]/10 rounded-lg"></div>
                        <div className="w-full h-12 bg-[#5DC0E7]/20 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Mockup 2 (central) */}
                <motion.div
                  className="relative w-56 h-[500px] bg-[#212227] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#5DC0E7]/30 z-20"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -15 }}
                >
                  <div className="w-full h-full bg-gradient-to-b from-[#5DC0E7]/20 to-[#212227] p-3">
                    <div className="w-full h-full bg-[#0A0A0F] rounded-2xl p-3 flex flex-col">
                      <div className="w-10 h-1 bg-[#5DC0E7]/50 rounded-full mx-auto mb-4"></div>

                      {/* App content */}
                      <div className="flex-1 space-y-4">
                        <div className="w-full h-48 bg-[#5DC0E7]/10 rounded-lg relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Smartphone className="h-12 w-12 text-[#5DC0E7]/30" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="w-full h-10 bg-[#5DC0E7]/10 rounded-lg"></div>
                          <div className="w-4/5 h-10 bg-[#5DC0E7]/10 rounded-lg"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-20 bg-[#5DC0E7]/15 rounded-lg"></div>
                          <div className="h-20 bg-[#5DC0E7]/15 rounded-lg"></div>
                          <div className="h-20 bg-[#5DC0E7]/15 rounded-lg"></div>
                          <div className="h-20 bg-[#5DC0E7]/15 rounded-lg"></div>
                        </div>

                        <div className="w-full h-14 bg-[#5DC0E7]/20 rounded-lg"></div>
                      </div>

                      {/* Bottom navigation */}
                      <div className="h-16 mt-4 bg-[#5DC0E7]/5 rounded-xl flex justify-around items-center px-4">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-[#5DC0E7]/15 flex items-center justify-center"
                          >
                            <div className="w-4 h-4 rounded-sm bg-[#5DC0E7]/30"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Mockup 3 */}
                <motion.div
                  className="absolute right-0 top-10 w-48 h-96 bg-[#212227] rounded-3xl overflow-hidden shadow-xl border-4 border-[#5DC0E7]/10 z-10"
                  initial={{ x: 100, opacity: 0, rotateY: 30 }}
                  whileInView={{ x: 0, opacity: 1, rotateY: 15 }}
                  transition={{ duration: 0.7 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <div className="w-full h-full bg-gradient-to-b from-[#5DC0E7]/20 to-[#212227] p-2">
                    <div className="w-full h-full bg-[#0A0A0F] rounded-2xl p-2">
                      <div className="w-8 h-1 bg-[#5DC0E7]/50 rounded-full mx-auto mb-2"></div>
                      <div className="space-y-2">
                        <div className="w-full h-10 bg-[#5DC0E7]/10 rounded-lg"></div>
                        <div className="w-full h-10 bg-[#5DC0E7]/10 rounded-lg"></div>
                        <div className="w-full h-10 bg-[#5DC0E7]/10 rounded-lg"></div>
                        <div className="w-full h-10 bg-[#5DC0E7]/10 rounded-lg"></div>
                        <div className="w-full h-10 bg-[#5DC0E7]/10 rounded-lg"></div>
                        <div className="w-full h-10 bg-[#5DC0E7]/10 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-[#5DC0E7]/10 rounded-full z-0"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#5DC0E7]/20 rounded-full z-0"></div>

              {/* Elementos flutuantes */}
              <motion.div
                className="absolute top-10 right-10 z-20"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Rocket className="h-12 w-12 text-[#5DC0E7]" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technologies - Mobile Tech Grid */}
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
              Trabalhamos com as tecnologias mais modernas para desenvolvimento de aplicativos mobile.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                name: "React Native",
                description: "Para apps híbridos de alta performance",
                icon: "/images/logo/ReactNative.png",
              },
              {
                name: "Flutter",
                description: "Framework multiplataforma do Google",
                icon: "/images/logo/flutter.png",
              },
              {
                name: "Swift",
                description: "Desenvolvimento nativo para iOS",
                icon: "/images/logo/swift.png",
              },
              {
                name: "Kotlin",
                description: "Desenvolvimento nativo para Android",
                icon: "/images/logo/kotlin.png",
              },
              {
                name: "Firebase",
                description: "Backend como serviço do Google",
                icon: "/images/logo/firebase.webp",
              },
              {
                name: "AWS Amplify",
                description: "Serviços de backend da Amazon",
                icon: "/images/logo/AWSAmplify.png",
              },
              {
                name: "GraphQL",
                description: "API flexível e eficiente",
                icon: "/images/logo/PostgreSQL.svg",
              },
              {
                name: "Redux",
                description: "Gerenciamento de estado",
                icon: "/images/logo/redux.svg",
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
                <Image src={tech.icon || "/placeholder.svg"} alt={tech.name} width={60} height={60} className="mb-4" />
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
                Pronto para criar seu <span className="text-[#5DC0E7]">aplicativo mobile</span>?
              </h2>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Entre em contato conosco e vamos transformar sua ideia em um aplicativo de sucesso.
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
          <Smartphone className="text-[#5DC0E7] w-full h-full" />
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
