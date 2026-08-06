import Link from "next/link"
import {
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Bot,
  Boxes,
  Braces,
  Check,
  CircleCheck,
  CloudCog,
  Code2,
  Gauge,
  Globe2,
  Layers3,
  LockKeyhole,
  MessageCircle,
  Network,
  Play,
  Rocket,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Users,
  Workflow,
  Zap,
} from "lucide-react"
import { EvoLogo, SiteFooter, SiteHeader } from "../_components/site-chrome"
import { Floating, PageMotion, ParallaxImage, Reveal, SlideReveal, StaggerGrid, StaggerItem } from "../_components/motion-system"
import { ContactJourney, PortfolioGallery } from "../_components/interactive-blocks"
import styles from "../pages.module.css"

function Marker({ index, children }: { index: string; children: React.ReactNode }) {
  return <div className={styles.marker}><span>{index}</span><i />{children}</div>
}

function PageCta({ title = "Pronto para colocar seu próximo projeto em movimento?" }: { title?: string }) {
  return <Reveal><section className={styles.pageCta}><div className={styles.ctaOrb} /><small>VAMOS CONSTRUIR O PRÓXIMO</small><h2>{title}</h2><Link href="/conceito-evolucao/contato">Conversar com a Infinity <ArrowRight /></Link></section></Reveal>
}

function ProductsPage() {
  return <PageMotion className={styles.sitePage}>
    <SiteHeader transparent />
    <section className={`${styles.innerHero} ${styles.productHero}`}>
      <div className={styles.heroNoise} />
      <div className={styles.innerHeroCopy}><Marker index="PRODUTO">INFINITY CRM</Marker><h1>Relacionamento, vendas e operação <span>em um só fluxo.</span></h1><p>Uma plataforma criada pela Infinity para empresas que precisam enxergar o comercial inteiro e agir antes das oportunidades esfriarem.</p><div className={styles.heroButtons}><Link href="/conceito-evolucao/contato">Agendar demonstração <ArrowRight /></Link><a href="#produto"><Play fill="currentColor" /> Explorar recursos</a></div></div>
      <Floating className={styles.crmHeroVisual}>
        <img src="/images/crm/dashboard-team.png" alt="Infinity CRM em uso por uma equipe comercial" />
        <div className={styles.crmGlass}><small>PIPELINE ATIVO</small><strong>R$ 482.300</strong><span>+18,4% este mês</span></div>
        <div className={styles.crmGlassTwo}><BarChart3 /><span><small>CONVERSÃO</small><strong>32,8%</strong></span></div>
      </Floating>
      <div className={styles.heroScrollCue}>ROLE PARA EXPLORAR <i /></div>
    </section>

    <section id="produto" className={styles.lightSection}>
      <Reveal><Marker index="01">VISÃO COMPLETA</Marker><div className={styles.splitHeading}><h2>Menos telas abertas.<br /><span>Mais clareza para decidir.</span></h2><p>O Infinity CRM conecta cada etapa do relacionamento com seus clientes, sem engessar o processo que já funciona na sua empresa.</p></div></Reveal>
      <StaggerGrid className={styles.bentoGrid}>
        <StaggerItem className={styles.bentoWide}><div><Workflow /><small>FUNIL DE VENDAS</small><h3>Cada oportunidade no lugar certo.</h3><p>Visualize etapas, responsáveis, valores e próximas ações em uma jornada simples.</p></div><div className={styles.pipelineMock}><span>Novos leads <b>24</b></span><span>Em negociação <b>12</b></span><span>Proposta enviada <b>08</b></span><span>Fechados <b>06</b></span></div></StaggerItem>
        <StaggerItem><Zap /><small>AUTOMAÇÕES</small><h3>O sistema trabalha enquanto o time vende.</h3><p>Follow-ups, tarefas e alertas acionados no momento certo.</p></StaggerItem>
        <StaggerItem><BarChart3 /><small>INDICADORES</small><h3>Decisões baseadas no que está acontecendo agora.</h3><div className={styles.miniBars}><i /><i /><i /><i /><i /></div></StaggerItem>
        <StaggerItem><Users /><small>COLABORAÇÃO</small><h3>Contexto compartilhado entre vendas e atendimento.</h3><p>Histórico, responsáveis e interações acessíveis para todo o time.</p></StaggerItem>
        <StaggerItem className={styles.bentoDark}><ShieldCheck /><small>CONTROLE</small><h3>Permissões, segurança e rastreabilidade.</h3><p>Cada pessoa acessa exatamente o que precisa.</p></StaggerItem>
      </StaggerGrid>
    </section>

    <section className={styles.darkSection}>
      <Reveal><Marker index="02">IMPLANTAÇÃO</Marker><div className={styles.splitHeading}><h2>O produto é nosso.<br /><span>A implantação é sua.</span></h2><p>Configuramos o Infinity CRM para o processo real da sua empresa e acompanhamos o time até a operação ganhar ritmo.</p></div></Reveal>
      <div className={styles.processRail}>{["Diagnóstico comercial", "Configuração do processo", "Migração e integrações", "Treinamento do time", "Evolução contínua"].map((item,index)=><Reveal key={item} delay={index*.08}><div><span>0{index+1}</span><strong>{item}</strong><i /></div></Reveal>)}</div>
    </section>
    <PageCta title="Quer ver o Infinity CRM funcionando no seu processo?" />
    <SiteFooter />
  </PageMotion>
}

