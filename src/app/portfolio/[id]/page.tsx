/* eslint-disable react/no-unescaped-entities */
"use client"

import { useParams, notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, ExternalLink, Star, Rocket, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import { useState, useEffect } from "react"

// Dados de exemplo para o portfólio
const portfolioItems = [
  {
    id: "acc-telecom",
    title: "ACC Telecom",
    category: "website",
    description: "Captação de leads",
    fullDescription:
      "Desenvolvimento de um site institucional moderno com sistema de captação de leads e apresentação de serviços de telecomunicações",
    challenge:
      "A Acc não tinha nenhum forma de comunicação visual online , sem traser uma presença online para seus clientes",
    solution:
      "Criamos um site institucional moderno com sistema de captação de leads e apresentação de serviços de telecomunicações",
    image: "/images/portfolio/Acctelecom/Projeto01.png",
    gallery: [
      "/images/portfolio/Acctelecom/Projeto01.png",
      "/images/portfolio/Acctelecom/Projeto02.png",
      "/images/portfolio/Acctelecom/Projeto03.png",
    ],
    technologies: ["Next.js", "Tailwind CSS", "Node.js", "React"],
    features: [
      "Dashboard personalizado",
      "Automação de processos internos",
      "Sistema de qualificação de leads",
      "Integração com ferramentas de marketing",
      "Relatórios em tempo real",
    ],
    results: "Redução de 70% no tempo gasto em tarefas administrativas e aumento de 200% na conversão de leads.",
    testimonial: {
      content:
        "A automação implementada pela Infinity Group transformou completamente nossos processos internos. Conseguimos atender mais clientes com a mesma equipe e aumentamos significativamente nossas vendas.",
      author: "Mariana Costa",
      role: "CEO, ACC Telecom",
    },
    url: "https://acctelecom.com.br",
  },
  {
    id: "emilie-banko",
    title: "Emilie Banko",
    category: "website",
    description: "Site para locação de casas com captação de leads",
    fullDescription:
      "Plataforma para exibição e locação de imóveis com sistema integrado de captação e qualificação de leads.",
    challenge:
      "Emilie Banko precisava de uma plataforma que exibisse seu portfólio de imóveis de forma atraente e, ao mesmo tempo, facilitasse o processo de agendamento de visitas e captação de potenciais locatários.",
    solution:
      "Desenvolvemos um site com galeria de imóveis de alta qualidade, sistema de busca avançada e formulários inteligentes para agendamento de visitas e captação de leads.",
    image: "/images/portfolio/EmilieBanko/Projeto01.png",
    gallery: [
      "/images/portfolio/EmilieBanko/Projeto01.png",
      "/images/portfolio/EmilieBanko/Projeto02.png",
      "/images/portfolio/EmilieBanko/Projeto03.png",
    ],
    technologies: ["React", "PostgreSQL", "Node.js", "Tailwind CSS"],
    features: [
      "Galeria de imóveis com filtros avançados",
      "Sistema de agendamento de visitas",
      "Painel administrativo para gestão de imóveis",
      "Integração com WhatsApp",
      "Otimização para dispositivos móveis",
    ],
    results: "Aumento de 120% nas solicitações de visitas aos imóveis e 80% na taxa de conversão.",
    testimonial: {
      content:
        "O site desenvolvido pela Infinity Group revolucionou meu negócio. A qualidade das imagens e a facilidade de navegação atraem muito mais clientes, e o sistema de agendamento de visitas simplificou todo o processo.",
      author: "Emilie Banko",
      role: "Proprietária",
    },
    url: "https://emilie-banko-k2kj4990t-kaykypaulinoalvesdossantos.vercel.app",
  },
  {
    id: "super-telecom",
    title: "Super Telecom",
    category: "website",
    description: "Site para locação de casas com aquisição de leads",
    fullDescription:
      "Desenvolvimento de um site institucional para apresentar a empresa, destacando seus produtos e serviços, e captar leads de forma estratégica",
    challenge:
        "A Super Telecom precisava migrar de um site antigo e limitado para um site moderno e funcional que pudesse captar leads de forma estratégica",
    solution:
      "Desenvolvemos um site institucional para apresentar a empresa, destacando seus produtos e serviços, e captar leads de forma estratégica",
    image: "/images/portfolio/Supertelecom/Projeto01.png",
    gallery: [
      "/images/portfolio/Supertelecom/Projeto01.png",
      "/images/portfolio/Supertelecom/Projeto02.png",
      "/images/portfolio/Supertelecom/Projeto03.png",
    ],
    technologies: ["React", "Node.js", "Tailwind CSS"],
    features: [
      "Design responsivo e moderno",
      "Sistema de captação de leads",
      "Painel administrativo personalizado",
      "Integração com CRM",
      "Otimização para SEO",
    ],
    results: "Aumento de 300% nas vendas online em comparação com a plataforma anterior.",
    testimonial: {
      content:
        "O site desenvolvido pela Infinity Group revolucionou meu negócio. A qualidade das imagens e a facilidade de navegação atraem muito mais clientes, e o sistema de agendamento de visitas simplificou todo o processo.",
      author: "Roberto Almeida",
      role: "Diretor, Super Telecom",
    },
    url: "https://super-telecom.vercel.app",
  },
  {
    id: "algartelecom",
    title: "Algar Telecom",
    category: "website",
    description: "Site institucional para apresentação de serviços de telecomunicações",
    fullDescription:
      "Desenvolvimento de um site institucional para apresentar a empresa, destacando seus produtos e serviços, e captar leads de forma estratégica",
    challenge:
      "A Algar Telecom precisava de um site institucional para apresentar a empresa, destacando seus produtos e serviços, e captar leads de forma estratégica",
    solution:
      "Desenvolvemos um site institucional para apresentar a empresa, destacando seus produtos e serviços, e captar leads de forma estratégica",
    image: "/images/portfolio/Algartelecom/Projeto01.png",
    gallery: [
      "/images/portfolio/Algartelecom/Projeto01.png",
      "/images/portfolio/Algartelecom/Projeto02.png",
      "/images/portfolio/Algartelecom/Projeto03.png",
    ],
    technologies: ["Next.js", "Tailwind CSS"],
    features: [
      "Produtos e serviços",
      "Sobre nós",
      "Contato",
    ],
    results: "Mais de 1.000 visitas por mês, e 100% de satisfação dos clientes",
    testimonial: {
      content:
        "O site desenvolvido pela Infinity Group revolucionou meu negócio. A qualidade das imagens e a facilidade de navegação atraem muito mais clientes, a apresntação do produto foi de fácil entendimento e acesso",
      author: "Roberto Almeida",
      role: "Diretor, Algar Telecom",
    },
    url: "https://comercialalgar.com.br",
  },
  {
    id: "jh-telecom",
    title: "JH Telecom",
    category: "website",
    description: "Site gerador de parcerias",
    fullDescription:
      "Desenvolvimento de um site institucional moderno com sistema de captação de leads para geração de parcerias comerciais.",
    challenge:
      "A JH Telecom precisava de uma presença online profissional que refletisse a qualidade de seus serviços e, ao mesmo tempo, funcionasse como uma ferramenta eficiente para captação de novos parceiros de negócios.",
    solution:
      "Desenvolvemos um site responsivo e otimizado para SEO, com um design moderno e profissional. Implementamos um sistema de formulários inteligentes para qualificação de leads e integração com ferramentas de CRM.",
    image: "/images/portfolio/Jhtelecom/Projeto01.png",
    gallery: [
      "/images/portfolio/Jhtelecom/Projeto01.png",
      "/images/portfolio/Jhtelecom/Projeto02.png",
      "/images/portfolio/Jhtelecom/Projeto03.png",
    ],
    technologies: ["React", "Node.js", "Tailwind CSS"],
    features: [
      "Design responsivo e moderno",
      "Sistema de captação de leads",
      "Painel administrativo personalizado",
      "Integração com CRM",
      "Otimização para SEO",
    ],
    results: "Aumento de 150% na geração de leads qualificados em apenas 3 meses.",
    testimonial: {
      content:
        "A Infinity Group entendeu perfeitamente nossas necessidades e entregou um site que superou nossas expectativas. O sistema de captação de leads transformou nossa forma de fazer negócios.",
      author: "Carlos Mendes",
      role: "Diretor Comercial, JH Telecom",
    },
    url: "https://jhtelecom.com.br",
  },
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const project = portfolioItems.find((item) => item.id === id)
  const [activeImage, setActiveImage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simula carregamento
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (!project) {
    notFound()
  }

  return (
    <main className="flex flex-col items-center justify-center w-full">
      {/* Hero Section - Space Theme */}
      <section className="w-full py-20 bg-[#0A0A0F] text-[#FBFBFB] relative overflow-hidden">
        <SpaceBackground />

        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F]/90 to-[#0A0A0F]/80 z-10"></div>
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full opacity-20">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-[#5DC0E7]/20"></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 z-10 relative">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/portfolio"
              className="inline-flex items-center text-[#FBFBFB]/80 hover:text-[#5DC0E7] mb-8 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o portfólio
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center mb-4">
                <span className="text-xs bg-[#5DC0E7] text-white px-3 py-1 rounded-full uppercase">
                  {project.category === "website"
                    ? "Website"
                    : project.category === "ecommerce"
                      ? "E-commerce"
                      : project.category === "mobile"
                        ? "App Mobile"
                        : project.category === "desktop"
                          ? "App Desktop"
                          : "Automação"}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#FBFBFB]">{project.title}</h1>
              <p className="text-xl mb-8 text-[#FBFBFB]/80">{project.fullDescription}</p>

              <div className="flex flex-wrap gap-2 mb-8">
                {project.technologies.map((tech, index) => (
                  <motion.span
                    key={index}
                    className="bg-[#FBFBFB]/10 text-[#FBFBFB] px-3 py-1 rounded-full text-sm"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(93, 192, 231, 0.2)" }}
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>

              {project.url && (
                <motion.a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[#5DC0E7] hover:text-[#5DC0E7]/80 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  Visitar projeto <ExternalLink className="ml-2 h-4 w-4" />
                </motion.a>
              )}
            </motion.div>
          </div>
        </div>

        {/* Elementos flutuantes */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-16 h-16 z-10"
          animate={{
            y: [0, -15, 0],
            rotate: 360,
          }}
          transition={{
            y: {
              duration: 4,
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
          <Rocket className="text-[#5DC0E7]/30 w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute bottom-1/4 left-1/4 w-12 h-12 z-10"
          animate={{
            y: [0, 15, 0],
            rotate: -360,
          }}
          transition={{
            y: {
              duration: 5,
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
          <Star className="text-[#5DC0E7]/20 w-full h-full" />
        </motion.div>
      </section>

      {/* Project Image - Interactive Gallery */}
      <section className="w-full py-12 bg-gradient-to-b from-[#0A0A0F] to-[#FBFBFB]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-lg overflow-hidden shadow-2xl border-4 border-[#5DC0E7]/20"
          >
            {isLoading ? (
              <div className="w-full h-[600px] bg-[#212227] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#5DC0E7]"></div>
              </div>
            ) : (
              <div className="relative">
                <Image
                  src={project.gallery[activeImage]}
                  alt={project.title}
                  width={1200}
                  height={800}
                  className="w-full h-[500px] object-cover rounded-lg"
                />

                {/* Controles da galeria */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {project.gallery.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        activeImage === index ? "bg-[#5DC0E7] scale-125" : "bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Ver imagem ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Botões de navegação */}
                {project.gallery.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((prev) => (prev === 0 ? project.gallery.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
                      aria-label="Imagem anterior"
                    >
                      <ArrowLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => setActiveImage((prev) => (prev === project.gallery.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
                      aria-label="Próxima imagem"
                    >
                      <ArrowRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>

          {/* Miniaturas */}
          <div className="mt-4 flex justify-center gap-4">
            {project.gallery.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={project.title}
                width={200}
                height={150}
                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Project Details - Interactive Sections */}
      <section className="w-full py-20 bg-[#FBFBFB]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="mb-12 p-8 bg-white rounded-lg shadow-lg border-l-4 border-[#5DC0E7]"
                whileHover={{
                  x: 5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <h2 className="text-3xl font-bold mb-6 text-[#212227]">O Desafio</h2>
                <p className="text-lg text-[#212227]/80">{project.challenge}</p>
              </motion.div>

              <motion.div
                className="mb-12 p-8 bg-white rounded-lg shadow-lg border-l-4 border-[#5DC0E7]"
                whileHover={{
                  x: 5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <h2 className="text-3xl font-bold mb-6 text-[#212227]">Nossa Solução</h2>
                <p className="text-lg mb-8 text-[#212227]/80">{project.solution}</p>

                <h3 className="text-xl font-bold mb-4 text-[#212227]">Principais Funcionalidades</h3>
                <ul className="space-y-3 mb-0">
                  {project.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start text-[#212227]/80"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ x: 5 }}
                    >
                      <CheckCircle className="h-5 w-5 text-[#5DC0E7] mr-2 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                className="p-8 bg-white rounded-lg shadow-lg border-l-4 border-[#5DC0E7]"
                whileHover={{
                  x: 5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <h2 className="text-3xl font-bold mb-6 text-[#212227]">Resultados</h2>
                <p className="text-lg text-[#212227]/80">{project.results}</p>

                {/* Gráfico de resultados animado */}
                <div className="mt-6 h-8 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#5DC0E7] rounded-full"
                    initial={{ width: "0%" }}
                    whileInView={{ width: "80%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    viewport={{ once: true }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-sm text-[#212227]/60">
                  <span>Antes</span>
                  <span>Depois</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="mb-12 p-8 bg-white rounded-lg shadow-lg"
                whileHover={{
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <h2 className="text-3xl font-bold mb-6 text-[#212227]">Tecnologias Utilizadas</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.technologies.map((tech, index) => (
                    <motion.div
                      key={index}
                      className="bg-[#F0F0F0] p-4 rounded-lg text-center"
                      whileHover={{ y: -5, backgroundColor: "#E6F7FF" }}
                    >
                      <span className="font-medium text-[#212227]">{tech}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {project.testimonial && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-[#212227] rounded-lg p-8 text-[#FBFBFB] relative shadow-xl"
                >
                  <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 text-[#5DC0E7] opacity-20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                    </svg>
                  </div>

                  <h3 className="text-xl font-bold mb-4 text-[#FBFBFB]">Depoimento do Cliente</h3>
                  <p className="text-lg mb-6 italic text-[#FBFBFB]/80">"{project.testimonial.content}"</p>
                  <div>
                    <p className="font-bold text-[#FBFBFB]">{project.testimonial.author}</p>
                    <p className="text-[#5DC0E7]">{project.testimonial.role}</p>
                  </div>
                </motion.div>
              )}

              {/* Linha do tempo do projeto */}
              <motion.div
                className="mt-12 p-8 bg-white rounded-lg shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold mb-6 text-[#212227]">Linha do Tempo do Projeto</h3>
                <div className="space-y-6">
                  {["Planejamento", "Design", "Desenvolvimento", "Testes", "Lançamento"].map((phase, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <motion.div
                        className="h-10 w-10 rounded-full bg-[#5DC0E7] flex items-center justify-center text-white font-bold text-sm mr-4"
                        whileHover={{ scale: 1.1 }}
                      >
                        {index + 1}
                      </motion.div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#212227]">{phase}</h4>
                        <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <motion.div
                            className="h-full bg-[#5DC0E7]"
                            initial={{ width: "0%" }}
                            whileInView={{ width: "100%" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Space Theme */}
      <section className="w-full py-20 bg-[#0A0A0F] text-[#FBFBFB] relative overflow-hidden">
        <SpaceBackground />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#FBFBFB]">
                Gostou do que viu? <span className="text-[#5DC0E7]">Vamos conversar!</span>
              </h2>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Entre em contato conosco para discutir como podemos ajudar a transformar sua ideia em realidade.
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
          <Star className="text-[#5DC0E7] w-full h-full" />
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
          <Rocket className="text-[#5DC0E7]/30 w-full h-full" />
        </motion.div>
      </section>
    </main>
  )
}
