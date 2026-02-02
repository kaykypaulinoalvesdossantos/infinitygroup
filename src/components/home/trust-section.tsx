"use client"

import { motion } from "framer-motion"
import { Building2, Smartphone, Hospital, ShoppingCart, Headphones } from "lucide-react"

export default function TrustSection() {
    const segments = [
        { name: "Tecnologia", icon: <Smartphone className="h-6 w-6" /> },
        { name: "Telecom", icon: <Headphones className="h-6 w-6" /> },
        { name: "Saúde", icon: <Hospital className="h-6 w-6" /> },
        { name: "Varejo", icon: <ShoppingCart className="h-6 w-6" /> },
        { name: "Serviços", icon: <Building2 className="h-6 w-6" /> },
    ]

    return (
        <section className="corporate-section-gray section-padding-sm">
            <div className="container-corporate">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <p className="text-sm font-semibold text-corporate-blue uppercase tracking-wide mb-2">
                        Confiança Corporativa
                    </p>
                    <h2 className="text-3xl font-bold text-corporate-black">
                        Empresas que confiam em soluções digitais
                    </h2>
                </motion.div>

                {/* Segmentos Atendidos */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto"
                >
                    {segments.map((segment, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-corporate-mediumGray hover:border-corporate-blue/30 hover:shadow-corporate transition-all duration-300"
                        >
                            <div className="w-12 h-12 rounded-full bg-corporate-blueBg flex items-center justify-center text-corporate-blue mb-3">
                                {segment.icon}
                            </div>
                            <span className="text-sm font-semibold text-corporate-black text-center">
                                {segment.name}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Nota */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="text-center text-sm text-corporate-textLight mt-8"
                >
                    Atendemos empresas de diversos segmentos com soluções personalizadas
                </motion.p>
            </div>
        </section>
    )
}
