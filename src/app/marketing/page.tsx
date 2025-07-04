"use client"

import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, ChevronDown, Sparkles, TrendingUp, Target, Zap, BarChart3, Users, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef, useEffect, useState } from "react"

export default function MarketingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nebulaCanvasRef = useRef<HTMLCanvasElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const [animationPhase, setAnimationPhase] = useState(0)
  const [showContent, setShowContent] = useState(false)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100])

  // Função para converter hex para rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Fundo nebulosa profissional e dinâmico
  useEffect(() => {
    const canvas = nebulaCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let frame = 0

    // Partículas de nebulosa
    const particles: NebulaParticle[] = []
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        color: Math.random() > 0.5 ? "#5DC0E7" : Math.random() > 0.5 ? "#9C5DE7" : "#E7A5DC",
        pulse: Math.random() * 0.02 + 0.005,
        angle: Math.random() * Math.PI * 2,
      })
    }

    function renderNebula() {
      if (!ctx || !canvas) return

      // Fundo base com degradê complexo
      const baseGradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height),
      )
      baseGradient.addColorStop(0, "#0B0B13")
      baseGradient.addColorStop(0.3, "#1a0f2e")
      baseGradient.addColorStop(0.6, "#0f1419")
      baseGradient.addColorStop(0.8, "#0b0b13")
      baseGradient.addColorStop(1, "#050508")

      ctx.fillStyle = baseGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Nebulosas principais - múltiplas camadas
      const time = frame * 0.005

      // Nebulosa azul-ciano principal
      const nebula1 = ctx.createRadialGradient(
        canvas.width * 0.3 + Math.sin(time * 0.5) * 50,
        canvas.height * 0.4 + Math.cos(time * 0.3) * 30,
        0,
        canvas.width * 0.3,
        canvas.height * 0.4,
        canvas.width * 0.6,
      )
      nebula1.addColorStop(0, `rgba(93, 192, 231, ${0.25 + Math.sin(time) * 0.1})`)
      nebula1.addColorStop(0.3, `rgba(93, 192, 231, ${0.15 + Math.sin(time * 1.2) * 0.05})`)
      nebula1.addColorStop(0.6, `rgba(156, 93, 231, ${0.08 + Math.sin(time * 0.8) * 0.03})`)
      nebula1.addColorStop(1, "rgba(0, 0, 0, 0)")

      ctx.fillStyle = nebula1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Nebulosa roxa secundária
      const nebula2 = ctx.createRadialGradient(
        canvas.width * 0.7 + Math.cos(time * 0.7) * 40,
        canvas.height * 0.6 + Math.sin(time * 0.4) * 35,
        0,
        canvas.width * 0.7,
        canvas.height * 0.6,
        canvas.width * 0.5,
      )
      nebula2.addColorStop(0, `rgba(156, 93, 231, ${0.2 + Math.cos(time * 1.1) * 0.08})`)
      nebula2.addColorStop(0.4, `rgba(231, 165, 220, ${0.12 + Math.cos(time * 0.9) * 0.04})`)
      nebula2.addColorStop(0.7, `rgba(93, 192, 231, ${0.06 + Math.cos(time * 1.3) * 0.02})`)
      nebula2.addColorStop(1, "rgba(0, 0, 0, 0)")

      ctx.fillStyle = nebula2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Nebulosa rosa-magenta
      const nebula3 = ctx.createRadialGradient(
        canvas.width * 0.1 + Math.sin(time * 0.6) * 30,
        canvas.height * 0.8 + Math.cos(time * 0.5) * 25,
        0,
        canvas.width * 0.1,
        canvas.height * 0.8,
        canvas.width * 0.4,
      )
      nebula3.addColorStop(0, `rgba(231, 165, 220, ${0.18 + Math.sin(time * 1.4) * 0.07})`)
      nebula3.addColorStop(0.5, `rgba(156, 93, 231, ${0.1 + Math.sin(time * 0.7) * 0.03})`)
      nebula3.addColorStop(1, "rgba(0, 0, 0, 0)")

      ctx.fillStyle = nebula3
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Nebulosa branca-azulada (centro brilhante)
      const nebula4 = ctx.createRadialGradient(
        canvas.width * 0.5 + Math.cos(time * 0.3) * 20,
        canvas.height * 0.3 + Math.sin(time * 0.4) * 15,
        0,
        canvas.width * 0.5,
        canvas.height * 0.3,
        canvas.width * 0.3,
      )
      nebula4.addColorStop(0, `rgba(255, 255, 255, ${0.15 + Math.sin(time * 1.5) * 0.08})`)
      nebula4.addColorStop(0.2, `rgba(173, 216, 230, ${0.12 + Math.sin(time * 1.1) * 0.05})`)
      nebula4.addColorStop(0.5, `rgba(93, 192, 231, ${0.08 + Math.sin(time * 0.9) * 0.03})`)
      nebula4.addColorStop(1, "rgba(0, 0, 0, 0)")

      ctx.fillStyle = nebula4
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Partículas de poeira cósmica
      particles.forEach((particle) => {
        // Movimento das partículas
        particle.x += particle.speedX
        particle.y += particle.speedY
        particle.angle += particle.pulse

        // Wrap around
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Pulsação da opacidade
        const pulseOpacity = Math.max(0, Math.min(1, particle.opacity + Math.sin(frame * particle.pulse) * 0.3))

        // Desenhar partícula com brilho
        const particleGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 3,
        )

        particleGradient.addColorStop(0, hexToRgba(particle.color, pulseOpacity))
        particleGradient.addColorStop(0.5, hexToRgba(particle.color, pulseOpacity * 0.5))
        particleGradient.addColorStop(1, hexToRgba(particle.color, 0))

        ctx.fillStyle = particleGradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
        ctx.fill()

        // Núcleo brilhante
        ctx.fillStyle = hexToRgba(particle.color, pulseOpacity * 0.8)
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2)
        ctx.fill()
      })

      // Efeitos de brilho adicionais
      for (let i = 0; i < 8; i++) {
        const glowX = (canvas.width / 8) * i + Math.sin(time + i) * 100
        const glowY = canvas.height * 0.5 + Math.cos(time * 0.7 + i) * 200
        const glowSize = 150 + Math.sin(time * 1.2 + i) * 50

        const glowGradient = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowSize)
        const colors = ["#5DC0E7", "#9C5DE7", "#E7A5DC", "#FFFFFF"]
        const color = colors[i % colors.length]
        const glowOpacity = Math.max(0, 0.05 + Math.sin(time + i) * 0.03)

        glowGradient.addColorStop(0, hexToRgba(color, glowOpacity))
        glowGradient.addColorStop(1, hexToRgba(color, 0))

        ctx.fillStyle = glowGradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      frame++
      requestAnimationFrame(renderNebula)
    }

    renderNebula()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Animação do planeta e sol - MAIS RÁPIDA E OTIMIZADA
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let frame = 0
    let phase = 0

    // FASES MAIS RÁPIDAS - Reduzido de 4.5s para 2.5s total
    const phases = [
      { duration: 30, name: "space_setup" }, // 0.5s
      { duration: 80, name: "sun_rise" }, // 1.3s
      { duration: 40, name: "planet_reveal" }, // 0.7s
      { duration: 999999, name: "complete" },
    ]

    let phaseFrame = 0

    function renderSpace() {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++
      phaseFrame++

      if (phaseFrame >= phases[phase]?.duration && phase < phases.length - 1) {
        phase++
        phaseFrame = 0
        setAnimationPhase(phase)

        if (phase >= 2) {
          setShowContent(true)
        }
      }

      const currentPhase = phases[phase]?.name

      // Sol mais brilhante e colorido - OTIMIZADO
      if (currentPhase === "sun_rise" || phase > 1) {
        const sunProgress = currentPhase === "sun_rise" ? Math.min(phaseFrame / 80, 1) : 1

        const sunRadius = 120 // Reduzido de 140 para 120
        const sunX = canvas.width * 0.5
        const sunY = canvas.height * 0.75 - sunProgress * sunRadius * 0.4

        // Atmosfera solar com cores nebulosas - OTIMIZADA
        if (sunProgress > 0.1) {
          const atmosphereGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 4) // Reduzido de 5 para 4
          atmosphereGradient.addColorStop(0, `rgba(255, 200, 100, ${0.2 * sunProgress})`)
          atmosphereGradient.addColorStop(0.3, `rgba(231, 165, 220, ${0.12 * sunProgress})`)
          atmosphereGradient.addColorStop(0.6, `rgba(93, 192, 231, ${0.08 * sunProgress})`)
          atmosphereGradient.addColorStop(1, "rgba(0, 0, 0, 0)")

          ctx.fillStyle = atmosphereGradient
          ctx.beginPath()
          ctx.arc(sunX, sunY, sunRadius * 4, 0, Math.PI * 2)
          ctx.fill()
        }

        // Corona solar multicolorida - OTIMIZADA (reduzido de 4 para 3 camadas)
        if (sunProgress > 0.2) {
          for (let layer = 0; layer < 3; layer++) {
            const coronaGradient = ctx.createRadialGradient(
              sunX,
              sunY,
              sunRadius * (0.6 + layer * 0.1),
              sunX,
              sunY,
              sunRadius * (1.2 + layer * 0.3),
            )

            const intensity = (0.25 - layer * 0.05) * sunProgress
            const colors = [
              `rgba(255, 255, 255, ${intensity})`,
              `rgba(173, 216, 230, ${intensity * 0.8})`,
              `rgba(231, 165, 220, ${intensity * 0.6})`,
            ]

            coronaGradient.addColorStop(0, colors[layer])
            coronaGradient.addColorStop(0.5, colors[layer].replace(/[\d.]+\)/, `${intensity * 0.5})`))
            coronaGradient.addColorStop(1, "rgba(0, 0, 0, 0)")

            ctx.fillStyle = coronaGradient
            ctx.beginPath()
            ctx.arc(sunX, sunY, sunRadius * (1.2 + layer * 0.3), 0, Math.PI * 2)
            ctx.fill()
          }
        }

        // Raios solares com cores nebulosas - OTIMIZADO (reduzido de 16 para 12 raios)
        if (sunProgress > 0.3) {
          for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12 + Math.sin(frame * 0.01) * 0.1
            const rayLength = sunRadius + 40 + Math.sin(frame * 0.015 + i) * 20
            const rayIntensity = (0.5 + Math.sin(frame * 0.02 + i) * 0.3) * sunProgress

            const rayColors = ["#FFFFFF", "#ADD8E6", "#E7A5DC", "#9C5DE7"]
            const color = rayColors[i % rayColors.length]

            const rayGradient = ctx.createLinearGradient(
              sunX + Math.cos(angle) * sunRadius,
              sunY + Math.sin(angle) * sunRadius,
              sunX + Math.cos(angle) * rayLength,
              sunY + Math.sin(angle) * rayLength,
            )

            rayGradient.addColorStop(0, hexToRgba(color, rayIntensity * 0.7))
            rayGradient.addColorStop(0.7, hexToRgba(color, rayIntensity * 0.3))
            rayGradient.addColorStop(1, hexToRgba(color, 0))

            ctx.strokeStyle = rayGradient
            ctx.lineWidth = 2 + Math.sin(frame * 0.03 + i) * 1.5
            ctx.lineCap = "round"
            ctx.beginPath()
            ctx.moveTo(sunX + Math.cos(angle) * sunRadius, sunY + Math.sin(angle) * sunRadius)
            ctx.lineTo(sunX + Math.cos(angle) * rayLength, sunY + Math.sin(angle) * rayLength)
            ctx.stroke()
          }
        }

        // Sol principal com brilho nebuloso
        if (sunProgress > 0.3) {
          const sunGradient = ctx.createRadialGradient(
            sunX - sunRadius * 0.2,
            sunY - sunRadius * 0.2,
            0,
            sunX,
            sunY,
            sunRadius,
          )
          sunGradient.addColorStop(0, "#FFFFFF")
          sunGradient.addColorStop(0.2, "#FFF8DC")
          sunGradient.addColorStop(0.4, "#FFE4B5")
          sunGradient.addColorStop(0.6, "#FFD700")
          sunGradient.addColorStop(0.8, "#FFA500")
          sunGradient.addColorStop(1, "#FF8C00")

          ctx.fillStyle = sunGradient
          ctx.beginPath()
          ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2)
          ctx.fill()

          // Núcleo ultra-brilhante
          const coreGradient = ctx.createRadialGradient(
            sunX - sunRadius * 0.15,
            sunY - sunRadius * 0.15,
            0,
            sunX,
            sunY,
            sunRadius * 0.7,
          )
          coreGradient.addColorStop(0, `rgba(255, 255, 255, ${0.9 * sunProgress})`)
          coreGradient.addColorStop(0.3, `rgba(173, 216, 230, ${0.6 * sunProgress})`)
          coreGradient.addColorStop(0.6, `rgba(255, 248, 220, ${0.4 * sunProgress})`)
          coreGradient.addColorStop(1, "rgba(255, 215, 0, 0)")

          ctx.fillStyle = coreGradient
          ctx.beginPath()
          ctx.arc(sunX, sunY, sunRadius * 0.7, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Planeta com brilho nebuloso - OTIMIZADO
      if (currentPhase === "planet_reveal" || phase > 2) {
        const planetProgress = currentPhase === "planet_reveal" ? Math.min(phaseFrame / 40, 1) : 1

        const planetHeight = canvas.height * 0.25 // Reduzido de 0.3 para 0.25
        const planetY = canvas.height - planetHeight

        // Atmosfera planetária com cores nebulosas
        const atmosphereGradient = ctx.createLinearGradient(0, planetY - 30, 0, planetY + 15)
        atmosphereGradient.addColorStop(0, "rgba(0, 0, 0, 0)")
        atmosphereGradient.addColorStop(0.2, `rgba(93, 192, 231, ${0.08 * planetProgress})`)
        atmosphereGradient.addColorStop(0.5, `rgba(156, 93, 231, ${0.12 * planetProgress})`)
        atmosphereGradient.addColorStop(0.8, `rgba(231, 165, 220, ${0.1 * planetProgress})`)
        atmosphereGradient.addColorStop(1, `rgba(93, 192, 231, ${0.15 * planetProgress})`)

        ctx.fillStyle = atmosphereGradient
        ctx.fillRect(0, planetY - 30, canvas.width, 45)

        // Superfície planetária
        const planetGradient = ctx.createRadialGradient(
          canvas.width / 2,
          planetY + 20,
          0,
          canvas.width / 2,
          planetY + 20,
          canvas.width * 0.7,
        )
        planetGradient.addColorStop(0, "#2a2a4e")
        planetGradient.addColorStop(0.3, "#1a1a2e")
        planetGradient.addColorStop(0.6, "#16213e")
        planetGradient.addColorStop(0.8, "#0f1419")
        planetGradient.addColorStop(1, "#0b0b13")

        ctx.fillStyle = planetGradient
        ctx.beginPath()
        ctx.moveTo(0, canvas.height)

        const curveAmplitude = 40 // Reduzido de 50 para 40
        for (let x = 0; x <= canvas.width; x += 4) {
          // Otimizado: incremento de 2 para 4
          const normalizedX = (x - canvas.width / 2) / (canvas.width / 2)
          const curvature = Math.pow(Math.cos((normalizedX * Math.PI) / 2), 1.5)
          const curveY = planetY + curveAmplitude * (1 - curvature)
          ctx.lineTo(x, curveY)
        }

        ctx.lineTo(canvas.width, canvas.height)
        ctx.closePath()
        ctx.fill()

        // Brilho nebuloso na superfície
        const surfaceGlow = ctx.createRadialGradient(
          canvas.width / 2,
          planetY + 10,
          0,
          canvas.width / 2,
          planetY + 10,
          canvas.width * 0.6,
        )
        surfaceGlow.addColorStop(0, `rgba(255, 255, 255, ${0.06 * planetProgress})`)
        surfaceGlow.addColorStop(0.3, `rgba(93, 192, 231, ${0.1 * planetProgress})`)
        surfaceGlow.addColorStop(0.6, `rgba(156, 93, 231, ${0.06 * planetProgress})`)
        surfaceGlow.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.fillStyle = surfaceGlow
        ctx.beginPath()
        ctx.moveTo(0, canvas.height)

        for (let x = 0; x <= canvas.width; x += 4) {
          const normalizedX = (x - canvas.width / 2) / (canvas.width / 2)
          const curvature = Math.pow(Math.cos((normalizedX * Math.PI) / 2), 1.5)
          const curveY = planetY + curveAmplitude * (1 - curvature)
          ctx.lineTo(x, curveY)
        }

        ctx.lineTo(canvas.width, canvas.height)
        ctx.closePath()
        ctx.fill()
      }

      requestAnimationFrame(renderSpace)
    }

    renderSpace()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <main className="flex flex-col items-center justify-center w-full">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0B0B13]"
      >
        {/* Fundo nebulosa dinâmico */}
        <motion.div className="absolute inset-0 z-0" style={{ y: parallaxY }}>
          <canvas ref={nebulaCanvasRef} className="w-full h-full object-cover" />
        </motion.div>

        {/* Canvas do planeta e sol */}
        <motion.div className="absolute inset-0 z-1" style={{ y: parallaxY }}>
          <canvas ref={canvasRef} className="w-full h-full object-cover" />
        </motion.div>

        {/* Estrelas do home */}
        <div className="fixed inset-0 z-2 pointer-events-none">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1 + "px",
                height: Math.random() * 3 + 1 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                opacity: Math.random() * 0.5 + 0.3,
                animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 5}s`,
              }}
            />
          ))}
          <style jsx global>{`
            @keyframes twinkle {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 0.8; }
            }
          `}</style>
        </div>

        {/* Overlay sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B13]/15 via-transparent to-[#0B0B13]/10 z-5" />

        {/* Conteúdo */}
        <div className="container mx-auto px-4 py-20 z-10 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Ícone */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={showContent ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="inline-block mb-8"
            >
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-[#0F0F1A]/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#5DC0E7] shadow-[0_0_30px_rgba(93,192,231,0.6)]">
                  <Sparkles className="h-10 w-10 text-[#5DC0E7]" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border border-[#E7A5DC]"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border border-[#9C5DE7]"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 0, 0.4],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </div>
            </motion.div>

            {/* Título */}
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-8 text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            >
              <motion.span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-[#5DC0E7] via-[#E7A5DC] to-[#9C5DE7]"
                initial={{ opacity: 0, x: -30 }}
                animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ duration: 1.2, delay: 0.8 }}
              >
                MARKETING
              </motion.span>
              <motion.span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-[#9C5DE7] via-[#5DC0E7] to-[#E7A5DC]"
                initial={{ opacity: 0, x: 30 }}
                animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ duration: 1.2, delay: 1.1 }}
              >
                DIGITAL
              </motion.span>
              <motion.span
                className="block text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={showContent ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 1.2, delay: 1.4 }}
              >
                NEBULOSO
              </motion.span>
            </motion.h1>

            {/* Subtítulo */}
            <motion.p
              className="text-xl md:text-2xl mb-12 text-white/90 max-w-4xl mx-auto leading-relaxed drop-shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 1.5, delay: 1.8, ease: "easeOut" }}
            >
              Navegue pela nossa nebulosa de estratégias digitais que transformam marcas em constelações de sucesso.
              Cada campanha é uma estrela que brilha no universo infinito do marketing digital.
            </motion.p>

            {/* Botões */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 1.5, delay: 2.2, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#5DC0E7] to-[#9C5DE7] hover:from-[#5DC0E7]/80 hover:to-[#9C5DE7]/80 text-white font-bold text-lg px-8 py-4 shadow-[0_0_25px_rgba(93,192,231,0.5)] backdrop-blur-sm"
              >
                <Link href="/orcamento">
                  <span className="flex items-center">
                    Explorar a Nebulosa
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </Link>
              </Button>

              <Link
                href="#servicos"
                className="border-2 border-[#E7A5DC] text-[#E7A5DC] hover:bg-[#E7A5DC]/10 bg-transparent/20 backdrop-blur-sm font-bold text-lg px-8 py-4 shadow-[0_0_15px_rgba(231,165,220,0.3)] rounded-lg flex items-center justify-center transition-all duration-300"
              >
                Descobrir Constelações
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={showContent ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 2.8 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <p className="text-[#E7A5DC] mb-3 text-sm drop-shadow-lg">Mergulhe na nebulosa</p>
            <ChevronDown className="h-6 w-6 text-[#E7A5DC] drop-shadow-lg" />
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section - Nebulosa de Serviços */}
      <section id="servicos" className="w-full py-24 bg-transparent text-white relative overflow-hidden">
        {/* Nebulosa de fundo mais intensa */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 15% 25%, rgba(156, 93, 231, 0.2) 0%, rgba(93, 192, 231, 0.15) 25%, rgba(231, 165, 220, 0.1) 50%, transparent 70%),
                radial-gradient(circle at 85% 75%, rgba(93, 192, 231, 0.18) 0%, rgba(231, 165, 220, 0.12) 30%, rgba(156, 93, 231, 0.08) 60%, transparent 80%),
                radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, rgba(173, 216, 230, 0.08) 30%, rgba(156, 93, 231, 0.06) 60%, transparent 85%),
                radial-gradient(circle at 25% 80%, rgba(231, 165, 220, 0.15) 0%, rgba(156, 93, 231, 0.1) 40%, transparent 70%),
                radial-gradient(circle at 75% 20%, rgba(138, 43, 226, 0.12) 0%, rgba(93, 192, 231, 0.08) 50%, transparent 75%)
              `,
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-6">
              <div className="w-16 h-16 mx-auto bg-[#0F0F1A]/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#E7A5DC] shadow-[0_0_20px_rgba(231,165,220,0.6)]">
                <Sparkles className="h-8 w-8 text-[#E7A5DC]" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#5DC0E7] via-[#E7A5DC] to-[#9C5DE7]">
              Constelação de Serviços Nebulosos
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-white/90 drop-shadow-lg">
              Cada serviço é uma estrela brilhante na nossa nebulosa digital, criando uma galáxia de soluções que
              iluminam o caminho para o sucesso da sua marca no universo online.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Estratégia Cósmica",
                description:
                  "Navegação estratégica através do universo digital com mapas estelares personalizados para sua marca.",
                icon: <Target className="h-8 w-8" />,
                gradient: "from-[#5DC0E7]/30 via-[#9C5DE7]/20 to-[#E7A5DC]/30",
                border: "border-[#5DC0E7]/40",
                glow: "shadow-[0_0_20px_rgba(93,192,231,0.3)]",
              },
              {
                title: "Criação Estelar",
                description:
                  "Conteúdo que brilha como supernovas, capturando a atenção e convertendo audiências em toda a galáxia.",
                icon: <Sparkles className="h-8 w-8" />,
                gradient: "from-[#E7A5DC]/30 via-[#5DC0E7]/20 to-[#9C5DE7]/30",
                border: "border-[#E7A5DC]/40",
                glow: "shadow-[0_0_20px_rgba(231,165,220,0.3)]",
              },
              {
                title: "Redes Galácticas",
                description:
                  "Conexões interplanetárias que expandem sua presença através de múltiplas dimensões sociais.",
                icon: <Users className="h-8 w-8" />,
                gradient: "from-[#9C5DE7]/30 via-[#E7A5DC]/20 to-[#5DC0E7]/30",
                border: "border-[#9C5DE7]/40",
                glow: "shadow-[0_0_20px_rgba(156,93,231,0.3)]",
              },
              {
                title: "Propulsão Publicitária",
                description:
                  "Foguetes publicitários que atravessam o espaço digital levando sua mensagem a novos mundos.",
                icon: <TrendingUp className="h-8 w-8" />,
                gradient: "from-[#5DC0E7]/30 via-[#E7A5DC]/20 to-[#9C5DE7]/30",
                border: "border-[#5DC0E7]/40",
                glow: "shadow-[0_0_20px_rgba(93,192,231,0.3)]",
              },
              {
                title: "Identidade Nebulosa",
                description: "Construção de marcas que brilham como constelações únicas no vasto universo digital.",
                icon: <Zap className="h-8 w-8" />,
                gradient: "from-[#E7A5DC]/30 via-[#9C5DE7]/20 to-[#5DC0E7]/30",
                border: "border-[#E7A5DC]/40",
                glow: "shadow-[0_0_20px_rgba(231,165,220,0.3)]",
              },
              {
                title: "Observatório de Dados",
                description: "Telescópios analíticos que capturam insights das profundezas do espaço digital.",
                icon: <BarChart3 className="h-8 w-8" />,
                gradient: "from-[#9C5DE7]/30 via-[#5DC0E7]/20 to-[#E7A5DC]/30",
                border: "border-[#9C5DE7]/40",
                glow: "shadow-[0_0_20px_rgba(156,93,231,0.3)]",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.03 }}
                className={`bg-gradient-to-br ${service.gradient} backdrop-blur-md p-8 rounded-xl ${service.glow} border ${service.border} hover:border-white/40 transition-all duration-500 group relative overflow-hidden`}
              >
                {/* Efeito de brilho nebuloso no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                {/* Partículas flutuantes */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                <div
                  className="absolute bottom-4 left-4 w-1 h-1 bg-[#5DC0E7]/50 rounded-full animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
                <div
                  className="absolute top-1/2 right-6 w-1.5 h-1.5 bg-[#E7A5DC]/40 rounded-full animate-pulse"
                  style={{ animationDelay: "2s" }}
                ></div>

                <div className="relative z-10">
                  <div className="text-white mb-6 group-hover:scale-110 group-hover:text-[#E7A5DC] transition-all duration-300 drop-shadow-lg">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#5DC0E7] group-hover:to-[#E7A5DC] transition-all duration-300">
                    {service.title}
                  </h3>
                  <p className="text-white/90 leading-relaxed drop-shadow-sm">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Nebulosa */}
      <section className="w-full py-32 bg-gradient-to-b from-[#0B0B13] to-[#12121E] text-white relative overflow-hidden">
        {/* Efeitos nebulosos de fundo */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(93, 192, 231, 0.15) 0%, rgba(156, 93, 231, 0.1) 40%, transparent 70%),
                radial-gradient(circle at 80% 70%, rgba(231, 165, 220, 0.12) 0%, rgba(93, 192, 231, 0.08) 50%, transparent 80%),
                radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.08) 0%, rgba(173, 216, 230, 0.06) 30%, transparent 60%)
              `,
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Conteúdo principal */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2 }}
              viewport={{ once: true }}
            >
              <div className="inline-block mb-6">
                <div className="w-16 h-16 bg-[#0F0F1A]/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#5DC0E7] shadow-[0_0_25px_rgba(93,192,231,0.6)]">
                  <Rocket className="h-8 w-8 text-[#5DC0E7]" />
                </div>
              </div>

              <h2 className="text-4xl md:text-6xl font-bold mb-8">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5DC0E7] to-[#E7A5DC]">
                  Pronto para
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E7A5DC] to-[#9C5DE7]">
                  Navegar
                </span>
                <br />
                <span className="text-white drop-shadow-lg">a Nebulosa?</span>
              </h2>

              <p className="text-xl mb-8 text-white/90 leading-relaxed drop-shadow-sm">
                Embarque numa jornada cósmica através das estratégias mais avançadas do marketing digital. Sua marca
                está pronta para brilhar como uma supernova no universo online.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-[#5DC0E7] to-[#9C5DE7] hover:from-[#5DC0E7]/80 hover:to-[#9C5DE7]/80 text-white font-bold text-lg px-8 py-4 shadow-[0_0_25px_rgba(93,192,231,0.4)] backdrop-blur-sm"
                >
                  <Link href="/orcamento">
                    Iniciar Jornada Cósmica
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Informações nebulosas */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-[#5DC0E7]/20 via-[#9C5DE7]/10 to-[#E7A5DC]/20 backdrop-blur-md p-6 rounded-xl border border-[#5DC0E7]/30 shadow-[0_0_20px_rgba(93,192,231,0.2)]">
                <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#5DC0E7] to-[#E7A5DC]">
                  Por que Marketing Nebuloso?
                </h3>
                <ul className="space-y-3 text-white/90">
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-[#5DC0E7] mt-2 mr-3 flex-shrink-0 shadow-[0_0_8px_rgba(93,192,231,0.6)]"></div>
                    <span>
                      <strong className="text-[#E7A5DC]">Alcance Galáctico:</strong> Sua mensagem viaja através de
                      múltiplas dimensões digitais
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-[#E7A5DC] mt-2 mr-3 flex-shrink-0 shadow-[0_0_8px_rgba(231,165,220,0.6)]"></div>
                    <span>
                      <strong className="text-[#5DC0E7]">ROI Estelar:</strong> Retornos que brilham como supernovas no
                      seu faturamento
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-[#9C5DE7] mt-2 mr-3 flex-shrink-0 shadow-[0_0_8px_rgba(156,93,231,0.6)]"></div>
                    <span>
                      <strong className="text-[#E7A5DC]">Dados Cósmicos:</strong> Insights que vêm das profundezas do
                      universo digital
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-white mt-2 mr-3 flex-shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.6)]"></div>
                    <span>
                      <strong className="text-[#5DC0E7]">Precisão Orbital:</strong> Segmentação que atinge o público
                      certo na velocidade da luz
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#E7A5DC]/20 via-[#5DC0E7]/10 to-[#9C5DE7]/20 backdrop-blur-md p-6 rounded-xl border border-[#E7A5DC]/30 shadow-[0_0_20px_rgba(231,165,220,0.2)]">
                <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#E7A5DC] to-[#9C5DE7]">
                  Nossa Tecnologia Estelar
                </h3>
                <ul className="space-y-3 text-white/90">
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-[#E7A5DC] mt-2 mr-3 flex-shrink-0 shadow-[0_0_8px_rgba(231,165,220,0.6)]"></div>
                    <span>
                      <strong className="text-[#5DC0E7]">IA Nebulosa:</strong> Inteligência artificial que aprende com
                      as estrelas
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-[#9C5DE7] mt-2 mr-3 flex-shrink-0 shadow-[0_0_8px_rgba(156,93,231,0.6)]"></div>
                    <span>
                      <strong className="text-[#E7A5DC]">Automação Cósmica:</strong> Sistemas que funcionam 24/7 em toda
                      a galáxia
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-[#5DC0E7] mt-2 mr-3 flex-shrink-0 shadow-[0_0_8px_rgba(93,192,231,0.6)]"></div>
                    <span>
                      <strong className="text-[#9C5DE7]">Relatórios Holográficos:</strong> Visualização de dados em 4D
                      temporal
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-white mt-2 mr-3 flex-shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.6)]"></div>
                    <span>
                      <strong className="text-[#5DC0E7]">Suporte Intergaláctico:</strong> Comunicação instantânea
                      através do hiperespaço
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}

interface NebulaParticle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
  pulse: number
  angle: number
}
