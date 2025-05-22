"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface InfinityAnimationProps {
  onComplete?: () => void
}

export default function InfinityAnimation({ onComplete }: InfinityAnimationProps) {
  const [animationComplete, setAnimationComplete] = useState(false)
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    // Mostra o texto "Tem uma ideia?" após 0.5 segundos
    const textTimer = setTimeout(() => {
      setShowText(true)
    }, 500)

    // Após a animação do infinito (2.5s) + 2s de espera, completa a animação
    const completeTimer = setTimeout(() => {
      setAnimationComplete(true)
      
      // Chama o callback onComplete após um tempo para permitir a animação de saída
      if (onComplete) {
        setTimeout(() => {
          onComplete()
        }, 800) // Tempo para a animação de saída
      }
    }, 4500) // 2.5s (animação) + 2s (espera)

    return () => {
      clearTimeout(textTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="relative z-10 flex flex-col items-center justify-center">
      <AnimatePresence>
        {!animationComplete ? (
          <motion.div
            key="infinity-symbol"
            className="w-64 h-32 mb-8"
            exit={{
              opacity: 0,
              scale: 1.2,
              filter: "blur(10px)",
              transition: { duration: 0.8 }
            }}
          >
            <svg viewBox="0 0 200 100" className="w-full h-full">
              <motion.path
                d="M20,50 C20,20 80,20 100,50 C120,80 180,80 180,50 C180,20 120,20 100,50 C80,80 20,80 20,50"
                initial={{
                  strokeDasharray: 580,
                  strokeDashoffset: 580,
                  filter: "drop-shadow(0 0 4px transparent)",
                  scale: 0.9,
                  opacity: 0.5,
                }}
                animate={{
                  strokeDashoffset: 0,
                  filter: "drop-shadow(0 0 10px #3ec6f0)",
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  duration: 2.5,
                  ease: "easeOut",
                }}
                style={{
                  fill: "none",
                  stroke: "#3ec6f0",
                  strokeWidth: 12,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                }}
              />
            </svg>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showText && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              y: -20,
              transition: { duration: 0.5 }
            }}
          >
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white"
            >
              <>
                <span>Tem uma ideia?</span>
                <motion.span
                  className="inline-block w-[3px] h-[1em] bg-[#3ec6f0] ml-1 align-middle"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: 2, repeatType: "loop" }}
                />
              </>
              {animationComplete && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="block text-[#3ec6f0]"
                >
                  Aqui ela vira realidade.
                </motion.span>
              )}
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
