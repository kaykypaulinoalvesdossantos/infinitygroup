"use client"

import type React from "react"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface ServiceCardProps {
  icon: React.ReactNode
  title: string
  description: string
  link: string
  fontTitle?: string
  fontDesc?: string
  className?: string
}

export default function ServiceCard({ icon, title, description, link, fontTitle = "font-sans", fontDesc = "font-sans", className = "" }: ServiceCardProps) {
  return (
    <div className={`glass-card rounded-xl p-8 h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(0,184,255,0.1)] group relative overflow-hidden flex flex-col border border-[#00B8FF]/10 hover:border-[#00B8FF]/30 ${className}`}>
      {/* Hover Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00B8FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex-grow">
        <div className="w-14 h-14 bg-[#12121E] rounded-xl flex items-center justify-center mb-6 text-[#00B8FF] group-hover:scale-110 transition-transform duration-300 border border-[#00B8FF]/20 group-hover:border-[#00B8FF]/50 shadow-[0_0_15px_rgba(0,184,255,0.1)]">
          {icon}
        </div>
        <h3 className={`text-xl font-bold mb-3 text-white group-hover:text-[#00B8FF] transition-colors ${fontTitle}`}>{title}</h3>
        <p className={`text-[#B5C0CF] text-[17px] leading-[1.6] mb-8 ${fontDesc}`}>{description}</p>
      </div>

      <div className="relative z-10 mt-auto">
        <Link
          href={link}
          className="inline-flex items-center text-sm font-bold text-[#00B8FF] hover:text-white transition-colors group/link uppercase tracking-wider"
        >
          <span className="mr-2">Saiba mais</span>
          <div className="w-6 h-6 rounded-full bg-[#00B8FF]/10 flex items-center justify-center group-hover/link:bg-[#00B8FF] group-hover/link:text-white transition-all duration-300">
            <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
          </div>
        </Link>
      </div>
    </div>
  )
}
