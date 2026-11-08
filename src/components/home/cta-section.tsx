
"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export default function CTASection() {
    return (
        <section className="w-full min-h-[550px] lg:min-h-[650px] py-16 relative overflow-hidden flex items-center">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?q=80&w=2669&auto=format&fit=crop"
                    alt="Homem de negócios sorrindo"
                    fill
                    sizes="100vw"
                    className="object-cover object-[center_35%]"
                />
                {/* Dark Gradient Overlay for Text Readability - Stronger on left */}
                <div className="absolute inset-0 bg-[#0F172A]/75 md:bg-transparent md:bg-gradient-to-r md:from-[#0F172A] md:via-[#0F172A]/80 md:to-transparent" />
            </div>

            <div className="container-premium relative z-10 w-full flex items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="max-w-3xl"
                >
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-10 uppercase tracking-tight leading-[1.1] drop-shadow-xl">
                        CONTE COM A INFINITY{" "}
                        <br className="hidden md:block" />
                        <span className="text-[#00B8FF]">PARA POTENCIALIZAR</span>{" "}
                        <br className="hidden md:block" />
                        O CRESCIMENTO{" "}
                        <br className="hidden md:block" />
                        DA SUA EMPRESA
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <Link
                            href="/orcamento"
                            className="inline-flex items-center justify-center px-10 py-5 bg-[#00B8FF] text-white font-bold text-lg rounded-full hover:bg-[#009bd6] transition-all duration-300 shadow-[0_0_20px_rgba(0,184,255,0.4)] hover:shadow-[0_0_30px_rgba(0,184,255,0.6)] md:hover:-translate-y-1"
                        >
                            LIGAMOS PARA VOCÊ
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
