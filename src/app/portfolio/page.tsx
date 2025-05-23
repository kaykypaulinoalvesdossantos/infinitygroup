"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Filter, ExternalLink } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SpaceBackground from "@/components/space-background"

// Dados de exemplo para o portfólio
const portfolioItems = [
  {
    id: "acc-telecom",
    title: "ACC Telecom",
    category: "website",
    description: "Captação de leads",
    fullDescription:
      "Desenvolvimento de um site institucional moderno com sistema de captação de leads",
    image: "/images/portfolio/Acctelecom/Projeto01.png",
    technologies: ["Next.js", "Tailwind CSS"],
    results: "Redução de 70% no tempo gasto em tarefas administrativas e aumento de 200% na conversão de leads.",
  },
  {
    id: "super-telecom",
    title: "Super Telecom",
    category: "website",
    description: "Site para locação de casas com captação de leads",
    fullDescription:
      "Desenvolvimento de um site institucional com o objetivo de apresentar a empresa, destacar seus produtos e serviços, e captar leads de forma estratégica",
    image: "/images/portfolio/Supertelecom/Projeto01.png",
    technologies: ["React", "Strapi", "PostgreSQL"],
    results: "Aumento de 120% nas solicitações de visitas aos imóveis e 80% na taxa de conversão.",
  },
  {
    id: "emilie-banko",
    title: "Emilie Banko",
    category: "ecommerce",
    description: "E-commerce de produtos tecnológicos",
    fullDescription:
      " site institucional para apresentar a chácara, destacando sua infraestrutura, diferenciais e serviços oferecidos para eventos e festas",
    image: "/images/portfolio/EmilieBanko/Projeto01.png",
    technologies: ["Next.js", "Stripe", "MongoDB"],
    results: "Aumento de 300% nas vendas online em comparação com a plataforma anterior.",
  },
  {
    id: "algartelecom",
    title: "Algar Telecom",
    category: "website",
    description: "Site institucional para apresentação de serviços de telecomunicações",
    fullDescription:
      "Desenvolvimento de um site institucional para apresentar a empresa, destacando seus produtos e serviços, e captar leads de forma estratégica",
    image: "/images/portfolio/Algartelecom/Projeto01.png",
    technologies: ["Next.js", "Tailwind CSS"],
    results: "Aumento de 120% nas solicitações de visitas aos imóveis e 80% na taxa de conversão.",
  },
  {
    id: "jh-telecom",
    title: "JH Telecom",
    category: "website",
    description: "Site gerador de parcerias",
    fullDescription:
      "Desenvolvimento de um site institucional moderno com sistema de captação de leads para geração de parcerias comerciais.",
    image: "/images/portfolio/Jhtelecom/Projeto01.png",
    technologies: ["React", "Node.js", "Tailwind CSS"],
    results: "Aumento de 150% na geração de leads qualificados em apenas 3 meses.",
  },
]

