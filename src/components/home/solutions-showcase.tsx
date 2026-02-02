"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { IconAutomation, IconSoftware, IconMobile } from "@/components/ui/custom-icons"

export default function SolutionsShowcase() {
    return (
        <section id="solutions" className="section-premium bg-white">
            <div className="container-premium">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mb-20"
                >
                    <div className="line-premium mb-6" />
                    <h2 className="text-h2 text-[#0F172A] mb-6">
                        Soluções que geram impacto real
                    </h2>
                    <p className="text-body-lg text-[#475569]">
                        Combinamos expertise técnica profunda com profundo entendimento de negócio
                        para criar soluções que realmente transformam operações e geram resultados mensuráveis.
                    </p>
                </motion.div>

                {/* Solutions grid */}
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {/* 1. Automação (Side) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                    >
                        <div className="group card-gradient h-full flex flex-col hover:border-[#2563EB] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white rounded-3xl p-8 border border-slate-100">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F8FAFF] to-[#EFF6FF] border border-[#2563EB]/10 flex items-center justify-center text-[#2563EB] mb-6 transition-all duration-500 group-hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.4)] group-hover:border-[#2563EB]/40 group-hover:bg-[#EFF6FF]">
                                <IconAutomation className="h-8 w-8" />
                            </div>
                            <div className="mb-4">
                                <span className="text-caption text-[#2563EB] font-semibold px-3 py-1.5 bg-[#F8FAFF] rounded-lg border border-[#2563EB]/10">
                                    Automação IA
                                </span>
                            </div>
                            <h3 className="text-h3 text-[#0F172A] mb-4">
                                Processos Inteligentes
                            </h3>
                            <p className="text-body text-[#475569] mb-6 flex-1">
                                Automatize tarefas repetitivas e reduza custos operacionais com agentes de IA e workflows inteligentes.
                            </p>
                            <ul className="space-y-3 mb-6">
                                {["Redução de Custo", "Zero Erros Manuais", "Integração Total", "ROI Rápido"].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#EFF6FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="dot-premium" />
                                        </div>
                                        <span className="text-sm text-[#475569]">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/servicos/automacoes" className="inline-flex items-center gap-2 text-[#2563EB] font-semibold hover:gap-3 transition-all duration-250 group/link">
                                <span>Explorar</span>
                                <ArrowRight className="h-5 w-5 group-hover/link:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* 2. Software (Featured Center) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="relative lg:-mt-6 z-10"
                    >
                        <div className="group relative h-full flex flex-col bg-slate-900 rounded-3xl p-8 border border-[#2563EB] shadow-[0_20px_50px_-12px_rgba(37,99,235,0.3)] hover:shadow-[0_30px_80px_-12px_rgba(37,99,235,0.6)] hover:border-[#60A5FA] hover:-translate-y-1 transition-all duration-300">
                            {/* Highlights */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wider uppercase z-20">
                                Mais Solicitado
                            </div>

                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-900/50 transition-all duration-500 group-hover:shadow-[0_0_35px_-5px_rgba(59,130,246,0.6)] group-hover:scale-105">
                                <IconSoftware className="h-9 w-9" />
                            </div>
                            <div className="mb-4">
                                <span className="text-caption text-white/90 font-semibold px-3 py-1.5 bg-[#1E293B] rounded-lg border border-white/10">
                                    Software & Web
                                </span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                                Criação de Sites e Softwares de Alta Performance
                            </h3>
                            <p className="text-slate-300 mb-8 flex-1 leading-relaxed">
                                A solução completa para empresas que precisam de tecnologia proprietária, sites institucionais parrudos e sistemas que escalam.
                            </p>
                            <ul className="space-y-4 mb-8">
                                {["Sites Corporativos", "Sistemas SaaS", "Arquitetura Escalável", "Design Premium"].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#2563EB]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                                        </div>
                                        <span className="text-sm text-slate-200 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/servicos/desenvolvimento-software" className="w-full btn-premium justify-center text-center py-4 text-base group/btn">
                                <span>Solicitar Orçamento</span>
                                <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* 3. Mobile (Side) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        viewport={{ once: true }}
                    >
                        <div className="group card-gradient h-full flex flex-col hover:border-[#2563EB] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white rounded-3xl p-8 border border-slate-100">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F8FAFF] to-[#EFF6FF] border border-[#2563EB]/10 flex items-center justify-center text-[#2563EB] mb-6 transition-all duration-500 group-hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.4)] group-hover:border-[#2563EB]/40 group-hover:bg-[#EFF6FF]">
                                <IconMobile className="h-8 w-8" />
                            </div>
                            <div className="mb-4">
                                <span className="text-caption text-[#2563EB] font-semibold px-3 py-1.5 bg-[#F8FAFF] rounded-lg border border-[#2563EB]/10">
                                    Mobile Apps
                                </span>
                            </div>
                            <h3 className="text-h3 text-[#0F172A] mb-4">
                                Aplicativos Mobile
                            </h3>
                            <p className="text-body text-[#475569] mb-6 flex-1">
                                Leve seu negócio para o bolso do cliente com aplicativos nativos e responsivos de alta performance.
                            </p>
                            <ul className="space-y-3 mb-6">
                                {["iOS e Android", "UX/UI Fluida", "Notificações", "Offline-first"].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#EFF6FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="dot-premium" />
                                        </div>
                                        <span className="text-sm text-[#475569]">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/servicos/aplicativos-celular" className="inline-flex items-center gap-2 text-[#2563EB] font-semibold hover:gap-3 transition-all duration-250 group/link">
                                <span>Explorar</span>
                                <ArrowRight className="h-5 w-5 group-hover/link:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
