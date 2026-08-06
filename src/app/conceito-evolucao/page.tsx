"use client"

import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  Bot,
  Braces,
  ChevronRight,
  Code2,
  Globe2,
  Menu,
  Play,
  Smartphone,
  Sparkles,
  Workflow,
} from "lucide-react"
import styles from "./evolucao.module.css"
import { SiteFooter, SiteHeader } from "./_components/site-chrome"
import { PageMotion, Reveal } from "./_components/motion-system"

function Logo() {
  return (
    <Link href="/" className={styles.logo}>
      <img src="/images/logo-Infinity/logo-sem-escrita.svg" alt="" />
      <img src="/images/logo-Infinity/So-escrita.svg" alt="Infinity Groups" />
    </Link>
  )
}

export default function EvolucaoHome() {
  return (
    <PageMotion className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroMedia}>
          <img
            src="/images/home-page/grok-video-f45cdb8e-36a8-4d57-8ffb-23fed21fefb0.gif"
            alt="Tecnologia e transformação digital"
          />
        </div>
        <div className={styles.heroShade} />
        <div className={styles.heroGridLines} />

        <SiteHeader transparent />

        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.kicker}><span>INFINITY GROUPS</span><i /> TECNOLOGIA EM MOVIMENTO</div>
            <h1>
              Transformação digital
              <span>do conceito à operação.</span>
            </h1>
            <p>
              Criamos softwares, aplicativos, automações e experiências digitais que tornam empresas mais rápidas, conectadas e preparadas para crescer.
            </p>
            <div className={styles.heroActions}>
              <Link href="/conceito-evolucao/contato" className={styles.mainCta}>Transformar meu negócio <ArrowRight /></Link>
              <Link href="/conceito-evolucao/portfolio" className={styles.ghostCta}><Play size={15} fill="currentColor" /> Ver projetos</Link>
            </div>
            <div className={styles.capabilities}>
              <span><Code2 /> Software sob medida</span>
              <span><Bot /> Automação & IA</span>
              <span><Smartphone /> Web & Mobile</span>
            </div>
          </div>

          <div className={styles.projectStage}>
            <div className={styles.stageLabel}><Sparkles /> PROJETOS REAIS · INFINITY LAB</div>
            <div className={styles.projectBack}>
              <img src="/images/portfolio/EmilieBanko/Projeto01.png" alt="E-commerce Emilie Banko" />
              <span>ECOMMERCE</span>
            </div>
            <div className={styles.projectFront}>
              <div className={styles.browserBar}><i /><i /><i /><small>acctelecom.com.br</small></div>
              <img src="/images/portfolio/Acctelecom/Projeto01.png" alt="Projeto ACC Telecom" />
              <div className={styles.projectCaption}>
                <div><small>CASE EM DESTAQUE</small><strong>ACC Telecom</strong></div>
                <span>Website de alta performance <ArrowRight /></span>
              </div>
            </div>
            <div className={styles.projectMini}>
              <img src="/images/portfolio/Supertelecom/Projeto01.png" alt="Projeto Super Telecom" />
              <span>SUPER TELECOM</span>
            </div>
            <div className={styles.orbitWord}>INFINITY</div>
          </div>
        </div>

        <div className={styles.heroBottom}>
          <span>DESENVOLVIMENTO</span><i />
          <span>DESIGN</span><i />
          <span>ESTRATÉGIA</span><i />
          <span>EVOLUÇÃO CONTÍNUA</span>
          <a href="#empresa"><ArrowDown /></a>
        </div>
      </section>

      <section className={styles.brandStrip}>
        <div>SOFTWARE <span>×</span> AUTOMAÇÕES <span>×</span> APLICATIVOS <span>×</span> WEBSITES <span>×</span> E-COMMERCE <span>×</span> CRM</div>
      </section>

      <section id="empresa" className={styles.companySection}>
        <div className={styles.sectionMarker}><span>01</span><i /> QUEM SOMOS</div>
        <Reveal className={styles.companyHeading}>
          <h2>Não entregamos apenas tecnologia.</h2>
          <h2><span>Construímos o próximo estágio</span> da sua empresa.</h2>
        </Reveal>
        <div className={styles.companyGrid}>
          <div className={styles.companyVisual}>
            <img src="/images/programador-pc.webp" alt="Desenvolvimento de software na Infinity Groups" />
            <div className={styles.visualSeal}><Braces /><span>CÓDIGO<br />QUE MOVE<br />NEGÓCIOS</span></div>
            <div className={styles.visualIndex}>INFINITY / BRASIL / 2026</div>
          </div>
          <div className={styles.companyCopy}>
            <p className={styles.lead}>A Infinity transforma desafios de negócio em produtos digitais robustos, claros e preparados para crescer.</p>
            <p>Combinamos estratégia, engenharia e design para desenvolver plataformas, aplicativos e automações que realmente entram na operação — e continuam evoluindo depois da entrega.</p>
            <div className={styles.companyFacts}>
              <div><strong>Estratégia</strong><span>Entendimento real do negócio antes do código.</span></div>
              <div><strong>Engenharia</strong><span>Arquitetura segura, escalável e bem construída.</span></div>
              <div><strong>Continuidade</strong><span>Parceria próxima para medir, melhorar e evoluir.</span></div>
            </div>
            <Link href="/conceito-evolucao/sobre">Conheça a Infinity <ArrowRight /></Link>
          </div>
        </div>
      </section>

      <section className={styles.servicesSection}>
        <div className={styles.sectionMarker}><span>02</span><i /> O QUE FAZEMOS</div>
        <Reveal className={styles.servicesIntro}>
          <h2>Da primeira ideia ao produto em operação.</h2>
          <p>Um time para pensar, construir, integrar e evoluir toda a experiência digital da sua empresa.</p>
        </Reveal>
        <div className={styles.serviceList}>
          <Link href="/conceito-evolucao/servicos/software"><span>Software sob medida</span><small>Sistemas · Plataformas · SaaS</small><Code2 /><ChevronRight /></Link>
          <Link href="/conceito-evolucao/servicos/automacoes"><span>Automação & Inteligência Artificial</span><small>Processos · Integrações · Agentes</small><Workflow /><ChevronRight /></Link>
          <Link href="/conceito-evolucao/servicos/aplicativos"><span>Aplicativos Web & Mobile</span><small>iOS · Android · Experiências digitais</small><Smartphone /><ChevronRight /></Link>
          <Link href="/conceito-evolucao/servicos/websites"><span>Websites & E-commerce</span><small>Marca · Performance · Conversão</small><Globe2 /><ChevronRight /></Link>
        </div>
      </section>

      <section className={styles.workSection}>
        <div className={styles.workHeader}>
          <div className={styles.sectionMarker}><span>03</span><i /> PROJETOS EM MOVIMENTO</div>
          <h2>Resultados que você consegue ver.</h2>
          <Link href="/conceito-evolucao/portfolio">Explorar portfólio <ArrowRight /></Link>
        </div>
        <div className={styles.workGrid}>
          <article className={styles.workLarge}>
            <img src="/images/portfolio/EmilieBanko/Projeto01.png" alt="Projeto Emilie Banko" />
            <div><small>E-COMMERCE · EXPERIÊNCIA</small><h3>Emilie Banko</h3><strong>+300% faturamento on-line</strong></div>
          </article>
          <article><img src="/images/portfolio/Supertelecom/Projeto01.png" alt="Projeto Super Telecom" /><div><small>WEBSITE · PERFORMANCE</small><h3>Super Telecom</h3><strong>−40% no CAC</strong></div></article>
          <article><img src="/images/portfolio/Jhtelecom/Projeto01.png" alt="Projeto JH Telecom" /><div><small>PLATAFORMA · VENDAS</small><h3>JH Telecom</h3><strong>+150% pipeline</strong></div></article>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div className={styles.ctaGlow} />
        <span>SEU PRÓXIMO PROJETO COMEÇA AQUI</span>
        <h2>Vamos colocar sua empresa em movimento?</h2>
        <Link href="/conceito-evolucao/contato">Conversar com a Infinity <ArrowRight /></Link>
      </section>

      <SiteFooter />
    </PageMotion>
  )
}
