"use client"

import type { ReactNode } from "react"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 130, damping: 28, mass: 0.25 })
  return <motion.div className="evo-scroll-progress" style={{ scaleX }} aria-hidden="true" />
}

export function PageMotion({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  distance = 42,
}: {
  children: ReactNode
  className?: string
  delay?: number
  distance?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function SlideReveal({ children, className = "", from = "left" }: { children: ReactNode; className?: string; from?: "left" | "right" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: from === "left" ? -70 : 70 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function ParallaxImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, 90])
  const scale = useTransform(scrollYProgress, [0, 1], [1.06, 1.13])
  return <motion.img className={className} src={src} alt={alt} style={{ y, scale }} />
}

export function Floating({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -10, 0], rotate: [0, 0.6, 0] }}
      transition={{ duration: 5.5, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.11 } } }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 38, scale: 0.985 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  )
}
