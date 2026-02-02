"use client"

import { motion } from "framer-motion"

export default function VisualImpactSection() {
    return (
        <section className="corporate-section-white section-padding">
            <div className="container-corporate">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
                    {/* Imagem à Esquerda */}
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="aspect-[4/3] rounded-xl overflow-hidden border border-corporate-mediumGray shadow-corporate-lg">
                            {/* Placeholder para foto corporativa */}
                            <div className="w-full h-full bg-gradient-to-br from-corporate-blue/5 via-white to-corporate-blueLight/5 flex items-center justify-center">
                                <div className="text-center p-8">
                                    <div className="text-8xl mb-4">💼</div>
                                    <p className="text-corporate-textGray font-medium text-lg">
                                        Foto real:<br />
                                        Pessoas, escritório, tecnologia
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Elemento decorativo */}
                        <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-corporate-blue/5 rounded-xl -z-10" />
                    </motion.div>

                    {/* Conteúdo à Direita */}
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div>
                            <p className="text-sm font-semibold text-corporate-blue uppercase tracking-wide mb-2">
                                Impacto Real
                            </p>
                            <h2 className="text-4xl lg:text-5xl font-bold text-corporate-black leading-tight">
                                Tecnologia que gera impacto real no negócio
                            </h2>
                        </div>

                        <p className="text-lg text-corporate-textGray leading-relaxed">
                            Não entregamos apenas código. Criamos <strong className="text-corporate-black">soluções que ajudam empresas a operar melhor</strong>,
                            crescer com segurança e se preparar para o futuro digital.
                        </p>

                        <p className="text-lg text-corporate-textGray leading-relaxed">
                            Nossa abordagem combina expertise técnica com profundo entendimento de negócio.
                            O resultado? Tecnologia que resolve problemas reais e gera valor mensurável.
                        </p>

                        {/* Stats inline */}
                        <div className="grid grid-cols-2 gap-6 pt-6">
                            <div className="p-5 rounded-xl bg-corporate-lightGray border border-corporate-mediumGray">
                                <div className="text-3xl font-bold text-corporate-blue mb-1">100%</div>
                                <div className="text-sm text-corporate-textGray">Projetos personalizados</div>
                            </div>
                            <div className="p-5 rounded-xl bg-corporate-lightGray border border-corporate-mediumGray">
                                <div className="text-3xl font-bold text-corporate-blue mb-1">24/7</div>
                                <div className="text-sm text-corporate-textGray">Suporte disponível</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
