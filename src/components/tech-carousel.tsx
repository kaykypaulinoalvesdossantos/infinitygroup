"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

// Tech logos with their names
const technologies = [
  { name: "React", logo: "/images/logo/imagem_2025-05-21_042656554-removebg-preview.png" },
  { name: "Next.js", logo: "/images/logo/nextjs.png" },
  { name: "Node.js", logo: "/images/logo/nodejs.png" },
  { name: "JavaScript", logo: "/images/logo/javascript.png" },
  { name: "TypeScript", logo: "/images/logo/typescript.png" },
  { name: "PostgreSQL", logo: "/images/logo/PostgreSQL.svg" },
  { name: "MongoDB", logo: "/images/logo/mongodb.png" },
  { name: "Firebase", logo: "/images/logo/firebase.webp" },
  { name: "Flutter", logo: "/images/logo/flutter.png" },
  { name: "Docker", logo: "/images/logo/doker.png" },
  { name: "Kotlin", logo: "/images/logo/kotlin.png" },
  { name: "Java", logo: "/images/logo/java.png" },
  { name: "Python", logo: "/images/logo/python.png" },
  { name: "AWS", logo: "/images/logo/aws.png" },
  { name: "Tailwind CSS", logo: "/images/logo/Tailwind_CSS.png" },
]

export default function TechCarousel() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scrollWidth = container.scrollWidth
    const clientWidth = container.clientWidth

    if (scrollWidth <= clientWidth) return

    let scrollPos = 0
    const maxScroll = scrollWidth - clientWidth
    const speed = 2

    const scroll = () => {
      scrollPos += speed
      if (scrollPos >= maxScroll) {
        scrollPos = 0
      }
      if (container) {
        container.scrollLeft = scrollPos
      }
      requestAnimationFrame(scroll)
    }

    const animation = requestAnimationFrame(scroll)

    return () => cancelAnimationFrame(animation)
  }, [])

  return (
    <div className="overflow-hidden" ref={containerRef}>
      <div className="flex space-x-8 py-8">
        {technologies.map((tech, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05, y: -10 }}
            className="flex-shrink-0 bg-white rounded-lg p-6 shadow-lg border border-gray-100 min-w-[200px] h-40 flex flex-col items-center justify-center gap-4 transition-all duration-300"
          >
            <Image
              src={tech.logo}
              alt={tech.name}
              width={60}
              height={60}
              className="object-contain"
            />
            <span className="text-lg font-bold text-[#212227]">{tech.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
