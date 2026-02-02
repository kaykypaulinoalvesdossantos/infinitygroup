"use client"

import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, ExternalLink, Rocket, ArrowRight, Cpu, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { OptimizedImage } from "@/components/ui/optimized-image"

// Dados de exemplo para o portfólio (Mantendo a mesma estrutura de dados, apenas redesign visual)
const portfolioItems = [
  {
    id: "acc-telecom",
    title: "ACC Telecom",
    category: "Website Institucional",
    client: "ACC Telecom",
    description: "Plataforma de alta performance focada na conversão de leads.",
    fullDescription:
      "Desenvolvemos uma plataforma institucional focada em performance e conversão. O objetivo principal era transformar a presença digital da ACC Telecom em um canal de vendas efetivo, integrando formulários inteligentes diretamente ao CRM da empresa.",
    challenge:
      "A empresa dependia quase exclusivamente de prospecção ativa (outbound) e não possuía um canal digital capaz de captar e qualificar leads passivamente. O site antigo era lento e não responsivo, gerando alta taxa de rejeição.",
    solution:
      "Criamos um ecossistema digital completo. Site ultrarrápido (Next.js), Otimização de SEO local e integração via API com o CRM para distribuição automática de leads para a equipe comercial.",
    image: "/images/portfolio/Acctelecom/Projeto01.png",
    gallery: [
      "/images/portfolio/Acctelecom/Projeto01.png",
      "/images/portfolio/Acctelecom/Projeto02.png",
      "/images/portfolio/Acctelecom/Projeto03.png",
    ],
    technologies: ["Next.js", "React", "Tailwind CSS", "Node.js"],
    features: [
      "Dashboard de Leads",
      "Integração CRM",
      "SEO Otimizado",
      "Design Mobile First",
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
    category: "Portal Imobiliário",
    client: "Emilie Banko Imóveis",
    description: "Portal de locação de luxo com sistema de agendamento.",
    fullDescription:
      "Portal imobiliário premium focado no mercado de luxo. A plataforma oferece uma experiência visual imersiva com tours virtuais e um sistema de agendamento de visitas totalmente automatizado.",
    challenge:
      "Gestão manual de agendamentos via WhatsApp gerava conflitos de agenda e perda de clientes de alto padrão que exigiam resposta imediata.",
    solution:
      "Desenvolvimento de um sistema de reserva e agendamento online sincronizado em tempo real. Interface minimalista focada na valorização das fotos dos imóveis.",
    image: "/images/portfolio/EmilieBanko/Projeto01.png",
    gallery: [
      "/images/portfolio/EmilieBanko/Projeto01.png",
      "/images/portfolio/EmilieBanko/Projeto02.png",
      "/images/portfolio/EmilieBanko/Projeto03.png",
    ],
    technologies: ["React", "PostgreSQL", "Node.js", "Vercel"],
    features: [
      "Busca Avançada",
      "Agendamento Online",
      "Gestão de Propriedades",
      "Tour Virtual",
      "Multi-idioma",
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
    category: "E-commerce de Serviços",
    client: "Super Telecom",
    description: "Venda automatizada de planos de fibra óptica.",
    fullDescription:
      "Plataforma de autoatendimento para provedor de internet. Permite que o cliente consulte a viabilidade técnica por CEP e contrate o plano ideal sem intervenção humana.",
    challenge:
      "Alta dependência de vendedores porta a porta e call center. O cliente não conseguia comprar online de forma autônoma.",
    solution:
      "Integração com o ERP da empresa para consulta de viabilidade técnica em tempo real baseada na geolocalização do cliente.",
    image: "/images/portfolio/Supertelecom/Projeto01.png",
    gallery: [
      "/images/portfolio/Supertelecom/Projeto01.png",
      "/images/portfolio/Supertelecom/Projeto02.png",
      "/images/portfolio/Supertelecom/Projeto03.png",
    ],
    technologies: ["React", "Google Maps API", "Node.js", "ERP Integration"],
    features: [
      "Consulta de Viabilidade (CEP)",
      "Checkout Transparente",
      "Área do Cliente",
      "Assinatura Digital",
      "Pagamento Recorrente",
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
    category: "Portal Corporativo",
    client: "Grupo ATK Engenharia",
    description: "Apresentação de soluções complexas de engenharia.",
    fullDescription: "Portal B2B desenvolvido para simplificar a apresentação de um portfólio complexo de serviços de engenharia e telecomunicações para grandes corporações.",
    challenge: "Dificuldade em comunicar o valor e a complexidade técnica dos serviços para decisores não-técnicos.",
    solution: "Criação de infográficos interativos e calculadoras de ROI que traduzem aspectos técnicos em benefícios financeiros claros.",
    image: "/images/portfolio/GrupoAtk/image.png",
    gallery: [
      "/images/portfolio/GrupoAtk/image.png",
      "/images/portfolio/GrupoAtk/image copy 2.png",
      "/images/portfolio/GrupoAtk/image copy 3.png",
    ],
    technologies: ["Next.js", "Three.js", "Tailwind"],
    features: ["Infográficos Interativos", "Calculadora de ROI", "Blog Corporativo", "Geração de Propostas PDF"],
    results: "+80% Taxa de Conversão em Orçamentos.",
    testimonial: { content: "A apresentação do produto ficou incrivelmente didática. O feedback dos clientes melhorou muito.", author: "Carlos Silva", role: "Diretor Técnico" },
    url: "https://grupoatk.com.br/",
  },
  {
    id: "jh-telecom",
    title: "JH Telecom",
    category: "Plataforma de Parceiros",
    client: "JH Telecom",
    description: "Hub de gestão para parceiros e afiliados.",
    fullDescription: "Sistema completo para gestão de parceiros comerciais, oferecendo material de marketing, link de afiliado e acompanhamento de comissões.",
    challenge: "Processo manual de cadastro e pagamentos de comissões para parceiros limitava a expansão da rede.",
    solution: "Área de membros automatizada onde o parceiro se cadastra, baixa materiais e acompanha suas vendas em tempo real.",
    image: "/images/portfolio/Jhtelecom/Projeto01.png",
    gallery: [
      "/images/portfolio/Jhtelecom/Projeto01.png",
      "/images/portfolio/Jhtelecom/Projeto02.png",
      "/images/portfolio/Jhtelecom/Projeto03.png",
    ],
    technologies: ["React", "Firebase", "Dashboard UI"],
    features: ["Área de Membros", "Gestão de Comissões", "Download Center", "Treinamento EAD"],
    results: "+150% Novos Parceiros em 3 meses.",
    testimonial: { content: "O sistema de parceiros automatizou nossa expansão. Hoje temos revendedores no estado todo.", author: "Carlos Mendes", role: "CMO" },
    url: "https://jhtelecom.com.br",
  },
  {
    id: "bko-consultoria",
    title: "BKO Consultoria",
    category: "Hub Multi-marcas",
    client: "BKO Consultoria",
    description: "Plataforma unificada para múltiplas operadoras.",
    fullDescription: "Uma plataforma de consultoria que redefiniu como múltiplas marcas de telecomunicações podem coexistir harmonicamente. Foco total em clareza, segmentação e experiência do usuário.",
    challenge: "Como representar gigantes como Vivo, Claro e Tim em um único ambiente sem criar poluição visual e confusão para o cliente?",
    solution: "Arquitetura da Informação Limpa. Desenvolvemos um 'Hub de Marcas' onde cada operadora possui seu ecossistema visual preservado, mas contido em uma interface minimalista unificada.",
    image: "/images/portfolio/bko/screenshot-1766293973588.png",
    gallery: [
      "/images/portfolio/bko/screenshot-1766293973588.png",
      "/images/portfolio/bko/screenshot-1766294030060.png",
      "/images/portfolio/bko/screenshot-1766294053769.png",
      "/images/portfolio/bko/screenshot-1766294072952.png",
      "/images/portfolio/bko/screenshot-1766294091861.png"
    ],
    technologies: ["Next.js", "Tailwind CSS", "Framer Motion"],
    features: ["Hub Multi-marcas", "Design Minimalista", "Comparador de Planos", "SEO Estratégico"],
    results: "Aumento significativo na permanência no site e clareza na escolha dos planos.",
    testimonial: { content: "A Infinity organizou nosso portfólio de um jeito que nunca imaginamos. Agora o cliente entra, entende e compra.", author: "Diretoria BKO", role: "Gestão Estratégica" },
    url: "#",
  },
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const project = portfolioItems.find((item) => item.id === id)
  const [activeImage, setActiveImage] = useState(0)

  if (!project) {
    notFound()
  }

  return (
    <main className="flex flex-col w-full bg-white text-[#1A1A1A] font-inter selection:bg-[#0076FF]/20">


      {/* HERO SECTION */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: Content */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-[#0076FF]/10 text-[#0076FF] text-xs font-bold uppercase tracking-wider">
                  {project.category}
                </span>
                <span className="text-slate-400 text-sm font-medium">|</span>
                <span className="text-slate-500 text-sm font-medium">{project.client}</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-8 leading-tight">
                {project.title}
              </h1>

              <div className="flex flex-wrap gap-x-12 gap-y-6 mb-10 text-sm">
                <div>
                  <span className="block text-slate-400 mb-1">Cliente</span>
                  <span className="font-bold text-[#1A1A1A]">{project.client}</span>
                </div>
                <div>
                  <span className="block text-slate-400 mb-1">Serviço</span>
                  <span className="font-bold text-[#1A1A1A]">{project.category}</span>
                </div>
                <div>
                  <span className="block text-slate-400 mb-1">Entregas</span>
                  <span className="font-bold text-[#1A1A1A]">Web, Mobile, Design</span>
                </div>
              </div>

              <p className="text-xl text-slate-600 leading-relaxed mb-10 font-medium">
                {project.fullDescription}
              </p>

              {project.url && project.url !== "#" && (
                <Button asChild size="lg" className="bg-[#1A1A1A] hover:bg-[#0076FF] text-white font-bold h-14 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl">
                  <a href={project.url} target="_blank" rel="noopener noreferrer">
                    Ver Projeto Online <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </Button>
              )}
            </motion.div>

            {/* Right: Main Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-100 bg-slate-50 aspect-[4/3]"
            >
              <OptimizedImage
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* GALLERY STRIP */}
      {project.gallery.length > 0 && (
        <section className="w-full py-12 bg-[#F6F6F6] border-y border-slate-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {project.gallery.slice(0, 3).map((img, i) => (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden shadow-md group cursor-pointer border border-slate-200">
                  <OptimizedImage src={img} alt={`Gallery ${i}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CASE STUDY CONTENT */}
      <section className="w-full py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 max-w-6xl mx-auto">

            {/* Left: Challenge & Solution */}
            <div className="lg:col-span-2 space-y-16">

              {/* Challenge */}
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-sm">01</span>
                  O Desafio
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed font-manrope">
                  {project.challenge}
                </p>
              </div>

              {/* Solution */}
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm">02</span>
                  A Solução
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed font-manrope mb-8">
                  {project.solution}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <CheckCircle size={18} className="text-[#0076FF] flex-shrink-0" />
                      <span className="font-medium text-slate-700">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="bg-[#1A1A1A] text-white p-10 rounded-3xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                    <Rocket className="text-[#0076FF]" /> Impacto Gerado
                  </h3>
                  <p className="text-3xl md:text-5xl font-bold font-orbitron leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                    {project.results}
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                  <Rocket size={200} />
                </div>
              </div>

            </div>

            {/* Right: Sidebar */}
            <div className="lg:col-span-1 space-y-8">

              {/* Tech Stack */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
                  <Cpu size={18} className="text-slate-400" /> Tecnologias
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                    <span key={tech} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              {project.testimonial && (
                <div className="p-8 rounded-2xl bg-[#0076FF]/5 border border-[#0076FF]/10 relative">
                  <div className="text-[#0076FF] opacity-20 text-6xl font-serif absolute top-4 left-4 leading-none">“</div>
                  <p className="relative z-10 text-slate-700 font-medium italic mb-6 pt-4 leading-relaxed">
                    {project.testimonial.content}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0076FF] flex items-center justify-center text-white font-bold">
                      {project.testimonial.author[0]}
                    </div>
                    <div>
                      <div className="font-bold text-[#1A1A1A] text-sm">{project.testimonial.author}</div>
                      <div className="text-slate-500 text-xs">{project.testimonial.role}</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* NEXT PROJECT / CTA */}
      <section className="w-full py-24 bg-[#F6F6F6] text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-8">Gostou deste projeto?</h2>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-[#0076FF] hover:bg-[#0060D0] text-white font-bold h-14 px-8 rounded-xl shadow-lg shadow-blue-500/20">
              <Link href="/orcamento">Quero um Projeto Igual</Link>
            </Button>
          </div>
        </div>
      </section>

    </main>
  )
}
