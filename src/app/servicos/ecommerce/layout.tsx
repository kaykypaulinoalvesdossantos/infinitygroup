import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata(
  "Desenvolvimento de e-commerce",
  "Lojas virtuais rápidas, seguras e preparadas para conversão, com checkout, pagamentos, estoque, logística e analytics integrados.",
  "/servicos/ecommerce",
)

export default function EcommerceLayout({ children }: { children: React.ReactNode }) {
  return children
}
