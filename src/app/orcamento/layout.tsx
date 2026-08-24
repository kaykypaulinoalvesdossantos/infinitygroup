import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata(
  "Solicite um orçamento",
  "Conte seu desafio para a Infinity Groups e receba uma avaliação técnica inicial para seu site, sistema, aplicativo, e-commerce ou automação.",
  "/orcamento",
)

export default function OrcamentoLayout({ children }: { children: React.ReactNode }) {
  return children
}