function PortfolioPage() {
  return <PageMotion className={styles.sitePage}>
    <SiteHeader transparent />
    <section className={`${styles.innerHero} ${styles.portfolioHero}`}><div className={styles.heroNoise}/><div className={styles.innerHeroCopy}><Marker index="PORTFÓLIO">PROJETOS QUE SE MOVEM</Marker><h1>Trabalhos que começam na tela e <span>continuam no resultado.</span></h1><p>Conheça experiências digitais criadas para aumentar vendas, organizar operações e fortalecer marcas.</p></div><div className={styles.portfolioHeroStack}><Floating><img src="/images/portfolio/EmilieBanko/Projeto01.png" alt="Projeto Emilie Banko" /></Floating><Floating delay={.7}><img src="/images/portfolio/Acctelecom/Projeto01.png" alt="Projeto ACC Telecom" /></Floating><Floating delay={1.4}><img src="/images/portfolio/Supertelecom/Projeto01.png" alt="Projeto Super Telecom" /></Floating></div></section>
    <section className={styles.portfolioSection}><Reveal><Marker index="01">CASES SELECIONADOS</Marker><div className={styles.splitHeading}><h2>Resultados reais.<br /><span>Em diferentes mercados.</span></h2><p>Filtre por tipo de projeto e explore como estratégia, design e tecnologia trabalharam juntos.</p></div></Reveal><PortfolioGallery /></section>
    <section className={styles.impactBand}><div><small>ACC TELECOM</small><strong>+200%</strong><span>leads qualificados</span></div><div><small>SUPER TELECOM</small><strong>−40%</strong><span>custo de aquisição</span></div><div><small>EMILIE BANKO</small><strong>+300%</strong><span>faturamento on-line</span></div></section>
    <PageCta title="Sua empresa pode ser o nosso próximo case." /><SiteFooter />
  </PageMotion>
}

const services = [
  { slug:"software", icon:Code2, title:"Software sob medida", text:"Sistemas, plataformas e produtos digitais construídos para a lógica específica da sua operação.", tags:["SaaS","ERPs","Portais","Integrações"], image:"/images/programador-pc.webp" },
  { slug:"automacoes", icon:Bot, title:"Automação & IA", text:"Processos inteligentes que eliminam tarefas manuais, conectam sistemas e aceleram decisões.", tags:["Workflows","Agentes IA","APIs","RPA"], image:"/images/processoatomação.webp" },
  { slug:"aplicativos", icon:Smartphone, title:"Aplicativos Web & Mobile", text:"Experiências rápidas, intuitivas e prontas para acompanhar o cliente em qualquer lugar.", tags:["iOS","Android","Web Apps","UX/UI"], image:"/images/coceitoapp.webp" },
  { slug:"websites", icon:Globe2, title:"Websites de alta performance", text:"Presença digital com estratégia, identidade, conteúdo e tecnologia focados em conversão.", tags:["Institucional","Landing Pages","SEO","Performance"], image:"/images/processodedesenvolvimentowebsite.webp" },
  { slug:"ecommerce", icon:Boxes, title:"E-commerce", text:"Lojas digitais que conectam marca, produto, pagamento e operação em uma experiência fluida.", tags:["B2B","B2C","Checkout","Integrações"], image:"/images/ecommerce.webp" },
  { slug:"marketing", icon:Target, title:"Marketing digital", text:"Estratégia, conteúdo e mídia conectados a páginas, dados e jornadas que geram oportunidades.", tags:["Campanhas","Conteúdo","Analytics","Conversão"], image:"/images/marketing_funnel.png" },
]

