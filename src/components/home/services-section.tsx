"use client"

import Link from "next/link"
import { Code2, Globe, Smartphone, Zap, Lightbulb, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function ServicesSection() {
    const services = [
        {
            icon: <Code2 className="h-8 w-8" />,
            title: "Desenvolvimento de Software",
            description: "Sistemas personalizados, plataformas corporativas e ERPs sob medida para seu negócio.",
            link: "/servicos/desenvolvimento-software",
        },
        {
            icon: <Globe className="h-8 w-8" />,
            title: "Aplicações Web & Mobile",
            description: "Desenvolvimento de aplicações modernas, seguras e performáticas para web e dispositivos móveis.",
            link: "/servicos/aplicativos-celular",
        },
        {
            icon: <Zap className="h-8 w-8" />,
            title: "Automação de Processos",
            description: "Automatização de fluxos internos e integrações para reduzir custos operacionais.",
            link: "/servicos/automacoes",
        },
        {
            icon: <Smartphone className="h-8 w-8" />,
            title: "E-commerce e Plataformas",
            description: "Plataformas digitais focadas em conversão, estabilidade e crescimento escalável.",
            link: "/servicos/ecommerce",
        },
        {
            icon: <Lightbulb className="h-8 w-8" />,
            title: "Consultoria em Tecnologia",
            description: "Apoio na definição de arquitetura, stack tecnológico e estratégia de transformação digital.",
            link: "/servicos/consultoria",
        },
    ]

    return (
        <section className="bg-white py-24">
            <div className="container-corporate">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 max-w-3xl mx-auto"
                >
                    <h2 className="text-4xl font-bold text-[#0F172A] mb-4">
                        O que fazemos
                    </h2>
                    <p className="text-xl text-[#475569]">
                        Soluções tecnológicas desenhadas para resolver desafios reais de negócio
                    </p>
                </motion.div>

                {/* Grid de Serviços */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Link href={service.link}>
                                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 h-full hover:border-[#1E40AF]/50 hover:shadow-xl transition-all duration-300 group">
                                    {/* Icon */}
                                    <div className="w-14 h-14 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-5 text-[#1E40AF] group-hover:bg-[#1E40AF] group-hover:text-white transition-colors duration-300">
                                        {service.icon}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-[#0F172A] mb-3 group-hover:text-[#1E40AF] transition-colors">
                                        {service.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-base text-[#475569] mb-4 leading-relaxed">
                                        {service.description}
                                    </p>

                                    {/* Link */}
                                    <div className="flex items-center gap-2 text-[#1E40AF] font-medium text-sm">
                                        Saiba mais
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
