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
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // --- Auto-scroll ---
    let scrollPos = 0
    const speed = 2
    const autoScroll = () => {
      if (!isDragging.current) {
        scrollPos = container.scrollLeft + speed
        if (scrollPos >= container.scrollWidth - container.clientWidth) {
          scrollPos = 0
        }
        container.scrollLeft = scrollPos
      }
      animationRef.current = requestAnimationFrame(autoScroll)
    }
    animationRef.current = requestAnimationFrame(autoScroll)

    // --- Drag com mouse ---
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      startX.current = e.pageX - container.offsetLeft
      scrollLeft.current = container.scrollLeft
      container.classList.add('cursor-grabbing')
    }
    const onMouseLeave = () => {
      isDragging.current = false
      container.classList.remove('cursor-grabbing')
    }
    const onMouseUp = () => {
      isDragging.current = false
      container.classList.remove('cursor-grabbing')
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      e.preventDefault()
      const x = e.pageX - container.offsetLeft
      const walk = (x - startX.current) * 1.2
      container.scrollLeft = scrollLeft.current - walk
    }

    // --- Drag com touch ---
    const onTouchStart = (e: TouchEvent) => {
      isDragging.current = true
      startX.current = e.touches[0].pageX - container.offsetLeft
      scrollLeft.current = container.scrollLeft
    }
    const onTouchEnd = () => {
      isDragging.current = false
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return
      const x = e.touches[0].pageX - container.offsetLeft
      const walk = (x - startX.current) * 1.2
      container.scrollLeft = scrollLeft.current - walk
    }

    // Mouse events
    container.addEventListener('mousedown', onMouseDown)
    container.addEventListener('mouseleave', onMouseLeave)
    container.addEventListener('mouseup', onMouseUp)
    container.addEventListener('mousemove', onMouseMove)
    // Touch events
    container.addEventListener('touchstart', onTouchStart)
    container.addEventListener('touchend', onTouchEnd)
    container.addEventListener('touchmove', onTouchMove)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      container.removeEventListener('mousedown', onMouseDown)
      container.removeEventListener('mouseleave', onMouseLeave)
      container.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchend', onTouchEnd)
      container.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  return (
    <div className="overflow-hidden" ref={containerRef} style={{ cursor: 'grab' }}>
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