function ServicesPage() {
  return <PageMotion className={styles.sitePage}><SiteHeader transparent />
    <section className={`${styles.innerHero} ${styles.servicesHero}`}><div className={styles.heroNoise}/><div className={styles.innerHeroCopy}><Marker index="SERVIÇOS">DA ESTRATÉGIA À OPERAÇÃO</Marker><h1>Um ecossistema para construir, conectar e <span>fazer evoluir.</span></h1><p>A Infinity combina engenharia, design e visão de negócio em soluções digitais completas.</p></div><div className={styles.serviceOrbit}><span><Code2/>SOFTWARE</span><span><Bot/>IA</span><span><Smartphone/>APPS</span><span><Globe2/>WEB</span><i>∞</i></div></section>
    <section className={styles.servicesCatalog}><Reveal><Marker index="01">ESCOLHA O PRÓXIMO MOVIMENTO</Marker><div className={styles.splitHeading}><h2>Especialidades que trabalham <span>como um único time.</span></h2><p>Entre por uma necessidade específica ou deixe a Infinity desenhar a combinação certa para o desafio.</p></div></Reveal>
      <div className={styles.serviceCatalogList}>{services.map((service,index)=><SlideReveal key={service.slug} from={index%2===0?"left":"right"}><Link href={`/conceito-evolucao/servicos/${service.slug}`}><div className={styles.serviceNumber}>0{index+1}</div><div className={styles.catalogImage}><img src={service.image} alt={service.title}/></div><div className={styles.catalogCopy}><service.icon/><h3>{service.title}</h3><p>{service.text}</p><div>{service.tags.map(tag=><span key={tag}>{tag}</span>)}</div></div><ArrowRight className={styles.catalogArrow}/></Link></SlideReveal>)}</div>
    </section><PageCta/><SiteFooter />
  </PageMotion>
}

function AboutPage() {
  return <PageMotion className={styles.sitePage}><SiteHeader transparent />
    <section className={`${styles.innerHero} ${styles.aboutHero}`}><ParallaxImage src="/images/modern_office_glass_architecture.png" alt="Visão tecnológica Infinity" className={styles.aboutHeroImage}/><div className={styles.aboutHeroShade}/><div className={styles.innerHeroCopy}><Marker index="SOBRE">INFINITY GROUPS</Marker><h1>Tecnologia para empresas que <span>não querem parar.</span></h1><p>Somos uma empresa brasileira de tecnologia que combina proximidade, engenharia e visão de futuro.</p></div></section>
    <section className={styles.lightSection}><Reveal><Marker index="01">NOSSA FORMA DE TRABALHAR</Marker><div className={styles.manifesto}><h2>Entendemos antes de construir.<br/>Construímos para durar.<br/><span>Evoluímos junto com o negócio.</span></h2><p>A Infinity nasceu para aproximar tecnologia e operação. Nosso papel é transformar complexidade em produtos claros, confiáveis e úteis para quem está do outro lado da tela.</p></div></Reveal>
      <div className={styles.valuesGrid}>{[{icon:Search,title:"Curiosidade",text:"Perguntamos até entender o problema real."},{icon:Braces,title:"Profundidade",text:"Decisões técnicas sustentadas por boa engenharia."},{icon:MessageCircle,title:"Proximidade",text:"Comunicação direta durante toda a jornada."},{icon:Rocket,title:"Movimento",text:"Entrega é o início de uma evolução contínua."}].map((value,index)=><Reveal key={value.title} delay={index*.1}><article><value.icon/><span>0{index+1}</span><h3>{value.title}</h3><p>{value.text}</p></article></Reveal>)}</div>
    </section>
    <section className={styles.storySection}><div className={styles.storyMedia}><img src="/images/programador-pc.webp" alt="Desenvolvimento na Infinity"/><div>INFINITY / SÃO PAULO / BRASIL</div></div><div className={styles.storyCopy}><Marker index="02">NOSSA HISTÓRIA</Marker><h2>Uma parceria entre negócio, design e código.</h2><p>Trabalhamos com empresas que precisam lançar, modernizar ou integrar produtos digitais importantes para a operação.</p><div className={styles.storyTimeline}><div><span>Entender</span><p>Objetivos, usuários, processos e restrições.</p></div><div><span>Desenhar</span><p>Estratégia, arquitetura e experiência.</p></div><div><span>Construir</span><p>Desenvolvimento, validação e implantação.</p></div><div><span>Evoluir</span><p>Dados, aprendizado e melhoria contínua.</p></div></div></div></section>
    <PageCta title="Vamos construir uma relação que continua depois da entrega?"/><SiteFooter/>
  </PageMotion>
}

