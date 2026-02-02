"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, MessageCircle } from "lucide-react"

const slides = [
    {
        id: 1,
        title: "Transformação Digital Inteligente",
        description: "Elevamos sua empresa ao próximo nível com arquitetura de software escalável, inteligência artificial e design premium.",
        cta: "Iniciar transformação",
        ctaLink: "https://wa.me/5511945332464",
        image: "/images/home-page/grok-video-f45cdb8e-36a8-4d57-8ffb-23fed21fefb0.gif",
        gradient: "from-blue-950/90 via-blue-900/50 to-transparent"
    },
    {
        id: 2,
        title: "Soluções Enterprise de Alta Performance",
        description: "Desenvolvimento robusto para grandes operações. Segurança, performance e confiabilidade para o seu core business.",
        cta: "Conhecer soluções",
        ctaLink: "#solutions",
        image: "/images/home-page/grok-video-4e2ef7c4-b3c2-4568-828e-4f9e644a29ee.gif",
        gradient: "from-slate-950/90 via-slate-900/50 to-transparent"
    },
    {
        id: 3,
        title: "Automação que Gera Resultados",
        description: "Reduza custos operacionais e elimine ineficiências com nossas soluções avançadas de automação de processos.",
        cta: "Ver cases de sucesso",
        ctaLink: "/portfolio",
        image: "/images/home-page/grok-video-66a5cf4c-482d-4ba5-8161-f9438b5056f7.gif",
        gradient: "from-indigo-950/90 via-indigo-900/50 to-transparent"
    }
]

export default function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [direction, setDirection] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    // Auto-play logic
    useEffect(() => {
        if (!isAutoPlaying) return

        const timer = setInterval(() => {
            nextSlide()
        }, 6000)

        return () => clearInterval(timer)
    }, [currentSlide, isAutoPlaying])

    const nextSlide = () => {
        setDirection(1)
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setDirection(-1)
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    const goToSlide = (index: number) => {
        setDirection(index > currentSlide ? 1 : -1)
        setCurrentSlide(index)
    }

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 1
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 1
        })
    }

    const scrollToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        document.getElementById('about-summary')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <section className="relative w-full h-[85vh] min-h-[550px] overflow-hidden bg-slate-900">
            {/* Carousel Slides */}
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <img
                            src={slides[currentSlide].image}
                            alt={slides[currentSlide].title}
                            className="w-full h-full object-cover"
                        />
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].gradient}`} />
                    </div>

                    {/* Content Container - Vertically Centered */}
                    <div className="relative h-full container-premium flex items-center">
                        <div className="max-w-4xl space-y-8">
                            {/* Animated Title */}
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="text-display font-bold text-white leading-[1.1] tracking-tight drop-shadow-lg"
                            >
                                {slides[currentSlide].title}
                            </motion.h1>

                            {/* Animated Description */}
                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-2xl drop-shadow-md"
                            >
                                {slides[currentSlide].description}
                            </motion.p>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="flex flex-wrap gap-4 pt-4"
                            >
                                <Link
                                    href={slides[currentSlide].ctaLink}
                                    className="btn-premium text-lg group"
                                >
                                    {slides[currentSlide].id === 1 && <MessageCircle className="w-5 h-5" />}
                                    {slides[currentSlide].cta}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="absolute bottom-32 left-0 right-0 z-20">
                <div className="container-premium flex items-center gap-4">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`group relative h-1.5 rounded-full transition-all duration-500 ease-out ${currentSlide === index ? 'w-16 bg-white' : 'w-3 bg-white/40 hover:bg-white/60'}`}
                            aria-label={`Go to slide ${index + 1}`}
                        >
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Curve Detail - TOTVS Style Exact Construction */}
            <div className="absolute bottom-0 left-0 right-0 z-30 flex items-end justify-center pointer-events-none">

                {/* Left White Bar Filler */}
                <div className="flex-1 h-[70px] bg-white mr-[-1px]" />

                {/* The Curve Itself - Clickable Area */}
                <div className="relative shrink-0 w-[505px] h-[70px] pointer-events-auto z-10">
                    <a
                        href="#about-summary"
                        onClick={scrollToAbout}
                        className="block relative w-full h-full"
                        aria-label="Scroll Down"
                    >
                        {/* SVG Curve */}
                        <svg
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            viewBox="0 0 505.7 70.1"
                            className="w-[101%] h-full ml-[-0.5%]"
                            preserveAspectRatio="none"
                        >
                            <path
                                className="fill-white"
                                d="M351,32.6c-55.9,30.1-71.4,32.7-98.2,32.7s-42.3-2.6-98.2-32.7S28,0,28,0H0v70.1h28h449.6h28.1V0h-28.1C477.6,0,407,2.5,351,32.6z"
                            />
                        </svg>

                        {/* Floating White Triangle Indicator */}
                        <div className="absolute top-[28px] left-1/2 transform -translate-x-1/2 -translate-y-full animate-bounce">
                            <svg
                                width="20"
                                height="12"
                                viewBox="0 0 20 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M10 12L0 0H20L10 12Z"
                                    fill="white"
                                />
                            </svg>
                        </div>
                    </a>
                </div>

                {/* Right White Bar Filler */}
                <div className="flex-1 h-[70px] bg-white ml-[-1px]" />
            </div>

            {/* Bottom White Bar Extension */}
            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-white z-30" />
        </section>
    )
}
