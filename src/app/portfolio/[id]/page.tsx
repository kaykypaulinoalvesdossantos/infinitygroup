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
    <main className="flex flex-col w-full bg-white text-[#1A1A1A] selection:bg-[#0076FF]/20">


      {/* HERO SECTION */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: Content */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-[#0076FF]/10 text-[#0076FF] text-xs font-bold uppercase tracking-wider">
                  {categoryLabel}
                </span>
                <span className="text-slate-400 text-sm font-medium">|</span>
                <span className="text-slate-500 text-sm font-medium">{project.client}</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-8 leading-tight">
                {project.title}
              </h1>

              <div className="flex flex-wrap gap-x-12 gap-y-6 mb-10 text-sm">
                <div>
                  <span className="block text-slate-400 mb-1">Cliente</span>
                  <span className="font-bold text-[#1A1A1A]">{project.client}</span>
                </div>
                <div>
                  <span className="block text-slate-400 mb-1">Serviço</span>
                  <span className="font-bold text-[#1A1A1A]">{categoryLabel}</span>
                </div>
                <div>
                  <span className="block text-slate-400 mb-1">Entregas</span>
                  <span className="font-bold text-[#1A1A1A]">Web, Mobile, Design</span>
                </div>
              </div>

              <p className="text-xl text-slate-600 leading-relaxed mb-10 font-medium">
                {project.fullDescription}
              </p>

              {project.url && project.url !== "#" && (
                <Button asChild size="lg" className="bg-[#1A1A1A] hover:bg-[#0076FF] text-white font-bold h-14 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl">
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
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-100 bg-slate-50 aspect-[4/3]"
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
        <section className="w-full py-12 bg-[#F6F6F6] border-y border-slate-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {project.gallery.slice(0, 3).map((img, i) => (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden shadow-md group border border-slate-200">
                  <OptimizedImage src={img} alt={`${project.title} - imagem ${i + 1}`} fill className="object-cover transition-transform duration-500 md:group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CASE STUDY CONTENT */}
      <section className="w-full py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-16 max-w-6xl mx-auto">

            {/* Left: Challenge & Solution */}
            <div className="lg:col-span-2 space-y-10 md:space-y-16">

              {/* Challenge */}
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-sm">01</span>
                  O Desafio
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  {project.challenge}
                </p>
              </div>

              {/* Solution */}
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm">02</span>
                  A Solução
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  {project.solution}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <CheckCircle size={18} className="text-[#0076FF] flex-shrink-0" />
                      <span className="font-medium text-slate-700">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="bg-[#1A1A1A] text-white p-6 md:p-10 rounded-3xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                    <Rocket className="text-[#0076FF]" /> Impacto Gerado
                  </h3>
                  <p className="text-3xl md:text-5xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
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
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
                  <Cpu size={18} className="text-slate-400" /> Tecnologias
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                    <span key={tech} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              {project.testimonial && (
                <div className="p-8 rounded-2xl bg-[#0076FF]/5 border border-[#0076FF]/10 relative">
                  <div className="text-[#0076FF] opacity-20 text-6xl font-serif absolute top-4 left-4 leading-none">“</div>
                  <p className="relative z-10 text-slate-700 font-medium italic mb-6 pt-4 leading-relaxed">
                    {project.testimonial.content}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0076FF] flex items-center justify-center text-white font-bold">
                      {project.testimonial.author[0]}
                    </div>
                    <div>
                      <div className="font-bold text-[#1A1A1A] text-sm">{project.testimonial.author}</div>
                      <div className="text-slate-500 text-xs">{project.testimonial.role}</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* NEXT PROJECT / CTA */}
      <section className="w-full py-24 bg-[#F6F6F6] text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-8">Gostou deste projeto?</h2>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-[#0076FF] hover:bg-[#0060D0] text-white font-bold h-14 px-8 rounded-xl shadow-lg shadow-blue-500/20">
              <Link href="/orcamento">Quero um Projeto Igual</Link>
            </Button>
          </div>
        </div>
      </section>

    </main>
  )
}
