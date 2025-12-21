"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function PortfolioSection() {
    const projects = [
        {
            image: "/images/portfolio/Acctelecom/Projeto01.png",
            title: "ACC Telecom",
            description: "Captação de leads de alta performance com sistema integrado.",
            tech: ["Next.js", "Tailwind CSS"],
            slug: "acc-telecom"
        },
        {
            image: "/images/portfolio/GrupoAtk/image.png",
            title: "Grupo ATK",
            description: "Hub de Soluções Corporativas B2B para telecomunicações.",
            tech: ["Next.js", "Tailwind CSS"],
            slug: "grupoatk"
        },
        {
            image: "/images/portfolio/bko/screenshot-1766293973588.png",
            title: "BKO Consultoria",
            description: "Hub Telecom Multi-marcas com unificação visual completa.",
            tech: ["Next.js", "Tailwind CSS"],
            slug: "bko-consultoria"
        },
    ]

    return (
        <section id="portfolio-preview" className="w-full py-20 sm:py-24 md:py-32 bg-[#0B0B13] relative z-10 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[#0B0B13]">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#00B8FF]/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#9C5DE7]/5 rounded-full blur-[120px] pointer-events-none translate-x-1/3" />
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
                            <Laptop className="h-6 w-6 sm:h-8 sm:w-8 text-[#00B8FF]" />
                        </div>
                    </div>

                    <h2 className="font-orbitron font-bold text-3xl sm:text-4xl md:text-5xl mb-6 text-white uppercase tracking-wider">
                        Nosso <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B8FF] to-white animate-pulse-slow">Portfólio</span>
                    </h2>

                    <p className="font-manrope font-medium text-lg sm:text-xl text-[#AAB3C2] max-w-2xl mx-auto leading-[1.7]">
                        Transformamos ideias complexas em experiências digitais de alto impacto.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-[#0E0E12] border border-[#1F2937] rounded-2xl overflow-hidden group hover:border-[#00B8FF]/30 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,184,255,0.05)] hover:-translate-y-2 flex flex-col h-full"
                        >
                            <div className="relative h-56 sm:h-64 overflow-hidden">
                                <Image
                                    src={project.image}
                                    alt={project.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-[#0B0B13]/20 group-hover:bg-[#00B8FF]/10 transition-colors duration-500" />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-transparent to-transparent opacity-90" />
                            </div>

                            <div className="p-8 flex flex-col flex-grow relative">
                                {/* Floating Tags */}
                                <div className="flex flex-wrap gap-2 mb-6 -mt-12 relative z-10">
                                    {project.tech.map((tech, i) => (
                                        <span key={i} className="bg-[#0E0E12]/80 backdrop-blur-md text-[#00B8FF] text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full border border-[#00B8FF]/20 shadow-lg">
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                <h3 className="font-orbitron font-bold text-2xl mb-3 text-white group-hover:text-[#00B8FF] transition-colors">
                                    {project.title}
                                </h3>

                                <p className="font-sans text-[#C0C7D0] text-base mb-6 leading-relaxed flex-grow">
                                    {project.description}
                                </p>

                                <div className="mt-auto pt-6 border-t border-[#1F2937] group-hover:border-[#00B8FF]/10 transition-colors">
                                    <Link
                                        href={`/portfolio`}
                                        className="inline-flex items-center text-white text-sm font-bold hover:text-[#00B8FF] transition-colors font-manrope uppercase tracking-wider group/link"
                                    >
                                        Ver Case
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-16 sm:mt-24">
                    <Button
                        asChild
                        variant="ghost"
                        size="lg"
                        className="text-white hover:text-[#00B8FF] hover:bg-[#00B8FF]/5 border border-[#1F2937] hover:border-[#00B8FF]/30 px-8 py-6 rounded-full font-manrope font-bold uppercase tracking-wider transition-all duration-300"
                    >
                        <Link href="/portfolio">
                            Explorar Todos os Projetos <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
