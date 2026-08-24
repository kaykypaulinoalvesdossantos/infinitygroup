import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata(
  "Desenvolvimento de aplicativos mobile",
  "Aplicativos iOS e Android com experiência fluida, arquitetura escalável e integração aos sistemas do seu negócio.",
  "/servicos/aplicativos-celular",
)

export default function AplicativosLayout({ children }: { children: React.ReactNode }) {
  return children
}
