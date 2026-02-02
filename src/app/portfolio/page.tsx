"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Filter, ExternalLink, Layers, Smartphone, Monitor, ShoppingCart, Bot, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from '@/components/ui/optimized-image'

// Dados Realistas e Corporativos
const portfolioItems = [
  {
    id: "acc-telecom",
    title: "ACC Telecom",
    category: "website",
    description: "Captação de leads de alta performance",
    fullDescription: "Reestruturação digital completa focada em SEO e conversão de leads B2B para o setor de telecomunicações.",
    image: "/images/portfolio/Acctelecom/Projeto01.png",
    technologies: ["Next.js", "Analytics", "CRM Integration"],
    results: "+200% em Leads Qualificados",
    clientLogo: "/images/logos/acc-logo.png"
  },
  {
    id: "super-telecom",
    title: "Super Telecom",
    category: "website",
    description: "Portal de Vendas e Atendimento",
    fullDescription: "Plataforma centralizada para gestão de planos, autoatendimento e vendas digitais de fibra óptica.",
    image: "/images/portfolio/Supertelecom/Projeto01.png",
    technologies: ["React Ecosystem", "UX/UI Design", "API Rest"],
    results: "Redução de 40% no CAC",
    clientLogo: "/images/logos/super-logo.png"
  },
  {
    id: "emilie-banko",
    title: "Emilie Banko",
    category: "ecommerce",
    description: "E-commerce de Luxo",
    fullDescription: "Experiência de compra premium com integração de estoque em tempo real e checkout transparente.",
    image: "/images/portfolio/EmilieBanko/Projeto01.png",
    technologies: ["Vtex IO", "Payment Gateway", "ERP Sync"],
    results: "+300% Faturamento Online",
    clientLogo: "/images/logos/emilie-logo.png"
  },
  {
    id: "grupoatk",
    title: "Grupo ATK",
    category: "website",
    description: "Hub Corporativo B2B",
    fullDescription: "Portal institucional para consolidação de marca e apresentação de portfólio de serviços enterprise.",
    image: "/images/portfolio/GrupoAtk/image.png",
    technologies: ["Institucional", "SEO Técnico", "Lead Gen"],
    results: "Autoridade de Marca Consolidada",
    clientLogo: undefined
  },
  {
    id: "jh-telecom",
    title: "JH Telecom",
    category: "website",
    description: "Motor de Vendas B2B",
    fullDescription: "Landing pages de alta conversão integradas ao funil de vendas da equipe comercial.",
    image: "/images/portfolio/Jhtelecom/Projeto01.png",
    technologies: ["Growth Hacking", "CRO", "Next.js"],
    results: "+150% Pipeline de Vendas",
    clientLogo: undefined
  },
  {
    id: "bko-consultoria",
    title: "BKO Consultoria",
    category: "website",
    description: "Plataforma Multi-Marcas",
    fullDescription: "Sistema unificado para consultores gerenciarem ofertas de múltiplas operadoras em uma interface única.",
    image: "/images/portfolio/bko/screenshot-1766293973588.png",
    technologies: ["SaaS", "Dashboard", "Auth System"],
    results: "Centralização Operacional",
    clientLogo: undefined
  },
]

