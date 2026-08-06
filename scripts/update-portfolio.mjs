import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newProjects = [
  {
    id: "mx-performance",
    title: "MX Performance Nutrition",
    category: "ecommerce",
    client: "MX Performance Nutrition",
    description: "Suplementos de alta performance para atletas",
    fullDescription: "Loja online de suplementos esportivos, focada em produtos de alta qualidade como Whey Protein, Creatina e Pré-treinos, projetada para impulsionar o desempenho de atletas.",
    challenge: "Criar uma plataforma de vendas direta ao consumidor (D2C) que transmita confiança, energia e facilite a conversão de vendas para o público fitness.",
    solution: "Desenvolvemos um e-commerce moderno e rápido, com catálogo de produtos otimizado, carrinho de compras intuitivo e layout voltado para conversão.",
    image: "/images/portfolio/mx-performance/Projeto01.png",
    gallery: [
      "/images/portfolio/mx-performance/Projeto01.png",
      "/images/portfolio/mx-performance/Projeto02.png",
      "/images/portfolio/mx-performance/Projeto03.png",
    ],
    technologies: ["Next.js", "React", "Tailwind CSS"],
    features: ["Catálogo de Produtos", "Carrinho Intuitivo", "Otimização de Conversão"],
    results: "+150% em Vendas Online",
    url: "https://mx-performance-nutrition.vercel.app/"
  },
  {
    id: "hera-verde",
    title: "Hera Verde",
    category: "website",
    client: "Hera Verde",
    description: "Plantas e paisagismo para transformar ambientes",
    fullDescription: "Site institucional para uma loja/serviço de paisagismo, apresentando seus produtos, serviços e dicas de cuidados com plantas, com um visual natural e relaxante.",
    challenge: "Digitalizar a apresentação do portfólio de paisagismo e facilitar o contato de clientes buscando serviços de jardinagem e compra de plantas.",
    solution: "Criamos um site com design limpo, foco em imagens de alta qualidade dos arranjos e jardins, e formulários de contato integrados para orçamentos.",
    image: "/images/portfolio/hera-verde/Projeto01.png",
    gallery: [
      "/images/portfolio/hera-verde/Projeto01.png",
      "/images/portfolio/hera-verde/Projeto02.png",
      "/images/portfolio/hera-verde/Projeto03.png",
    ],
    technologies: ["Next.js", "React", "Tailwind CSS"],
    features: ["Catálogo de Serviços", "Design Limpo", "Geração de Leads"],
    results: "+200% Pedidos de Orçamento",
    url: "https://heraverde.vercel.app/"
  },
  {
    id: "terra-nova",
    title: "Terra Nova Restaurante",
    category: "website",
    client: "Terra Nova Restaurante",
    description: "Sabores autênticos e ingredientes frescos",
    fullDescription: "Site para o restaurante Terra Nova, destacando o menu, o ambiente acolhedor e facilitando reservas, focado na culinária local com ingredientes selecionados.",
    challenge: "Atrair novos clientes online, exibir o cardápio de forma apetitosa e simplificar o processo de reserva de mesas.",
    solution: "Desenvolvimento de uma vitrine digital com menu interativo, galeria de fotos dos pratos e integração com sistema de reservas online.",
    image: "/images/portfolio/terra-nova/Projeto01.png",
    gallery: [
      "/images/portfolio/terra-nova/Projeto01.png",
      "/images/portfolio/terra-nova/Projeto02.png",
      "/images/portfolio/terra-nova/Projeto03.png",
    ],
    technologies: ["Next.js", "React", "Tailwind CSS"],
    features: ["Cardápio Interativo", "Sistema de Reservas", "Galeria de Fotos"],
    results: "+80% em Reservas Antecipadas",
    url: "https://terranovarestaurante-ptt5.vercel.app/"
  },
  {
    id: "cafe-porque-sou-cult",
    title: "Café Porque Sou Cult",
    category: "website",
    client: "Café Porque Sou Cult",
    description: "Cafeteria boutique para amantes de cafés especiais",
    fullDescription: "Presença online para uma cafeteria especializada, apresentando seus grãos selecionados, menu de bebidas e a atmosfera 'cult' e aconchegante do local.",
    challenge: "Comunicar o posicionamento premium e cultural da marca, além de atrair tráfego local para a loja física.",
    solution: "Criamos um site focado em storytelling da origem dos grãos, design minimalista e SEO local para capturar clientes na região.",
    image: "/images/portfolio/cafe-porque-sou-cult/Projeto01.png",
    gallery: [
      "/images/portfolio/cafe-porque-sou-cult/Projeto01.png",
      "/images/portfolio/cafe-porque-sou-cult/Projeto02.png",
      "/images/portfolio/cafe-porque-sou-cult/Projeto03.png",
    ],
    technologies: ["Next.js", "React", "Tailwind CSS"],
    features: ["Storytelling da Marca", "Menu Digital", "Otimização SEO Local"],
    results: "Destaque nas buscas locais",
    url: "https://cafeporquesoucult.vercel.app/"
  },
  {
    id: "the-coffee",
    title: "The Coffee SS",
    category: "website",
    client: "The Coffee SS",
    description: "Café minimalista e moderno no estilo to-go",
    fullDescription: "Landing page para a The Coffee SS, focada em um estilo de vida rápido e moderno, apresentando o cardápio e a conveniência de pedir e retirar.",
    challenge: "Refletir a agilidade e o minimalismo da marca no ambiente digital, facilitando o acesso ao menu para clientes em movimento.",
    solution: "Interface super limpa e rápida (mobile-first), destacando as opções de café e a localização da loja para o público urbano.",
    image: "/images/portfolio/the-coffee/Projeto01.png",
    gallery: [
      "/images/portfolio/the-coffee/Projeto01.png",
      "/images/portfolio/the-coffee/Projeto02.png",
      "/images/portfolio/the-coffee/Projeto03.png",
    ],
    technologies: ["Next.js", "React", "Tailwind CSS"],
    features: ["Design Mobile-first", "Menu To-go", "Localizador"],
    results: "+60% de acessos mobile",
    url: "https://thecoffeess.vercel.app/"
  },
  {
    id: "cao-della",
    title: "Cao Della",
    category: "ecommerce",
    client: "Cao Della",
    description: "Produtos premium e exclusivos para pets",
    fullDescription: "Loja online voltada para o mercado pet de luxo, oferecendo acessórios, camas e itens de cuidado com design exclusivo para cães.",
    challenge: "Entrar no mercado de nicho pet premium com uma loja virtual que passasse sofisticação e segurança para os tutores.",
    solution: "E-commerce robusto com navegação por categorias, destaque para os detalhes dos produtos e fluxo de checkout otimizado.",
    image: "/images/portfolio/cao-della/Projeto01.png",
    gallery: [
      "/images/portfolio/cao-della/Projeto01.png",
      "/images/portfolio/cao-della/Projeto02.png",
      "/images/portfolio/cao-della/Projeto03.png",
    ],
    technologies: ["Next.js", "React", "Tailwind CSS"],
    features: ["E-commerce", "Categorização", "Checkout Otimizado"],
    results: "+300% de Crescimento Mensal",
    url: "https://caodella.vercel.app/"
  },
  {
    id: "sentimental-cafe",
    title: "Sentimental Café",
    category: "website",
    client: "Sentimental Café",
    description: "Cafés especiais e doces artesanais",
    fullDescription: "Site para o Sentimental Café, destacando seu cardápio de cafés e doces caseiros em um ambiente focado no conforto e bem-estar do cliente.",
    challenge: "Transmitir a essência acolhedora do espaço físico para o digital, atraindo clientes para conhecerem os bolos e cafés artesanais.",
    solution: "Design aconchegante com uso de cores quentes, galeria de fotos de dar água na boca e informações claras sobre horários e localização.",
    image: "/images/portfolio/sentimental-cafe/Projeto01.png",
    gallery: [
      "/images/portfolio/sentimental-cafe/Projeto01.png",
      "/images/portfolio/sentimental-cafe/Projeto02.png",
      "/images/portfolio/sentimental-cafe/Projeto03.png",
    ],
    technologies: ["Next.js", "React", "Tailwind CSS"],
    features: ["Galeria de Fotos", "Design Aconchegante", "Menu Digital"],
    results: "Forte Engajamento da Comunidade",
    url: "https://setimentalcafe.vercel.app/"
  },
  {
    id: "saint-german",
    title: "Saint German",
    category: "website",
    client: "Saint German",
    description: "Pães de fermentação natural e confeitaria fina",
    fullDescription: "Site institucional para a padaria artesanal Saint German, apresentando sua variedade de pães, doces e aceitando encomendas especiais para eventos.",
    challenge: "Facilitar o processo de encomendas de pães e bolos que antes era feito manualmente por telefone, além de modernizar a imagem da marca.",
    solution: "Desenvolvimento de um catálogo digital atrativo com integração direta para pedidos via WhatsApp e formulários de encomenda customizados.",
    image: "/images/portfolio/saint-german/Projeto01.png",
    gallery: [
      "/images/portfolio/saint-german/Projeto01.png",
      "/images/portfolio/saint-german/Projeto02.png",
      "/images/portfolio/saint-german/Projeto03.png",
    ],
    technologies: ["Next.js", "React", "Tailwind CSS"],
    features: ["Catálogo de Produtos", "Integração WhatsApp", "Formulário de Encomendas"],
    results: "-50% no tempo de atendimento",
    url: "https://saintgermansite.vercel.app/"
  }
];

const injectProjectsInFile = (filePath, projectsToAdd) => {
  const code = fs.readFileSync(filePath, 'utf-8');

  const regex = /const\s+portfolioItems\s*=\s*\[/;
  const match = code.match(regex);

  if (!match) {
    console.error(`Could not find portfolioItems in ${filePath}`);
    return;
  }

  const insertIndex = match.index + match[0].length;

  const newProjectsStr = projectsToAdd.map(p => JSON.stringify(p, null, 4)).join(',\n  ') + ',\n  ';

  const newCode = code.slice(0, insertIndex) + '\n  ' + newProjectsStr + code.slice(insertIndex);

  fs.writeFileSync(filePath, newCode);
  console.log(`Updated ${filePath}`);
};

const pagePath = path.join(__dirname, '..', 'src', 'app', 'portfolio', 'page.tsx');
const detailPath = path.join(__dirname, '..', 'src', 'app', 'portfolio', '[id]', 'page.tsx');

injectProjectsInFile(pagePath, newProjects);
injectProjectsInFile(detailPath, newProjects);
