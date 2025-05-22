/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function InfinityLoader() {
  const [loading, setLoading] = useState(true)
  const [typingComplete, setTypingComplete] = useState(false)
  const [showSubtext, setShowSubtext] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [infinityMoved, setInfinityMoved] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Função para desenhar o símbolo do infinito
  const drawInfinity = (ctx: CanvasRenderingContext2D, progress: number, width: number, height: number) => {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height)

    const centerX = width / 2
    const centerY = height / 2
    const size = Math.min(width, height) * 0.4

    ctx.strokeStyle = "#5DC0E7"
    ctx.lineWidth = 6
    ctx.lineCap = "round"

    // Desenha o símbolo do infinito
    ctx.beginPath()

    // Calcula o ponto final baseado no progresso (0 a 1)
    const endAngle = progress * Math.PI * 4

    // Primeiro círculo (esquerda)
    for (let i = 0; i <= Math.min(Math.PI * 2, endAngle); i += 0.01) {
      const x = centerX - size / 2 + Math.sin(i) * (size / 2)
      const y = centerY + Math.cos(i) * (size / 2)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    // Segundo círculo (direita)
    if (endAngle > Math.PI * 2) {
      for (let i = 0; i <= Math.min(Math.PI * 2, endAngle - Math.PI * 2); i += 0.01) {
        const x = centerX + size / 2 + Math.sin(i) * (size / 2)
        const y = centerY + Math.cos(i) * (size / 2)

        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()
  }

  // Animação da partícula de luz
  const animateParticle = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!ctx) return;
    const centerX = width / 2
    const centerY = height / 2
    const size = Math.min(width, height) * 0.4
    let angle = 0
    let currentLoop = 0
    const totalLoops = 3

    const draw = () => {
      if (currentLoop >= totalLoops) return

      // Limpa apenas a área da partícula
      ctx.clearRect(0, 0, width, height)

      // Redesenha o símbolo do infinito
      drawInfinity(ctx, 1, width, height)

      // Desenha a partícula
      let x, y

      if (angle < Math.PI * 2) {
        // Primeiro círculo (esquerda)
        x = centerX - size / 2 + Math.sin(angle) * (size / 2)
        y = centerY + Math.cos(angle) * (size / 2)
      } else {
        // Segundo círculo (direita)
        const adjustedAngle = angle - Math.PI * 2
        x = centerX + size / 2 + Math.sin(adjustedAngle) * (size / 2)
        y = centerY + Math.cos(adjustedAngle) * (size / 2)
      }

      // Desenha a partícula de luz
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 10)
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)")
      gradient.addColorStop(1, "rgba(93, 192, 231, 0)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fill()

      // Atualiza o ângulo
      angle += 0.05
      if (angle >= Math.PI * 4) {
        angle = 0
        currentLoop++
      }

      requestAnimationFrame(draw)
    }

    draw()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Ajusta o canvas para a resolução do dispositivo
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.scale(dpr, dpr)

    let progress = 0
    let lastTime = 0

    const animate = (time: number) => {
      if (!lastTime) lastTime = time
      const deltaTime = time - lastTime
      lastTime = time

      progress += deltaTime / 2000 // Ajuste a velocidade aqui
      if (progress >= 1) {
        progress = 1
        setTimeout(() => {
          setLoading(false)
          setTimeout(() => {
            setTypingComplete(true)
            setTimeout(() => {
              setShowSubtext(true)
              setTimeout(() => {
                setInfinityMoved(true)
                setTimeout(() => {
                  setShowContent(true)

                  // Inicia a animação da partícula após o símbolo se mover
                  setTimeout(() => {
                    const canvas = canvasRef.current
                    if (!canvas) return
                    const ctx = canvas.getContext("2d")
                    if (!ctx) return
                    animateParticle(ctx, canvas.offsetWidth, canvas.offsetHeight)
                  }, 1000)
                }, 1000)
              }, 1500)
            }, 1000)
          }, 500)
        }, 500)
        return
      }

      drawInfinity(ctx, progress, canvas.offsetWidth, canvas.offsetHeight)
      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)

    // Limpa a animação quando o componente for desmontado
    return () => {
      lastTime = 0
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0F]">
      <div className="absolute inset-0 overflow-hidden">
        {/* Estrelas no fundo */}
        <div className="absolute inset-0">
          {Array.from({ length: 200 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.8 + 0.2,
                animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Nebulosas coloridas */}
        <div
          className="absolute rounded-full bg-[#5DC0E7]/10 blur-3xl"
          style={{
            width: "40vw",
            height: "40vw",
            top: "20%",
            left: "10%",
            transform: "rotate(-15deg)",
          }}
        />
        <div
          className="absolute rounded-full bg-purple-500/5 blur-3xl"
          style={{
            width: "30vw",
            height: "30vw",
            bottom: "15%",
            right: "10%",
            transform: "rotate(25deg)",
          }}
        />
      </div>

      <AnimatePresence>
        {!showContent ? (
          <div className="relative z-10 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 1 }}
              animate={{
                opacity: 1,
                x: infinityMoved ? -window.innerWidth / 2 + 120 : 0,
                y: infinityMoved ? -window.innerHeight / 2 + 80 : 0,
                scale: infinityMoved ? 0.5 : 1,
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="relative w-64 h-64 mb-8"
            >
              <canvas ref={canvasRef} className="w-full h-full" style={{ display: loading ? "block" : "none" }} />

              {!loading && !infinityMoved && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M30,30 C30,16.7 41.7,5 55,5 C68.3,5 80,16.7 80,30 C80,43.3 68.3,55 55,55 C48.3,55 42.1,52.1 37.9,47.1 L62.1,12.9 C66.3,17.9 72.5,20.8 79.2,20.8 C92.5,20.8 104.2,9.1 104.2,-4.2 C104.2,-17.5 92.5,-29.2 79.2,-29.2 C65.9,-29.2 54.2,-17.5 54.2,-4.2 C54.2,2.5 57.1,8.7 62.1,12.9 L37.9,47.1 C33.7,42.1 27.5,39.2 20.8,39.2 C7.5,39.2 -4.2,50.9 -4.2,64.2 C-4.2,77.5 7.5,89.2 20.8,89.2 C34.1,89.2 45.8,77.5 45.8,64.2 C45.8,57.5 42.9,51.3 37.9,47.1"
                      stroke="#5DC0E7"
                      strokeWidth="6"
                      transform="translate(0, -15)"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.div>

            <div className="text-center">
              {!loading && (
                <>
                  <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white"
                  >
                    <TypewriterText text="Tem uma ideia?" delay={50} onComplete={() => {}} />
                    {typingComplete && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="block text-[#5DC0E7]"
                      >
                        <TypewriterText text="Aqui ela vira realidade." delay={50} onComplete={() => {}} />
                      </motion.span>
                    )}
                  </motion.h1>

                  {showSubtext && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-lg md:text-xl text-white/80 max-w-2xl"
                    >
                      Desenvolvemos seu aplicativo, site, loja virtual ou sistema personalizado — e automatizamos seus
                      processos do dia a dia.
                    </motion.p>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-10"
            onClick={() => {
              document.body.style.overflow = "auto"
              document.querySelector(".infinity-loader-container")?.remove()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface TypewriterTextProps {
  text: string
  delay: number
  onComplete: () => void
}

function TypewriterText({ text, delay, onComplete }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, delay)

      return () => clearTimeout(timeout)
    } else {
      onComplete()
    }
  }, [currentIndex, delay, onComplete, text])

  return <>{displayedText}</>
}
