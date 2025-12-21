"use client"

import Link from "next/link"
import { Rocket, Globe, Database, Phone, Laptop, Code, Server, Zap, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import ServiceCard from "@/components/service-card"

export default function ServicesSection() {
    const services = [
        {
            icon: <Globe className="h-6 w-6" />,
            title: "Web Sites",
            description: "Sites institucionais modernos, rápidos, responsivos e otimizados para SEO.",
            link: "/servicos/websites",
        },
        {
            icon: <Database className="h-6 w-6" />,
            title: "E-commerce",
            description: "Lojas virtuais integradas com gateways de pagamento, automações e funis de vendas.",
            link: "/servicos/ecommerce",
        },
        {
            icon: <Phone className="h-6 w-6" />,
            title: "Aplicativos para Celular",
            description: "Desenvolvimento de apps Android e iOS personalizados com UX otimizada.",
            link: "/servicos/aplicativos-celular",
        },
        {
            icon: <Laptop className="h-6 w-6" />,
            title: "Aplicativos para Computador",
            description: "Softwares para uso interno de empresas com foco em performance e produtividade.",
            link: "/servicos/aplicativos-computador",
        },
        {
            icon: <Code className="h-6 w-6" />,
            title: "Automações",
            description: "Automatize tarefas repetitivas e integre sistemas para acelerar seus processos.",
            link: "/servicos/automacoes",
        },
        {
            icon: <Server className="h-6 w-6" />,
            title: "Consultoria",
            description: "Consultoria técnica especializada para otimizar seus processos e sistemas.",
            link: "/servicos/consultoria",
        },
    ]

    return (
        <section id="servicos" className="w-full py-20 sm:py-24 md:py-32 relative z-10 overflow-hidden bg-[#0B0B13]">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[#0B0B13]">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00B8FF]/5 rounded-full blur-[120px] pointer-events-none" />
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
                            <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-[#00B8FF]" />
                        </div>
                    </div>

                    <h2 className="font-orbitron font-bold text-4xl sm:text-5xl md:text-6xl mb-6 text-white uppercase tracking-wider">
                        Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B8FF] to-white animate-pulse-slow">Serviços</span>
                    </h2>

                    <p className="font-manrope font-medium text-lg sm:text-xl text-[#AAB3C2] max-w-2xl mx-auto leading-[1.7]">
                        Soluções digitais sob medida — do design ao código.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {services.map((service, index) => {
                        // Mosaic Layout Logic
                        const isMain = index === 0; // Web Sites
                        const isFullWidth = index === 5; // Consultoria (Last one)

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className={`
                                    ${isMain ? 'md:col-span-2 lg:col-span-2' : ''}
                                    ${isFullWidth ? 'md:col-span-2 lg:col-span-3' : 'col-span-1'}
                                `}
                            >
                                <ServiceCard
                                    {...service}
                                    fontTitle="font-manrope"
                                    fontDesc="font-sans"
                                    className={isMain ? 'bg-gradient-to-br from-[#12121E]/80 to-[#00B8FF]/5 border-[#00B8FF]/20 shadow-[0_0_30px_rgba(0,184,255,0.05)]' : ''}
                                />
                            </motion.div>
                        )
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="text-center mt-16 sm:mt-20"
                >
                    <Button
                        asChild
                        variant="ghost"
                        size="lg"
                        className="text-white hover:text-[#00B8FF] hover:bg-[#00B8FF]/5 font-manrope font-bold text-base sm:text-lg tracking-wide transition-all duration-300 group"
                    >
                        <Link href="/servicos" className="flex items-center gap-2">
                            Explorar todas as soluções da Infinity
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    )
}
