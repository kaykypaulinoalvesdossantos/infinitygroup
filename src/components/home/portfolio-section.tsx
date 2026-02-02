"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ExternalLink } from "lucide-react"
import Image from "next/image"

export default function PortfolioSection() {
    const projects = [
        {
            id: 1,
            title: "Plataforma de Gestão Empresarial",
            industry: "Consultoria",
            challenge: "Automatizar processos manuais e integrar dados de múltiplas fontes.",
            solution: "Desenvolvemos uma plataforma web personalizada com dashboards em tempo real e integrações via API.",
            result: "Redução de 60% no tempo de operações administrativas.",
            image: "/portfolio/project-1.jpg"
        },
        {
            id: 2,
            title: "E-commerce B2B",
            industry: "Varejo",
            challenge: "Criar uma loja virtual focada em vendas corporativas com gestão de pedidos complexos.",
            solution: "Plataforma e-commerce com sistema de cotações, aprovações e integração com ERP.",
            result: "Aumento de 120% nas vendas online no primeiro ano.",
            image: "/portfolio/project-2.jpg"
        },
        {
            id: 3,
            title: "Aplicativo Mobile para Field Service",
            industry: "Telecom",
            challenge: "Mobilizar equipes de campo com acesso offline e sincronização de dados.",
            solution: "App híbrido para Android/iOS com funcionalidades offline e geolocalização.",
            result: "Melhoria de 45% na eficiência operacional das equipes.",
            image: "/portfolio/project-3.jpg"
        }
    ]

    return (
        <section id="portfolio" className="corporate-section-white section-padding">
            <div className="container-corporate relative z-10">
                {/* Header da Seção */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 sm:mb-20"
                >
                    <h2 className="text-4xl font-bold text-corporate-black mb-6">
                        Projetos que geraram resultados
                    </h2>
                    <p className="text-lg text-corporate-textGray max-w-2xl mx-auto">
                        Cada projeto é único, desenvolvido para resolver desafios específicos de negócio.
                    </p>
                </motion.div>

                {/* Grid de Projetos */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Link href={`/portfolio/${project.id}`}>
                                <div className="corporate-card-light h-full group p-0 overflow-hidden">
                                    {/* Imagem (placeholder por enquanto) */}
                                    <div className="h-48 bg-gradient-to-br from-corporate-blue/5 to-corporate-blueLight/10 border-b border-corporate-mediumGray flex items-center justify-center">
                                        <div className="text-corporate-blue text-sm font-medium">{project.industry}</div>
                                    </div>

                                    {/* Conteúdo */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-corporate-black mb-3 group-hover:text-corporate-blue transition-colors">
                                            {project.title}
                                        </h3>

                                        <div className="space-y-3 mb-4">
                                            <div>
                                                <div className="text-xs font-medium text-corporate-textLight uppercase tracking-wide mb-1">Desafio</div>
                                                <p className="text-sm text-corporate-textGray">{project.challenge}</p>
                                            </div>

                                            <div>
                                                <div className="text-xs font-medium text-corporate-textLight uppercase tracking-wide mb-1">Solução</div>
                                                <p className="text-sm text-corporate-textGray">{project.solution}</p>
                                            </div>

                                            <div className="pt-3 border-t border-corporate-mediumGray">
                                                <div className="text-xs font-medium text-corporate-textLight uppercase tracking-wide mb-1">Resultado</div>
                                                <p className="text-sm font-semibold text-corporate-blue">{project.result}</p>
                                            </div>
                                        </div>

                                        {/* Link */}
                                        <div className="flex items-center gap-2 text-corporate-blue text-sm font-medium">
                                            Ver caso completo
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* CTA para ver mais */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <Link
                        href="/portfolio"
                        className="inline-flex items-center gap-2 text-corporate-text hover:text-corporate-blue transition-colors font-medium"
                    >
                        Ver todos os projetos
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
