"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

export default function ProcessSection() {
    const steps = [
        {
            number: "01",
            title: "Discovery & Imersão",
            description: "Entendimento profundo do seu negócio, processos atuais e objetivos estratégicos."
        },
        {
            number: "02",
            title: "Estratégia & Arquitetura",
            description: "Definição de stack tecnológico, arquitetura e roadmap detalhado de implementação."
        },
        {
            number: "03",
            title: "Desenvolvimento Ágil",
            description: "Construção iterativa com entregas incrementais e validações constantes."
        },
        {
            number: "04",
            title: "Qualidade & Testes",
            description: "Testes automatizados, revisões de código e validação de segurança contínua."
        },
        {
            number: "05",
            title: "Implantação Segura",
            description: "Deploy controlado com monitoramento em tempo real e garantia de estabilidade."
        },
        {
            number: "06",
            title: "Evolução Contínua",
            description: "Suporte dedicado, otimizações e implementação de novas funcionalidades."
        }
    ]

    return (
        <section className="section-premium bg-white">
            <div className="container-premium">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-20 max-w-3xl mx-auto"
                >
                    <div className="line-premium mx-auto mb-6" />
                    <h2 className="text-h2 text-[#0F172A] mb-6">
                        Metodologia consolidada
                    </h2>
                    <p className="text-body-lg text-[#475569]">
                        Processos estruturados que garantem previsibilidade, qualidade e transparência em cada etapa
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.08 }}
                            viewport={{ once: true }}
                            className="card-gradient group"
                        >
                            {/* Number with check */}
                            <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white font-bold text-lg mb-5 group-hover:scale-110 transition-transform duration-250">
                                {step.number}
                                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center ring-2 ring-white">
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-[#0F172A] mb-3">
                                {step.title}
                            </h3>
                            <p className="text-sm text-[#475569] leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl glass-premium">
                        <div className="dot-premium pulse-premium" />
                        <span className="text-label text-[#2563EB]">
                            Acompanhamento em tempo real com dashboards dedicados
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
