"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react"
import styles from "../pages.module.css"

const projects = [
  { name: "ACC Telecom", category: "Websites", impact: "+200% em leads qualificados", image: "/images/portfolio/Acctelecom/Projeto01.png" },
  { name: "Super Telecom", category: "Websites", impact: "−40% no custo de aquisição", image: "/images/portfolio/Supertelecom/Projeto01.png" },
  { name: "Emilie Banko", category: "E-commerce", impact: "+300% no faturamento on-line", image: "/images/portfolio/EmilieBanko/Projeto01.png" },
  { name: "Grupo ATK", category: "Plataformas", impact: "Hub corporativo B2B", image: "/images/portfolio/GrupoAtk/image.png" },
  { name: "JH Telecom", category: "Websites", impact: "+150% no pipeline de vendas", image: "/images/portfolio/Jhtelecom/Projeto01.png" },
  { name: "BKO Consultoria", category: "Plataformas", impact: "Operação multimarcas centralizada", image: "/images/portfolio/bko/screenshot-1766293973588.png" },
]

export function PortfolioGallery() {
  const [filter, setFilter] = useState("Todos")
  const filters = ["Todos", "Websites", "E-commerce", "Plataformas"]
  const visible = filter === "Todos" ? projects : projects.filter((project) => project.category === filter)
  return (
    <div>
      <div className={styles.filters}>{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={filter === item ? styles.filterActive : ""}>{item}</button>)}</div>
      <motion.div layout className={styles.portfolioGrid}>
        <AnimatePresence mode="popLayout">
          {visible.map((project, index) => (
            <motion.article
              layout
              key={project.name}
              initial={{ opacity: 0, scale: .96, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: .96 }}
              transition={{ duration: .45, delay: index * .04 }}
              className={index === 0 && filter === "Todos" ? styles.projectFeatured : ""}
            >
              <img src={project.image} alt={`Projeto ${project.name}`} />
              <div className={styles.projectOverlay}><small>{project.category}</small><h3>{project.name}</h3><strong>{project.impact}</strong><button aria-label={`Abrir projeto ${project.name}`}><ArrowRight /></button></div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

const steps = ["Contato", "Desafio", "Objetivo"]

export function ContactJourney() {
  const [step, setStep] = useState(0)
  return (
    <div className={styles.contactJourney}>
      <div className={styles.stepper}>{steps.map((item, index) => <div key={item} className={index <= step ? styles.stepActive : ""}><span>{index < step ? <Check /> : `0${index + 1}`}</span><small>{item}</small></div>)}</div>
      <div className={styles.formViewport}>
        <AnimatePresence mode="wait">
          {step === 0 && <motion.div key="contact" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}><h3>Vamos começar por você.</h3><p>Essas informações ajudam nosso especialista a preparar a conversa.</p><div className={styles.formGrid}><label>Nome<input placeholder="Como podemos chamar você?" /></label><label>Empresa<input placeholder="Nome da empresa" /></label><label>E-mail corporativo<input type="email" placeholder="voce@empresa.com.br" /></label><label>WhatsApp<input placeholder="(11) 99999-9999" /></label></div></motion.div>}
          {step === 1 && <motion.div key="challenge" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}><h3>Qual desafio precisa sair do caminho?</h3><p>Não precisa trazer uma solução pronta. Conte como a operação funciona hoje.</p><div className={styles.optionGrid}>{["Processos manuais", "Sistema atual limitado", "Novo produto digital", "Mais vendas on-line", "Integração entre sistemas", "Outro desafio"].map((item) => <label key={item}><input type="checkbox" /> <span>{item}</span></label>)}</div></motion.div>}
          {step === 2 && <motion.div key="goal" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}><h3>O que precisa mudar depois do projeto?</h3><p>Descreva o resultado que faria essa iniciativa valer a pena.</p><label className={styles.fullField}>Contexto<textarea rows={6} placeholder="Ex.: reduzir retrabalho, lançar uma nova plataforma, centralizar dados..." /></label><div className={styles.formSuccessNote}><Check /> Você receberá um retorno em até um dia útil.</div></motion.div>}
        </AnimatePresence>
      </div>
      <div className={styles.formActions}><button onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}><ChevronLeft /> Voltar</button>{step < 2 ? <button onClick={() => setStep((value) => Math.min(2, value + 1))}>Continuar <ChevronRight /></button> : <button>Solicitar diagnóstico <ArrowRight /></button>}</div>
    </div>
  )
}
