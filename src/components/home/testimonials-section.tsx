"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Quote, Star } from "lucide-react"

export default function TestimonialsSection() {
    const testimonials = [
        {
            quote: "A Infinity Groups transformou nosso negócio com um site incrível e automações que economizam horas por dia. O nível de entrega foi muito acima do mercado.",
            author: "Auro Cedro Cruz",
            role: "Diretor Comercial",
            company: "ACC Telecom",
            image: "/images/testemuinho-home/acctelecom.avif",
            rating: 5
        },
        {
            quote: "Profissionalismo impecável. O sistema que desenvolveram para nós é robusto, rápido e tem uma interface extremamente intuitiva.",
            author: "Mariana Costa",
            role: "CEO",
            company: "JH Telecom",
            image: "/images/testemuinho-home/jhtelecom.avif",
            rating: 5
        },
        {
            quote: "Nosso faturamento aumentou consideravelmente após o novo e-commerce. A equipe entendeu perfeitamente nossa necessidade estratégica.",
            author: "Emilie Banko",
            role: "Proprietária",
            company: "Emilie Banko Imóveis",
            image: "/images/testemuinho-home/emili.avif",
            rating: 5
        }
    ]

    return (
        <section className="section-premium bg-gray-premium">
            <div className="container-premium">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 md:mb-20 max-w-3xl mx-auto"
                >
                    <div className="line-premium mx-auto mb-6" />
                    <h2 className="text-h2 text-[#0F172A] mb-6">
                        Resultados que falam por si
                    </h2>
                    <p className="text-body-lg text-[#475569]">
                        O sucesso dos nossos clientes é a melhor prova da qualidade do nosso trabalho
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="card-premium flex flex-col h-full"
                        >
                            {/* Rating stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-[#2563EB] text-[#2563EB]" />
                                ))}
                            </div>

                            {/* Quote */}
                            <Quote className="h-10 w-10 text-[#2563EB]/20 mb-4" />

                            {/* Text */}
                            <p className="text-base text-[#475569] leading-relaxed mb-6 flex-1">
                                “{testimonial.quote}”
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4 pt-5 border-t border-[#E4E7EC]">
                                <Image
                                    src={testimonial.image}
                                    alt={testimonial.author}
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                                />
                                <div>
                                    <div className="font-semibold text-[#0F172A] mb-1">
                                        {testimonial.author}
                                    </div>
                                    <div className="text-label text-[#64748B]">
                                        {`${testimonial.role} • ${testimonial.company}`}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
