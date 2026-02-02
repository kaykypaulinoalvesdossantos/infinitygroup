"use client"

import { motion } from "framer-motion"

export default function TechSection() {
    const technologies = [
        "TypeScript",
        "Node.js",
        "React",
        "Next.js",
        "PostgreSQL",
        "AWS",
        "Docker"
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
                    className="text-center mb-12 max-w-3xl mx-auto"
                >
                    <h2 className="text-4xl font-bold text-[#0F172A] mb-4">
                        Tecnologias que dominamos
                    </h2>
                    <p className="text-xl text-[#475569]">
                        Utilizamos as melhores ferramentas para garantir escalabilidade e performance
                    </p>
                </motion.div>

                {/* Grid de Tecnologias */}
                <div className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto">
                    {technologies.map((tech, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            viewport={{ once: true }}
                        >
                            <div className="px-6 py-3 bg-white border-2 border-[#E5E7EB] rounded-xl text-[#0F172A] font-semibold hover:border-[#1E40AF] hover:bg-[#EFF6FF] hover:text-[#1E40AF] transition-all duration-300">
                                {tech}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Nota */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="text-center text-[#64748B] mt-8"
                >
                    E diversas outras tecnologias conforme necessidade do projeto
                </motion.p>
            </div>
        </section>
    )
}
