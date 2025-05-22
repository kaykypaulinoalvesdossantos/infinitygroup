"use client"

import { useEffect, useRef } from "react"

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Ajusta o canvas para a resolução do dispositivo
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Cria estrelas
    const stars: Star[] = []
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.05,
        twinkleSpeed: Math.random() * 0.01 + 0.005,
        twinkleDirection: Math.random() > 0.5 ? 1 : -1,
      })
    }

    // Cria nebulosas
    const nebulae: Nebula[] = [
      {
        x: canvas.width * 0.3,
        y: canvas.height * 0.3,
        radius: canvas.width * 0.2,
        color: "#5DC0E7",
        opacity: 0.1,
      },
      {
        x: canvas.width * 0.7,
        y: canvas.height * 0.7,
        radius: canvas.width * 0.15,
        color: "#9C5DE7",
        opacity: 0.05,
      },
    ]

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Desenha nebulosas
      for (const nebula of nebulae) {
        const gradient = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius)
        gradient.addColorStop(
          0,
          `${nebula.color}${Math.floor(nebula.opacity * 255)
            .toString(16)
            .padStart(2, "0")}`,
        )
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Desenha e anima estrelas
      for (const star of stars) {
        // Atualiza opacidade para efeito de brilho
        star.opacity += star.twinkleSpeed * star.twinkleDirection
        if (star.opacity > 1) {
          star.opacity = 1
          star.twinkleDirection = -1
        } else if (star.opacity < 0.2) {
          star.opacity = 0.2
          star.twinkleDirection = 1
        }

        // Desenha a estrela com brilho
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`)
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()

        // Movimento lento das estrelas
        star.y += star.speed
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    // Redimensiona o canvas quando a janela é redimensionada
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)

      // Reposiciona as nebulosas
      nebulae[0].x = canvas.width * 0.3
      nebulae[0].y = canvas.height * 0.3
      nebulae[0].radius = canvas.width * 0.2

      nebulae[1].x = canvas.width * 0.7
      nebulae[1].y = canvas.height * 0.7
      nebulae[1].radius = canvas.width * 0.15
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
}

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  twinkleSpeed: number
  twinkleDirection: number
}

interface Nebula {
  x: number
  y: number
  radius: number
  color: string
  opacity: number
}
