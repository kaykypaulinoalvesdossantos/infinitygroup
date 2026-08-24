import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata(
  "Marketing digital orientado a dados",
  "Estratégia, mídia, conteúdo e tecnologia conectados para aumentar aquisição, conversão e previsibilidade comercial.",
  "/marketing",
)

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return children
}
