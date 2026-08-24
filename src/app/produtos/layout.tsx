import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata(
  "Produtos digitais",
  "Conheça os produtos proprietários da Infinity Groups para automatizar vendas, organizar operações e acompanhar resultados em tempo real.",
  "/produtos",
)

export default function ProdutosLayout({ children }: { children: React.ReactNode }) {
  return children
}
