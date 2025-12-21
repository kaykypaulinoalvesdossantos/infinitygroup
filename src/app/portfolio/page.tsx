"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Filter, ExternalLink, Layers, Smartphone, Monitor, ShoppingCart, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import { OptimizedImage } from '@/components/ui/optimized-image'

// Dados de exemplo para o portfólio
const portfolioItems = [
  {
    id: "acc-telecom",
    title: "ACC Telecom",
    category: "website",
    description: "Captação de leads de alta performance",
    fullDescription: "Desenvolvimento de um site institucional moderno com sistema de captação de leads.",
    image: "/images/portfolio/Acctelecom/Projeto01.png",
    technologies: ["Next.js", "Tailwind CSS"],
    results: "+200% Conversão de Leads",
    color: "#00B8FF"
  },
  {
    id: "super-telecom",
    title: "Super Telecom",
    category: "website",
    description: "Plataforma de locação imobiliária",
    fullDescription: "Site institucional para apresentar a empresa e destacar produtos de fibra óptica.",
    image: "/images/portfolio/Supertelecom/Projeto01.png",
    technologies: ["React", "PostgreSQL"],
    results: "+120% Solicitações de Visita",
    color: "#9C5DE7"
  },
  {
    id: "emilie-banko",
    title: "Emilie Banko",
    category: "ecommerce",
    description: "E-commerce Tech & Lifestyle",
    fullDescription: "Loja virtual completa com sistema de pagamentos integrado e gestão de estoque.",
    image: "/images/portfolio/EmilieBanko/Projeto01.png",
    technologies: ["Next.js", "Stripe", "MongoDB"],
    results: "+300% Vendas Online",
    color: "#E7A5DC"
  },
  {
    id: "grupoatk",
    title: "Grupo ATK",
    category: "website",
    description: "Hub de Soluções Corporativas",
    fullDescription: "Portal corporativo para apresentação de serviços de telecomunicações B2B.",
    image: "/images/portfolio/GrupoAtk/image.png",
    technologies: ["Next.js", "Tailwind CSS"],
    results: "+80% Taxa de Conversão",
    color: "#00B8FF"
  },
  {
    id: "jh-telecom",
    title: "JH Telecom",
    category: "website",
    description: "Motor de Parcerias Comerciais",
    fullDescription: "Sistema focado em geração de leads B2B e expansão de canal de vendas.",
    image: "/images/portfolio/Jhtelecom/Projeto01.png",
    technologies: ["React", "Node.js"],
    results: "+150% Leads Qualificados",
    color: "#9C5DE7"
  },
  {
    id: "bko-consultoria",
    title: "BKO Consultoria",
    category: "website",
    description: "Hub Telecom Multi-marcas",
    fullDescription: "Plataforma inteligente que unifica o marketing de múltiplas operadoras em uma interface limpa e de alta conversão.",
    image: "/images/portfolio/bko/screenshot-1766293973588.png",
    technologies: ["Next.js", "Tailwind CSS"],
    results: "Unificação Visual Completa",
    color: "#00B8FF"
  },
]

export default function PortfolioPage() {
  const [filter, setFilter] = useState("all")
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredItems = filter === "all" ? portfolioItems : portfolioItems.filter((item) => item.category === filter)

  const categories = [
    { id: 'all', label: 'Todos', icon: Layers },
    { id: 'website', label: 'Websites', icon: Monitor },
    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart },
    { id: 'mobile', label: 'Apps Mobile', icon: Smartphone },
    { id: 'automation', label: 'Automações', icon: Bot },
  ]

  return (
    <main className="flex flex-col items-center justify-center w-full bg-[#0B0B13] min-h-screen">

      {/* Hero Section */}
      <section className="w-full min-h-[50vh] flex flex-col items-center justify-center relative overflow-hidden pt-32 pb-12">
        <SpaceBackground />
        <div className="absolute inset-0 bg-[#0B0B13]/80 z-0"></div>

        <div className="container mx-auto px-4 z-10 relative text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-orbitron font-bold text-4xl md:text-6xl text-white mb-6">
              Nossas <span className="text-[#00B8FF]">Obras Primas</span>
            </h1>
            <p className="font-manrope text-[#AAB3C2] text-lg max-w-2xl mx-auto leading-relaxed">
              Mais do que código, entregamos resultados. Explore como transformamos desafios de negócios em soluções digitais de alto impacto.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="w-full py-8 border-b border-[#1F2937]/50 sticky top-16 z-40 bg-[#0B0B13]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 overflow-x-auto">
          <div className="flex justify-start md:justify-center gap-4 min-w-max px-2">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = filter === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 ${isActive
                    ? "bg-[#00B8FF]/10 border-[#00B8FF] text-[#00B8FF] shadow-[0_0_15px_rgba(0,184,255,0.3)]"
                    : "bg-[#12121E] border-[#1F2937] text-[#AAB3C2] hover:border-[#00B8FF]/50 hover:text-white"
                    }`}
                >
                  <Icon size={16} />
                  <span className="font-manrope font-bold text-sm tracking-wide">{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="w-full py-20" ref={containerRef}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  onMouseEnter={() => setHoveredItem(project.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="bg-[#12121E] rounded-2xl overflow-hidden border border-[#1F2937] group hover:border-[#00B8FF]/50 transition-colors shadow-2xl flex flex-col h-full"
                >
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <OptimizedImage
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12121E] to-transparent opacity-60"></div>

                    {/* Overlay Stats */}
                    <div className="absolute top-4 right-4 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="bg-[#00B8FF] text-[#0B0B13] px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <ExternalLink size={12} /> Ver Case
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {project.technologies.map((tech) => (
                          <span key={tech} className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider bg-[#0B0B13]/80 text-[#AAB3C2] border border-[#1F2937] backdrop-blur-md">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-4">
                      <h3 className="font-orbitron font-bold text-2xl text-white mb-2 group-hover:text-[#00B8FF] transition-colors">{project.title}</h3>
                      <p className="text-[#AAB3C2] text-sm leading-relaxed mb-4 line-clamp-2">
                        {project.fullDescription}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-[#1F2937] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase text-[#555B66] font-bold tracking-wider mb-1">Resultado</div>
                        <div className="text-[#00B8FF] font-bold text-sm">{project.results}</div>
                      </div>
                      <Link
                        href={`/portfolio/${project.id}`}
                        className="w-10 h-10 rounded-full bg-[#1F2937] hover:bg-[#00B8FF] flex items-center justify-center transition-colors group/btn"
                      >
                        <ArrowRight size={18} className="text-white group-hover/btn:scale-110 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredItems.length === 0 && (
            <div className="py-20 text-center">
              <div className="inline-block p-4 rounded-full bg-[#1F2937] mb-4">
                <Filter size={32} className="text-[#555B66]" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Nenhum projeto encontrado</h3>
              <p className="text-[#AAB3C2]">Tente selecionar outra categoria.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="w-full py-24 bg-gradient-to-t from-[#0E0E12] to-[#0B0B13] border-t border-[#1F2937]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-orbitron font-bold text-3xl md:text-5xl text-white mb-8">
            Seu projeto é o <span className="text-[#9C5DE7]">próximo?</span>
          </h2>
          <Button
            asChild
            size="lg"
            className="bg-[#00B8FF] hover:bg-[#00B8FF]/80 text-[#0B0B13] font-bold text-xl px-12 h-16 rounded-full shadow-[0_0_40px_rgba(0,184,255,0.4)] transition-all hover:scale-105"
          >
            <Link href="/orcamento">
              Iniciar Projeto <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

    </main>
  )
}
