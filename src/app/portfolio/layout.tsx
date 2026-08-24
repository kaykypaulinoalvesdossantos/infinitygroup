import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata(
  "Portfólio e cases de sucesso",
  "Explore sites, sistemas, aplicativos e automações desenvolvidos pela Infinity Groups para empresas de diferentes setores.",
  "/portfolio",
)

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children
}
