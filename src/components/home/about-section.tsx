"use client"

import { motion } from "framer-motion"
import { Target, Eye, Heart } from "lucide-react"

export default function AboutSection() {
    const values = [
        {
            icon: <Target className="h-6 w-6" />,
            title: "Missão",
            description: "Gerar valor através da tecnologia"
        },
        {
            icon: <Eye className="h-6 w-6" />,
            title: "Visão",
            description: "Ser referência em soluções digitais corporativas"
        },
        {
            icon: <Heart className="h-6 w-6" />,
            title: "Valores",
            description: "Transparência, qualidade, inovação responsável"
        }
    ]

    return (
        <section className="corporate-section-gray section-padding">
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
                        Sobre a Infinity Groups
                    </h2>
                </motion.div>

                {/* Layout  em 2 colunas */}
                <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
                    {/* Texto Principal */}
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <p className="text-lg text-corporate-textGray leading-relaxed">
                            A Infinity Groups é uma empresa de tecnologia especializada no desenvolvimento de
                            soluções digitais sob medida para empresas. Atuamos com foco em{" "}
                            <span className="text-corporate-black font-semibold">qualidade</span>,{" "}
                            <span className="text-corporate-black font-semibold">segurança</span>,{" "}
                            <span className="text-corporate-black font-semibold">escalabilidade</span> e{" "}
                            <span className="text-corporate-black font-semibold">resultados de negócio</span>.
                        </p>

                        <p className="text-lg text-corporate-textGray leading-relaxed">
                            Trabalhamos lado a lado com nossos clientes, entendendo seus desafios e
                            entregando soluções que realmente fazem diferença.
                        </p>

                        {/* Estatísticas Inline */}
                        <div className="grid grid-cols-2 gap-6 pt-6">
                            <div>
                                <div className="text-3xl font-bold text-corporate-blue mb-1">+10</div>
                                <div className="text-sm text-corporate-textLight">Projetos entregues</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-corporate-blue mb-1">100%</div>
                                <div className="text-sm text-corporate-textLight">Foco em B2B</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Missão, Visão, Valores */}
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="corporate-card-light"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-corporate-blue/10 border border-corporate-blue/20 flex items-center justify-center flex-shrink-0">
                                        <div className="text-corporate-blue">
                                            {value.icon}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-corporate-black mb-2">
                                            {value.title}
                                        </h3>
                                        <p className="text-base text-corporate-textGray leading-relaxed">
                                            {value.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Destaques de Diferenciais */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="mt-20 grid md:grid-cols-4 gap-8 max-w-5xl mx-auto"
                >
                    {[
                        { label: "Projetos sob medida", description: "Cada solução é única" },
                        { label: "Suporte contínuo", description: "Evolução constante" },
                        { label: "Equipe experiente", description: "Profissionais qualificados" },
                        { label: "Processos sólidos", description: "Metodologia comprovada" }
                    ].map((item, index) => (
                        <div key={index} className="text-center">
                            <div className="w-3 h-3 rounded-full bg-corporate-blue mx-auto mb-3" />
                            <div className="text-corporate-black font-semibold mb-1">{item.label}</div>
                            <div className="text-sm text-corporate-textLight">{item.description}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
