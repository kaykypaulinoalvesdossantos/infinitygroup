import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  CreditCard,
  FileText,
  Gauge,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MessageCircle,
  Network,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Workflow,
  Zap,
} from "lucide-react"
import styles from "../concept.module.css"

type View = "home" | "produtos" | "portfolio" | "contato" | "login" | "dashboard"

const routes: { label: string; view: View }[] = [
  { label: "Soluções", view: "home" },
  { label: "Produtos", view: "produtos" },
  { label: "Cases", view: "portfolio" },
  { label: "Contato", view: "contato" },
]

function Brand({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <Link href="/conceito/home" className={`${styles.brand} ${dark ? styles.brandDark : ""}`}>
      <img src="/images/logo-Infinity/logo-sem-escrita.svg" alt="Infinity Groups" />
      {!compact && (
        <span>
          <strong>INFINITY</strong>
          <small>GROUPS</small>
        </span>
      )}
    </Link>
  )
}

function PublicHeader({ active, light = false }: { active: View; light?: boolean }) {
  return (
    <header className={`${styles.header} ${light ? styles.headerLight : ""}`}>
      <Brand dark={!light} />
      <nav className={styles.nav} aria-label="Navegação principal">
        {routes.map((item) => (
          <Link
            key={item.view}
            href={`/conceito/${item.view}`}
            className={active === item.view ? styles.navActive : ""}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className={styles.headerActions}>
        <Link href="/conceito/login" className={styles.textAction}>Área do cliente</Link>
        <Link href="/conceito/contato" className={styles.headerCta}>Falar com especialista <ArrowRight size={16} /></Link>
      </div>
      <button className={styles.mobileMenu} aria-label="Abrir menu"><Menu size={24} /></button>
    </header>
  )
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        <Brand dark />
        <p>Tecnologia para empresas que precisam operar melhor, crescer com segurança e decidir com dados.</p>
      </div>
      <div className={styles.footerLinks}>
        <span>São Paulo · Brasil</span>
        <span>contato@infinitygroup.tech</span>
        <span>+55 11 94533-2464</span>
      </div>
    </footer>
  )
}

function LoopGraphic() {
  return (
    <div className={styles.systemGraphic} aria-label="Fluxo de soluções conectadas">
      <div className={styles.systemTopbar}>
        <span><i /> Infinity architecture</span>
        <span>LIVE MAP</span>
      </div>
      <svg className={styles.systemLines} viewBox="0 0 620 430" role="img" aria-label="Arquitetura Infinity conectando operações, dados e experiências">
        <defs>
          <linearGradient id="flow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4AE3F4" />
            <stop offset="100%" stopColor="#3578FF" />
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path d="M115 210 C150 80 290 78 326 210 C362 340 505 340 535 210 C505 78 362 80 326 210 C290 340 150 340 115 210Z" fill="none" stroke="url(#flow)" strokeWidth="3" filter="url(#glow)" />
        <path d="M70 210 H545" stroke="#8AB4FF" strokeOpacity=".22" strokeDasharray="5 10" />
        <circle cx="115" cy="210" r="7" fill="#4AE3F4" />
        <circle cx="326" cy="210" r="7" fill="#ffffff" />
        <circle cx="535" cy="210" r="7" fill="#3578FF" />
      </svg>
      <div className={`${styles.systemNode} ${styles.nodeOne}`}><Workflow size={18} /><span>Operações<small>Fluxos conectados</small></span></div>
      <div className={`${styles.systemNode} ${styles.nodeTwo}`}><BarChart3 size={18} /><span>Dados<small>Decisão em tempo real</small></span></div>
      <div className={`${styles.systemNode} ${styles.nodeThree}`}><Sparkles size={18} /><span>Experiência<small>Jornadas melhores</small></span></div>
      <div className={styles.systemMetric}><span>Eficiência operacional</span><strong>+ contínua</strong></div>
    </div>
  )
}

function HomePage() {
  return (
    <div className={styles.publicPage}>
      <section className={styles.hero}>
        <PublicHeader active="home" />
        <div className={styles.heroGlow} />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}><span /> Tecnologia que destrava operações</div>
            <h1>Complexidade operacional, <em>transformada em vantagem.</em></h1>
            <p>Arquitetura, software e automação sob medida para empresas que precisam escalar sem perder controle.</p>
            <div className={styles.heroActions}>
              <Link href="/conceito/contato" className={styles.primaryButton}>Mapear meu desafio <ArrowRight size={18} /></Link>
              <Link href="/conceito/portfolio" className={styles.secondaryButton}>Ver resultados reais</Link>
            </div>
            <div className={styles.trustLine}>
              <span>Especialistas em</span><strong>Telecom</strong><i /><strong>Serviços</strong><i /><strong>Varejo</strong>
            </div>
          </div>
          <LoopGraphic />
        </div>
        <div className={styles.heroProof}>
          <div><strong>+200%</strong><span>leads qualificados</span><small>ACC Telecom</small></div>
          <div><strong>−40%</strong><span>custo de aquisição</span><small>Super Telecom</small></div>
          <div><strong>+300%</strong><span>faturamento on-line</span><small>Emilie Banko</small></div>
          <p>Impactos observados em projetos do portfólio Infinity.</p>
        </div>
      </section>

      <section className={styles.solutionSection}>
        <div className={styles.sectionHeading}>
          <span>ONDE ENTRAMOS</span>
          <h2>Do gargalo visível à estrutura que sustenta o próximo nível.</h2>
          <p>Não vendemos tecnologia isolada. Desenhamos o sistema certo para o momento real da operação.</p>
        </div>
        <div className={styles.solutionGrid}>
          <article><span>01</span><Network /><h3>Sistemas sob medida</h3><p>Plataformas que traduzem processos complexos em rotinas simples e confiáveis.</p><a>Explorar solução <ChevronRight size={16} /></a></article>
          <article className={styles.featuredSolution}><span>02</span><Zap /><h3>Automação & IA aplicada</h3><p>Menos retrabalho, mais previsibilidade e pessoas focadas no que gera valor.</p><a>Explorar solução <ChevronRight size={16} /></a></article>
          <article><span>03</span><Boxes /><h3>Produtos digitais</h3><p>Web, mobile e e-commerce com experiência de uso e arquitetura para crescer.</p><a>Explorar solução <ChevronRight size={16} /></a></article>
        </div>
      </section>

      <section className={styles.homeCase}>
        <div className={styles.caseVisual}>
          <img src="/images/portfolio/Acctelecom/Projeto01.png" alt="Projeto ACC Telecom" />
          <div className={styles.caseBadge}>CASE · TELECOM</div>
        </div>
        <div className={styles.caseCopy}>
          <span>ACC TELECOM</span>
          <h2>Uma experiência comercial desenhada para converter.</h2>
          <p>Estratégia, interface e performance trabalhando como um único sistema de aquisição.</p>
          <strong>+200% <small>em leads qualificados</small></strong>
          <Link href="/conceito/portfolio">Ver o caso completo <ArrowRight size={17} /></Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}

function ProductsPage() {
  return (
    <div className={styles.lightPage}>
      <PublicHeader active="produtos" light />
      <main>
        <section className={styles.productHero}>
          <div className={styles.productHeroCopy}>
            <div className={`${styles.eyebrow} ${styles.eyebrowBlue}`}><span /> Produtos Infinity</div>
            <h1>Uma operação mais clara começa com um sistema que fala a sua língua.</h1>
            <p>Produtos próprios, desenhados a partir de desafios reais de vendas, relacionamento e gestão.</p>
          </div>
          <div className={styles.productStats}><span>Produto em destaque</span><strong>Infinity CRM</strong><small>Vendas · Atendimento · Gestão</small></div>
        </section>

        <section className={styles.crmShowcase}>
          <div className={styles.crmCopy}>
            <div className={styles.productTag}><i /> Infinity CRM</div>
            <h2>Seu comercial inteiro, em uma visão só.</h2>
            <p>Leads, oportunidades, atendimento e indicadores conectados para o time agir mais rápido e a liderança decidir melhor.</p>
            <ul>
              <li><CircleCheck /> Funil de vendas visual e personalizável</li>
              <li><CircleCheck /> Automação de tarefas e follow-ups</li>
              <li><CircleCheck /> Indicadores em tempo real</li>
              <li><CircleCheck /> Implantação acompanhada pela Infinity</li>
            </ul>
            <div className={styles.heroActions}>
              <button className={styles.primaryButton}>Agendar demonstração <ArrowRight size={18} /></button>
              <button className={styles.outlineButton}>Conhecer recursos</button>
            </div>
          </div>
          <div className={styles.crmWindow}>
            <div className={styles.windowBar}><span><i /><i /><i /></span><small>crm.infinitygroup.tech</small><ShieldCheck size={15} /></div>
            <div className={styles.crmUi}>
              <aside><Brand compact /><LayoutDashboard /><Users /><BarChart3 /><Workflow /><Settings /></aside>
              <div className={styles.crmMain}>
                <div className={styles.crmHeader}><div><small>Visão comercial</small><strong>Bom dia, Mariana.</strong></div><div><Search /><Bell /></div></div>
                <div className={styles.crmKpis}>
                  <div><small>Pipeline ativo</small><strong>R$ 482 mil</strong><span>+18,4%</span></div>
                  <div><small>Conversão</small><strong>32,8%</strong><span>+6,2%</span></div>
                  <div><small>Novos leads</small><strong>184</strong><span>esta semana</span></div>
                </div>
                <div className={styles.crmChart}>
                  <div><small>EVOLUÇÃO DO PIPELINE</small><strong>Oportunidades por semana</strong></div>
                  <svg viewBox="0 0 520 160"><path d="M0 132 C60 124 65 92 120 100 S190 135 244 80 S326 55 364 69 S438 26 520 20" fill="none" stroke="#2776ff" strokeWidth="4" /><path d="M0 132 C60 124 65 92 120 100 S190 135 244 80 S326 55 364 69 S438 26 520 20 V160 H0Z" fill="url(#chartFill)" opacity=".25" /><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#2776ff"/><stop offset="1" stopColor="#fff"/></linearGradient></defs></svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.productBenefits}>
          <div><Gauge /><strong>Visibilidade</strong><span>Indicadores que mostram onde agir.</span></div>
          <div><Workflow /><strong>Consistência</strong><span>Processos que o time realmente segue.</span></div>
          <div><TrendingUp /><strong>Escala</strong><span>Estrutura pronta para crescer.</span></div>
          <div><ShieldCheck /><strong>Segurança</strong><span>Dados e acessos sob controle.</span></div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

const cases = [
  { name: "ACC Telecom", type: "Aquisição digital", result: "+200% em leads qualificados", image: "/images/portfolio/Acctelecom/Projeto01.png" },
  { name: "Super Telecom", type: "Portal comercial", result: "−40% no CAC", image: "/images/portfolio/Supertelecom/Projeto01.png" },
  { name: "Emilie Banko", type: "E-commerce", result: "+300% no faturamento on-line", image: "/images/portfolio/EmilieBanko/Projeto01.png" },
]

function PortfolioPage() {
  return (
    <div className={styles.publicPage}>
      <section className={styles.portfolioHero}>
        <PublicHeader active="portfolio" />
        <div>
          <span>CASES INFINITY · 2022—2026</span>
          <h1>Projetos que não terminam na entrega.<br /><em>Continuam no resultado.</em></h1>
          <p>Uma seleção de experiências digitais construídas para destravar crescimento, eficiência e posicionamento.</p>
        </div>
        <div className={styles.portfolioIndex}><span>06</span><small>projetos selecionados</small><i /><span>04</span><small>setores atendidos</small></div>
      </section>
      <main className={styles.caseList}>
        {cases.map((item, index) => (
          <article key={item.name} className={styles.caseCard}>
            <div className={styles.caseImage}><img src={item.image} alt={`Projeto ${item.name}`} /><span>{String(index + 1).padStart(2, "0")}</span></div>
            <div className={styles.caseInfo}>
              <div><small>{item.type}</small><h2>{item.name}</h2></div>
              <strong>{item.result}</strong>
              <button aria-label={`Abrir case ${item.name}`}><ArrowRight /></button>
            </div>
          </article>
        ))}
      </main>
      <section className={styles.caseCta}><span>Seu próximo salto pode começar aqui.</span><h2>Vamos transformar um desafio real em um case de referência?</h2><Link href="/conceito/contato">Conversar com a Infinity <ArrowRight /></Link></section>
      <Footer />
    </div>
  )
}

function ContactPage() {
  return (
    <div className={styles.contactPage}>
      <PublicHeader active="contato" light />
      <main className={styles.contactMain}>
        <div className={styles.contactIntro}>
          <div className={`${styles.eyebrow} ${styles.eyebrowBlue}`}><span /> Diagnóstico inicial</div>
          <h1>Conte o que está travando. Nós ajudamos a enxergar o próximo movimento.</h1>
          <p>Em uma conversa de 30 minutos, entendemos o cenário e indicamos o caminho mais viável — mesmo que a resposta não seja construir software.</p>
          <div className={styles.contactAssurance}>
            <div><Clock3 /><span><strong>Retorno em até 1 dia útil</strong><small>Sem mensagens automáticas genéricas.</small></span></div>
            <div><ShieldCheck /><span><strong>Conversa confidencial</strong><small>Seus dados e contexto protegidos.</small></span></div>
            <div><MessageCircle /><span><strong>Direto com um especialista</strong><small>Sem roteiro comercial engessado.</small></span></div>
          </div>
        </div>
        <form className={styles.contactForm}>
          <div className={styles.formStep}><span>01</span><div><strong>Sobre você</strong><small>Para direcionarmos a conversa.</small></div></div>
          <div className={styles.fieldRow}><label>Nome<input placeholder="Como podemos chamar você?" /></label><label>Empresa<input placeholder="Nome da empresa" /></label></div>
          <div className={styles.fieldRow}><label>E-mail corporativo<input type="email" placeholder="voce@empresa.com.br" /></label><label>WhatsApp<input placeholder="(11) 99999-9999" /></label></div>
          <div className={styles.formDivider} />
          <div className={styles.formStep}><span>02</span><div><strong>O desafio</strong><small>Não precisa trazer a solução pronta.</small></div></div>
          <label>Em que podemos ajudar?<select defaultValue=""><option value="" disabled>Selecione o tema principal</option><option>Automação de processos</option><option>Sistema sob medida</option><option>Site ou e-commerce</option><option>Infinity CRM</option></select></label>
          <label>Contexto<textarea placeholder="Conte brevemente o que acontece hoje, quem é impactado e o que você gostaria de melhorar." rows={4} /></label>
          <button type="button" className={styles.submitButton}>Solicitar diagnóstico <ArrowRight size={18} /></button>
          <small className={styles.privacyNote}><LockKeyhole size={13} /> Seus dados serão usados somente para este contato.</small>
        </form>
      </main>
    </div>
  )
}

function LoginPage() {
  return (
    <main className={styles.loginPage}>
      <section className={styles.loginStory}>
        <Brand dark />
        <div>
          <span className={styles.loginPill}><i /> Ambiente seguro</span>
          <h1>Seu relacionamento com a Infinity, <em>organizado em um só lugar.</em></h1>
          <p>Acompanhe serviços, faturas e solicitações com clareza.</p>
        </div>
        <div className={styles.loginPreview}>
          <div><CircleCheck /><span><small>Serviço ativo</small><strong>Infinity CRM</strong></span><em>Operando</em></div>
          <div><ReceiptText /><span><small>Próxima fatura</small><strong>15 de agosto</strong></span><em>R$ 1.890,00</em></div>
        </div>
        <small>© 2026 Infinity Groups · Tecnologia com continuidade.</small>
      </section>
      <section className={styles.loginFormSide}>
        <Link href="/conceito/home" className={styles.backLink}>← Voltar ao site</Link>
        <form className={styles.loginForm}>
          <div className={styles.loginIcon}><LockKeyhole /></div>
          <h2>Bem-vindo de volta.</h2>
          <p>Entre para acessar seu painel.</p>
          <label>E-mail<input type="email" placeholder="voce@empresa.com.br" /></label>
          <label><span>Senha <a>Esqueci minha senha</a></span><input type="password" placeholder="Sua senha" /></label>
          <button type="button">Entrar com segurança <ArrowRight size={17} /></button>
          <div className={styles.secureNote}><ShieldCheck /><span><strong>Conexão protegida</strong><small>Seus dados trafegam de forma segura.</small></span></div>
        </form>
        <p className={styles.loginHelp}>Precisa de ajuda? <a>Fale com nosso atendimento</a></p>
      </section>
    </main>
  )
}

function DashboardPage() {
  return (
    <main className={styles.dashboardPage}>
      <aside className={styles.dashboardSidebar}>
        <Brand dark compact />
        <nav>
          <a className={styles.sideActive}><LayoutDashboard /> <span>Visão geral</span></a>
          <a><ReceiptText /> <span>Faturas</span><i>2</i></a>
          <a><Boxes /> <span>Serviços</span></a>
          <a><FileText /> <span>Documentos</span></a>
        </nav>
        <div className={styles.sideSupport}><MessageCircle /><strong>Precisa de ajuda?</strong><span>Fale com seu atendimento.</span><button>Abrir conversa</button></div>
        <a className={styles.sideProfile}><span>MS</span><div><strong>Marina Silva</strong><small>ACC Telecom</small></div><ChevronRight /></a>
      </aside>
      <section className={styles.dashboardContent}>
        <header className={styles.dashboardHeader}>
          <div><small>DOMINGO, 02 DE AGOSTO</small><h1>Bom dia, Marina.</h1><p>Aqui está o resumo da sua operação com a Infinity.</p></div>
          <div><button><Bell /><i /></button><button className={styles.dashboardContact}>Falar com atendimento</button></div>
        </header>
        <div className={styles.dashboardKpis}>
          <article><span><Boxes /> Serviços ativos</span><strong>03</strong><small>Todos operando normalmente</small><i className={styles.okDot} /></article>
          <article><span><ReceiptText /> Próxima fatura</span><strong>R$ 1.890,00</strong><small>Vencimento em 15 ago</small><button>Ver fatura <ArrowRight /></button></article>
          <article><span><Clock3 /> Solicitações</span><strong>01</strong><small>Em acompanhamento</small><i className={styles.progressDot} /></article>
        </div>
        <div className={styles.dashboardGrid}>
          <section className={styles.servicePanel}>
            <div className={styles.panelTitle}><div><small>SEUS SERVIÇOS</small><h2>O que está operando agora</h2></div><button>Ver todos <ArrowRight /></button></div>
            <div className={styles.serviceRow}><span className={styles.serviceIcon}><Workflow /></span><div><strong>Infinity CRM</strong><small>Plano Performance · 18 usuários</small></div><em>Ativo</em><ChevronRight /></div>
            <div className={styles.serviceRow}><span className={styles.serviceIcon}><Network /></span><div><strong>Site Institucional</strong><small>Hospedagem e evolução contínua</small></div><em>Ativo</em><ChevronRight /></div>
            <div className={styles.serviceRow}><span className={styles.serviceIcon}><Zap /></span><div><strong>Automação comercial</strong><small>Integrações e monitoramento</small></div><em>Ativo</em><ChevronRight /></div>
          </section>
          <section className={styles.activityPanel}>
            <div className={styles.panelTitle}><div><small>ATIVIDADE RECENTE</small><h2>Últimos movimentos</h2></div></div>
            <div><span><Check /></span><p><strong>Fatura de julho liquidada</strong><small>Hoje, 09:42</small></p></div>
            <div><span><FileText /></span><p><strong>Relatório mensal disponível</strong><small>Ontem, 16:20</small></p></div>
            <div><span><MessageCircle /></span><p><strong>Atualização na solicitação #184</strong><small>01 ago, 11:05</small></p></div>
          </section>
        </div>
      </section>
    </main>
  )
}

export default function ConceptPage({ params }: { params: { view: string } }) {
  const view = params.view as View
  if (view === "produtos") return <ProductsPage />
  if (view === "portfolio") return <PortfolioPage />
  if (view === "contato") return <ContactPage />
  if (view === "login") return <LoginPage />
  if (view === "dashboard") return <DashboardPage />
  return <HomePage />
}
