
"use client"

import Link from "next/link"
import { Play } from "lucide-react"

export default function AboutSummary() {
    return (
        <section id="about-summary" className="w-full py-20 lg:py-28 bg-[#F8FAFC]">
            <div className="container-premium">

                {/* Main Headline (Mobile centered, Desktop left) */}
                <div className="mb-12 lg:mb-16 text-center lg:text-left">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0F172A] uppercase tracking-tight max-w-4xl">
                        AS EMPRESAS QUE <span className="text-[#2563EB]">TRANSFORMAM O FUTURO</span>, CONFIAM NA INFINITY
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left Column: Image/Video Placeholder */}
                    <div className="relative group cursor-pointer w-full aspect-video lg:aspect-auto lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                        {/* Image */}
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                            alt="Equipe Infinity Group"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent opacity-90" />

                        {/* Play Button & Text */}


                        {/* Decorative Side Element (TOTVS style) */}
                        <div className="absolute top-0 right-0 h-full w-4 sm:w-6 bg-[#2563EB]/80 backdrop-blur-sm mix-blend-multiply" />
                    </div>

                    {/* Right Column: Text Content */}
                    <div className="space-y-8">
                        <div className="space-y-6 text-[#475569] text-lg leading-relaxed">
                            <p>
                                A <strong>Infinity Group</strong> cria soluções que resolvem o dia a dia de empresas que buscam liderança em seus setores.
                            </p>

                            <p>
                                Brasileira com visão global, somos a <span className="text-[#0F172A] font-bold">pareceira estratégica ideal</span> para o desenvolvimento de sistemas e plataformas de alta complexidade.
                            </p>

                            <p>
                                Transformamos tecnologia em histórias de sucesso. Estamos juntos de quem inova, produz, serve e entrega. De quem cuida, educa, vende e constrói o amanhã.
                            </p>

                            <p>
                                Somos parceiros de um mercado que não para. Nossas soluções de software, aplicativos e automações atendem negócios dos mais variados portes e segmentos da economia.
                            </p>
                        </div>

                        <div className="pt-4">
                            <p className="text-[#0F172A] font-bold text-lg mb-6">
                                As empresas que movem o mercado confiam na Infinity.
                            </p>

                            <Link
                                href="/sobre"
                                className="inline-flex items-center text-[#2563EB] font-bold tracking-wider uppercase hover:text-[#1E40AF] transition-colors border-b-2 border-[#2563EB] pb-1 hover:border-[#1E40AF]"
                            >
                                O FUTURO QUE FAZ, FAZ COM INFINITY
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
