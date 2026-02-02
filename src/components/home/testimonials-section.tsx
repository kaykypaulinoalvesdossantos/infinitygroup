"use client"

import { motion } from "framer-motion"
import { Quote, Star } from "lucide-react"

export default function TestimonialsSection() {
    const testimonials = [
        {
            quote: "A Infinity Groups entregou uma plataforma robusta que modernizou completamente nossos processos. O nível técnico da equipe e a capacidade de traduzir necessidades de negócio em soluções práticas foram impressionantes.",
            author: "Carlos Silva",
            role: "CTO",
            company: "TechCorp Solutions",
            rating: 5
        },
        {
            quote: "Parceria excepcional. A transparência no processo, a qualidade do código entregue e o suporte contínuo estabeleceram um novo padrão para nossos projetos de tecnologia.",
            author: "Mariana Santos",
            role: "Diretora de TI",
            company: "LogisticPro",
            rating: 5
        },
        {
            quote: "Desenvolveram nossa plataforma de e-commerce com foco total em performance e conversão. O resultado superou nossas expectativas e está preparado para escalar com nosso crescimento.",
            author: "Roberto Oliveira",
            role: "CEO",
            company: "VarejoMax Digital",
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
                    className="text-center mb-20 max-w-3xl mx-auto"
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
                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
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
                                "{testimonial.quote}"
                            </p>

                            {/* Author */}
                            <div className="pt-5 border-t border-[#E4E7EC]">
                                <div className="font-semibold text-[#0F172A] mb-1">
                                    {testimonial.author}
                                </div>
                                <div className="text-label text-[#64748B]">
                                    {testimonial.role} • {testimonial.company}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
