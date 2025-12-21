"use client"

import { CheckCircle, Rocket, Eye, Heart, Clock, Star } from "lucide-react"
import { motion } from "framer-motion"
import { OptimizedImage } from '@/components/ui/optimized-image'
import StatsCounter from "@/components/stats-counter"

export default function AboutSection() {
    return (
        <section id="sobre" className="w-full py-20 sm:py-24 md:py-32 relative z-10 overflow-hidden bg-[#0B0B13]">
            {/* Background noise/gradient */}
            <div className="absolute inset-0 bg-[#0B0B13]">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00B8FF]/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#9C5DE7]/5 rounded-full blur-[120px] pointer-events-none" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center mb-20">
                    {/* Content Column (60%) */}
                    <motion.div
                        className="lg:col-span-7"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        {/* Title */}
                        <div className="mb-8">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: "60px" }}
                                transition={{ duration: 0.8 }}
                                className="h-1 bg-[#00B8FF] mb-6 rounded-full"
                            />
                            <h2 className="font-orbitron font-bold text-4xl sm:text-5xl leading-tight text-white tracking-wide">
                                Quem somos – <br />
                                <span className="text-white animate-pulse-slow drop-shadow-[0_0_15px_rgba(0,184,255,0.5)]">Infinity Groups</span>
                            </h2>
                        </div>

                        {/* Description */}
                        <div className="space-y-6 mb-12 max-w-2xl">
                            <p className="font-sans font-normal text-lg text-[#AAB3C2] leading-[1.8]">
                                A Infinity Groups é uma empresa focada em desenvolvimento de soluções digitais. Há mais de 2 anos no mercado, entregamos <span className="font-manrope font-semibold text-[#00B8FF]">projetos funcionais e personalizados</span> que transformam sonhos em realidade.
                            </p>
                            <p className="font-sans font-normal text-lg text-[#AAB3C2] leading-[1.8]">
                                Atuamos com excelência e profissionalismo, ajudando nossos clientes a crescerem com <span className="font-manrope font-semibold text-[#00B8FF]">tecnologia de alto nível</span> e estratégias validadas.
                            </p>
                        </div>

                        {/* MVV Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { title: "Missão", text: "Inovação, qualidade e resultado real.", icon: <Rocket className="w-5 h-5 text-[#00B8FF]" /> },
                                { title: "Visão", text: "Referência nacional em automação inteligente.", icon: <Eye className="w-5 h-5 text-[#00B8FF]" /> },
                                { title: "Valores", text: "Marketing estratégico e entrega de valor.", icon: <Heart className="w-5 h-5 text-[#00B8FF]" /> }
                            ].map((card, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -5 }}
                                    className={`group p-6 rounded-xl border border-[#00B8FF]/10 bg-[#12121E]/40 backdrop-blur-sm transition-all duration-300 hover:border-[#00B8FF]/30 hover:shadow-[0_10px_30px_rgba(0,184,255,0.05)] ${idx === 1 ? 'mt-0 sm:-mt-4' : ''}`}
                                >
                                    <div className="mb-4 p-3 rounded-lg bg-[#00B8FF]/10 w-fit group-hover:bg-[#00B8FF]/20 transition-colors">
                                        {card.icon}
                                    </div>
                                    <h3 className="font-manrope font-bold text-lg text-white mb-2 group-hover:text-[#00B8FF] transition-colors">{card.title}</h3>
                                    <p className="font-sans text-sm text-[#AAB3C2] leading-relaxed">
                                        {card.text}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Image Column (40%) */}
                    <motion.div
                        className="lg:col-span-5 relative"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        <div className="relative z-10 rounded-2xl overflow-hidden border border-[#00B8FF]/20 shadow-[0_0_40px_rgba(0,184,255,0.1)] group aspect-[4/5]">
                            <div className="absolute inset-0 bg-[#00B8FF]/10 mix-blend-overlay z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B13] to-transparent opacity-60 z-10" />
                            <OptimizedImage
                                src="/images/innovation-team.png"
                                alt="Time de inovação Infinity Groups colaborando"
                                width={600}
                                height={750}
                                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Floating Tech Elements Overlay */}
                            <div className="absolute bottom-8 left-8 z-30">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-[#00B8FF] animate-pulse" />
                                    <span className="font-orbitron text-xs text-[#00B8FF] tracking-widest">SYSTEM ONLINE</span>
                                </div>
                                <div className="h-[1px] w-20 bg-[#00B8FF]/50" />
                            </div>
                        </div>

                        {/* Decorative glowing dots - softer */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00B8FF]/10 rounded-full blur-3xl -z-10" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#9C5DE7]/10 rounded-full blur-3xl -z-10" />
                    </motion.div>
                </div>

                {/* Stats - Centered & Horizontal */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center justify-center border-t border-[#00B8FF]/10 pt-12">
                        {[
                            { value: 10, suffix: "+", label: "Projetos Entregues", icon: <Rocket className="w-4 h-4" /> },
                            { value: 4.9, suffix: "", label: "Avaliação Média", icon: <Star className="w-4 h-4" /> },
                            { value: 24, suffix: "/7", label: "Suporte Técnico", icon: <Clock className="w-4 h-4" /> },
                            { value: 100, suffix: "%", label: "Satisfação", icon: <CheckCircle className="w-4 h-4" /> },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center justify-center text-center group">
                                <div className="mb-3 p-3 rounded-full bg-[#12121E] border border-[#00B8FF]/10 group-hover:border-[#00B8FF]/30 transition-colors shadow-[0_0_15px_rgba(0,184,255,0.05)]">
                                    <span className="text-[#00B8FF] group-hover:text-white transition-colors">{stat.icon}</span>
                                </div>
                                <StatsCounter
                                    end={stat.value}
                                    suffix={stat.suffix}
                                    label=""
                                    decimals={Number.isInteger(stat.value) ? 0 : 1}
                                    className="font-orbitron font-bold text-3xl md:text-4xl text-white mb-1 group-hover:text-[#00B8FF] transition-colors"
                                />
                                <span className="font-manrope font-medium text-sm text-[#AAB3C2] tracking-wide uppercase">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
