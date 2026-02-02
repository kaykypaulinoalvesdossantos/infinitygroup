"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Check, Users, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from '@/components/ui/optimized-image'

// Produtos Exclusivos Infinity (Apenas CRM)
const products = [
    {
        id: "infinity-crm",
        category: "crm",
        name: "Infinity CRM",
        description: "Gestão completa para operadoras e equipes comerciais. Automatize processos de vendas, relacionamento e suporte com dashboards inteligentes e relatórios em tempo real.",
        highlights: ["Automação de Funil", "Integração Omnichannel", "IA de Recomendação"],
        icon: Users,
        color: "purple", // 🟣
        primaryCta: "Ver Detalhes",
        secondaryCta: "Experimentar Demo"
    }
]

export default function ProdutosPage() {

    const scrollToContent = () => {
        document.getElementById('explore-ecosystem')?.scrollIntoView({ behavior: 'smooth' })
    }

    // Helper para cores dinâmicas
    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string, text: string, border: string, check: string }> = {
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', check: 'text-purple-500' },
        }
        return colors[color] || colors.purple
    }

    return (
        <main className="flex flex-col w-full bg-[#FAFBFC]">

            {/* HERO SECTION */}
            <section className="relative w-full h-[85vh] min-h-[600px] bg-slate-900 flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/products-hero-bg.png"
                        alt="Background Tech"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/50" />
                </div>

                <div className="container-premium relative z-10 w-full pt-10">
                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                                Produtos Exclusivos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Infinity</span>
                            </h1>
                            <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-3xl">
                                Soluções proprietárias criadas pela Infinity Group para impulsionar empresas que buscam alta performance, automação inteligente e crescimento exponencial.
                                <br /><span className="text-slate-400 text-lg mt-2 block">Cada produto é desenvolvido com tecnologia de ponta, integração total e foco em resultados reais.</span>
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Button
                                    size="lg"
                                    onClick={scrollToContent}
                                    className="bg-[#00B8FF] hover:bg-[#009bd6] text-slate-900 font-bold text-lg h-14 px-8 rounded-full shadow-[0_0_20px_rgba(0,184,255,0.3)] hover:shadow-[0_0_30px_rgba(0,184,255,0.5)] transition-all"
                                >
                                    Explorar Produtos
                                </Button>
                                <Button
                                    size="lg"
                                    asChild
                                    className="bg-[#12121E] text-white hover:bg-black border border-slate-700 h-14 px-8 rounded-full font-semibold transition-all cursor-pointer"
                                >
                                    <Link href="/contato">Falar com um Especialista</Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* THE "SMILE" CURVE */}
                <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-center pointer-events-none">
                    <div className="flex-1 h-[70px] bg-[#FAFBFC] mr-[-1px]" />
                    <div className="relative shrink-0 w-[505px] h-[70px] pointer-events-auto z-10">
                        <a
                            href="#explore-ecosystem"
                            onClick={(e) => { e.preventDefault(); scrollToContent() }}
                            className="block relative w-full h-full"
                        >
                            <svg
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                x="0px"
                                y="0px"
                                viewBox="0 0 505.7 70.1"
                                className="w-full h-full"
                                preserveAspectRatio="none"
                            >
                                <path
                                    className="fill-[#FAFBFC]"
                                    d="M351,32.6c-55.9,30.1-71.4,32.7-98.2,32.7s-42.3-2.6-98.2-32.7S28,0,28,0H0v70.1h28h449.6h28.1V0h-28.1C477.6,0,407,2.5,351,32.6z"
                                />
                            </svg>
                            <div className="absolute top-[28px] left-1/2 transform -translate-x-1/2 -translate-y-full animate-bounce">
                                <svg
                                    width="20"
                                    height="12"
                                    viewBox="0 0 20 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M10 12L0 0H20L10 12Z"
                                        fill="#FAFBFC"
                                    />
                                </svg>
                            </div>
                        </a>
                    </div>
                    <div className="flex-1 h-[70px] bg-[#FAFBFC] ml-[-1px]" />
                </div>
            </section>

            {/* DESTAQUE DE CATEGORIA & ECOSSYSTEMA */}
            <section id="explore-ecosystem" className="py-24 bg-[#FAFBFC]">
                <div className="container-premium">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
                            Explore o Ecossistema Infinity
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            A solução definitiva para escalar sua operação.
                        </p>
                    </div>

                    {/* Product Cards Grid - Centered Single Item */}
                    <div className="flex justify-center">
                        <AnimatePresence mode="popLayout">
                            {products.map((product) => {
                                const styles = getColorClasses(product.color)
                                return (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden max-w-md w-full"
                                    >
                                        <div className="mb-6 flex items-start justify-between">
                                            <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-2xl border-4 border-white bg-black group-hover:scale-105 transition-transform duration-500 flex-shrink-0">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                                                <OptimizedImage
                                                    src="/images/logo_produtos/Foto do zap.png"
                                                    alt="Infinity CRM Logo"
                                                    width={96}
                                                    height={96}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20">
                                                Destaque
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors">
                                            {product.name}
                                        </h3>

                                        <p className="text-slate-600 mb-8 leading-relaxed flex-grow">
                                            {product.description}
                                        </p>

                                        <div className="space-y-3 mb-8">
                                            {product.highlights.map((item, i) => (
                                                <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                                    <Check className={`w-4 h-4 ${styles.check}`} />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col gap-3 mt-auto">
                                            <Button
                                                asChild
                                                className="w-full bg-slate-900 text-white hover:bg-purple-600 font-semibold h-12 rounded-xl transition-colors cursor-pointer"
                                            >
                                                <Link href={`/produtos/${product.id}`}>
                                                    {product.primaryCta} <ChevronRight className="w-4 h-4 ml-2" />
                                                </Link>
                                            </Button>

                                            <Button
                                                asChild
                                                variant="ghost"
                                                className="w-full text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium h-12 rounded-xl border border-transparent hover:border-slate-200 cursor-pointer"
                                            >
                                                <Link href="/orcamento">
                                                    {product.secondaryCta}
                                                </Link>
                                            </Button>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* VALOR INSTITUCIONAL SECTION */}
            <section className="py-24 bg-slate-50 border-y border-slate-200">
                <div className="container-premium">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-4 block">
                                Por que somos diferentes
                            </span>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                Tecnologia Infinity, <br />resultado comprovado.
                            </h2>
                            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                                Soluções 100% desenvolvidas no Brasil, com suporte especializado e arquitetura escalável.
                                Transformamos desafios corporativos em oportunidades de crescimento através da inovação digital.
                            </p>

                            <div className="space-y-6">
                                {[
                                    "Cloud Native e segurança de nível corporativo",
                                    "Consultoria técnica e suporte contínuo",
                                    "Integração total entre produtos do ecossistema Infinity"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <span className="text-lg font-medium text-slate-800">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-[2rem] rotate-3 blur-lg opacity-50" />
                            <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2340&auto=format&fit=crop"
                                    alt="Equipe Infinity"
                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-8">
                                    <div className="text-white">
                                        <p className="font-bold text-lg">Suporte Especializado</p>
                                        <p className="text-slate-200">Time brasileiro focado no seu sucesso</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA FINAL (Conversão) */}
            <section className="py-24 relative overflow-hidden bg-white">
                <div className="container-premium relative z-10">
                    <div className="bg-[#0052CC] rounded-[3rem] px-8 py-16 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-900/30">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] transform -translate-x-1/3 translate-y-1/3" />

                        <div className="relative z-10 max-w-4xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight">
                                Quer levar o poder do ecossistema Infinity para sua empresa?
                            </h2>
                            <p className="text-xl text-blue-100 mb-12 leading-relaxed max-w-2xl mx-auto">
                                Fale com um especialista e descubra qual solução exclusiva da Infinity melhor atende ao seu negócio.
                            </p>

                            <div className="flex justify-center">
                                <Button
                                    asChild
                                    className="bg-white text-[#0052CC] hover:bg-white/90 font-bold text-xl h-20 px-16 rounded-full shadow-lg transition-all hover:scale-105 cursor-pointer"
                                >
                                    <Link href="/contato">Falar com Especialista</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    )
}
