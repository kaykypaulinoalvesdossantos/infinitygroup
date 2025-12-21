"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform } from "framer-motion"
import SpaceBackground from "@/components/space-background"

export default function HeroSection() {
    const { scrollY } = useScroll()
    const y1 = useTransform(scrollY, [0, 500], [0, 200])
    const y2 = useTransform(scrollY, [0, 500], [0, -150])

    // Smooth fade for content
    const opacity = useTransform(scrollY, [0, 300], [1, 0])
    const scale = useTransform(scrollY, [0, 300], [1, 0.95])

    return (
        <section className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0B0B13] text-white pt-20 pb-10">
            {/* Space Background */}
            <div className="fixed inset-0 z-0">
                <SpaceBackground />
            </div>

            {/* Grid overlay for tech feel */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B13]/0 via-[#0B0B13]/50 to-[#0B0B13] z-10"></div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] grid-rows-[repeat(auto-fill,minmax(100px,1fr))] h-full w-full opacity-[0.03]">
                    {Array.from({ length: 100 }).map((_, i) => (
                        <div key={i} className="border border-[#5DC0E7]"></div>
                    ))}
                </div>
            </div>

            <motion.div
                className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 relative flex flex-col items-center text-center"
                style={{ opacity, scale }}
            >
                {/* Agitate - Pre-header Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-8 sm:mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.1)] group cursor-default hover:bg-red-500/15 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-manrope text-red-200 text-xs sm:text-sm font-semibold tracking-wide uppercase">
                            Cansado de promessas vazias?
                        </span>
                    </div>
                </motion.div>

                {/* Main Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="max-w-5xl mx-auto mb-8 sm:mb-10 relative"
                >
                    <h1 className="font-orbitron font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-wider text-white uppercase text-balance">
                        A Infinity <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5DC0E7] via-cyan-400 to-[#3ec6f0] drop-shadow-[0_0_25px_rgba(93,192,231,0.4)]">Transforma Ideias</span>
                        <br /> em Resultados Reais
                    </h1>

                    {/* Decorative elements behind text */}
                    <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#5DC0E7]/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
                    <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#9C5DE7]/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
                </motion.div>

                {/* Subtitle / Value Prop */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="max-w-2xl mx-auto mb-12 sm:mb-14"
                >
                    <p className="font-sans text-lg sm:text-xl text-gray-400 leading-relaxed text-balance">
                        Chega de perder tempo. Unimos <span className="text-white font-medium">tecnologia de ponta</span> e <span className="text-white font-medium">design estratégico</span> para criar soluções digitais que realmente escalam o seu negócio.
                    </p>
                </motion.div>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto"
                >
                    <Button
                        asChild
                        size="lg"
                        className="w-full sm:w-auto bg-[#5DC0E7] hover:bg-[#4aa8cc] text-white h-14 px-8 rounded-full text-base sm:text-lg shadow-[0_0_30px_rgba(93,192,231,0.3)] hover:shadow-[0_0_50px_rgba(93,192,231,0.5)] hover:-translate-y-1 transition-all duration-300 font-manrope font-bold uppercase tracking-wide group"
                    >
                        <Link href="/orcamento">
                            Começar Agora <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto h-14 px-8 border-white/10 text-white hover:bg-white/5 hover:border-[#5DC0E7]/50 rounded-full text-base sm:text-lg backdrop-blur-sm transition-all duration-300 font-manrope font-bold uppercase tracking-wide"
                    >
                        <Link href="/portfolio">
                            Conhecer Projetos
                        </Link>
                    </Button>
                </motion.div>
            </motion.div>

            {/* Floating Background Elements (Parallax) */}
            <motion.div style={{ y: y1 }} className="absolute top-1/4 left-5 sm:left-20 w-3 h-3 bg-[#5DC0E7] rounded-full shadow-[0_0_15px_#5DC0E7]" />
            <motion.div style={{ y: y2 }} className="absolute bottom-1/3 right-5 sm:right-20 w-4 h-4 border-2 border-[#5DC0E7]/30 rounded-full" />

        </section>
    )
}
