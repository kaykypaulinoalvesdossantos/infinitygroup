"use client"

export default function BackgroundStars() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => {
                // Create a deterministic grid of positions (6x5 grid)
                const row = Math.floor(i / 6)
                const col = i % 6

                // Calculate fixed positions based on grid
                const top = Number((row * 20 + 5).toFixed(2))
                const left = Number((col * 20 + 5).toFixed(2))

                // Use index for other properties to ensure consistency
                const size = Number((1 + (i % 3)).toFixed(2))
                const opacity = Number((0.3 + (i % 5) * 0.1).toFixed(3))
                const duration = Number((2 + (i % 3)).toFixed(2))
                const delay = Number((i * 0.2).toFixed(2))

                return (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            top: `${top}%`,
                            left: `${left}%`,
                            opacity,
                            animation: `twinkle ${duration}s infinite ${delay}s`,
                        }}
                    />
                )
            })}
            <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
        </div>
    )
}
