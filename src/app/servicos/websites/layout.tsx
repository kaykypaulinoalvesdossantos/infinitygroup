import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata(
  "Criação de sites profissionais",
  "Sites rápidos, responsivos e otimizados para SEO, criados para comunicar valor, gerar oportunidades e converter em qualquer dispositivo.",
  "/servicos/websites",
)

export default function WebsitesLayout({ children }: { children: React.ReactNode }) {
  return children
}
