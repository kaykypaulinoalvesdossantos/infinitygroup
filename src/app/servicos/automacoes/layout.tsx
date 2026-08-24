import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata(
  "Automação empresarial e inteligência artificial",
  "Automatize tarefas, conecte sistemas e reduza erros com integrações, RPA e inteligência artificial aplicados à sua operação.",
  "/servicos/automacoes",
)

export default function AutomacoesLayout({ children }: { children: React.ReactNode }) {
  return children
}
