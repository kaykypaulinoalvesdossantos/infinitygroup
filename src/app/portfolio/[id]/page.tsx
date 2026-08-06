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