function ContactPage() {
  return <PageMotion className={styles.sitePage}><SiteHeader transparent />
    <section className={`${styles.innerHero} ${styles.contactHero}`}><div className={styles.heroNoise}/><div className={styles.innerHeroCopy}><Marker index="CONTATO">PRIMEIRO MOVIMENTO</Marker><h1>Conte o desafio.<br/><span>A gente ajuda a desenhar o caminho.</span></h1><p>Uma conversa objetiva com quem entende produto, operação e tecnologia — sem roteiro comercial genérico.</p></div><div className={styles.contactSignals}><div><MessageCircle/><span><strong>Direto com especialistas</strong><small>Sem intermediários.</small></span></div><div><ShieldCheck/><span><strong>Conversa confidencial</strong><small>Seu contexto protegido.</small></span></div><div><Zap/><span><strong>Retorno rápido</strong><small>Em até um dia útil.</small></span></div></div></section>
    <section className={styles.contactSection}><Reveal><Marker index="01">DIAGNÓSTICO INICIAL</Marker><div className={styles.splitHeading}><h2>Três passos para começar <span>uma conversa melhor.</span></h2><p>O formulário se adapta ao seu contexto e leva menos de três minutos.</p></div></Reveal><ContactJourney /></section>
    <section className={styles.directContact}><span>PREFERE FALAR AGORA?</span><a href="https://wa.me/5511945332464"><MessageCircle/> Conversar pelo WhatsApp <ArrowRight/></a><a href="mailto:contato@infinitygroup.tech">contato@infinitygroup.tech</a></section>
    <SiteFooter />
  </PageMotion>
}

function LoginPageClean() {
  return <PageMotion className={styles.loginPage}>
    <section className={styles.loginBrand}>
      <div className={styles.loginBrandTop}><EvoLogo /><Link href="/conceito-evolucao"><ArrowLeft /> Voltar ao site</Link></div>
      <div className={styles.loginBrandCopy}>
        <Marker index="PORTAL">&Aacute;REA DO CLIENTE</Marker>
        <h1>Sua opera&ccedil;&atilde;o continua em movimento.</h1>
        <p>Um espa&ccedil;o seguro para acompanhar servi&ccedil;os, documentos, solicita&ccedil;&otilde;es e tudo o que conecta sua empresa &agrave; Infinity.</p>
        <div className={styles.loginSignals}><span><i /> Dados protegidos</span><span><i /> Suporte especializado</span></div>
      </div>
      <div className={styles.loginConsole}>
        <div className={styles.consoleHeader}><span><i /> REDE INFINITY</span><small>ATUALIZADO AGORA</small></div>
        <div className={styles.consoleMain}><CircleCheck /><div><small>STATUS DOS SERVI&Ccedil;OS</small><strong>Todos os sistemas operando</strong></div><em>100%</em></div>
        <div className={styles.consoleBars}><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      </div>
      <div className={styles.loginBrandFooter}><span>INFINITY / CLIENT PORTAL</span><span>SESS&Atilde;O PROTEGIDA</span></div>
    </section>
    <section className={styles.loginSide}>
      <div className={styles.loginPanel}>
        <div className={styles.loginPanelTop}><span>ACESSO RESTRITO</span><small><i /> CONEX&Atilde;O SEGURA</small></div>
        <form><div className={styles.loginLock}><LockKeyhole/></div><h2>Bem-vindo de volta.</h2><p>Entre para continuar de onde parou.</p><label>E-mail<input type="email" placeholder="voce@empresa.com.br" autoComplete="email"/></label><label><span>Senha <a>Esqueci minha senha</a></span><input type="password" placeholder="Sua senha" autoComplete="current-password"/></label><button type="button">Entrar com seguran&ccedil;a <ArrowRight/></button><small><ShieldCheck/> Seus dados s&atilde;o tratados com seguran&ccedil;a.</small></form>
        <div className={styles.loginPanelFoot}><span>Precisa de ajuda?</span><a href="mailto:contato@infinitygroup.tech">Falar com a Infinity <ArrowRight /></a></div>
      </div>
    </section>
  </PageMotion>
}

