"use client"

import { motion } from "framer-motion"
import { Building2, TrendingUp, Shield, Zap } from "lucide-react"

export default function StatsSection() {
    const stats = [
        {
            icon: <Building2 className="h-8 w-8" />,
            number: "35",
            suffix: "mil",
            description: "Colaboradores no mundo"
        },
        {
            icon: <TrendingUp className="h-8 w-8" />,
            number: "18",
            suffix: "mil",
            description: "Clientes ativos"
        },
        {
            icon: <Shield className="h-8 w-8" />,
            number: "+15",
            suffix: "anos",
            description: "De experiência"
        },
        {
            icon: <Zap className="h-8 w-8" />,
            number: "500",
            suffix: "+",
            description: "Projetos entregues"
        }
    ]

    return (
        <section className="bg-orange-gradient section-padding">
            <div className="container-corporate">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="text-center text-white"
                        >
                            {/* Icon */}
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
                                {stat.icon}
                            </div>

                            {/* Number */}
                            <div className="mb-2">
                                <span className="text-5xl font-bold">{stat.number}</span>
                                <span className="text-2xl ml-1 font-normal">{stat.suffix}</span>
                            </div>

                            {/* Description */}
                            <div className="text-sm text-white/90 font-medium">
                                {stat.description}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