export default function PortfolioPage() {
  const [filter, setFilter] = useState("all")
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredItems = filter === "all" ? portfolioItems : portfolioItems.filter((item) => item.category === filter)

  const categories = [
    { id: 'all', label: 'Todos os Projetos', icon: Layers },
    { id: 'website', label: 'Plataformas Web', icon: Monitor },
    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart },
    { id: 'mobile', label: 'Apps Mobile', icon: Smartphone },
  ]

  return (
    <main className="flex flex-col w-full bg-white text-[#1A1A1A] selection:bg-[#0076FF]/20 font-inter">

      {/* 1. HERO SECTION (Fixed & Corporate) */}
      <section className="relative w-full min-h-[70vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Full Background Image (Fixed) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/images/modern_office_glass_architecture.png')] bg-cover bg-center bg-fixed" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="font-bold text-5xl lg:text-7xl text-white mb-6 leading-tight drop-shadow-lg">
              Nossas <span className="text-[#0076FF]">Obras Primas</span>
            </h1>
            <p className="text-xl text-slate-200 font-medium mb-10 leading-relaxed drop-shadow-md max-w-2xl mx-auto">
              Transformamos desafios complexos em soluções digitais de alto impacto. Explore os cases que estão definindo o mercado.
            </p>
          </motion.div>
        </div>

        {/* SMILE CURVE SEPARATOR */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-center pointer-events-none">
          <div className="flex-1 h-[70px] bg-[#F6F6F6] mr-[-1px]" />
          <div className="relative shrink-0 w-[505px] h-[70px] pointer-events-auto z-10">
            <a href="#cases" className="block relative w-full h-full">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 505.7 70.1"
                className="w-[101%] h-full ml-[-0.5%]"
                preserveAspectRatio="none"
              >
                <path className="fill-[#F6F6F6]" d="M351,32.6c-55.9,30.1-71.4,32.7-98.2,32.7s-42.3-2.6-98.2-32.7S28,0,28,0H0v70.1h28h449.6h28.1V0h-28.1C477.6,0,407,2.5,351,32.6z" />
              </svg>
              <div className="absolute top-[28px] left-1/2 transform -translate-x-1/2 -translate-y-full animate-bounce">
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12L0 0H20L10 12Z" fill="#F6F6F6" />
                </svg>
              </div>
            </a>
          </div>
          <div className="flex-1 h-[70px] bg-[#F6F6F6] ml-[-1px]" />
        </div>
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-[#F6F6F6] z-30" />
      </section>

      {/* 2. FILTER & GRID SECTION */}
      <section id="cases" className="w-full py-20 bg-[#F6F6F6]">
        <div className="container mx-auto px-4">

          {/* Filter Bar */}
          <div className="flex justify-center mb-16 overflow-x-auto pb-4">
            <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200 inline-flex gap-2">
              {categories.map((cat) => {
                const isActive = filter === cat.id
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${isActive
                      ? 'bg-[#0076FF] text-white shadow-md'
                      : 'text-[#4B4B4B] hover:bg-slate-100'
                      }`}
                  >
                    <Icon size={16} />
                    <span className="whitespace-nowrap">{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-lg hover:shadow-xl hover:border-[#0076FF]/30 transition-all duration-300 group flex flex-col h-full"
                >
                  {/* Image Area */}
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <OptimizedImage
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Floating Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur text-[#0076FF] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                        <CheckCircle2 size={12} /> Case de Sucesso
                      </span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="mb-6">
                      <h3 className="font-bold text-2xl text-[#1A1A1A] mb-2 group-hover:text-[#0076FF] transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-[#4B4B4B] text-sm leading-relaxed line-clamp-3">
                        {project.fullDescription}
                      </p>
                    </div>

                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.technologies.slice(0, 3).map(tech => (
                          <span key={tech} className="bg-[#F6F6F6] text-[#4B4B4B] text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border border-slate-100">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#0076FF] font-bold uppercase tracking-widest block mb-1">Impacto</span>
                          <span className="text-[#1A1A1A] font-bold text-sm">{project.results}</span>
                        </div>
                        <Link href={`/portfolio/${project.id}`} className="w-10 h-10 rounded-full bg-[#0076FF] text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-110 transition-transform">
                          <ArrowRight size={18} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <Filter size={24} />
              </div>
              <h3 className="font-bold text-[#1A1A1A] text-xl">Nenhum projeto encontrado</h3>
              <p className="text-[#4B4B4B]">Tente selecionar outra categoria de filtro.</p>
            </div>
          )}

        </div>
      </section>

      {/* 3. CTA FINAL */}
      <section className="w-full py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="bg-[#0B0C10] rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-[url('/images/products-hero-bg.png')] bg-cover bg-center opacity-20 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0076FF]/90 to-[#0B0C10]/90" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Sua empresa no próximo <span className="text-blue-300">Case de Sucesso?</span>
              </h2>
              <p className="text-lg text-white/80 mb-10 leading-relaxed">
                Não desenvolvemos apenas software. Construímos ativos digitais que geram valor real para o seu negócio.
              </p>
              <Button asChild size="lg" className="bg-white text-[#0076FF] hover:bg-slate-100 font-bold h-16 px-12 rounded-xl text-xl shadow-2xl">
                <Link href="/orcamento">Iniciar Projeto <ArrowRight className="ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
