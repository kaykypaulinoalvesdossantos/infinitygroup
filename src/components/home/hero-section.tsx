"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { ArrowRight, MessageCircle } from "lucide-react"

const slides = [
    {
        id: 1,
        title: "Transformação Digital Inteligente",
        description: "Elevamos sua empresa ao próximo nível com arquitetura de software escalável, inteligência artificial e design premium.",
        cta: "Iniciar transformação",
        ctaLink: "https://wa.me/5511945332464",
        image: "/images/home-page/grok-video-f45cdb8e-36a8-4d57-8ffb-23fed21fefb0-poster.webp",
        gradient: "bg-gradient-to-b from-blue-950/90 via-blue-950/75 to-blue-950/60 md:bg-gradient-to-r md:from-blue-950/90 md:via-blue-900/50 md:to-transparent"
    },
    {
        id: 2,
        title: "Soluções Enterprise de Alta Performance",
        description: "Desenvolvimento robusto para grandes operações. Segurança, performance e confiabilidade para o seu core business.",
        cta: "Conhecer soluções",
        ctaLink: "#solutions",
        image: "/images/home-page/grok-video-4e2ef7c4-b3c2-4568-828e-4f9e644a29ee-poster.webp",
        gradient: "bg-gradient-to-b from-slate-950/90 via-slate-950/75 to-slate-950/60 md:bg-gradient-to-r md:from-slate-950/90 md:via-slate-900/50 md:to-transparent"
    },
    {
        id: 3,
        title: "Automação que Gera Resultados",
        description: "Reduza custos operacionais e elimine ineficiências com nossas soluções avançadas de automação de processos.",
        cta: "Ver cases de sucesso",
        ctaLink: "/portfolio",
        image: "/images/home-page/grok-video-66a5cf4c-482d-4ba5-8161-f9438b5056f7-poster.webp",
        gradient: "bg-gradient-to-b from-indigo-950/90 via-indigo-950/75 to-indigo-950/60 md:bg-gradient-to-r md:from-indigo-950/90 md:via-indigo-900/50 md:to-transparent"
    }
]

const AUTOPLAY_INTERVAL = 6000
const SWIPE_THRESHOLD = 50

export default function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [isFocusWithin, setIsFocusWithin] = useState(false)
    const shouldReduceMotion = useReducedMotion()
    const touchStartX = useRef<number | null>(null)

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    const goToSlide = (index: number) => setCurrentSlide(index)

    // Auto-play: paused on hover/keyboard focus, disabled for reduced motion.
    // Timer restarts whenever the slide changes (including dot clicks).
    useEffect(() => {
        if (isHovered || isFocusWithin || shouldReduceMotion) return

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, AUTOPLAY_INTERVAL)

        return () => clearInterval(timer)
    }, [currentSlide, isHovered, isFocusWithin, shouldReduceMotion])

    const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
        touchStartX.current = e.touches[0]?.clientX ?? null
    }

    const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
        const startX = touchStartX.current
        touchStartX.current = null
        if (startX === null) return

        const dx = e.changedTouches[0].clientX - startX
        if (Math.abs(dx) > SWIPE_THRESHOLD) {
            if (dx < 0) nextSlide()
            else prevSlide()
        }
    }

    const scrollToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        document.getElementById('about-summary')?.scrollIntoView({ behavior: 'smooth' })
    }

    const slide = slides[currentSlide]

    return (
        <section
            className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-slate-900 md:h-[85vh] md:min-h-[650px]"
            onPointerEnter={(e) => { if (e.pointerType === "mouse") setIsHovered(true) }}
            onPointerLeave={() => setIsHovered(false)}
            onFocusCapture={(e) => { if ((e.target as HTMLElement).matches(":focus-visible")) setIsFocusWithin(true) }}
            onBlurCapture={() => setIsFocusWithin(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background Layer - crossfade between slides */}
            <div className="absolute inset-0">
                <AnimatePresence initial={false}>
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            priority={currentSlide === 0}
                            sizes="100vw"
                            quality={78}
                            className="object-cover"
                        />
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 ${slide.gradient}`} />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Text Layer - single static container, only one h1 in the DOM at any time */}
            <div className="relative z-10 flex h-full items-center container-premium pt-20 pb-40 lg:pt-24">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-4xl space-y-6 md:space-y-8"
                >
                    <h1 className="text-display font-bold text-white leading-[1.1] tracking-tight md:drop-shadow-lg">
                        {slide.title}
                    </h1>

                    <p className="max-w-2xl text-base font-normal leading-relaxed text-white/90 md:drop-shadow-md sm:text-xl md:text-2xl">
                        {slide.description}
                    </p>

                    <div className="flex w-full flex-wrap gap-4 pt-2 md:pt-4">
                        <Link
                            href={slide.ctaLink}
                            className="btn-premium group w-full text-base sm:w-auto sm:text-lg"
                        >
                            {slide.id === 1 && <MessageCircle className="w-5 h-5" />}
                            {slide.cta}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Navigation Dots - enlarged hit area, visual size unchanged */}
            <div className="absolute bottom-24 left-0 right-0 z-20 md:bottom-32">
                <div className="container-premium flex items-center gap-1">
                    {slides.map((_, index) => {
                        const isActive = currentSlide === index
                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => goToSlide(index)}
                                className="group relative flex items-center justify-center rounded-full p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                                aria-label={`Ir para o slide ${index + 1}`}
                                aria-current={isActive ? "true" : undefined}
                            >
                                <span
                                    className={`block h-1.5 rounded-full transition-all duration-500 ease-out ${isActive ? 'w-16 bg-white' : 'w-3 bg-white/40 group-hover:bg-white/60'}`}
                                />
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Bottom Curve Detail - TOTVS Style Exact Construction */}
            <div className="absolute bottom-0 left-0 right-0 z-30 flex items-end justify-center pointer-events-none">

                {/* Left White Bar Filler */}
                <div className="flex-1 h-[70px] bg-white -mr-0.5 relative z-20" />

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
                            className="block w-full h-full"
                            preserveAspectRatio="none"
                        >
                            <path
                                className="fill-white"
                                d="M351,32.6c-55.9,30.1-71.4,32.7-98.2,32.7s-42.3-2.6-98.2-32.7S28,0,28,0H0v70.1h28h449.6h28.1V0h-28.1C477.6,0,407,2.5,351,32.6z"
                            />
                        </svg>

                        {/* Floating White Triangle Indicator - outer div keeps centering, inner div bounces */}
                        <div className="absolute top-[28px] left-1/2 -translate-x-1/2 -translate-y-full">
                            <div className="motion-safe:animate-bounce">
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
                        </div>
                    </a>
                </div>

                {/* Right White Bar Filler */}
                <div className="flex-1 h-[70px] bg-white -ml-0.5 relative z-20" />
            </div>
        </section>
    )
}
