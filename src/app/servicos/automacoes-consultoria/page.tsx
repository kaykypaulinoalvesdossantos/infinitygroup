"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AutomacoesConsultoriaPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the automations page
    router.push("/servicos/automacoes")
  }, [router])

  return null
}