function LoginPageRedesigned() {
  return <PageMotion className={styles.loginPage}>
    <section className={styles.loginBrand}>
      <div className={styles.loginBrandTop}><EvoLogo /><Link href="/conceito-evolucao"><ArrowLeft /> Voltar ao site</Link></div>
      <div className={styles.loginBrandCopy}>
        <Marker index="PORTAL">ÃREA DO CLIENTE</Marker>
        <h1>Sua operaÃ§Ã£o continua em movimento.</h1>
        <p>Um espaÃ§o seguro para acompanhar serviÃ§os, documentos, solicitaÃ§Ãµes e tudo o que conecta sua empresa Ã  Infinity.</p>
        <div className={styles.loginSignals}><span><i /> Dados protegidos</span><span><i /> Suporte especializado</span></div>
      </div>
      <div className={styles.loginConsole}>
        <div className={styles.consoleHeader}><span><i /> REDE INFINITY</span><small>ATUALIZADO AGORA</small></div>
        <div className={styles.consoleMain}><CircleCheck /><div><small>STATUS DOS SERVIÃ‡OS</small><strong>Todos os sistemas operando</strong></div><em>100%</em></div>
        <div className={styles.consoleBars}><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      </div>
      <div className={styles.loginBrandFooter}><span>INFINITY / CLIENT PORTAL</span><span>SESSÃƒO PROTEGIDA</span></div>
    </section>
    <section className={styles.loginSide}>
      <div className={styles.loginPanel}>
        <div className={styles.loginPanelTop}><span>ACESSO RESTRITO</span><small><i /> CONEXÃƒO SEGURA</small></div>
        <form><div className={styles.loginLock}><LockKeyhole/></div><h2>Bem-vindo de volta.</h2><p>Entre para continuar de onde parou.</p><label>E-mail<input type="email" placeholder="voce@empresa.com.br" autoComplete="email"/></label><label><span>Senha <a>Esqueci minha senha</a></span><input type="password" placeholder="Sua senha" autoComplete="current-password"/></label><button type="button">Entrar com seguranÃ§a <ArrowRight/></button><small><ShieldCheck/> Seus dados sÃ£o tratados com seguranÃ§a.</small></form>
        <div className={styles.loginPanelFoot}><span>Precisa de ajuda?</span><a href="mailto:contato@infinitygroup.tech">Falar com a Infinity <ArrowRight /></a></div>
      </div>
    </section>
  </PageMotion>
}

function LoginPage() {
  return <PageMotion className={styles.loginPage}><div className={styles.loginBrand}><SiteHeader transparent/><div className={styles.loginBrandCopy}><Marker index="PORTAL">ÁREA DO CLIENTE</Marker><h1>Tudo o que conecta sua empresa à Infinity.</h1><p>Serviços, faturas, documentos e solicitações organizados em um ambiente seguro.</p></div><div className={styles.loginCards}><Floating><CircleCheck/><span><small>SERVIÇO ATIVO</small><strong>Infinity CRM</strong></span><em>Operando</em></Floating><Floating delay={.8}><Gauge/><span><small>DISPONIBILIDADE</small><strong>Todos os sistemas</strong></span><em>100%</em></Floating></div></div><div className={styles.loginSide}><Link href="/conceito-evolucao">← Voltar ao site</Link><form><div className={styles.loginLock}><LockKeyhole/></div><h2>Bem-vindo de volta.</h2><p>Use suas credenciais para acessar o painel.</p><label>E-mail<input type="email" placeholder="voce@empresa.com.br"/></label><label><span>Senha <a>Esqueci minha senha</a></span><input type="password" placeholder="Sua senha"/></label><button type="button">Entrar com segurança <ArrowRight/></button><small><ShieldCheck/> Conexão protegida e monitorada.</small></form></div></PageMotion>
}

export default function EvolutionPage({ params }: { params: { view: string } }) {
  if (params.view === "produtos") return <ProductsPage />
  if (params.view === "portfolio") return <PortfolioPage />
  if (params.view === "servicos") return <ServicesPage />
  if (params.view === "sobre") return <AboutPage />
  if (params.view === "contato") return <ContactPage />
  if (params.view === "login") return <LoginPageClean />
  return <ServicesPage />
}
