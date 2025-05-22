"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { CheckCircle, Target, Award, Zap, Code, Star } from "lucide-react"
import SpaceBackground from "@/components/space-background"
import TechCarousel from "@/components/tech-carousel"

export default function SobrePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Efeito para animar o símbolo do infinito
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Ajusta o canvas para a resolução do dispositivo
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.scale(dpr, dpr)

    // Função para redimensionar o canvas
    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    window.addEventListener("resize", resizeCanvas)

    // Fórmula refinada para a curva do infinito
    function getInfinityPoint(t: number, scale = 1, offsetX = 0, offsetY = 0) {
      const x = Math.sin(t) * scale + offsetX
      const y = Math.sin(2 * t) * scale + offsetY
      return { x, y }
    }

    let progress = 0
    let glowPulse = 0

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const centerX = canvas.offsetWidth / 2
      const centerY = canvas.offsetHeight / 2

      // Desenha o símbolo ∞
      ctx.beginPath()
      for (let i = 0; i <= 1; i += 0.01) {
        const { x, y } = getInfinityPoint(i, 1, centerX, centerY)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = "#5DC0E7"
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      ctx.stroke()

      // Bolinha de energia com brilho pulsante
      const { x, y } = getInfinityPoint(progress, 1, centerX, centerY)
      const pulse = 1 + Math.sin(glowPulse) * 0.3 // brilho varia suavemente
      const glowRadius = 8 * pulse

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius)
      gradient.addColorStop(0, "rgba(255,255,255,1)")
      gradient.addColorStop(0.4, "rgba(255,255,255,0.5)")
      gradient.addColorStop(1, "rgba(255,255,255,0)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()

      progress += 0.0025
      if (progress >= 1) progress = 0

      glowPulse += 0.1

      requestAnimationFrame(animate)
    }

    const animationFrame = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <main className="flex flex-col items-center justify-center w-full">
      {/* Hero Section - Space Theme */}
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
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mx-auto mt-8 mb-12"
              >
                <div className="relative h-32 w-64 mx-auto">
                  <canvas ref={canvasRef} className="w-full h-full" />
                </div>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#FBFBFB]">
                Sobre a <span className="text-[#5DC0E7]">Infinity Group</span>
              </h1>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Conheça nossa história, missão, visão e valores que nos guiam no desenvolvimento de soluções digitais
                inovadoras que transformam o universo digital.
              </p>

              {/* Símbolo do infinito animado */}

            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="w-full py-20 bg-gradient-to-b from-[#0A0A0F] to-[#141420] text-[#FBFBFB]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#FBFBFB]">
                Conheça o <span className="text-[#5DC0E7]">Idealizador</span>
              </h2>
              <p className="text-lg mb-6 text-[#FBFBFB]/80">
                A Infinity Group foi fundada por <span className="text-[#5DC0E7] font-semibold">Kayky Paulino</span>, um
                desenvolvedor full-stack apaixonado por tecnologia e inovação. Com formação em Ciência da Computação,
                Kayky combina conhecimento técnico com visão estratégica para criar soluções digitais que realmente
                fazem a diferença.
              </p>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Sua experiência abrange desde o desenvolvimento de websites e aplicativos até a implementação de
                sistemas complexos de automação. Com um olhar sempre voltado para o futuro, ele lidera a Infinity Group
                com o compromisso de entregar excelência em cada projeto.
              </p>

              <div className="space-y-4 mt-8">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#5DC0E7]"></div>
                  <span className="text-[#FBFBFB]/80">Desenvolvedor Full-Stack</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#5DC0E7]"></div>
                  <span className="text-[#FBFBFB]/80">Formado em Ciência da Computação</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#5DC0E7]"></div>
                  <span className="text-[#FBFBFB]/80">Especialista em Soluções Digitais Inovadoras</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative order-1 lg:order-2"
            >
              <div className="relative z-10 rounded-full overflow-hidden shadow-2xl border-4 border-[#5DC0E7] w-96 h-96 mx-auto">
                <Image
                  src="/images/kayky.jpeg"
                  alt="Kayky Paulino - Fundador da Infinity Group"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-[#5DC0E7]/10 rounded-full z-0"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#5DC0E7]/20 rounded-full z-0"></div>

              {/* Floating elements around the founder */}
              <motion.div
                className="absolute top-0 right-1/4 w-10 h-10 z-20"
                animate={{
                  y: [0, -10, 0],
                  rotate: 360,
                }}
                transition={{
                  y: {
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: 10,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  },
                }}
              >
                <Code className="text-[#5DC0E7] w-full h-full" />
              </motion.div>

              <motion.div
                className="absolute bottom-10 left-1/4 w-8 h-8 z-20"
                animate={{
                  y: [0, 10, 0],
                  rotate: -360,
                }}
                transition={{
                  y: {
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: 15,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  },
                }}
              >
                <Star className="text-[#5DC0E7] w-full h-full" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company History */}
      <section className="w-full py-20 bg-[#FBFBFB]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#212227]">
                Nossa <span className="text-[#5DC0E7]">História</span>
              </h2>
              <p className="text-lg mb-6 text-[#212227]/80">
                A Infinity Group nasceu da paixão por tecnologia e da vontade de transformar ideias em soluções digitais
                que realmente funcionam. Fundada há mais de 2 anos, nossa empresa tem se destacado no mercado pelo
                compromisso com a qualidade e inovação.
              </p>
              <p className="text-lg mb-8 text-[#212227]/80">
                Começamos como uma pequena equipe de desenvolvedores entusiastas e hoje contamos com profissionais
                especializados em diversas áreas da tecnologia, prontos para enfrentar os desafios mais complexos e
                entregar resultados excepcionais.
              </p>
              <p className="text-lg mb-8 text-[#212227]/80">
                Nossa trajetória é marcada por projetos bem-sucedidos e clientes satisfeitos, que confiam em nossa
                capacidade de transformar suas ideias em realidade digital.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Timeline */}
              <div className="relative z-10 bg-white p-8 rounded-lg shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-[#212227]">Nossa Linha do Tempo</h3>

                <div className="space-y-8">
                  {[
                    {
                      year: "2022",
                      title: "Fundação",
                      description: "Início das operações com foco em websites e sistemas web.",
                    },
                    {
                      year: "2023",
                      title: "Expansão",
                      description: "Ampliação do portfólio para incluir aplicativos mobile e automações.",
                    },
                    {
                      year: "2024",
                      title: "Consolidação",
                      description: "Fortalecimento da marca e expansão da carteira de clientes.",
                    },
                    {
                      year: "2025",
                      title: "Futuro",
                      description: "Novas tecnologias e soluções inovadoras em desenvolvimento.",
                    },
                  ].map((item, index) => (
                    <div key={index} className="relative pl-10">
                      <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-[#5DC0E7] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                      {index < 3 && <div className="absolute left-3 top-6 bottom-0 w-0.5 h-16 bg-[#5DC0E7]/30"></div>}
                      <div>
                        <span className="text-[#5DC0E7] font-bold">{item.year}</span>
                        <h4 className="text-lg font-bold text-[#212227] mt-1">{item.title}</h4>
                        <p className="text-[#212227]/80 mt-2">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-[#5DC0E7]/10 rounded-full z-0"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#5DC0E7]/20 rounded-full z-0"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values - Space Theme */}
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
              Missão, Visão e <span className="text-[#5DC0E7]">Valores</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#FBFBFB]/80">
              Nossos princípios fundamentais que guiam todas as nossas ações e decisões.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              viewport={{ once: true }}
              className="bg-[#FBFBFB]/5 p-8 rounded-lg backdrop-blur-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[#5DC0E7]"></div>
              <div className="absolute top-0 left-0 w-0 h-1 bg-[#FBFBFB] group-hover:w-full transition-all duration-500"></div>
              <div className="text-[#5DC0E7] mb-6">
                <Target className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#FBFBFB]">Missão</h3>
              <p className="text-[#FBFBFB]/80">
                Oferecer soluções digitais que realmente funcionam, com foco em inovação, qualidade e resultado.
                Buscamos transformar ideias em realidade digital, superando expectativas e gerando valor para nossos
                clientes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-[#FBFBFB]/5 p-8 rounded-lg backdrop-blur-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[#5DC0E7]"></div>
              <div className="absolute top-0 left-0 w-0 h-1 bg-[#FBFBFB] group-hover:w-full transition-all duration-500"></div>
              <div className="text-[#5DC0E7] mb-6">
                <Zap className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#FBFBFB]">Visão</h3>
              <p className="text-[#FBFBFB]/80">
                Ser referência nacional no desenvolvimento de sistemas, sites e automações inteligentes. Queremos ser
                reconhecidos pela excelência técnica, inovação constante e capacidade de entregar soluções que
                transformam negócios.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-[#FBFBFB]/5 p-8 rounded-lg backdrop-blur-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[#5DC0E7]"></div>
              <div className="absolute top-0 left-0 w-0 h-1 bg-[#FBFBFB] group-hover:w-full transition-all duration-500"></div>
              <div className="text-[#5DC0E7] mb-6">
                <Award className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#FBFBFB]">Valores</h3>
              <ul className="space-y-3 text-[#FBFBFB]/80">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#5DC0E7] mr-2 shrink-0 mt-0.5" />
                  <span>Inovação e Qualidade em tudo que fazemos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#5DC0E7] mr-2 shrink-0 mt-0.5" />
                  <span>Marketing Estratégico voltado para performance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#5DC0E7] mr-2 shrink-0 mt-0.5" />
                  <span>Prometemos menos e entregamos mais</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#5DC0E7] mr-2 shrink-0 mt-0.5" />
                  <span>Soluções inteligentes e seguras</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#5DC0E7] mr-2 shrink-0 mt-0.5" />
                  <span>Transparência e ética em todas as relações</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technologies - Interactive */}
      <section className="w-full py-20 bg-gradient-to-b from-[#0A0A0F] to-[#FBFBFB]">
        <div className="container mx-auto px-4">
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
              Trabalhamos com as tecnologias mais modernas e eficientes do mercado.
            </p>
          </motion.div>

          <TechCarousel />
        </div>
      </section>

      {/* Why Choose Us - Interactive */}
      <section className="w-full py-20 bg-[#FBFBFB] relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#212227]">
              Por que escolher a <span className="text-[#5DC0E7]">Infinity Group</span>?
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#212227]/80">
              Descubra o que nos diferencia e por que somos a escolha certa para o seu próximo projeto digital.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-lg shadow-xl border border-gray-100"
            >
              <h3 className="text-2xl font-bold mb-6 text-[#5DC0E7]">Nossa Abordagem</h3>
              <p className="text-[#212227]/80 mb-6">
                Trabalhamos de forma colaborativa, envolvendo nossos clientes em todas as etapas do processo.
                Acreditamos que a comunicação clara e a transparência são fundamentais para o sucesso de qualquer
                projeto.
              </p>
              <p className="text-[#212227]/80">
                Nossa metodologia ágil permite adaptações rápidas e entregas contínuas, garantindo que o produto final
                atenda perfeitamente às necessidades do cliente e do mercado.
              </p>

              {/* Interactive element */}
              <motion.div
                className="mt-8 p-4 bg-[#F0F0F0] rounded-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h4 className="font-bold text-[#212227] mb-2">Metodologia de Trabalho</h4>
                <div className="flex justify-between">
                  {["Planejamento", "Design", "Desenvolvimento", "Testes", "Entrega"].map((step, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#5DC0E7] flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-xs mt-2 text-center">{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-lg shadow-xl border border-gray-100"
            >
              <h3 className="text-2xl font-bold mb-6 text-[#5DC0E7]">Nosso Compromisso</h3>
              <p className="text-[#212227]/80 mb-6">
                Estamos comprometidos com a excelência técnica e a satisfação do cliente. Cada projeto é tratado com
                dedicação e cuidado, como se fosse nosso próprio negócio.
              </p>
              <p className="text-[#212227]/80">
                Nosso compromisso vai além da entrega do projeto. Oferecemos suporte contínuo e estamos sempre
                disponíveis para ajudar nossos clientes a evoluírem suas soluções digitais.
              </p>

              {/* Interactive element */}
              <motion.div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { title: "Suporte 24/7", value: "100%" },
                  { title: "Satisfação", value: "98%" },
                  { title: "Projetos no Prazo", value: "95%" },
                  { title: "Clientes Recorrentes", value: "80%" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="bg-[#F0F0F0] p-4 rounded-lg text-center"
                    whileHover={{ y: -5, backgroundColor: "#E6F7FF" }}
                  >
                    <h4 className="font-bold text-[#212227]">{stat.title}</h4>
                    <p className="text-[#5DC0E7] text-xl font-bold">{stat.value}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#5DC0E7]/5 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-[#5DC0E7]/5 rounded-full"></div>
      </section>
    </main>
  )
}
