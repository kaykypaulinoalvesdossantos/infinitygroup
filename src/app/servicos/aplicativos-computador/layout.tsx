import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata(
  "Desenvolvimento de software sob medida",
  "Sistemas e softwares sob medida para digitalizar processos, integrar dados e sustentar operações críticas com segurança.",
  "/servicos/aplicativos-computador",
)

export default function SoftwareLayout({ children }: { children: React.ReactNode }) {
  return children
}
