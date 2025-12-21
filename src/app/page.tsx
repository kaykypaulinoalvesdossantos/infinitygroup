"use client"

import HeroSection from "@/components/home/hero-section"
import ServicesSection from "@/components/home/services-section"
import AboutSection from "@/components/home/about-section"
import TechSection from "@/components/home/tech-section"
import TestimonialsSection from "@/components/home/testimonials-section"
import PortfolioSection from "@/components/home/portfolio-section"
import CTASection from "@/components/home/cta-section"
import BackgroundStars from "@/components/home/background-stars"

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center w-full overflow-hidden relative">
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <TechSection />
      <TestimonialsSection />
      <PortfolioSection />
      <CTASection />
      <BackgroundStars />
    </main>
  )
}
