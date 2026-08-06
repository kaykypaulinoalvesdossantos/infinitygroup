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
    "id": "noble-smoke",
    "title": "Noble Smoke",
    "category": "website",
    "client": "Noble Smoke",
    "description": "Tabacaria sofisticada com os melhores produtos",
    "fullDescription": "Loja virtual voltada para uma tabacaria de alto padrão. O site oferece catálogos para charutos, narguilés, essências e acessórios, tudo com uma estética voltada para o luxo e a exclusividade.",
    "challenge": "Apresentar um catálogo diversificado de tabacaria de forma elegante, respeitando regulamentações e atraindo um público focado em produtos premium.",
    "solution": "Desenvolvimento de um site com design sofisticado (dark mode), categorização inteligente de produtos e confirmação de idade, garantindo uma jornada fluida.",
    "image": "/images/portfolio/noble-smoke/Projeto01.png",
    "gallery": [
        "/images/portfolio/noble-smoke/Projeto01.png",
        "/images/portfolio/noble-smoke/Projeto02.png",
        "/images/portfolio/noble-smoke/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Catálogo Digital",
        "Verificação de Idade",
        "Design Premium"
    ],
    "results": "+120% em Vendas Mensais",
    "url": "https://noblesmoke.vercel.app/"
},
  {
    "id": "union-du-pain",
    "title": "Union Du Pain",
    "category": "website",
    "client": "Union Du Pain",
    "description": "A autêntica panificação francesa pertinho de você",
    "fullDescription": "Site institucional e catálogo digital para uma padaria artesanal de estilo francês. O site destaca os pães de fermentação natural, viennoiserie e métodos tradicionais de preparo.",
    "challenge": "Transmitir a tradição e a qualidade artesanal dos produtos franceses no ambiente digital, incentivando as visitas à loja física e encomendas.",
    "solution": "Criamos um site com foco no visual (fotografias de alta qualidade dos produtos), com uma seção de encomendas e cardápio digital claro e atrativo.",
    "image": "/images/portfolio/union-du-pain/Projeto01.png",
    "gallery": [
        "/images/portfolio/union-du-pain/Projeto01.png",
        "/images/portfolio/union-du-pain/Projeto02.png",
        "/images/portfolio/union-du-pain/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Menu Digital",
        "Seção de Encomendas",
        "Design Fotográfico"
    ],
    "results": "+200% nas Encomendas Online",
    "url": "https://uniondupain.vercel.app/"
},
  {
    "id": "terapia-do-bolo",
    "title": "Terapia do Bolo",
    "category": "website",
    "client": "Terapia do Bolo",
    "description": "Bolos caseiros que trazem memórias afetivas",
    "fullDescription": "Uma vitrine online para venda de bolos caseiros e artesanais. O foco é na simplicidade, sabor e nas memórias afetivas que um bom bolo com café pode trazer.",
    "challenge": "Facilitar os pedidos online de bolos para o dia a dia e eventos, organizando o catálogo por sabores e tamanhos disponíveis.",
    "solution": "Uma landing page focada em conversão, com catálogo visual direto e botão de pedidos integrado ao WhatsApp para agilizar o atendimento.",
    "image": "/images/portfolio/terapia-do-bolo/Projeto01.png",
    "gallery": [
        "/images/portfolio/terapia-do-bolo/Projeto01.png",
        "/images/portfolio/terapia-do-bolo/Projeto02.png",
        "/images/portfolio/terapia-do-bolo/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Catálogo Visual",
        "Integração WhatsApp",
        "Landing Page Otimizada"
    ],
    "results": "Redução no tempo de atendimento",
    "url": "https://terapiadobolo-seven.vercel.app/"
},
  {
    "id": "agd",
    "title": "AGD",
    "category": "website",
    "client": "AGD",
    "description": "Soluções completas e inovadoras para negócios",
    "fullDescription": "Site corporativo apresentando os serviços e a expertise da AGD. O foco é em credibilidade, portfólio de serviços e captação de clientes B2B.",
    "challenge": "Posicionar a marca como uma parceira estratégica de negócios confiável, clara sobre as soluções oferecidas e focada em captação de leads qualificados.",
    "solution": "Design corporativo moderno e responsivo, focado na explicação dos serviços, apresentação de resultados/clientes e formulários de contato otimizados.",
    "image": "/images/portfolio/agd/Projeto01.png",
    "gallery": [
        "/images/portfolio/agd/Projeto01.png",
        "/images/portfolio/agd/Projeto02.png",
        "/images/portfolio/agd/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Portfólio B2B",
        "Design Corporativo",
        "Captação de Leads"
    ],
    "results": "+50% Geração de Leads Qualificados",
    "url": "https://agdsite.vercel.app/"
},
  {
    "id": "arte-formatti",
    "title": "Arte Formatti",
    "category": "website",
    "client": "Arte Formatti",
    "description": "Móveis sob medida que transformam seu ambiente",
    "fullDescription": "Portfólio e site institucional de uma marcenaria e empresa de móveis planejados. O site destaca a qualidade do acabamento, projetos realizados e a versatilidade de estilos.",
    "challenge": "Exibir o portfólio de projetos de forma que valorize o design e a qualidade dos móveis sob medida, gerando confiança para fechamento de projetos de alto valor.",
    "solution": "Criamos galerias de projetos por ambiente (cozinha, quartos, salas), integrando depoimentos e chamadas fortes para agendamento de orçamentos.",
    "image": "/images/portfolio/arte-formatti/Projeto01.png",
    "gallery": [
        "/images/portfolio/arte-formatti/Projeto01.png",
        "/images/portfolio/arte-formatti/Projeto02.png",
        "/images/portfolio/arte-formatti/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Galeria de Projetos",
        "Testemunhos",
        "Agendamento Online"
    ],
    "results": "+80% Fechamento de Orçamentos",
    "url": "https://arte-formatti.vercel.app/"
},
  {
    "id": "grippa-spa",
    "title": "Grippa Spa",
    "category": "website",
    "client": "Grippa Spa",
    "description": "Relaxamento e bem-estar para corpo e mente",
    "fullDescription": "Site para um spa e centro de bem-estar. Apresenta os serviços de massagens, tratamentos estéticos e terapias relaxantes, focando na tranquilidade do ambiente.",
    "challenge": "Transmitir calma, profissionalismo e os benefícios dos tratamentos de forma digital, além de facilitar o agendamento de horários pelos clientes.",
    "solution": "Layout com tons suaves, tipografia elegante, descrição detalhada dos procedimentos e um sistema simples de contato para agendamentos e compra de vouchers.",
    "image": "/images/portfolio/grippa-spa/Projeto01.png",
    "gallery": [
        "/images/portfolio/grippa-spa/Projeto01.png",
        "/images/portfolio/grippa-spa/Projeto02.png",
        "/images/portfolio/grippa-spa/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Design Suave",
        "Menu de Serviços",
        "Agendamento Faciliato"
    ],
    "results": "+150% em Agendamentos pelo site",
    "url": "https://grippaspa.vercel.app/"
},
  {
    "id": "masa-viva",
    "title": "Masa Viva",
    "category": "website",
    "client": "Masa Viva",
    "description": "A verdadeira pizza de longa fermentação",
    "fullDescription": "Site para uma pizzaria focada em fermentação natural (Masa Viva) e ingredientes selecionados. Destaca o cardápio, a técnica artesanal e o ambiente do restaurante.",
    "challenge": "Diferenciar a pizzaria no mercado local enfatizando a qualidade da massa de longa fermentação e facilitar o acesso ao menu para pedidos de delivery ou retirada.",
    "solution": "Design que destaca a textura e o processo artesanal, com integração direta para o sistema de delivery (iFood/WhatsApp) e mapa de localização.",
    "image": "/images/portfolio/masa-viva/Projeto01.png",
    "gallery": [
        "/images/portfolio/masa-viva/Projeto01.png",
        "/images/portfolio/masa-viva/Projeto02.png",
        "/images/portfolio/masa-viva/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Integração Delivery",
        "Cardápio Artesanal",
        "Mapa de Localização"
    ],
    "results": "Aumento no fluxo de pedidos diretos",
    "url": "https://masaviva.vercel.app/"
},
  {
    "id": "jaco-academia",
    "title": "Jaco Academia",
    "category": "website",
    "client": "Jaco Academia",
    "description": "Estrutura completa para você alcançar seus objetivos",
    "fullDescription": "Site para uma academia de ginástica, apresentando os planos, as modalidades oferecidas (musculação, aulas coletivas) e a estrutura do local.",
    "challenge": "Apresentar a infraestrutura da academia e os planos de forma clara, incentivando novas matrículas e a marcação de aulas experimentais.",
    "solution": "Página dinâmica com informações sobre os professores, grade de horários, fotos do maquinário e um processo simples de pré-matrícula online.",
    "image": "/images/portfolio/jaco-academia/Projeto01.png",
    "gallery": [
        "/images/portfolio/jaco-academia/Projeto01.png",
        "/images/portfolio/jaco-academia/Projeto02.png",
        "/images/portfolio/jaco-academia/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Planos Dinâmicos",
        "Grade de Horários",
        "Pré-matrícula"
    ],
    "results": "+20% em Novas Matrículas",
    "url": "https://jacoacademia.vercel.app/"
},
  {
    "id": "marcenaria-ee",
    "title": "Marcenaria E.E.",
    "category": "website",
    "client": "Marcenaria E.E.",
    "description": "Marcenaria tradicional com qualidade e precisão",
    "fullDescription": "Site focado em apresentar os serviços de uma marcenaria tradicional e focada em qualidade. Apresenta o portfólio de cozinhas, gabinetes, closets e painéis.",
    "challenge": "Digitalizar um negócio tradicional de marcenaria e construir confiança mostrando trabalhos anteriores para capturar clientes buscando serviços sob medida.",
    "solution": "Criamos um site com foco na visualização de antes/depois e detalhes de acabamento, facilitando orçamentos através de chamadas para o WhatsApp.",
    "image": "/images/portfolio/marcenaria-ee/Projeto01.png",
    "gallery": [
        "/images/portfolio/marcenaria-ee/Projeto01.png",
        "/images/portfolio/marcenaria-ee/Projeto02.png",
        "/images/portfolio/marcenaria-ee/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Portfólio de Projetos",
        "Foco em Acabamento",
        "Contato Facilitado"
    ],
    "results": "Crescimento contínuo na captação B2C",
    "url": "https://marcenaria-e-e.vercel.app/"
},
  
  {
    "id": "mx-performance",
    "title": "MX Performance Nutrition",
    "category": "ecommerce",
    "client": "MX Performance Nutrition",
    "description": "Suplementos de alta performance para atletas",
    "fullDescription": "Loja online de suplementos esportivos, focada em produtos de alta qualidade como Whey Protein, Creatina e Pré-treinos, projetada para impulsionar o desempenho de atletas.",
    "challenge": "Criar uma plataforma de vendas direta ao consumidor (D2C) que transmita confiança, energia e facilite a conversão de vendas para o público fitness.",
    "solution": "Desenvolvemos um e-commerce moderno e rápido, com catálogo de produtos otimizado, carrinho de compras intuitivo e layout voltado para conversão.",
    "image": "/images/portfolio/mx-performance/Projeto01.png",
    "gallery": [
        "/images/portfolio/mx-performance/Projeto01.png",
        "/images/portfolio/mx-performance/Projeto02.png",
        "/images/portfolio/mx-performance/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Catálogo de Produtos",
        "Carrinho Intuitivo",
        "Otimização de Conversão"
    ],
    "results": "+150% em Vendas Online",
    "url": "https://mx-performance-nutrition.vercel.app/"
},
  {
    "id": "hera-verde",
    "title": "Hera Verde",
    "category": "website",
    "client": "Hera Verde",
    "description": "Plantas e paisagismo para transformar ambientes",
    "fullDescription": "Site institucional para uma loja/serviço de paisagismo, apresentando seus produtos, serviços e dicas de cuidados com plantas, com um visual natural e relaxante.",
    "challenge": "Digitalizar a apresentação do portfólio de paisagismo e facilitar o contato de clientes buscando serviços de jardinagem e compra de plantas.",
    "solution": "Criamos um site com design limpo, foco em imagens de alta qualidade dos arranjos e jardins, e formulários de contato integrados para orçamentos.",
    "image": "/images/portfolio/hera-verde/Projeto01.png",
    "gallery": [
        "/images/portfolio/hera-verde/Projeto01.png",
        "/images/portfolio/hera-verde/Projeto02.png",
        "/images/portfolio/hera-verde/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Catálogo de Serviços",
        "Design Limpo",
        "Geração de Leads"
    ],
    "results": "+200% Pedidos de Orçamento",
    "url": "https://heraverde.vercel.app/"
},
  {
    "id": "terra-nova",
    "title": "Terra Nova Restaurante",
    "category": "website",
    "client": "Terra Nova Restaurante",
    "description": "Sabores autênticos e ingredientes frescos",
    "fullDescription": "Site para o restaurante Terra Nova, destacando o menu, o ambiente acolhedor e facilitando reservas, focado na culinária local com ingredientes selecionados.",
    "challenge": "Atrair novos clientes online, exibir o cardápio de forma apetitosa e simplificar o processo de reserva de mesas.",
    "solution": "Desenvolvimento de uma vitrine digital com menu interativo, galeria de fotos dos pratos e integração com sistema de reservas online.",
    "image": "/images/portfolio/terra-nova/Projeto01.png",
    "gallery": [
        "/images/portfolio/terra-nova/Projeto01.png",
        "/images/portfolio/terra-nova/Projeto02.png",
        "/images/portfolio/terra-nova/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Cardápio Interativo",
        "Sistema de Reservas",
        "Galeria de Fotos"
    ],
    "results": "+80% em Reservas Antecipadas",
    "url": "https://terranovarestaurante-ptt5.vercel.app/"
},
  {
    "id": "cafe-porque-sou-cult",
    "title": "Café Porque Sou Cult",
    "category": "website",
    "client": "Café Porque Sou Cult",
    "description": "Cafeteria boutique para amantes de cafés especiais",
    "fullDescription": "Presença online para uma cafeteria especializada, apresentando seus grãos selecionados, menu de bebidas e a atmosfera 'cult' e aconchegante do local.",
    "challenge": "Comunicar o posicionamento premium e cultural da marca, além de atrair tráfego local para a loja física.",
    "solution": "Criamos um site focado em storytelling da origem dos grãos, design minimalista e SEO local para capturar clientes na região.",
    "image": "/images/portfolio/cafe-porque-sou-cult/Projeto01.png",
    "gallery": [
        "/images/portfolio/cafe-porque-sou-cult/Projeto01.png",
        "/images/portfolio/cafe-porque-sou-cult/Projeto02.png",
        "/images/portfolio/cafe-porque-sou-cult/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Storytelling da Marca",
        "Menu Digital",
        "Otimização SEO Local"
    ],
    "results": "Destaque nas buscas locais",
    "url": "https://cafeporquesoucult.vercel.app/"
},
  {
    "id": "the-coffee",
    "title": "The Coffee SS",
    "category": "website",
    "client": "The Coffee SS",
    "description": "Café minimalista e moderno no estilo to-go",
    "fullDescription": "Landing page para a The Coffee SS, focada em um estilo de vida rápido e moderno, apresentando o cardápio e a conveniência de pedir e retirar.",
    "challenge": "Refletir a agilidade e o minimalismo da marca no ambiente digital, facilitando o acesso ao menu para clientes em movimento.",
    "solution": "Interface super limpa e rápida (mobile-first), destacando as opções de café e a localização da loja para o público urbano.",
    "image": "/images/portfolio/the-coffee/Projeto01.png",
    "gallery": [
        "/images/portfolio/the-coffee/Projeto01.png",
        "/images/portfolio/the-coffee/Projeto02.png",
        "/images/portfolio/the-coffee/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Design Mobile-first",
        "Menu To-go",
        "Localizador"
    ],
    "results": "+60% de acessos mobile",
    "url": "https://thecoffeess.vercel.app/"
},
  {
    "id": "cao-della",
    "title": "Cao Della",
    "category": "ecommerce",
    "client": "Cao Della",
    "description": "Produtos premium e exclusivos para pets",
    "fullDescription": "Loja online voltada para o mercado pet de luxo, oferecendo acessórios, camas e itens de cuidado com design exclusivo para cães.",
    "challenge": "Entrar no mercado de nicho pet premium com uma loja virtual que passasse sofisticação e segurança para os tutores.",
    "solution": "E-commerce robusto com navegação por categorias, destaque para os detalhes dos produtos e fluxo de checkout otimizado.",
    "image": "/images/portfolio/cao-della/Projeto01.png",
    "gallery": [
        "/images/portfolio/cao-della/Projeto01.png",
        "/images/portfolio/cao-della/Projeto02.png",
        "/images/portfolio/cao-della/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "E-commerce",
        "Categorização",
        "Checkout Otimizado"
    ],
    "results": "+300% de Crescimento Mensal",
    "url": "https://caodella.vercel.app/"
},
  {
    "id": "sentimental-cafe",
    "title": "Sentimental Café",
    "category": "website",
    "client": "Sentimental Café",
    "description": "Cafés especiais e doces artesanais",
    "fullDescription": "Site para o Sentimental Café, destacando seu cardápio de cafés e doces caseiros em um ambiente focado no conforto e bem-estar do cliente.",
    "challenge": "Transmitir a essência acolhedora do espaço físico para o digital, atraindo clientes para conhecerem os bolos e cafés artesanais.",
    "solution": "Design aconchegante com uso de cores quentes, galeria de fotos de dar água na boca e informações claras sobre horários e localização.",
    "image": "/images/portfolio/sentimental-cafe/Projeto01.png",
    "gallery": [
        "/images/portfolio/sentimental-cafe/Projeto01.png",
        "/images/portfolio/sentimental-cafe/Projeto02.png",
        "/images/portfolio/sentimental-cafe/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Galeria de Fotos",
        "Design Aconchegante",
        "Menu Digital"
    ],
    "results": "Forte Engajamento da Comunidade",
    "url": "https://setimentalcafe.vercel.app/"
},
  {
    "id": "saint-german",
    "title": "Saint German",
    "category": "website",
    "client": "Saint German",
    "description": "Pães de fermentação natural e confeitaria fina",
    "fullDescription": "Site institucional para a padaria artesanal Saint German, apresentando sua variedade de pães, doces e aceitando encomendas especiais para eventos.",
    "challenge": "Facilitar o processo de encomendas de pães e bolos que antes era feito manualmente por telefone, além de modernizar a imagem da marca.",
    "solution": "Desenvolvimento de um catálogo digital atrativo com integração direta para pedidos via WhatsApp e formulários de encomenda customizados.",
    "image": "/images/portfolio/saint-german/Projeto01.png",
    "gallery": [
        "/images/portfolio/saint-german/Projeto01.png",
        "/images/portfolio/saint-german/Projeto02.png",
        "/images/portfolio/saint-german/Projeto03.png"
    ],
    "technologies": [
        "Next.js",
        "React",
        "Tailwind CSS"
    ],
    "features": [
        "Catálogo de Produtos",
        "Integração WhatsApp",
        "Formulário de Encomendas"
    ],
    "results": "-50% no tempo de atendimento",
    "url": "https://saintgermansite.vercel.app/"
},
  
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
