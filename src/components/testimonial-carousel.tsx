/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    content:
      "A Infinity Group transformou nosso negócio com um site incrível e automações que economizam horas por dia.",
    author: "Auro Cedro Cruz",
    company: "ACC Telecom",
    role: "Diretor Comercial",
    image: "/images/testemuinho-home/acctelecom.jpg",
  },
  {
    id: 2,
    content: "Entrega rápida, sistema funcional e suporte excelente.",
    author: "Mariana Costa",
    company: "JH Telecom",
    role: "CEO",
    image: "/images/testemuinho-home/jhtelecom.jpg",
  },
  {
    id: 3,
    content:
      "Profissionais extremamente competentes. Nosso site ficou exatamente como queríamos e os resultados superaram nossas expectativas.",
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="bg-[#FBFBFB]/5 p-8 rounded-lg backdrop-blur-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[#5DC0E7]"></div>
          <div className="absolute top-0 left-0 w-0 h-1 bg-[#FBFBFB] group-hover:w-full transition-all duration-500"></div>
          <Quote className="h-10 w-10 text-[#5DC0E7]/20 mb-4" />
          <p className="text-[#FBFBFB]/80 mb-6 italic">"{testimonial.content}"</p>
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full overflow-hidden mr-4 border-2 border-[#5DC0E7]">
              <Image
                src={testimonial.image || "/placeholder.svg"}
                alt={testimonial.author}
                width={100}
                height={100}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-[#FBFBFB]">{testimonial.author}</h3>
              <p className="text-[#5DC0E7]">
                {testimonial.role}, {testimonial.company}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
