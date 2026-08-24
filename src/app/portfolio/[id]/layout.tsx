import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const title = params.id.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  return createPageMetadata(
    `Case ${title}`,
    `Conheça o projeto ${title}, desenvolvido pela Infinity Groups com foco em experiência, performance e resultado de negócio.`,
    `/portfolio/${params.id}`,
  )
}

export default function CaseLayout({ children }: { children: React.ReactNode }) {
  return children
}
