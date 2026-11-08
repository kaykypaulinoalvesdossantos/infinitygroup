import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata(
  "Loja NFC",
  "Cartões de visita NFC, plaquinhas NFC e brindes personalizados. Escolha os produtos e faça seu pedido direto pelo WhatsApp.",
  "/loja",
)

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return children
}
