"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  CheckCircle,
  Code,
  Database,
  Globe,
  Laptop,
  Phone,
  Server,
  Rocket,
  Star,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import TechCarousel from "@/components/tech-carousel"
import ServiceCard from "@/components/service-card"
import TestimonialCarousel from "@/components/testimonial-carousel"
import StatsCounter from "@/components/stats-counter"
import InfinityAnimation from "@/components/infinity-animation"
import { motion, useScroll, useTransform } from "framer-motion"
import SpaceBackground from "@/components/space-background"

export default function Home() {
  const [animationComplete, setAnimationComplete] = useState(false)
  const scrollRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  // Parallax effect for floating elements
  const [floatingElements, setFloatingElements] = useState<
    { id: number; x: number; y: number; size: number; rotation: number; delay: number; type: string }[]
  >([])

  useEffect(() => {
    // Create floating elements
    const elements = []
    for (let i = 0; i < 15; i++) {
      elements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 30 + 10,
        rotation: Math.random() * 360,
        delay: Math.random() * 5,
        type: Math.random() > 0.7 ? "circle" : Math.random() > 0.5 ? "star" : "dot",
      })
    }
    setFloatingElements(elements)
  }, [])

  return (
    <main className="flex flex-col items-center justify-center w-full overflow-hidden">
      {/* Hero Section */}
      <section
        ref={scrollRef}
        className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0B0B13] text-white"
      >
        {/* Space Background */}
        <div className="fixed inset-0 z-0">
          <SpaceBackground />
        </div>

        {/* Floating UI Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          {floatingElements.map((element) => (
            <motion.div
              key={element.id}
              className="absolute opacity-20"
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                width: element.size,
                height: element.size,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [element.rotation, element.rotation + 10, element.rotation],
              }}
              transition={{
                duration: 10 + element.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: element.delay,
              }}
            >
              {element.type === "circle" ? (
                <div className="w-full h-full rounded-full bg-[#5DC0E7]" />
              ) : element.type === "star" ? (
                <Star className="w-full h-full text-[#5DC0E7]" />
              ) : (
                <div className="w-full h-full rounded-full bg-white" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B13]/30 via-transparent to-[#0B0B13] z-10"></div>
          <div className="grid grid-cols-12 grid-rows-12 h-full w-full opacity-10">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-[#5DC0E7]/20"></div>
            ))}
          </div>
        </div>

        <motion.div className="container mx-auto px-4 py-20 z-10 relative" style={{ opacity, scale }}>
          <div className="max-w-4xl mx-auto text-center">
            {!animationComplete ? (
              <InfinityAnimation onComplete={() => setAnimationComplete(true)} />
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                    Tem uma ideia? <span className="text-[#5DC0E7]">Aqui ela vira realidade.</span>
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <p className="text-lg md:text-xl mb-8 text-white/90">
                    Desenvolvemos seu aplicativo, site, loja virtual ou sistema personalizado — e automatizamos seus
                    processos do dia a dia.
                  </p>
                  <p className="text-lg md:text-xl mb-12 text-white/90">
                    Utilizamos tecnologia de ponta, design intuitivo e estratégias inteligentes para criar soluções web
                    e mobile que geram resultados reais para o seu negócio.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Button
                    asChild
                    size="lg"
                    className="bg-[#5DC0E7] hover:bg-[#5DC0E7]/80 text-white shadow-[0_0_15px_rgba(93,192,231,0.5)]"
                  >
                    <Link href="/orcamento">
                      Solicitar Orçamento <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-[#5DC0E7] text-[#5DC0E7] hover:bg-[#5DC0E7]/10 shadow-[0_0_15px_rgba(93,192,231,0.3)]"
                  >
                    <Link href="/portfolio">Ver Projetos</Link>
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="flex flex-col items-center">
            <p className="text-white/60 mb-2 text-sm">Scroll para explorar</p>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <motion.div
                className="w-1.5 h-1.5 bg-white rounded-full mt-2"
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="w-full py-24 bg-[#0B0B13] relative z-10">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#0B0B13] to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#0B0B13] to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <div className="w-16 h-16 mx-auto bg-[#0F0F1A] rounded-full flex items-center justify-center border border-[#5DC0E7] shadow-[0_0_15px_rgba(93,192,231,0.5)]">
                <Rocket className="h-8 w-8 text-[#5DC0E7]" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Nossos <span className="text-[#5DC0E7]">Serviços</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-white/80">
              Oferecemos soluções completas para transformar sua ideia em realidade, com foco em qualidade e resultados.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="h-6 w-6" />,
                title: "Web Sites",
                description: "Sites institucionais modernos, rápidos, responsivos e otimizados para SEO.",
                link: "/servicos/websites",
              },
              {
                icon: <Database className="h-6 w-6" />,
                title: "E-commerce",
                description: "Lojas virtuais integradas com gateways de pagamento, automações e funis de vendas.",
                link: "/servicos/ecommerce",
              },
              {
                icon: <Phone className="h-6 w-6" />,
                title: "Aplicativos para Celular",
                description: "Desenvolvimento de apps Android e iOS personalizados com UX otimizada.",
                link: "/servicos/aplicativos-celular",
              },
              {
                icon: <Laptop className="h-6 w-6" />,
                title: "Aplicativos para Computador",
                description: "Softwares para uso interno de empresas com foco em performance e produtividade.",
                link: "/servicos/aplicativos-computador",
              },
              {
                icon: <Code className="h-6 w-6" />,
                title: "Automações",
                description: "Automatize tarefas repetitivas e integre sistemas para acelerar seus processos.",
                link: "/servicos/automacoes",
              },
              {
                icon: <Server className="h-6 w-6" />,
                title: "Consultoria",
                description: "Consultoria técnica especializada para otimizar seus processos e sistemas.",
                link: "/servicos/consultoria",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ServiceCard
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  link={service.link}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* About Section with 3D effect */}
      <section id="sobre" className="w-full py-24 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#0B0B13]">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover opacity-5"></div>
        </div>

        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 30% 50%, rgba(93, 192, 231, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(156, 93, 231, 0.05) 0%, transparent 50%)",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="inline-block mb-6">
                <div className="w-16 h-16 bg-[#0F0F1A] rounded-full flex items-center justify-center border border-[#5DC0E7] shadow-[0_0_15px_rgba(93,192,231,0.5)]">
                  <Sparkles className="h-8 w-8 text-[#5DC0E7]" />
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Quem somos – <span className="text-[#5DC0E7]">Infinity Group</span>
              </h2>

              <p className="text-lg mb-6 text-white/80">
                A Infinity Group é uma empresa focada em desenvolvimento de soluções digitais. Há mais de 2 anos no
                mercado, entregamos projetos funcionais e personalizados que transformam sonhos em realidade.
              </p>

              <p className="text-lg mb-8 text-white/80">
                Atuamos com excelência e profissionalismo, ajudando nossos clientes a crescerem com tecnologia de alto
                nível.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="bg-[#12121E] p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-[#5DC0E7]/20 hover:border-[#5DC0E7]/40 transition-all">
                  <h3 className="text-xl font-bold mb-3 text-white">Missão</h3>
                  <p className="text-white/80">
                    Oferecer soluções digitais que realmente funcionam, com foco em inovação, qualidade e resultado.
                  </p>
                </div>

                <div className="bg-[#12121E] p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-[#5DC0E7]/20 hover:border-[#5DC0E7]/40 transition-all">
                  <h3 className="text-xl font-bold mb-3 text-white">Visão</h3>
                  <p className="text-white/80">
                    Ser referência nacional no desenvolvimento de sistemas, sites e automações inteligentes.
                  </p>
                </div>

                <div className="bg-[#12121E] p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-[#5DC0E7]/20 hover:border-[#5DC0E7]/40 transition-all">
                  <h3 className="text-xl font-bold mb-3 text-white">Valores</h3>
                  <ul className="space-y-2 text-white/80">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#5DC0E7] mr-2 shrink-0 mt-0.5" />
                      <span>Inovação e Qualidade</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#5DC0E7] mr-2 shrink-0 mt-0.5" />
                      <span>Marketing Estratégico</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#5DC0E7] mr-2 shrink-0 mt-0.5" />
                      <span>Entrega de valor</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-[#5DC0E7]/30">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#5DC0E7]/20 to-transparent z-10"></div>
                <Image
                  src="/images/coceitoapp.jpg"
                  alt="Infinity Group Team"
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#5DC0E7]/5 rounded-full z-0 blur-xl"></div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#5DC0E7]/10 rounded-full z-0 blur-xl"></div>

              {/* Floating elements */}
              <motion.div
                className="absolute -top-5 -right-5 w-10 h-10 z-20"
                animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
              >
                <div className="w-full h-full rounded-full bg-[#5DC0E7]/30 backdrop-blur-sm border border-[#5DC0E7]/50"></div>
              </motion.div>

              <motion.div
                className="absolute -bottom-5 -left-5 w-14 h-14 z-20"
                animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              >
                <div className="w-full h-full rounded-full bg-[#5DC0E7]/20 backdrop-blur-sm border border-[#5DC0E7]/40"></div>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="mt-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { end: 10, suffix: "+", label: "Projetos entregues" },
                { end: 4.9, decimals: 1, suffix: "", label: "Avaliação média" },
                { end: 24, suffix: "/7", label: "Suporte técnico" },
                { end: 100, suffix: "%", label: "Satisfação garantida" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-[#12121E] p-8 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-[#5DC0E7]/20"
                >
                  <StatsCounter end={stat.end} suffix={stat.suffix} label={stat.label} decimals={stat.decimals || 0} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section id="tecnologias" className="w-full py-24 bg-[#0B0B13] relative z-10">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 70% 50%, rgba(93, 192, 231, 0.1) 0%, transparent 50%), radial-gradient(circle at 30% 30%, rgba(156, 93, 231, 0.05) 0%, transparent 50%)",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <div className="w-16 h-16 mx-auto bg-[#0F0F1A] rounded-full flex items-center justify-center border border-[#5DC0E7] shadow-[0_0_15px_rgba(93,192,231,0.5)]">
                <Code className="h-8 w-8 text-[#5DC0E7]" />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Tecnologias que <span className="text-[#5DC0E7]">utilizamos</span>
            </h2>

            <p className="text-lg max-w-3xl mx-auto text-white/80">
              Trabalhamos com as tecnologias mais modernas e eficientes do mercado.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <TechCarousel />
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="w-full py-24 bg-[#0B0B13] relative z-10">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 20% 50%, rgba(93, 192, 231, 0.1) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(156, 93, 231, 0.05) 0%, transparent 40%)",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <div className="w-16 h-16 mx-auto bg-[#0F0F1A] rounded-full flex items-center justify-center border border-[#5DC0E7] shadow-[0_0_15px_rgba(93,192,231,0.5)]">
                <Star className="h-8 w-8 text-[#5DC0E7]" />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              O que nossos <span className="text-[#5DC0E7]">clientes</span> dizem
            </h2>

            <p className="text-lg max-w-3xl mx-auto text-white/80">
              A satisfação dos nossos clientes é o nosso maior orgulho. Confira alguns depoimentos.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <TestimonialCarousel />
          </motion.div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section id="portfolio-preview" className="w-full py-24 bg-[#0B0B13] relative z-10">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 30% 70%, rgba(93, 192, 231, 0.1) 0%, transparent 40%), radial-gradient(circle at 70% 20%, rgba(156, 93, 231, 0.05) 0%, transparent 40%)",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <div className="w-16 h-16 mx-auto bg-[#0F0F1A] rounded-full flex items-center justify-center border border-[#5DC0E7] shadow-[0_0_15px_rgba(93,192,231,0.5)]">
                <Laptop className="h-8 w-8 text-[#5DC0E7]" />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Nosso <span className="text-[#5DC0E7]">Portfólio</span>
            </h2>

            <p className="text-lg max-w-3xl mx-auto text-white/80">
              Conheça alguns dos projetos que desenvolvemos e os resultados que alcançamos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                image: "/images/projetos-home/Projeto01.png",
                title: "JH Telecom",
                description: "Site gerador de parcerias",
                tech: ["React", "Node.js", "MongoDB"],
              },
              {
                image: "/images/projetos-home/Projeto03.png",
                title: "ACC Telecom",
                description: "Geração de leads + automações internas",
                tech: ["Next.js", "Firebase", "Tailwind CSS"],
              },
              {
                image: "/images/projetos-home/Projeto02.png",
                title: "Emilie Banko",
                description: "Site para locação de casas com captação de leads",
                tech: ["React", "PostgreSQL"],
              },
            ].map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#12121E] rounded-lg overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-[#5DC0E7]/20 hover:border-[#5DC0E7]/40 transition-all group"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    width={600}
                    height={400}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B13] to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech, i) => (
                        <span key={i} className="bg-[#5DC0E7]/80 text-white text-xs px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">{project.title}</h3>
                  <p className="text-white/80 mb-4">{project.description}</p>
                  <Link
                    href={`/portfolio/${project.title.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-[#5DC0E7] font-medium hover:text-[#5DC0E7]/80 flex items-center"
                  >
                    Ver detalhes <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-[#5DC0E7] text-[#5DC0E7] hover:bg-[#5DC0E7]/10 bg-transparent shadow-[0_0_15px_rgba(93,192,231,0.3)]"
            >
              <Link href="/portfolio">
                Ver todos os projetos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 bg-[#0B0B13] relative z-10">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(93, 192, 231, 0.15) 0%, transparent 70%)",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-[#12121E] rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] p-12 border border-[#5DC0E7]/20 text-center"
            style={{
              background: "linear-gradient(to bottom right, rgba(18, 18, 30, 0.9), rgba(11, 11, 19, 0.9))",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(93, 192, 231, 0.1)",
            }}
          >
            <div className="inline-block mb-6">
              <div className="w-20 h-20 mx-auto bg-[#0F0F1A] rounded-full flex items-center justify-center border border-[#5DC0E7] shadow-[0_0_15px_rgba(93,192,231,0.5)]">
                <Rocket className="h-10 w-10 text-[#5DC0E7]" />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Pronto para <span className="text-[#5DC0E7]">transformar</span> suas ideias em realidade?
            </h2>

            <p className="text-lg mb-8 text-white/80">
              Entre em contato conosco e vamos conversar sobre o seu projeto. O primeiro orçamento é gratuito!
            </p>

            <Button
              asChild
              size="lg"
              className="bg-[#5DC0E7] hover:bg-[#5DC0E7]/80 text-white shadow-[0_0_15px_rgba(93,192,231,0.5)]"
            >
              <Link href="/orcamento">
                Solicitar Orçamento <Rocket className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Animated Stars */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.3,
              animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 5}s`,
            }}
          />
        ))}
        <style jsx global>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    </main>
  )
}
