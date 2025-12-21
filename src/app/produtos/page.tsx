"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles, Brain, ExternalLink, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import { OptimizedImage } from '@/components/ui/optimized-image'

// Dados dos produtos - fácil de expandir no futuro
const products = [
    {
        id: "infinity-crm",
        name: "Infinity CRM",
        tagline: "Gestão Completa para Operadoras de Telecom",
        description: "Sistema de gestão de relacionamento com clientes especializado para revendas de telecomunicações. Automatize vendas, gerencie leads e maximize conversões.",
        image: "/images/logo_produtos/Foto do zap.png",
        status: "Disponível",
        category: "crm",
        externalLink: "https://infinitygroupscrm.com.br/",
        highlights: [
            "Gestão de Equipes",
            "Automação de Vendas",
            "BKO Integrado",
            "Multi-Operadoras"
        ]
    },
    // Futuros produtos virão aqui
]

const categories = [
    { id: 'all', label: 'Todos os Produtos', icon: Layers },
    { id: 'crm', label: 'CRM & Gestão', icon: Brain },
]

export default function ProdutosPage() {
    const [filter, setFilter] = useState("all")

    const filteredProducts = filter === "all" ? products : products.filter((p) => p.category === filter)

    return (
        <main className="flex flex-col items-center justify-center w-full bg-[#0B0B13] min-h-screen">

            {/* Hero Section */}
            <section className="w-full min-h-[50vh] flex flex-col items-center justify-center relative overflow-hidden pt-32 pb-12">
                <SpaceBackground />
                <div className="absolute inset-0 bg-[#0B0B13]/80 z-0"></div>

                <div className="container mx-auto px-4 z-10 relative text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <div className="inline-block mb-6">
                            <div className="px-4 py-1.5 rounded-full border border-[#00B8FF]/30 bg-[#00B8FF]/10 backdrop-blur-md flex items-center gap-2">
                                <Sparkles size={16} className="text-[#00B8FF]" />
                                <span className="text-[#00B8FF] text-sm font-semibold uppercase tracking-wider font-manrope">Infinity Ecosystem</span>
                            </div>
                        </div>

                        <h1 className="font-orbitron font-bold text-4xl md:text-6xl text-white mb-6">
                            Nossos <span className="text-[#00B8FF]">Produtos</span>
                        </h1>
                        <p className="font-manrope text-[#AAB3C2] text-lg max-w-2xl mx-auto leading-relaxed">
                            Soluções proprietárias desenvolvidas pela Infinity Group para revolucionar a gestão empresarial com tecnologia de ponta.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filter Section */}
            <section className="w-full py-8 border-b border-[#1F2937]/50 sticky top-16 z-40 bg-[#0B0B13]/80 backdrop-blur-md">
                <div className="container mx-auto px-4 overflow-x-auto">
                    <div className="flex justify-start md:justify-center gap-4 min-w-max px-2">
                        {categories.map((cat) => {
                            const Icon = cat.icon
                            const isActive = filter === cat.id
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilter(cat.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 ${isActive
                                        ? "bg-[#00B8FF]/10 border-[#00B8FF] text-[#00B8FF] shadow-[0_0_15px_rgba(0,184,255,0.3)]"
                                        : "bg-[#12121E] border-[#1F2937] text-[#AAB3C2] hover:border-[#00B8FF]/50 hover:text-white"
                                        }`}
                                >
                                    <Icon size={16} />
                                    <span className="font-manrope font-bold text-sm tracking-wide">{cat.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="w-full py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4 }}
                                    className="bg-[#12121E] rounded-2xl overflow-hidden border border-[#1F2937] group hover:border-[#00B8FF]/50 transition-colors shadow-2xl flex flex-col h-full"
                                >
                                    {/* Logo Container */}
                                    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#00B8FF]/5 to-[#9C5DE7]/5 flex items-center justify-center p-8">
                                        <OptimizedImage
                                            src={product.image}
                                            alt={product.name}
                                            width={200}
                                            height={200}
                                            className="object-contain transition-transform duration-700 group-hover:scale-110"
                                        />

                                        {/* Status Badge */}
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-[#00B8FF] text-[#0B0B13] px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                {product.status}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="mb-4">
                                            <h3 className="font-orbitron font-bold text-2xl text-white mb-2 group-hover:text-[#00B8FF] transition-colors">{product.name}</h3>
                                            <p className="text-[#9C5DE7] text-sm font-bold mb-3">{product.tagline}</p>
                                            <p className="text-[#AAB3C2] text-sm leading-relaxed line-clamp-3">
                                                {product.description}
                                            </p>
                                        </div>

                                        {/* Highlights */}
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {product.highlights.slice(0, 3).map((highlight) => (
                                                <span key={highlight} className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider bg-[#0B0B13]/80 text-[#AAB3C2] border border-[#1F2937]">
                                                    {highlight}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-auto pt-4 border-t border-[#1F2937] flex flex-col gap-3">
                                            <Link
                                                href={`/produtos/${product.id}`}
                                                className="w-full py-3 px-4 rounded-lg bg-[#00B8FF] hover:bg-[#00B8FF]/80 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                                            >
                                                Ver Detalhes <ArrowRight size={16} />
                                            </Link>

                                            {product.externalLink && (
                                                <a
                                                    href={product.externalLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full py-3 px-4 rounded-lg border border-[#1F2937] hover:border-[#00B8FF] text-[#AAB3C2] hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                                                >
                                                    Acessar Plataforma <ExternalLink size={16} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="py-20 text-center">
                            <h3 className="text-white font-bold text-xl mb-2">Nenhum produto encontrado</h3>
                            <p className="text-[#AAB3C2]">Tente selecionar outra categoria.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Bottom */}
            <section className="w-full py-24 bg-gradient-to-t from-[#0E0E12] to-[#0B0B13] border-t border-[#1F2937]">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-orbitron font-bold text-3xl md:text-5xl text-white mb-8">
                        Quer saber mais sobre nossos <span className="text-[#9C5DE7]">produtos</span>?
                    </h2>
                    <Button
                        asChild
                        size="lg"
                        className="bg-[#00B8FF] hover:bg-[#00B8FF]/80 text-[#0B0B13] font-bold text-xl px-12 h-16 rounded-full shadow-[0_0_40px_rgba(0,184,255,0.4)] transition-all hover:scale-105"
                    >
                        <Link href="/orcamento">
                            Falar com Especialista <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </section>

        </main>
    )
}
