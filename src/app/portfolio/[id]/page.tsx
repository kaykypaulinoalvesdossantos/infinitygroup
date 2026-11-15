"use client"

import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle, Rocket, ArrowRight, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { getProject } from "./projects-data"

const CATEGORY_LABELS: Record<string, string> = {
  website: "Website",
  ecommerce: "E-commerce",
}

function formatCategory(category: string) {
  return CATEGORY_LABELS[category] ?? category
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const project = getProject(id)

  if (!project) {
    notFound()
  }

  const categoryLabel = formatCategory(project.category)

  return (
    <main className="flex flex-col w-full bg-card text-foreground selection:bg-primary/20">


      {/* HERO SECTION */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: Content */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                  {categoryLabel}
                </span>
                <span className="text-foreground-subtle text-sm font-medium">|</span>
                <span className="text-muted-foreground text-sm font-medium">{project.client}</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
                {project.title}
              </h1>

              <div className="flex flex-wrap gap-x-12 gap-y-6 mb-10 text-sm">
                <div>
                  <span className="block text-foreground-subtle mb-1">Cliente</span>
                  <span className="font-bold text-foreground">{project.client}</span>
                </div>
                <div>
                  <span className="block text-foreground-subtle mb-1">Serviço</span>
                  <span className="font-bold text-foreground">{categoryLabel}</span>
                </div>
                <div>
                  <span className="block text-foreground-subtle mb-1">Entregas</span>
                  <span className="font-bold text-foreground">Web, Mobile, Design</span>
                </div>
              </div>

              <p className="text-xl text-muted-foreground leading-relaxed mb-10 font-medium">
                {project.fullDescription}
              </p>

              {project.url && project.url !== "#" && (
                <Button asChild size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold h-14 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl">
                  <a href={project.url} target="_blank" rel="noopener noreferrer">
                    Ver Projeto Online <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </Button>
              )}
            </motion.div>

            {/* Right: Main Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-border bg-muted aspect-[4/3]"
            >
              <OptimizedImage
                src={project.image}
                alt={project.title}
                fill
                priority
                className="object-cover"
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* GALLERY STRIP */}
      {project.gallery.length > 0 && (
        <section className="w-full py-12 bg-background border-y border-input">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {project.gallery.slice(0, 3).map((img, i) => (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden shadow-md group border border-input">
                  <OptimizedImage src={img} alt={`${project.title} - imagem ${i + 1}`} fill className="object-cover transition-transform duration-500 md:group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CASE STUDY CONTENT */}
      <section className="w-full py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-16 max-w-6xl mx-auto">

            {/* Left: Challenge & Solution */}
            <div className="lg:col-span-2 space-y-10 md:space-y-16">

              {/* Challenge */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-danger text-danger-foreground flex items-center justify-center text-sm">01</span>
                  O Desafio
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {project.challenge}
                </p>
              </div>

              {/* Solution */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm">02</span>
                  A Solução
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {project.solution}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-muted border border-border">
                      <CheckCircle size={18} className="text-primary flex-shrink-0" />
                      <span className="font-medium text-foreground">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="bg-foreground text-background p-6 md:p-10 rounded-3xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                    <Rocket className="text-background" /> Impacto Gerado
                  </h3>
                  <p className="text-3xl md:text-5xl font-bold leading-tight text-background break-words">
                    {project.results}
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                  <Rocket size={200} />
                </div>
              </div>

            </div>

            {/* Right: Sidebar */}
            <div className="lg:col-span-1 space-y-8">

              {/* Tech Stack */}
              <div className="p-8 rounded-2xl bg-muted border border-border">
                <h4 className="font-bold text-foreground mb-6 flex items-center gap-2">
                  <Cpu size={18} className="text-foreground-subtle" /> Tecnologias
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                    <span key={tech} className="px-3 py-1.5 bg-card border border-input rounded-lg text-sm font-medium text-muted-foreground">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              {project.testimonial && (
                <div className="p-8 rounded-2xl bg-primary/5 border border-primary/10 relative">
                  <div className="text-primary opacity-20 text-6xl font-serif absolute top-4 left-4 leading-none">“</div>
                  <p className="relative z-10 text-foreground font-medium italic mb-6 pt-4 leading-relaxed">
                    {project.testimonial.content}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {project.testimonial.author[0]}
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-sm">{project.testimonial.author}</div>
                      <div className="text-muted-foreground text-xs">{project.testimonial.role}</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* NEXT PROJECT / CTA */}
      <section className="w-full py-24 bg-background text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-8">Gostou deste projeto?</h2>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold h-14 px-8 rounded-xl shadow-lg shadow-blue-500/20">
              <Link href="/orcamento">Quero um Projeto Igual</Link>
            </Button>
          </div>
        </div>
      </section>

    </main>
  )
}
