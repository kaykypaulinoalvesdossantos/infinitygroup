import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createPageMetadata } from "@/lib/seo"
import { getProject, portfolioItems } from "./projects-data"

export const dynamicParams = false

export function generateStaticParams() {
  return portfolioItems.map((project) => ({ id: project.id }))
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const project = getProject(params.id)

  if (!project) {
    notFound()
  }

  const base = createPageMetadata(
    `Case ${project.title}`,
    project.description,
    `/portfolio/${project.id}`,
  )

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [{ url: project.image, alt: project.title }],
    },
  }
}

export default function CaseLayout({ children }: { children: React.ReactNode }) {
  return children
}
