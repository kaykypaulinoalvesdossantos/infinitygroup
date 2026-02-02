"use client"

import HeroSection from "@/components/home/hero-section"
import AboutSummary from "@/components/home/about-summary"
import SolutionsShowcase from "@/components/home/solutions-showcase"
import DifferentialsSection from "@/components/home/differentials-section"
import ProcessSection from "@/components/home/process-section"
import TestimonialsSection from "@/components/home/testimonials-section"
import CTASection from "@/components/home/cta-section"

export default function Home() {
  return (
    <main className="flex flex-col w-full">
      <HeroSection />
      <AboutSummary />
      <SolutionsShowcase />
      <DifferentialsSection />
      <ProcessSection />
      <CTASection />
      <TestimonialsSection />
    </main>
  )
}
