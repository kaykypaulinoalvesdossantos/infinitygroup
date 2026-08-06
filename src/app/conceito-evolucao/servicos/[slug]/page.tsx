import Link from "next/link"
import { ArrowRight, Check, CircleCheck, Code2, Layers3, ShieldCheck, Sparkles, Zap } from "lucide-react"
import { SiteFooter, SiteHeader } from "../../_components/site-chrome"
import { Floating, PageMotion, ParallaxImage, Reveal, StaggerGrid, StaggerItem } from "../../_components/motion-system"
import styles from "../../pages.module.css"

const serviceData = {
  software: {
    label: "SOFTWARE SOB MEDIDA",
    title: "Tecnologia construída para a lógica do seu negócio.",
    text: "Sistemas e plataformas que organizam operações complexas, conectam dados e acompanham o crescimento da empresa.",
    image: "/images/programador-pc.webp",
    accent: "Arquitetura · Produto · Engenharia",
    outcomes: ["Centralizar processos e informações", "Substituir planilhas e sistemas limitados", "Criar produtos SaaS e plataformas", "Integrar áreas, parceiros e clientes"],
    capabilities: ["Sistemas corporativos", "Plataformas SaaS", "Portais B2B e B2C", "APIs e integrações", "Dashboards operacionais", "Modernização de legado"],
  },
  automacoes: {
    label: "AUTOMAÇÃO & IA",
    title: "Menos tarefas repetidas. Mais operação em movimento.",
    text: "Automatizamos rotinas, conectamos ferramentas e aplicamos inteligência artificial onde ela realmente reduz esforço e acelera decisões.",
    image: "/images/processoatomação.webp",
    accent: "Workflows · Agentes · Integrações",
    outcomes: ["Eliminar tarefas manuais e retrabalho", "Reduzir erros em processos críticos", "Conectar sistemas que não conversam", "Criar agentes para atendimento e operação"],
    capabilities: ["Automação de processos", "Agentes de IA", "Integrações via API", "RPA e workflows", "Processamento de documentos", "Alertas e rotinas inteligentes"],
  },
  aplicativos: {
    label: "APLICATIVOS WEB & MOBILE",
    title: "Sua operação e seus clientes em qualquer tela.",
    text: "Aplicativos rápidos, intuitivos e conectados ao negócio — da primeira experiência até o uso recorrente.",
    image: "/images/coceitoapp.webp",
    accent: "iOS · Android · Web Apps",
    outcomes: ["Lançar um novo produto digital", "Levar processos para equipes de campo", "Criar novas jornadas para clientes", "Unificar experiências web e mobile"],
    capabilities: ["Apps iOS e Android", "Aplicações web", "Portais do cliente", "Experiência UX/UI", "Notificações e geolocalização", "Operação offline-first"],
  },
  websites: {
    label: "WEBSITES DE ALTA PERFORMANCE",
    title: "Um site que mostra a força real da sua empresa.",
    text: "Estratégia, conteúdo, design e tecnologia trabalhando juntos para posicionar a marca e transformar visitas em oportunidades.",
    image: "/images/processodedesenvolvimentowebsite.webp",
    accent: "Marca · Conteúdo · Conversão",
    outcomes: ["Reposicionar a presença digital", "Aumentar geração de oportunidades", "Apresentar produtos com mais clareza", "Ganhar performance, SEO e autoridade"],
    capabilities: ["Sites institucionais", "Landing pages", "Arquitetura de conteúdo", "SEO técnico", "Performance e analytics", "CMS e integrações"],
  },
  ecommerce: {
    label: "E-COMMERCE",
    title: "Experiências de compra preparadas para vender mais.",
    text: "Lojas digitais que conectam catálogo, pagamento, logística e relacionamento sem perder a identidade da marca.",
    image: "/images/ecommerce.webp",
    accent: "B2B · B2C · Operação",
    outcomes: ["Criar um novo canal de vendas", "Simplificar a jornada de compra", "Integrar estoque, pagamento e logística", "Atender operações B2B complexas"],
    capabilities: ["E-commerce B2C", "Portais de venda B2B", "Checkout e pagamentos", "Catálogos personalizados", "Integração com ERP", "Analytics de conversão"],
  },
  marketing: {
    label: "MARKETING DIGITAL",
    title: "Aquisição conectada à experiência e aos dados.",
    text: "Estratégia, mídia, conteúdo e tecnologia organizados em uma jornada que gera demanda e mostra o que realmente converte.",
    image: "/images/marketing_funnel.png",
    accent: "Campanhas · Conteúdo · Dados",
    outcomes: ["Gerar demanda qualificada", "Organizar campanhas e páginas", "Medir a jornada completa", "Integrar marketing, vendas e CRM"],
    capabilities: ["Planejamento digital", "Mídia de performance", "Landing pages", "Conteúdo e criativos", "Analytics e tracking", "Integração com CRM"],
  },
} as const

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = serviceData[params.slug as keyof typeof serviceData] || serviceData.software
  return <PageMotion className={styles.sitePage}>
    <SiteHeader transparent />
    <section className={styles.serviceDetailHero}>
      <div className={styles.serviceDetailCopy}>
        <div className={styles.marker}><span>SERVIÇO</span><i />{service.label}</div>
        <h1>{service.title}</h1>
        <p>{service.text}</p>
        <div className={styles.heroButtons}><Link href="/conceito-evolucao/contato">Conversar sobre o projeto <ArrowRight /></Link><Link href="/conceito-evolucao/portfolio">Ver projetos relacionados</Link></div>
        <small>{service.accent}</small>
      </div>
      <Floating className={styles.serviceDetailMedia}>
        <ParallaxImage src={service.image} alt={service.label} />
        <div className={styles.mediaScan} />
        <span><Sparkles /> INFINITY DELIVERY SYSTEM</span>
      </Floating>
    </section>

    <section className={styles.servicePromise}>
      <Reveal><div className={styles.marker}><span>01</span><i />QUANDO FAZ SENTIDO</div><div className={styles.splitHeading}><h2>O desafio deixa de ser abstrato.<br /><span>O caminho fica visível.</span></h2><p>A solução começa pelo resultado esperado e pela realidade de quem vai usar, operar e manter o produto.</p></div></Reveal>
      <StaggerGrid className={styles.outcomeGrid}>{service.outcomes.map((outcome,index)=><StaggerItem key={outcome}><article><span>0{index+1}</span><CircleCheck/><h3>{outcome}</h3></article></StaggerItem>)}</StaggerGrid>
    </section>

    <section className={styles.capabilitySection}>
      <Reveal><div className={styles.marker}><span>02</span><i />O QUE PODEMOS CONSTRUIR</div><h2>Capacidades que se combinam conforme o projeto.</h2></Reveal>
      <div className={styles.capabilityList}>{service.capabilities.map((capability,index)=><Reveal key={capability} delay={index*.06}><div><span>{String(index+1).padStart(2,"0")}</span><strong>{capability}</strong><ArrowRight/></div></Reveal>)}</div>
    </section>

    <section className={styles.deliverySection}>
      <div className={styles.deliveryVisual}><img src={service.image} alt="Processo de desenvolvimento Infinity"/><div><Code2/><strong>Construção com contexto.</strong><span>Decisões visíveis e evolução contínua.</span></div></div>
      <div className={styles.deliveryCopy}><Reveal><div className={styles.marker}><span>03</span><i />COMO ENTREGAMOS</div><h2>Clareza em cada etapa. Movimento durante todo o projeto.</h2><p>Você acompanha decisões, protótipos e entregas incrementais. O produto nasce validado e preparado para continuar evoluindo.</p></Reveal><div className={styles.deliverySteps}>{["Imersão e diagnóstico","Estratégia e arquitetura","Experiência e protótipo","Desenvolvimento incremental","Implantação e evolução"].map((step,index)=><Reveal key={step} delay={index*.07}><div><span>0{index+1}</span><strong>{step}</strong><Check/></div></Reveal>)}</div></div>
    </section>

    <section className={styles.serviceProof}><ShieldCheck/><div><small>PARCERIA DE LONGO PRAZO</small><h2>A entrega coloca o produto no ar. A parceria mantém o negócio avançando.</h2></div><Link href="/conceito-evolucao/contato">Iniciar diagnóstico <ArrowRight/></Link></section>
    <SiteFooter />
  </PageMotion>
}
