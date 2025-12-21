"use client"

import { Code } from "lucide-react"
import { motion } from "framer-motion"
import TechCarousel from "@/components/tech-carousel"

export default function TechSection() {
    return (
        <section id="tecnologias" className="w-full py-20 sm:py-24 md:py-32 bg-[#0B0B13] relative z-10 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[#0B0B13]">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#00B8FF]/5 rounded-full blur-[120px] pointer-events-none" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12 sm:mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="inline-block mb-4 sm:mb-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-[#0F0F1A] rounded-full flex items-center justify-center border border-[#00B8FF]/30 shadow-[0_0_20px_rgba(0,184,255,0.2)]">
                            <Code className="h-6 w-6 sm:h-8 sm:w-8 text-[#00B8FF]" />
                        </div>
                    </div>

                    <h2 className="font-orbitron font-bold text-3xl sm:text-4xl md:text-5xl mb-6 text-white uppercase tracking-wider">
                        Stack <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B8FF] to-white animate-pulse-slow">Tecnológico</span>
                    </h2>

                    <p className="font-manrope font-medium text-lg sm:text-xl text-[#AAB3C2] max-w-2xl mx-auto leading-[1.7]">
                        Dominamos as tecnologias mais modernas para construir soluções robustas e escaláveis.
                    </p>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
                className="w-full lg:container lg:mx-auto relative z-10"
            >
                <TechCarousel />
            </motion.div>
        </section>
    )
}
