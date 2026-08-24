import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const title = params.id === "infinity-crm" ? "Infinity CRM" : "Produto Infinity"
  return createPageMetadata(
    title,
    "CRM para centralizar vendas, equipes, comissões, leads e indicadores em uma plataforma simples, segura e pronta para escalar.",
    `/produtos/${params.id}`,
  )
}

export default function ProdutoLayout({ children }: { children: React.ReactNode }) {
  return children
}
