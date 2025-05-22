"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  opacity: number
  originalX: number
  originalY: number
}

export default function EnhancedParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>(0)

  // Função para criar partículas
  const createParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    const particleCount = 100 // Número de partículas

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = Math.random() * 3 + 2 // Partículas maiores (2-5px)

      // Velocidade aleatória para movimento suave
      const speedX = (Math.random() - 0.5) * 0.5
      const speedY = (Math.random() - 0.5) * 0.5

      // Cores variadas com predominância de azul e branco
      const colors = ["#ffffff", "#ffffff", "#ffffff", "#5DC0E7", "#5DC0E7", "#A7E1F8"]
      const color = colors[Math.floor(Math.random() * colors.length)]

      // Opacidade variada para efeito de profundidade
      const opacity = Math.random() * 0.5 + 0.5 // Mais brilhante (0.5-1.0)

      particles.push({
        x,
        y,
        size,
        speedX,
        speedY,
        color,
        opacity,
        originalX: x,
        originalY: y,
      })
    }

    return particles
  }, [])

  // Função para animar as partículas
  const animateParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Limpa o canvas
    ctx.clearRect(0, 0, width, height)

    // Atualiza e desenha cada partícula
    particlesRef.current.forEach((particle) => {
      // Movimento natural das partículas
      particle.x += particle.speedX
      particle.y += particle.speedY

      // Mantém as partículas dentro do canvas
      if (particle.x > width) particle.x = 0
      if (particle.x < 0) particle.x = width
      if (particle.y > height) particle.y = 0
      if (particle.y < 0) particle.y = height

      // Interação com o mouse
      if (mousePosition) {
        const dx = mousePosition.x - particle.x
        const dy = mousePosition.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 150

        if (distance < maxDistance) {
          // Calcula a força baseada na distância (mais forte quando mais perto)
          const force = (maxDistance - distance) / maxDistance

          // Move a partícula para longe do mouse
          particle.x -= dx * force * 0.05
          particle.y -= dy * force * 0.05

          // Aumenta temporariamente o tamanho e brilho da partícula
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * (1 + force), 0, Math.PI * 2)
          ctx.fillStyle = particle.color
          ctx.globalAlpha = Math.min(1, particle.opacity * (1 + force))
          ctx.fill()

          // Adiciona um brilho ao redor da partícula
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 3 * force,
          )
          gradient.addColorStop(
            0,
            `${particle.color}${Math.floor(particle.opacity * 255)
              .toString(16)
              .padStart(2, "0")}`,
          )
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 3 * force, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.globalAlpha = 0.3 * force
          ctx.fill()
          ctx.globalAlpha = 1
        } else {
          // Desenho normal da partícula
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = particle.color
          ctx.globalAlpha = particle.opacity
          ctx.fill()
          ctx.globalAlpha = 1
        }
      } else {
        // Desenho normal da partícula
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      }
    })

    // Continua a animação
    animationFrameRef.current = requestAnimationFrame(animateParticles)
  }, [mousePosition])

  // Inicializa o canvas e as partículas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Ajusta o tamanho do canvas para preencher o container
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (!container) return

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight

      // Recria as partículas quando o tamanho muda
      particlesRef.current = createParticles(canvas.width, canvas.height)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Inicia a animação
    animationFrameRef.current = requestAnimationFrame(animateParticles)

    // Limpa quando o componente é desmontado
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [animateParticles, createParticles])

  // Rastreia a posição do mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    const handleMouseLeave = () => {
      setMousePosition(null)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
