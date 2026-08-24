import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata(
  "Sobre a Infinity Groups",
  "Conheça a Infinity Groups, nossa forma de trabalhar e como transformamos desafios empresariais em produtos digitais seguros e escaláveis.",
  "/sobre",
)

export default function SobreLayout({ children }: { children: React.ReactNode }) {
  return children
}
