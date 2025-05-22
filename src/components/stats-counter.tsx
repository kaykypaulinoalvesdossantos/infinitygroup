/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useRef } from "react"
import { useInView } from "framer-motion"

interface StatsCounterProps {
  end: number
  suffix?: string
  label: string
  duration?: number
  decimals?: number
}

export default function StatsCounter({ end, suffix = "", label, duration = 2000, decimals = 0 }: StatsCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const countRef = useRef(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (!isInView || hasAnimated) return

    const multiplier = Math.pow(10, decimals)
    const targetValue = end * multiplier
    const step = targetValue / (duration / 16)
    let currentCount = 0

    const timer = setInterval(() => {
      currentCount += step
      if (currentCount >= targetValue) {
        clearInterval(timer)
        currentCount = targetValue
        setHasAnimated(true)
      }

      setCount(currentCount / multiplier)
    }, 16)

    return () => clearInterval(timer)
  }, [isInView, end, duration, decimals, hasAnimated])

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-bold text-[#5DC0E7] mb-2">
        {count.toFixed(decimals)}
        {suffix}
      </div>
      <div className="text-[#FBFBFB]/80">{label}</div>
    </div>
  )
}
