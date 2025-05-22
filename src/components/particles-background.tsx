"use client"

import { useCallback, useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  connections: number[]
}

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null })
  const animationFrameRef = useRef<number>(0)

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const particles: Particle[] = []
    const particleCount = 100
    const width = canvas.width
    const height = canvas.height

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 2, // Partículas maiores (2-4px)
        speedX: (Math.random() - 0.5) * 1,
        speedY: (Math.random() - 0.5) * 1,
        connections: [],
      })
    }

    particlesRef.current = particles
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const particles = particlesRef.current
    const mouse = mouseRef.current

    // Limpa o canvas
    ctx.clearRect(0, 0, width, height)

    // Atualiza e desenha partículas
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]

      // Atualiza posição
      p.x += p.speedX
      p.y += p.speedY

      // Verifica limites
      if (p.x > width) p.x = 0
      else if (p.x < 0) p.x = width
      if (p.y > height) p.y = 0
      else if (p.y < 0) p.y = height

      // Interação com o mouse
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 100

        if (distance < maxDistance) {
          // Afasta a partícula do mouse
          const forceDirectionX = dx / distance
          const forceDirectionY = dy / distance
          const force = (maxDistance - distance) / maxDistance
          p.speedX -= forceDirectionX * force * 1
          p.speedY -= forceDirectionY * force * 1
        }
      }

      // Desenha a partícula
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = "#ffffff"
      ctx.fill()

      // Reseta conexões
      p.connections = []
    }

    // Desenha conexões entre partículas
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"
    ctx.lineWidth = 1

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i]
        const p2 = particles[j]
        const dx = p1.x - p2.x
        const dy = p1.y - p2.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 150) {
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()

          p1.connections.push(j)
          p2.connections.push(i)
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Ajusta o tamanho do canvas
    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
        initParticles()
      }
    }

    // Rastreia o mouse
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    // Inicia a animação
    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", handleResize)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [animate, initParticles])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
