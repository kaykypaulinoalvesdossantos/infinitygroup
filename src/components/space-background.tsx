"use client"

import { useEffect, useRef } from "react"

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true }) // Optimize for transparency
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1

    // Resize handler
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener("resize", resize)

    // Create stars
    const stars: Star[] = []
    // Reduced star count for better performance, especially on mobile
    const starCount = window.innerWidth < 768 ? 100 : 200

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * window.innerWidth, // Use simple window dimensions initially
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5, // Slightly smaller, sharper stars
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.05,
        twinkleSpeed: Math.random() * 0.01 + 0.005,
        twinkleDirection: Math.random() > 0.5 ? 1 : -1,
      })
    }

    let animationFrameId: number

    function animate() {
      if (!ctx || !canvas) return

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)

      // Draw stars
      ctx.fillStyle = "#FFFFFF" // Set color once

      for (const star of stars) {
        // Update twinkle
        star.opacity += star.twinkleSpeed * star.twinkleDirection
        if (star.opacity > 1) {
          star.opacity = 1
          star.twinkleDirection = -1
        } else if (star.opacity < 0.2) {
          star.opacity = 0.2
          star.twinkleDirection = 1
        }

        // Draw star (Simple rect is much faster than arc + gradient)
        ctx.globalAlpha = star.opacity
        ctx.fillRect(star.x, star.y, star.size, star.size)

        // Move star
        star.y += star.speed
        if (star.y > (canvas.height / dpr)) {
          star.y = 0
          star.x = Math.random() * (canvas.width / dpr)
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0B0B13]">
      {/* Static CSS Gradients for Nebulae - Zero JS overhead */}
      <div
        className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] rounded-full opacity-10 blur-[100px]"
        style={{
          background: "radial-gradient(circle, #5DC0E7 0%, transparent 70%)",
          transform: "translate(-50%, -50%)"
        }}
      />
      <div
        className="absolute top-[70%] left-[70%] w-[30vw] h-[30vw] rounded-full opacity-5 blur-[80px]"
        style={{
          background: "radial-gradient(circle, #9C5DE7 0%, transparent 70%)",
          transform: "translate(-50%, -50%)"
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />
    </div>
  )
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
