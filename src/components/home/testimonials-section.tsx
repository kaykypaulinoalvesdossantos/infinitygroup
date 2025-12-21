"use client"

import { Star } from "lucide-react"
import { motion } from "framer-motion"
import TestimonialCarousel from "@/components/testimonial-carousel"

export default function TestimonialsSection() {
    return (
        <section id="depoimentos" className="w-full py-20 sm:py-24 md:py-32 bg-[#0B0B13] relative z-10 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[#0B0B13]">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00B8FF]/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#9C5DE7]/5 rounded-full blur-[120px] pointer-events-none" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 sm:mb-20"
                >
                    <div className="inline-block mb-4 sm:mb-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-[#0F0F1A] rounded-full flex items-center justify-center border border-[#00B8FF]/30 shadow-[0_0_20px_rgba(0,184,255,0.2)]">
                            <Star className="h-6 w-6 sm:h-8 sm:w-8 text-[#00B8FF]" />
                        </div>
                    </div>

                    <h2 className="font-orbitron font-bold text-3xl sm:text-4xl md:text-5xl mb-6 text-white uppercase tracking-wider">
                        O que dizem <br className="md:hidden" />nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B8FF] to-white animate-pulse-slow">Parceiros</span>
                    </h2>

                    <p className="font-manrope font-medium text-lg sm:text-xl text-[#AAB3C2] max-w-2xl mx-auto leading-[1.7]">
                        A satisfação de quem confia na Infinity Groups é o nosso maior combustível.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="px-0 sm:px-6 lg:px-8"
                >
                    <TestimonialCarousel />
                </motion.div>
            </div>
        </section>
    )
}
