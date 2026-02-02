
"use client"

import { motion } from "framer-motion"

export default function DifferentialsSection() {
    return (
        <section className="w-full min-h-[85vh] py-24 bg-[#0B0B13] flex items-center justify-center overflow-hidden relative border-t border-[#1F2937]">

            {/* Background Gradients */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00B8FF]/20 to-transparent"></div>
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#00B8FF]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#9C5DE7]/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container-premium relative z-10 w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-20 max-w-4xl mx-auto"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 uppercase tracking-tight leading-tight">
                        Tecnologia que Gera <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B8FF] to-[#9C5DE7]">Receita e Escala</span>
                    </h2>
                    <p className="text-lg md:text-xl text-[#AAB3C2] font-medium max-w-3xl mx-auto leading-relaxed">
                        Unimos engenharia de software de elite com estratégias de growth hacking. Não entregamos apenas código, entregamos resultados de negócio.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid md:grid-cols-3 gap-12 lg:gap-16 items-start max-w-7xl mx-auto">

                    {/* Item 1 - Organização & Tech */}
                    <div className="flex flex-col items-center text-center group">
                        <div className="mb-8 relative transform transition-transform duration-500 group-hover:scale-105">
                            <IsoBuildingIcon />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Centros de
                            <br />Excelência
                        </h3>
                        <p className="text-[#AAB3C2] text-sm leading-relaxed max-w-[300px] mx-auto">
                            Equipes multidisciplinares focadas em organização de processos e arquitetura escalável para suportar o crescimento da sua operação.
                        </p>
                    </div>

                    {/* Item 2 - Performance & Marketing */}
                    <div className="flex flex-col items-center text-center group">
                        <div className="mb-8 relative transform transition-transform duration-500 group-hover:scale-105">
                            <IsoChartIcon />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Performance &
                            <br />Growth Hacking
                        </h3>
                        <p className="text-[#AAB3C2] text-sm leading-relaxed max-w-[300px] mx-auto">
                            Estratégias orientadas a dados e ROI. Transformamos tecnologia em uma alavanca de vendas e eficiência operacional.
                        </p>
                    </div>

                    {/* Item 3 - IA & Inovação */}
                    <div className="flex flex-col items-center text-center group">
                        <div className="mb-8 relative transform transition-transform duration-500 group-hover:scale-105">
                            <IsoChipIcon />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">
                            IA Nativa &
                            <br />Automação
                        </h3>
                        <p className="text-[#AAB3C2] text-sm leading-relaxed max-w-[300px] mx-auto">
                            Reduza custos e elimine ineficiências. Nossas soluções já nascem com inteligência artificial para colocar seu negócio à frente.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    )
}

// Custom Isometric SVGs to replace generic icons

function IsoBuildingIcon() {
    return (
        <svg width="140" height="140" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_30px_rgba(0,184,255,0.15)]">
            <path d="M100 180L30 140V60L100 100V180Z" fill="#0B0B13" stroke="#00B8FF" strokeWidth="2" />
            <path d="M100 180L170 140V60L100 100V180Z" fill="#12121E" stroke="#00B8FF" strokeWidth="2" />
            <path d="M100 100L170 60L100 20L30 60L100 100Z" fill="#00B8FF" fillOpacity="0.2" stroke="#00B8FF" strokeWidth="2" />

            {/* Windows Left */}
            <path d="M45 75L85 98" stroke="#00B8FF" strokeWidth="2" strokeOpacity="0.5" />
            <path d="M45 95L85 118" stroke="#00B8FF" strokeWidth="2" strokeOpacity="0.5" />
            <path d="M45 115L85 138" stroke="#00B8FF" strokeWidth="2" strokeOpacity="0.5" />

            {/* Windows Right */}
            <path d="M115 98L155 75" stroke="#00B8FF" strokeWidth="2" strokeOpacity="0.5" />
            <path d="M115 118L155 95" stroke="#00B8FF" strokeWidth="2" strokeOpacity="0.5" />
            <path d="M115 138L155 115" stroke="#00B8FF" strokeWidth="2" strokeOpacity="0.5" />

            {/* Glow */}
            <circle cx="100" cy="100" r="40" fill="#00B8FF" fillOpacity="0.05" />
        </svg>
    )
}

function IsoChartIcon() {
    return (
        <svg width="140" height="140" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_30px_rgba(37,235,133,0.15)]">
            {/* Base Platform */}
            <path d="M100 170L30 130L100 90L170 130L100 170Z" fill="#12121E" stroke="#00B8FF" strokeWidth="2" strokeOpacity="0.3" />

            {/* Bars */}
            {/* Tech Bar 1 */}
            <path d="M50 120V80L80 65V105L50 120Z" fill="#00B8FF" fillOpacity="0.2" stroke="#00B8FF" strokeWidth="2" />
            <path d="M80 65L110 50L80 35L50 50L80 65Z" fill="#00B8FF" fillOpacity="0.5" stroke="#00B8FF" strokeWidth="1" />

            {/* Tech Bar 2 (Higher) */}
            <path d="M90 100V50L120 35V85L90 100Z" fill="#9C5DE7" fillOpacity="0.2" stroke="#9C5DE7" strokeWidth="2" />
            <path d="M120 35L150 20L120 5L90 20L120 35Z" fill="#9C5DE7" fillOpacity="0.5" stroke="#9C5DE7" strokeWidth="1" />

            {/* Arrow */}
            <path d="M165 40L140 60" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
            <path d="M165 40L155 40" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
            <path d="M165 40L165 50" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
        </svg>
    )
}

function IsoChipIcon() {
    return (
        <svg width="140" height="140" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_30px_rgba(156,93,231,0.15)]">
            {/* Chip Body */}
            <path d="M100 160L40 130V70L100 40L160 70V130L100 160Z" fill="#0B0B13" stroke="#9C5DE7" strokeWidth="2" />

            {/* Inner Circuit */}
            <path d="M100 130L70 115V85L100 70L130 85V115L100 130Z" fill="#9C5DE7" fillOpacity="0.2" />

            {/* Nodes */}
            <circle cx="100" cy="100" r="10" fill="#9C5DE7" className="animate-pulse" />
            <path d="M100 70V40" stroke="#00B8FF" strokeWidth="2" />
            <path d="M130 85L160 70" stroke="#00B8FF" strokeWidth="2" />
            <path d="M130 115L160 130" stroke="#00B8FF" strokeWidth="2" />
            <path d="M100 130V160" stroke="#00B8FF" strokeWidth="2" />
            <path d="M70 115L40 130" stroke="#00B8FF" strokeWidth="2" />
            <path d="M70 85L40 70" stroke="#00B8FF" strokeWidth="2" />
        </svg>
    )
}
