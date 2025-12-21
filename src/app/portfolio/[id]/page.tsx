/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-unescaped-entities */
"use client"

import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, ExternalLink, Star, Rocket, ArrowRight, Calendar, Users, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import { useState, useEffect } from "react"
import { OptimizedImage } from "@/components/ui/optimized-image"

// Dados de exemplo para o portfólio (Centralizado - Idealmente viria de um arquivo de config ou API)
const portfolioItems = [
  {
    id: "acc-telecom",
    title: "ACC Telecom",
    category: "website",
    description: "Captação de leads",
    fullDescription:
      "Plataforma institucional de alta performance. Focada em velocidade de carregamento e experiência do usuário para maximizar a conversão de leads no setor de telecomunicações.",
    challenge:
      "A ACC Telecom enfrentava o desafio da invisibilidade digital. Sem um canal centralizado, dependiam inteiramente de prospecção fria, o que limitava o crescimento escalável.",
    solution:
      "Desenvolvemos um ecossistema digital completo: Site Institucional ultrarrápido + Landing Pages de alta conversão. Integramos tudo ao CRM da empresa, automatizando o fluxo de entrada de clientes.",
    image: "/images/portfolio/Acctelecom/Projeto01.png",
    gallery: [
      "/images/portfolio/Acctelecom/Projeto01.png",
      "/images/portfolio/Acctelecom/Projeto02.png",
      "/images/portfolio/Acctelecom/Projeto03.png",
    ],
    technologies: ["Next.js", "Tailwind CSS", "Node.js", "React"],
    features: [
      "Dashboard de Leads Personalizado",
      "Automação de E-mail Marketing",
      "Qualificação Automática de Leads (Scoring)",
      "Integração RD Station",
      "Analytics em Tempo Real",
    ],
    results: "+200% Conversão de Leads nos primeiros 3 meses.",
    testimonial: {
      content:
        "A automação implementada pela Infinity Groups transformou completamente nossos processos internos. Conseguimos atender mais clientes com a mesma equipe e aumentamos significativamente nossas vendas.",
      author: "Mariana Costa",
      role: "CEO, ACC Telecom",
    },
    url: "https://acctelecom.com.br",
  },
  {
    id: "emilie-banko",
    title: "Emilie Banko",
    category: "website",
    description: "Site para locação de casas",
    fullDescription:
      "Portal imobiliário premium para locação de temporada. Foco total em design visual e facilidade de agendamento.",
    challenge:
      "A gestão de agendamentos era feita via WhatsApp, gerando conflitos de agenda e perda de clientes pela demora na resposta. A apresentação dos imóveis não refletia o padrão 'Alto Luxo' da marca.",
    solution:
      "Criamos uma galeria imersiva com tour virtual e um sistema de reservas automatizado. O cliente visualiza a disponibilidade em tempo real e agenda a visita sem interação humana inicial.",
    image: "/images/portfolio/EmilieBanko/Projeto01.png",
    gallery: [
      "/images/portfolio/EmilieBanko/Projeto01.png",
      "/images/portfolio/EmilieBanko/Projeto02.png",
      "/images/portfolio/EmilieBanko/Projeto03.png",
    ],
    technologies: ["React", "PostgreSQL", "Node.js", "Vercel"],
    features: [
      "Filtros Avançados de Busca",
      "Calendário de Disponibilidade Real-time",
      "Painel de Gestão de Propriedades",
      "Botão WhatsApp Inteligente",
      "Mobile First Design",
    ],
    results: "+120% Solicitações de visita e redução de 90% no tempo de atendimento.",
    testimonial: {
      content:
        "O site revolucionou meu negócio. A qualidade das imagens e a facilidade de navegação atraem muito mais clientes, e o sistema de agendamento simplificou todo o processo.",
      author: "Emilie Banko",
      role: "Fundadora",
    },
    url: "https://emilie-banko-k2kj4990t-kaykypaulinoalvesdossantos.vercel.app",
  },
  {
    id: "super-telecom",
    title: "Super Telecom",
    category: "website",
    description: "Telecomunicações & Fibra",
    fullDescription:
      "Reestruturação completa da presença digital da Super Telecom, focando em vendas de planos de fibra óptica.",
    challenge:
      "Site antigo não responsivo e com alta taxa de rejeição. Clientes não conseguiam consultar a cobertura de fibra em sua região.",
    solution:
      "Implementamos um 'Consulta CEP' integrado ao sistema da empresa. O cliente digita o CEP e já recebe os planos disponíveis para sua rua, fechando a venda sozinho.",
    image: "/images/portfolio/Supertelecom/Projeto01.png",
    gallery: [
      "/images/portfolio/Supertelecom/Projeto01.png",
      "/images/portfolio/Supertelecom/Projeto02.png",
      "/images/portfolio/Supertelecom/Projeto03.png",
    ],
    technologies: ["React", "API Maps Google", "Node.js"],
    features: [
      "Consulta de Viabilidade Técnica (CEP)",
      "Checkout Transparente",
      "Área do Cliente",
      "Integração MK Solutions",
      "SEO Local Otimizado",
    ],
    results: "+300% Vendas Online Diretas.",
    testimonial: {
      content:
        "Antes dependíamos 100% de vendedores porta a porta. Hoje, 40% das nossas vendas vêm direto do site novo.",
      author: "Roberto Almeida",
      role: "Diretor Comercial",
    },
    url: "https://super-telecom.vercel.app",
  },
  {
    id: "grupoatk",
    title: "Grupo ATK",
    category: "website",
    description: "Soluções Corporativas",
    fullDescription: "Portal B2B para apresentação de portfólio complexo de serviços de engenharia e telecom.",
    challenge: "Complexidade na explicação dos serviços técnicos, o que afastava decisores não-técnicos.",
    solution: "Simplificação da jornada através de infográficos interativos e calculadoras de ROI integradas ao site.",
    image: "/images/portfolio/GrupoAtk/image.png",
    gallery: [
      "/images/portfolio/GrupoAtk/image.png",
      "/images/portfolio/GrupoAtk/image copy 2.png",
      "/images/portfolio/GrupoAtk/image copy 3.png",
    ],
    technologies: ["Next.js", "Three.js", "Tailwind"],
    features: ["Infográficos Interativos", "Calculadora de ROI", "Blog Corporativo", "Geração de PDF de Proposta"],
    results: "+80% Taxa de Conversão em Orçamentos.",
    testimonial: { content: "A apresentação do produto ficou incrivelmente didática. O feedback dos clientes melhorou muito.", author: "Carlos Silva", role: "Diretor Técnico" },
    url: "https://grupoatk.com.br/",
  },
  {
    id: "jh-telecom",
    title: "JH Telecom",
    category: "website",
    description: "Parcerias Comerciais",
    fullDescription: "Hub de geração de parcerias e afiliados para expansão comercial.",
    challenge: "Dificuldade em gerenciar e atrair novos parceiros de revenda.",
    solution: "Desenvolvimento de uma área de membros para parceiros, com material de marketing e painel de comissões.",
    image: "/images/portfolio/Jhtelecom/Projeto01.png",
    gallery: [
      "/images/portfolio/Jhtelecom/Projeto01.png",
      "/images/portfolio/Jhtelecom/Projeto02.png",
      "/images/portfolio/Jhtelecom/Projeto03.png",
    ],
    technologies: ["React", "Firebase", "Dashboard UI"],
    features: ["Área de Membros", "Dashboard de Comissões", "Download Center", "Treinamento em Vídeo"],
    results: "+150% Novos Parceiros em 3 meses.",
    testimonial: { content: "O sistema de parceiros automatizou nossa expansão. Hoje temos revendedores no estado todo.", author: "Carlos Mendes", role: "CMO" },
    url: "https://jhtelecom.com.br",
  },
  {
    id: "bko-consultoria",
    title: "BKO Consultoria",
    category: "website",
    description: "Hub Telecom Multi-marcas",
    fullDescription: "Uma plataforma de consultoria que redefiniu como múltiplas marcas de telecomunicações podem coexistir harmonicamente. Foco total em clareza, segmentação e experiência do usuário.",
    challenge: "O Desafio da Sobrecarga: Como representar gigantes como Vivo, Claro e Tim em um único ambiente sem criar um 'Frankenstein' visual? O cliente precisava vender tudo, mas o excesso de informações estava paralisando a decisão de compra do usuário.",
    solution: "Arquitetura da Informação Limpa. Desenvolvemos um 'Hub de Marcas' onde cada operadora possui seu ecossistema visual preservado, mas contido em uma interface proprietária da BKO super minimalista. Removemos todo o ruído visual, deixando apenas a proposta de valor brilhar.",
    image: "/images/portfolio/bko/screenshot-1766293973588.png",
    gallery: [
      "/images/portfolio/bko/screenshot-1766293973588.png",
      "/images/portfolio/bko/screenshot-1766294030060.png",
      "/images/portfolio/bko/screenshot-1766294053769.png",
      "/images/portfolio/bko/screenshot-1766294072952.png",
      "/images/portfolio/bko/screenshot-1766294091861.png"
    ],
    technologies: ["Next.js", "Tailwind CSS", "Framer Motion"],
    features: ["Hub Multi-marcas", "Design Minimalista", "Navegação Intuitiva", "Comparador de Planos", "SEO Estratégico"],
    results: "De Confusão à Conversão. O novo layout aumentou a permanência no site e, crucialmente, a clareza na escolha do plano ideal.",
    testimonial: { content: "A Infinity organizou nosso portfólio de um jeito que nunca imaginamos. Agora o cliente entra, entende e compra. Simples assim.", author: "Diretoria BKO", role: "Gestão Estratégica" },
    url: "#", // User didn't provide specific URL, leaving placeholder or removing if undefined in logic
  },
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const project = portfolioItems.find((item) => item.id === id)
  const [activeImage, setActiveImage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  if (!project) {
    notFound()
  }

  return (
    <main className="flex flex-col items-center justify-center w-full bg-[#0B0B13] min-h-screen">

      {/* Hero Section */}
      <section className="w-full pt-32 pb-20 bg-[#0B0B13] relative overflow-hidden">
        <SpaceBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B13]/80 to-[#0B0B13] z-0"></div>

        <div className="container mx-auto px-4 z-10 relative">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/portfolio"
              className="inline-flex items-center text-[#AAB3C2] hover:text-[#00B8FF] mb-8 transition-colors text-sm font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar aos Projetos
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center mb-6 gap-3">
                <span className="text-[10px] bg-[#00B8FF]/20 text-[#00B8FF] border border-[#00B8FF]/30 px-3 py-1 rounded md:text-xs font-bold uppercase tracking-widest">
                  {project.category}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#555B66]"></span>
                <span className="text-sm text-[#AAB3C2] font-manrope">{new Date().getFullYear()}</span>
              </div>

              <h1 className="font-orbitron font-bold text-4xl md:text-6xl mb-6 text-white leading-tight">
                {project.title}
              </h1>

              <p className="font-manrope text-xl text-[#AAB3C2] leading-relaxed border-l-2 border-[#00B8FF] pl-6">
                {project.fullDescription}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="w-full pb-20 bg-[#0B0B13] relative z-20 -mt-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,184,255,0.1)] border border-[#1F2937] bg-[#12121E]"
            >
              {/* Main Image */}
              <div className="relative aspect-video w-full bg-[#0E0E12]">
                <OptimizedImage
                  src={project.gallery[activeImage]}
                  alt={`Screenshot ${activeImage + 1}`}
                  fill
                  className={`object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                />

                {/* Controls */}
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setActiveImage((prev) => (prev === 0 ? project.gallery.length - 1 : prev - 1))}
                    className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-[#00B8FF] transition-colors group"
                  >
                    <ArrowLeft className="text-white group-hover:scale-110 transition-transform" />
                  </button>
                  <button
                    onClick={() => setActiveImage((prev) => (prev === project.gallery.length - 1 ? 0 : prev + 1))}
                    className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-[#00B8FF] transition-colors group"
                  >
                    <ArrowRight className="text-white group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="p-4 bg-[#12121E] border-t border-[#1F2937] flex gap-4 overflow-x-auto">
                {project.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative min-w-[100px] h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#00B8FF] opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <OptimizedImage src={img} alt="thumb" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Case Study Details */}
      <section className="w-full py-24 bg-[#0E0E12] border-t border-[#1F2937]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 max-w-6xl mx-auto">

            {/* Left Column: Context */}
            <div className="lg:col-span-2 space-y-16">

              {/* Challenge */}
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="font-orbitron font-bold text-2xl text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded bg-[#FF5555]/20 flex items-center justify-center text-[#FF5555]">!</span>
                  O Desafio
                </h2>
                <p className="font-manrope text-[#AAB3C2] text-lg leading-relaxed">
                  {project.challenge}
                </p>
              </motion.div>

              {/* Solution */}
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                <h2 className="font-orbitron font-bold text-2xl text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded bg-[#00B8FF]/20 flex items-center justify-center text-[#00B8FF]">✓</span>
                  A Solução
                </h2>
                <p className="font-manrope text-[#AAB3C2] text-lg leading-relaxed mb-6">
                  {project.solution}
                </p>

                <div className="bg-[#12121E] rounded-xl p-6 border border-[#1F2937]">
                  <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Funcionalidades Chave</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-[#AAB3C2]">
                        <CheckCircle size={16} className="text-[#00B8FF]" /> {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Results */}
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                <h2 className="font-orbitron font-bold text-2xl text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded bg-[#9C5DE7]/20 flex items-center justify-center text-[#9C5DE7]">🚀</span>
                  Resultados
                </h2>
                <div className="bg-gradient-to-r from-[#1F2937] to-[#12121E] p-8 rounded-2xl border border-[#9C5DE7]/30 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-2">{project.results}</div>
                    <div className="h-1 w-20 bg-[#9C5DE7] rounded mt-4"></div>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                    <Rocket size={150} />
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">

                {/* Tech Stack */}
                <div className="bg-[#12121E] p-6 rounded-2xl border border-[#1F2937]">
                  <h3 className="font-orbitron font-bold text-white mb-4 flex items-center gap-2">
                    <Cpu size={18} className="text-[#00B8FF]" /> Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-[#1F2937] text-[#AAB3C2] text-sm rounded-lg border border-[#2D3748]">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Testimonial */}
                {project.testimonial && (
                  <div className="bg-[#12121E] p-6 rounded-2xl border border-[#1F2937] relative">
                    <div className="text-[#9C5DE7] text-4xl font-serif absolute top-4 left-4 opacity-30">"</div>
                    <p className="text-[#AAB3C2] italic relative z-10 mb-4 pt-4">
                      {project.testimonial.content}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00B8FF] to-[#9C5DE7] flex items-center justify-center text-white font-bold">
                        {project.testimonial.author[0]}
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">{project.testimonial.author}</div>
                        <div className="text-[#555B66] text-xs">{project.testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action */}
                {project.url && (
                  <Button asChild className="w-full bg-[#00B8FF] hover:bg-[#00B8FF]/80 text-[#0B0B13] font-bold h-12 rounded-xl">
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                      Ver Projeto Online <ExternalLink size={16} />
                    </a>
                  </Button>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="w-full py-24 bg-[#0B0B13] border-t border-[#1F2937] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-orbitron font-bold text-3xl md:text-5xl text-white mb-8">
            Vamos construir o <span className="text-[#00B8FF]">próximo case de sucesso?</span>
          </h2>
          <div className="flex justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-[#00B8FF] hover:bg-[#00B8FF]/80 text-[#0B0B13] font-bold text-lg px-10 h-14 rounded-full shadow-[0_0_30px_rgba(0,184,255,0.3)]"
            >
              <Link href="/orcamento">
                Iniciar Projeto
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-[#1F2937] text-white hover:bg-[#1F2937] font-bold text-lg px-10 h-14 rounded-full"
            >
              <Link href="/portfolio">
                Outros Projetos
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </main>
  )
}
