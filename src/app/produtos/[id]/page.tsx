"use client"

import { notFound } from "next/navigation"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowLeft, ExternalLink, CheckCircle2, Users, Zap, MessageSquare, DollarSign, Shield, Globe, X, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { useRef } from "react"

// Dados completos dos produtos (Preserved Data)
const productsData: Record<string, any> = {
    "infinity-crm": {
        id: "infinity-crm",
        name: "Infinity CRM",
        tagline: "Gestão Completa para Operadoras de Telecom",
        description: "Centralize vendas, comissões e leads em uma única plataforma. O Infinity CRM é a solução definitiva para revenda que querem escalar com organização e previsibilidade.",
        image: "/images/logo_produtos/Foto do zap.png",
        externalLink: "https://infinitygroupscrm.com.br/",
        status: "Disponível",

        features: [
            {
                icon: <Users size={24} />,
                title: "Gestão de Equipes",
                description: "Ambiente dedicado para cada vendedor com controle de hierarquia, metas e comissionamento automático."
            },
            {
                icon: <Zap size={24} />,
                title: "Automação de Vendas",
                description: "Workflows inteligentes que notificam sobre follow-ups, renovações e oportunidades de upsell."
            },
            {
                icon: <MessageSquare size={24} />,
                title: "BKO Integrado",
                description: "Conecte vendas e backoffice em um fluxo único. Elimine planilhas e erros de comunicação manual."
            },
            {
                icon: <DollarSign size={24} />,
                title: "Gestão Financeira",
                description: "Controle completo de contas a receber, repasses de comissões e fluxo de caixa da operação."
            },
            {
                icon: <Shield size={24} />,
                title: "Segurança de Dados",
                description: "Proteção total da sua base de clientes com níveis de acesso granulares e logs de auditoria."
            },
            {
                icon: <Globe size={24} />,
                title: "Multi-Operadoras",
                description: "Gerencie Vivo, Claro, Tim e outras operadoras em uma única interface padronizada."
            }
        ],

        stats: [
            { number: "2.500+", label: "Vendas/Mês" },
            { number: "45%", label: "Aumento em Conversão" },
            { number: "15h", label: "Economia Semanal" },
            { number: "3 dias", label: "Redução no BKO" }
        ],

        beforeAfter: {
            before: [
                "Planilhas desorganizadas e descentralizadas",
                "Leads perdidos por falta de follow-up",
                "BKO sem visibilidade do status real",
                "Comissões calculadas manualmente",
                "Relatórios demoram dias para gerar",
                "Dificuldade mult-operadoras"
            ],
            after: [
                "Sistema centralizado e 100% automatizado",
                "Agendamentos e lembretes inteligentes",
                "Status em tempo real com histórico",
                "Cálculo automático de comissões",
                "Dashboards instantâneos 24/7",
                "Configuração por operadora"
            ]
        },

        benefits: [
            "Setup em 24h",
            "Sem fidelidade",
            "Suporte 24/7",
            "Migração Gratuita"
        ]
    }
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const product = productsData[params.id]
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({ target: containerRef })
    const y = useTransform(scrollYProgress, [0, 1], [0, -50])

    if (!product) {
        notFound()
    }

    return (
        <main ref={containerRef} className="flex flex-col w-full bg-white selection:bg-blue-100 min-h-screen">

            {/* PRODUCT NAV HEADER REMOVED FOR STANDARD NAV */}

            {/* Header Background Bar */}
            <div className="w-full h-24 bg-[#0B0B13] absolute top-0 left-0 z-0" />

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white -z-10" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 skew-x-12 translate-x-32 -z-10" />

                <div className="container-premium grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-xl bg-white shadow-lg shadow-blue-900/5 p-2 flex items-center justify-center border border-slate-100">
                                <OptimizedImage
                                    src={product.image}
                                    alt={product.name}
                                    width={64}
                                    height={64}
                                    className="object-contain"
                                />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight">
                                {product.name}
                            </h1>
                        </div>

                        <p className="text-xl md:text-2xl text-slate-600 mb-8 font-light leading-relaxed">
                            {product.description}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                asChild
                                className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                            >
                                <a href={product.externalLink} target="_blank" rel="noopener noreferrer">
                                    Começar Agora <ChevronRight className="ml-2 w-5 h-5" />
                                </a>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="h-14 px-8 text-lg border-2 border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50 rounded-full"
                            >
                                <Link href="/orcamento">
                                    <Play className="mr-2 w-4 h-4 fill-current" /> Ver Demonstração
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-12 flex items-center gap-8 text-sm font-medium text-slate-500">
                            {product.benefits.map((benefit: string, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    {benefit}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Image */}
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/20 border border-slate-200 bg-white aspect-[4/3] group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-purple-600/5 group-hover:opacity-0 transition-opacity duration-700" />
                            {/* Using the logo as a placeholder for dashboard screenshot if not available, scaled up */}
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 relative">
                                <OptimizedImage
                                    src="/images/crm/dashboard-team.png"
                                    alt="Equipe utilizando o Dashboard Infinity CRM"
                                    width={800}
                                    height={600}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none" />
                            </div>
                        </div>
                        {/* Floating Stats Card */}
                        <motion.div
                            style={{ y }}
                            className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-[200px]"
                        >
                            <div className="text-4xl font-bold text-blue-600 mb-1">45%</div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                                Aumento médio em conversão de vendas
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* KEY METRICS STRIP */}
            <section className="bg-slate-900 py-16 text-white">
                <div className="container-premium">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
                        {product.stats.map((stat: any, idx: number) => (
                            <div key={idx} className="text-center px-4">
                                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">{stat.number}</div>
                                <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES GRID */}
            <section className="py-24 bg-slate-50">
                <div className="container-premium">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                            Tudo o que você precisa em um só lugar
                        </h2>
                        <p className="text-lg text-slate-600">
                            Uma suíte completa de ferramentas desenhada especificamente para a realidade das operadoras de telecom.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {product.features.map((feature: any, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* COMPARISON SECTION (Before/After) */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container-premium">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-4 block">Porque Mudar?</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
                            A evolução da sua operação
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center relative">
                        {/* Background Decoration */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 hidden md:block" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white border border-slate-100 rounded-full hidden md:flex items-center justify-center text-slate-300 z-10">
                            VS
                        </div>

                        {/* Traditional Way */}
                        <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100">
                            <h3 className="text-2xl font-bold text-slate-400 mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"><X size={16} /></span>
                                Operação Tradicional
                            </h3>
                            <ul className="space-y-6">
                                {product.beforeAfter.before.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-4 text-slate-500">
                                        <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Infinity Way */}
                        <div className="bg-white rounded-3xl p-10 border-2 border-blue-100 shadow-2xl shadow-blue-900/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
                            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><CheckCircle2 size={16} /></span>
                                Com Infinity CRM
                            </h3>
                            <ul className="space-y-6">
                                {product.beforeAfter.after.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-4 text-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="font-semibold">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA BANNER */}
            <section className="py-20">
                <div className="container-premium">
                    <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-900/30">
                        {/* Background Pattern */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                            </svg>
                        </div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-bold mb-8">
                                Pronto para escalar seus resultados?
                            </h2>
                            <p className="text-xl text-blue-100 mb-12">
                                Experimente a plataforma que está revolucionando o mercado de telecomunicações.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-white text-blue-600 hover:bg-blue-50 h-16 px-12 rounded-full font-bold text-lg shadow-lg"
                                >
                                    <a href={product.externalLink} target="_blank" rel="noopener noreferrer">
                                        Solicitar Demonstração
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
