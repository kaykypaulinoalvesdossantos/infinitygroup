import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0A0A0F]/80 backdrop-blur-sm z-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-[#5DC0E7] animate-spin mx-auto mb-4" />
        <p className="text-[#FBFBFB] text-lg">Carregando projetos...</p>
      </div>
    </div>
  )
}
