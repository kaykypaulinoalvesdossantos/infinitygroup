"use client"

import Link from "next/link"
import { Rocket, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function CTASection() {
    return (
        <section className="w-full py-20 sm:py-24 md:py-32 bg-[#0B0B13] relative z-10 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[#0B0B13]">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>

                {/* Radiant Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00B8FF]/10 rounded-full blur-[120px] pointer-events-none" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto bg-[#0E0E12] rounded-3xl p-8 sm:p-12 md:p-16 border border-[#1F2937] relative overflow-hidden text-center group"
                >
                    {/* Glass Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {/* Decorative Borders */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00B8FF]/50 to-transparent opacity-50" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00B8FF]/20 to-transparent opacity-30" />

                    <div className="inline-block mb-6 sm:mb-8 relative z-10">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#0F0F1A] rounded-full flex items-center justify-center border border-[#00B8FF]/30 shadow-[0_0_30px_rgba(0,184,255,0.3)] group-hover:scale-110 transition-transform duration-500">
                            <Rocket className="h-8 w-8 sm:h-10 sm:w-10 text-[#00B8FF]" />
                        </div>
                    </div>

                    <h2 className="font-orbitron font-bold text-3xl sm:text-4xl md:text-5xl mb-6 text-white uppercase tracking-wider relative z-10">
                        Não deixe sua ideia <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B8FF] to-white animate-pulse-slow">Apenas no Papel</span>
                    </h2>

                    <p className="font-manrope font-medium text-lg sm:text-xl mb-10 text-[#AAB3C2] leading-relaxed max-w-2xl mx-auto relative z-10">
                        A tecnologia certa pode transformar seu negócio. Receba um plano personalizado de inovação digital, sem compromisso.
                    </p>

                    <div className="relative z-10">
                        <Button
                            asChild
                            size="lg"
                            className="bg-[#00B8FF] hover:bg-[#0099D6] text-white px-10 py-8 text-lg rounded-full shadow-[0_0_30px_rgba(0,184,255,0.4)] hover:shadow-[0_0_50px_rgba(0,184,255,0.6)] transition-all duration-300 transform hover:-translate-y-1 font-manrope font-bold uppercase tracking-wide border border-white/20"
                        >
                            <Link href="/orcamento">
                                Receber Proposta Gratuita <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <p className="mt-4 text-sm text-[#AAB3C2]/60 font-manrope">
                            *Resposta em até 24 horas úteis
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
