"use client"

import { motion } from "framer-motion"
import { FileText, TrendingUp, Lightbulb, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ContentSection() {
    const articles = [
        {
            icon: <Lightbulb className="h-6 w-6" />,
            category: "Insights",
            title: "Como escolher a stack certa para seu projeto",
            description: "Decisões técnicas que impactam o sucesso do seu produto digital."
        },
        {
            icon: <FileText className="h-6 w-6" />,
            category: "Segurança",
            title: "Segurança em aplicações corporativas",
            description: "Práticas essenciais para proteger dados críticos do negócio."
        },
        {
            icon: <TrendingUp className="h-6 w-6" />,
            category: "Escalabilidade",
            title: "Escalabilidade: quando e como investir",
            description: "Prepare sua infraestrutura para o crescimento sustentável."
        },
    ]

    return (
        <section className="corporate-section-white section-padding">
            <div className="container-corporate">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <p className="text-sm font-semibold text-corporate-blue uppercase tracking-wide mb-2">
                        Conhecimento
                    </p>
                    <h2 className="text-4xl lg:text-5xl font-bold text-corporate-black mb-4">
                        Conteúdos que ajudam sua empresa a evoluir
                    </h2>
                    <p className="text-xl text-corporate-textGray max-w-2xl mx-auto">
                        Insights, tendências e tecnologia aplicada ao negócio
                    </p>
                </motion.div>

                {/* Grid de Artigos */}
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {articles.map((article, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Link href="#" className="group block">
                                <div className="corporate-card-light h-full space-y-4">
                                    {/* Icon */}
                                    <div className="w-12 h-12 rounded-xl bg-corporate-blueBg flex items-center justify-center text-corporate-blue group-hover:bg-corporate-blue group-hover:text-white transition-colors duration-300">
                                        {article.icon}
                                    </div>

                                    {/* Category */}
                                    <span className="inline-block text-xs font-semibold text-corporate-blue uppercase tracking-wide">
                                        {article.category}
                                    </span>

                                    {/* Title */}
                                    <h3 className="text-xl font-semibold text-corporate-black group-hover:text-corporate-blue transition-colors">
                                        {article.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-base text-corporate-textGray leading-relaxed">
                                        {article.description}
                                    </p>

                                    {/* CTA */}
                                    <div className="flex items-center gap-2 text-corporate-blue text-sm font-medium pt-2">
                                        Ler artigo
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="text-center text-sm text-corporate-textLight mt-12"
                >
                    Mais do que uma software house. Somos uma referência em soluções digitais.
                </motion.p>
            </div>
        </section>
    )
}