export default function PortfolioPage() {
  const [filter, setFilter] = useState("all")
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredItems = filter === "all" ? portfolioItems : portfolioItems.filter((item) => item.category === filter)

  // Track mouse position for the custom cursor effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <main className="flex flex-col items-center justify-center w-full">
      {/* Hero Section - Space Theme */}
      <section className="w-full min-h-[60vh] flex flex-col items-center justify-center relative overflow-hidden bg-[#0A0A0F] text-[#FBFBFB]">
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
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#FBFBFB] z-50">
                Nosso <span className="text-[#5DC0E7]">Portfólio</span>
              </h1>
              <p className="text-lg mb-8 text-[#FBFBFB]/80 z-50">
                Explore o universo de projetos que desenvolvemos e os resultados estelares que alcançamos para nossos
                clientes.
              </p>
            </motion.div>

            {/* Floating elements */}
            <motion.div
              className="absolute top-1/4 right-1/4 w-16 h-16 -z-10"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <div className="w-full h-full rounded-full bg-[#5DC0E7]/20 backdrop-blur-sm"></div>
            </motion.div>

            <motion.div
              className="absolute bottom-1/3 left-1/4 w-12 h-12 -z-10"
              animate={{
                y: [0, 15, 0],
                rotate: [0, -15, 0],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <div className="w-full h-full rounded-full bg-[#FBFBFB]/10 backdrop-blur-sm"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portfolio Section - Interactive */}
      <section className="w-full py-20 bg-gradient-to-b from-[#0A0A0F] to-[#FBFBFB]" ref={containerRef}>
        <div className="container mx-auto px-4">
          {/* Custom cursor effect */}
          {hoveredItem && (
            <motion.div
              className="fixed w-24 h-24 rounded-full bg-[#5DC0E7]/20 backdrop-blur-sm pointer-events-none z-50 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: mousePosition.x - 48,
                y: mousePosition.y - 48,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <ExternalLink className="text-white" />
            </motion.div>
          )}

          <Tabs defaultValue="all" className="w-full mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-[#5DC0E7] mr-2" />
                <span className="text-lg font-medium text-[#FBFBFB]">Filtrar por:</span>
              </div>
              <TabsList className="bg-[#212227]/20 backdrop-blur-sm w-full sm:w-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-2">
                <TabsTrigger
                  value="all"
                  onClick={() => setFilter("all")}
                  className="data-[state=active]:bg-[#5DC0E7] data-[state=active]:text-white text-[#FBFBFB] whitespace-nowrap"
                >
                  Todos
                </TabsTrigger>
                <TabsTrigger
                  value="website"
                  onClick={() => setFilter("website")}
                  className="data-[state=active]:bg-[#5DC0E7] data-[state=active]:text-white text-[#FBFBFB] whitespace-nowrap"
                >
                  Websites
                </TabsTrigger>
                <TabsTrigger
                  value="ecommerce"
                  onClick={() => setFilter("ecommerce")}
                  className="data-[state=active]:bg-[#5DC0E7] data-[state=active]:text-white text-[#FBFBFB] whitespace-nowrap"
                >
                  E-commerce
                </TabsTrigger>
                <TabsTrigger
                  value="mobile"
                  onClick={() => setFilter("mobile")}
                  className="data-[state=active]:bg-[#5DC0E7] data-[state=active]:text-white text-[#FBFBFB] whitespace-nowrap"
                >
                  Aplicativos Mobile
                </TabsTrigger>
                <TabsTrigger
                  value="desktop"
                  onClick={() => setFilter("desktop")}
                  className="data-[state=active]:bg-[#5DC0E7] data-[state=active]:text-white text-[#FBFBFB] whitespace-nowrap"
                >
                  Aplicativos Desktop
                </TabsTrigger>
                <TabsTrigger
                  value="automation"
                  onClick={() => setFilter("automation")}
                  className="data-[state=active]:bg-[#5DC0E7] data-[state=active]:text-white text-[#FBFBFB] whitespace-nowrap"
                >
                  Automações
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{
                      y: -10,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                    onMouseEnter={() => setHoveredItem(project.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg transition-all duration-300 group"
                  >
                    <div className="relative overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.title}
                        width={600}
                        height={400}
                        className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#212227] to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, i) => (
                            <span key={i} className="bg-[#5DC0E7]/80 text-white text-xs px-2 py-1 rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-[#212227]">{project.title}</h3>
                        <span className="text-xs bg-[#F0F0F0] text-[#212227]/70 px-2 py-1 rounded capitalize">
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
                      <p className="text-[#212227]/80 mb-4">{project.description}</p>
                      <Link
                        href={`/portfolio/${project.id}`}
                        className="text-[#5DC0E7] font-medium hover:text-[#5DC0E7]/80 flex items-center"
                      >
                        Ver detalhes{" "}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {["website", "ecommerce", "mobile", "desktop", "automation"].map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredItems.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{
                        y: -10,
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      }}
                      onMouseEnter={() => setHoveredItem(project.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg transition-all duration-300 group"
                    >
                      <div className="relative overflow-hidden">
                        <Image
                          src={project.image}
                          alt={project.title}
                          width={600}
                          height={400}
                          className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#212227] to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, i) => (
                              <span key={i} className="bg-[#5DC0E7]/80 text-white text-xs px-2 py-1 rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-[#212227]">{project.title}</h3>
                          <span className="text-xs bg-[#F0F0F0] text-[#212227]/70 px-2 py-1 rounded capitalize">
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
                        <p className="text-[#212227]/80 mb-4">{project.description}</p>
                        <Link
                          href={`/portfolio/${project.id}`}
                          className="text-[#5DC0E7] font-medium hover:text-[#5DC0E7]/80 flex items-center"
                        >
                          Ver detalhes{" "}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg text-[#212227]/70">Nenhum projeto encontrado para esta categoria.</p>
            </div>
          )}
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
                Pronto para lançar seu <span className="text-[#5DC0E7]">próximo projeto</span>?
              </h2>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Entre em contato conosco e vamos transformar sua ideia em realidade digital.
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
      </section>
    </main>
  )
}
