"use client"

import type React from "react"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

interface ServiceCardProps {
  icon: React.ReactNode
  title: string
  description: string
  link: string
}

export default function ServiceCard({ icon, title, description, link }: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group"
    >
      <div className="text-[#5DC0E7] mb-4 h-12 w-12 rounded-lg bg-[#5DC0E7]/10 flex items-center justify-center group-hover:bg-[#5DC0E7] group-hover:text-white transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-[#212227]">{title}</h3>
      <p className="text-[#212227]/80 mb-6">{description}</p>
      <Link
        href={link}
        className="text-[#5DC0E7] font-medium hover:text-[#5DC0E7]/80 flex items-center group-hover:underline"
      >
        Saiba mais <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.div>
  )
}
