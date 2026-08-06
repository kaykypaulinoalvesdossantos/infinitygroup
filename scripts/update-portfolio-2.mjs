import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newProjects = [
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
    "technologies": ["Next.js", "React", "Tailwind CSS"],
    "features": ["Catálogo Digital", "Verificação de Idade", "Design Premium"],
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
    "technologies": ["Next.js", "React", "Tailwind CSS"],
    "features": ["Menu Digital", "Seção de Encomendas", "Design Fotográfico"],
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
    "technologies": ["Next.js", "React", "Tailwind CSS"],
    "features": ["Catálogo Visual", "Integração WhatsApp", "Landing Page Otimizada"],
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
    "technologies": ["Next.js", "React", "Tailwind CSS"],
    "features": ["Portfólio B2B", "Design Corporativo", "Captação de Leads"],
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
    "technologies": ["Next.js", "React", "Tailwind CSS"],
    "features": ["Galeria de Projetos", "Testemunhos", "Agendamento Online"],
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
    "technologies": ["Next.js", "React", "Tailwind CSS"],
    "features": ["Design Suave", "Menu de Serviços", "Agendamento Faciliato"],
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
    "technologies": ["Next.js", "React", "Tailwind CSS"],
    "features": ["Integração Delivery", "Cardápio Artesanal", "Mapa de Localização"],
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
    "technologies": ["Next.js", "React", "Tailwind CSS"],
    "features": ["Planos Dinâmicos", "Grade de Horários", "Pré-matrícula"],
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
    "technologies": ["Next.js", "React", "Tailwind CSS"],
    "features": ["Portfólio de Projetos", "Foco em Acabamento", "Contato Facilitado"],
    "results": "Crescimento contínuo na captação B2C",
    "url": "https://marcenaria-e-e.vercel.app/"
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