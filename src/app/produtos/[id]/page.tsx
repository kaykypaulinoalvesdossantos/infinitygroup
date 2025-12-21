"use client"

import { notFound } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ExternalLink, CheckCircle2, Users, Zap, MessageSquare, DollarSign, Shield, Globe, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import { OptimizedImage } from "@/components/ui/optimized-image"

// Dados completos dos produtos
const productsData: Record<string, any> = {
    "infinity-crm": {
        id: "infinity-crm",
        name: "Infinity CRM",
        tagline: "Gestão Completa para Operadoras de Telecom",
        description: "Centralize vendas, comissões e leads em uma única plataforma. O Infinity CRM é a solução definitiva para revendas que querem escalar com organização e previsibilidade.",
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
                "Comissões calculadas manualmente (erros comuns)",
                "Relatórios demoram dias para serem gerados",
                "Dificuldade em gerenciar múltiplas operadoras"
            ],
            after: [
                "Sistema centralizado e 100% automatizado",
                "Agendamentos automáticos e lembretes inteligentes",
                "Status em tempo real com histórico completo",
                "Cálculo automático e transparente de comissões",
                "Dashboards instantâneos 24/7 para tomada de decisão",
                "Configuração específica por operadora e produto"
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

    if (!product) {
        notFound()
    }

    return (
        <main className="flex flex-col items-center justify-center w-full bg-[#0B0B13] min-h-screen">

            {/* Hero Section */}
            <section className="w-full min-h-[60vh] flex flex-col items-center justify-center relative overflow-hidden pt-32 pb-16">
                <SpaceBackground />
                <div className="absolute inset-0 bg-[#0B0B13]/80 z-0"></div>

                {/* Glowing Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#00B8FF]/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#9C5DE7]/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-4 z-10 relative">
                    {/* Back Button */}
                    <Link
                        href="/produtos"
                        className="inline-flex items-center gap-2 text-[#AAB3C2] hover:text-[#00B8FF] transition-colors mb-8 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-manrope font-semibold">Voltar para Produtos</span>
                    </Link>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8 max-w-6xl">
                        {/* Logo */}
                        <div className="w-32 h-32 rounded-2xl bg-white/5 flex items-center justify-center p-6 border border-white/10 flex-shrink-0">
                            <OptimizedImage
                                src={product.image}
                                alt={product.name}
                                width={128}
                                height={128}
                                className="object-contain"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="inline-block px-4 py-1.5 rounded-full bg-[#00B8FF]/20 text-[#00B8FF] text-sm font-bold uppercase tracking-wider border border-[#00B8FF]/30 mb-4">
                                    {product.status}
                                </span>

                                <h1 className="font-orbitron font-bold text-4xl md:text-6xl text-white mb-4">
                                    {product.name}
                                </h1>

                                <p className="text-[#9C5DE7] text-xl font-bold mb-6">{product.tagline}</p>

                                <p className="font-manrope text-[#C0C7D0] text-lg leading-relaxed max-w-3xl">
                                    {product.description}
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="bg-gradient-to-r from-[#00B8FF] to-[#9C5DE7] hover:opacity-90 text-white font-bold text-lg px-10 h-14 rounded-full shadow-[0_0_40px_rgba(0,184,255,0.3)] transition-all hover:scale-105"
                                    >
                                        <a href={product.externalLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                                            Acessar Plataforma <ExternalLink className="ml-2" size={20} />
                                        </a>
                                    </Button>

                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        className="border-[#00B8FF] text-[#00B8FF] hover:bg-[#00B8FF]/10 font-bold text-lg px-10 h-14 rounded-full transition-all"
                                    >
                                        <Link href="/orcamento" className="inline-flex items-center">
                                            Solicitar Demonstração
                                        </Link>
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="w-full py-20 bg-[#0B0B13]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="font-orbitron font-bold text-3xl md:text-5xl text-white mb-4">
                            Funcionalidades <span className="text-[#00B8FF]">Principais</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {product.features.map((feature: any, idx: number) => (
                            <motion.div
                                key={idx}
                                className="bg-[#12121E] border border-[#1F2937] p-8 rounded-2xl hover:border-[#00B8FF]/30 transition-all hover:bg-[#1A1A2E] group"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="w-12 h-12 rounded-full bg-[#00B8FF]/10 flex items-center justify-center text-[#00B8FF] mb-6 group-hover:bg-[#00B8FF]/20 transition-colors">
                                    {feature.icon}
                                </div>
                                <h4 className="font-orbitron font-bold text-xl text-white mb-3">{feature.title}</h4>
                                <p className="font-manrope text-[#AAB3C2] text-sm leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="w-full py-20 bg-[#0E0E12]">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                        {product.stats.map((stat: any, idx: number) => (
                            <motion.div
                                key={idx}
                                className="text-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="font-orbitron font-bold text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-[#00B8FF] to-[#9C5DE7] mb-2">
                                    {stat.number}
                                </div>
                                <div className="font-manrope text-[#AAB3C2] text-sm uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Before/After Comparison */}
            <section className="w-full py-24 bg-[#0B0B13]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="font-orbitron font-bold text-3xl md:text-5xl text-white mb-4">
                            A Diferença de um CRM <span className="text-[#00B8FF]">Especializado</span>
                        </h2>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Before */}
                            <motion.div
                                className="bg-[#12121E]/60 border border-[#FF5555]/30 rounded-2xl p-8"
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-[#FF5555]/10 flex items-center justify-center">
                                        <X size={24} className="text-[#FF5555]" />
                                    </div>
                                    <h3 className="font-orbitron font-bold text-xl text-white">Sem o CRM Telecom</h3>
                                </div>
                                <ul className="space-y-3">
                                    {product.beforeAfter.before.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-[#AAB3C2] text-sm">
                                            <X size={16} className="text-[#FF5555] flex-shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* After */}
                            <motion.div
                                className="bg-[#12121E]/60 border border-[#00B8FF]/30 rounded-2xl p-8"
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-[#00B8FF]/10 flex items-center justify-center">
                                        <CheckCircle2 size={24} className="text-[#00B8FF]" />
                                    </div>
                                    <h3 className="font-orbitron font-bold text-xl text-white">Com o {product.name}</h3>
                                </div>
                                <ul className="space-y-3">
                                    {product.beforeAfter.after.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-[#C0C7D0] text-sm">
                                            <CheckCircle2 size={16} className="text-[#00B8FF] flex-shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="w-full py-32 bg-gradient-to-t from-[#0E0E12] to-[#0B0B13] border-t border-[#1F2937]">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h2 className="font-orbitron font-bold text-3xl md:text-5xl text-white mb-6">
                            Pronto Para Transformar Sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B8FF] to-[#9C5DE7]">Operação</span>?
                        </h2>

                        <p className="font-manrope text-[#AAB3C2] text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
                            Junte-se às operadoras que mais crescem no Brasil. Tecnologia de ponta, gestão simplificada e resultados previsíveis.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <Button
                                asChild
                                size="lg"
                                className="bg-gradient-to-r from-[#00B8FF] to-[#9C5DE7] hover:opacity-90 text-white font-bold text-xl px-12 h-16 rounded-full shadow-[0_0_50px_rgba(156,93,231,0.4)] transition-all hover:scale-105"
                            >
                                <a href={product.externalLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                                    Começar Agora <ExternalLink className="ml-2" size={20} />
                                </a>
                            </Button>

                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="border-white/20 text-white hover:bg-white/5 font-bold text-xl px-12 h-16 rounded-full transition-all"
                            >
                                <Link href="/orcamento">
                                    Falar com Especialista
                                </Link>
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-[#555B66] text-sm">
                            {product.benefits.map((benefit: string, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-[#00B8FF]" />
                                    <span>{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

        </main>
    )
}
