/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Quote, Star, CheckCircle2 } from "lucide-react"

const testimonials = [
  {
    id: 1,
    content:
      "A Infinity Groups transformou nosso negócio com um site incrível e automações que economizam horas por dia. O nível de entrega foi muito acima do mercado.",
    author: "Auro Cedro Cruz",
    company: "ACC Telecom",
    role: "Diretor Comercial",
    image: "/images/testemuinho-home/acctelecom.jpg",
  },
  {
    id: 2,
    content: "Profissionalismo impecável. O sistema que desenvolveram para nós é robusto, rápido e tem uma interface extremamente intuitiva.",
    author: "Mariana Costa",
    company: "JH Telecom",
    role: "CEO",
    image: "/images/testemuinho-home/jhtelecom.jpg",
  },
  {
    id: 3,
    content:
      "Nosso faturamento aumentou consideravelmente após o novo e-commerce. A equipe entendeu perfeitamente nossa necessidade estratégica.",
    author: "Emilie Banko",
    company: "Emilie Banko Imóveis",
    role: "Proprietária",
    image: "/images/testemuinho-home/emili.jpg",
  },
]

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  const next = () => {
    setCurrent((current + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrent((current - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      next()
    }, 5000)

    return () => clearInterval(interval)
  }, [current, autoplay])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="bg-[#0E0E12] p-8 rounded-2xl border border-[#1F2937] hover:border-[#00B8FF]/30 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,184,255,0.03)] h-full flex flex-col group relative"
        >
          {/* Top Bar: Stars & Verified */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 fill-[#00B8FF] text-[#00B8FF]" />
              ))}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00B8FF]/10 border border-[#00B8FF]/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00B8FF]" />
              <span className="text-xs font-semibold text-[#00B8FF] uppercase tracking-wide">Verificado</span>
            </div>
          </div>

          {/* Quote Body */}
          <div className="flex-grow mb-8 relative">
            <Quote className="absolute -top-2 -left-2 w-8 h-8 text-[#00B8FF]/10 rotate-180 opacity-50" />
            <p className="font-sans text-[#C0C7D0] text-[16px] sm:text-[17px] leading-[1.6] relative z-10 pl-4 font-normal tracking-wide">{testimonial.content}</p>
          </div>

          {/* Author Footer */}
          <div className="flex items-center pt-6 border-t border-[#1F2937] group-hover:border-[#00B8FF]/10 transition-colors">
            <div className="h-12 w-12 rounded-full overflow-hidden mr-4 border-2 border-[#1F2937] group-hover:border-[#00B8FF] transition-colors relative">
              <Image
                src={testimonial.image}
                alt={testimonial.author}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-manrope font-bold text-white text-base">{testimonial.author}</h3>
              <p className="font-sans text-sm text-[#8892A0]">
                {testimonial.role} <span className="text-[#00B8FF]">•</span> {testimonial.company}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
