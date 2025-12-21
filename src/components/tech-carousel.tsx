"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { TbBrandKotlin } from "react-icons/tb"

// Tech logos with their names - Duplicated for seamless loop
const technologies = [
  { name: "React", logo: "/images/logo/imagem_2025-05-21_042656554-removebg-preview.png" },
  { name: "Next.js", logo: "/images/logo/nextjs.png" }, // Ideally need a white version or ensure contrast
  { name: "Node.js", logo: "/images/logo/nodejs.png" },
  { name: "JavaScript", logo: "/images/logo/javascript.png" },
  { name: "TypeScript", logo: "/images/logo/typescript.png" },
  { name: "PostgreSQL", logo: "/images/logo/PostgreSQL.svg" },
  { name: "MongoDB", logo: "/images/logo/mongodb.png" },
  { name: "Firebase", logo: "/images/logo/firebase.webp" },
  { name: "Flutter", logo: "/images/logo/flutter.png" },
  { name: "Docker", logo: "/images/logo/doker.png" },
  { name: "Kotlin", logo: <TbBrandKotlin /> },
  { name: "Java", logo: "/images/logo/java.png" },
  { name: "Python", logo: "/images/logo/python.png" },
  { name: "AWS", logo: "/images/logo/aws.png" },
  { name: "Tailwind CSS", logo: "/images/logo/Tailwind_CSS.png" },
]

export default function TechCarousel() {
  // Double the list for infinite scroll effect
  const extendedTech = [...technologies, ...technologies]

  return (
    <div className="relative w-full overflow-hidden">
      {/* Side Gradients for "Fade" effect */}
      <div className="absolute top-0 left-0 w-12 sm:w-24 h-full bg-gradient-to-r from-[#0B0B13] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-12 sm:w-24 h-full bg-gradient-to-l from-[#0B0B13] to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-scroll hover:pause py-4">
        {extendedTech.map((tech, index) => (
          <div
            key={index}
            className="mx-4 sm:mx-6 flex-shrink-0"
          >
            <div className="bg-[#12121E]/50 backdrop-blur-sm border border-[#00B8FF]/10 rounded-xl p-6 w-[160px] sm:w-[180px] md:w-[220px] h-32 sm:h-40 md:h-48 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-[#00B8FF]/30 hover:bg-[#12121E] hover:shadow-[0_0_20px_rgba(0,184,255,0.1)] hover:-translate-y-1 group">
              <div className="flex-1 flex items-center justify-center w-full">
                {typeof tech.logo === "string" ? (
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 transition-transform duration-300 group-hover:scale-110">
                    <Image
                      src={tech.logo}
                      alt={tech.name}
                      fill
                      className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ) : (
                  <div className="text-4xl sm:text-6xl text-[#AAB3C2] group-hover:text-[#00B8FF] transition-colors duration-300">
                    {tech.logo}
                  </div>
                )}
              </div>

              <span className="font-manrope font-semibold text-sm text-[#AAB3C2] group-hover:text-white transition-colors">
                {tech.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
