"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  Package,
  Shield,
  Truck,
  Star,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import { OptimizedImage } from '@/components/ui/optimized-image'

export default function EcommercePage() {
  return (
    <main className="flex flex-col items-center justify-center w-full">
      {/* Hero Section - Space Theme with Shopping Elements */}
      <section className="w-full min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden bg-[#0A0A0F] text-[#FBFBFB]">
        <SpaceBackground />

        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F]/90 to-[#0A0A0F]/80 z-10"></div>
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full opacity-20">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-[#5DC0E7]/20"></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 z-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#FBFBFB]">
                Soluções de <span className="text-[#5DC0E7]">E-commerce</span>
              </h1>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Lojas virtuais completas, integradas com gateways de pagamento, automações e funis de vendas.
                Desenvolvemos e-commerces que não apenas vendem, mas convertem e fidelizam clientes.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#5DC0E7] hover:bg-[#5DC0E7]/80 text-white relative overflow-hidden group"
              >
                <Link href="/orcamento">
                  <span className="relative z-10 flex items-center">
                    Solicitar Orçamento{" "}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl border-4 border-[#5DC0E7]/30">
                <OptimizedImage
                  src="/images/ecommerce.webp"
                  alt="E-commerce"
                  width={1920}
                  height={1080}
                  priority={true}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-[#5DC0E7]/10 rounded-full z-0"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#5DC0E7]/20 rounded-full z-0"></div>

              {/* Elementos flutuantes de e-commerce */}
              <motion.div
                className="absolute top-1/4 right-1/4 w-12 h-12 z-20"
                animate={{
                  y: [0, -15, 0],
                  rotate: 360,
                }}
                transition={{
                  y: {
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  },
                }}
              >
                <ShoppingCart className="text-[#5DC0E7] w-full h-full" />
              </motion.div>

              <motion.div
                className="absolute bottom-1/4 left-1/4 w-10 h-10 z-20"
                animate={{
                  y: [0, 15, 0],
                  rotate: -360,
                }}
                transition={{
                  y: {
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: 25,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  },
                }}
              >
                <CreditCard className="text-[#5DC0E7] w-full h-full" />
              </motion.div>

              <motion.div
                className="absolute top-2/3 right-1/3 w-8 h-8 z-20"
                animate={{
                  y: [0, 10, 0],
                  x: [0, 10, 0],
                }}
                transition={{
                  y: {
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  x: {
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                }}
              >
                <DollarSign className="text-[#5DC0E7] w-full h-full" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Floating Cards */}
      <section className="w-full py-20 bg-gradient-to-b from-[#0A0A0F] to-[#141420] text-[#FBFBFB] relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#5DC0E7]/30 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#5DC0E7]/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[#5DC0E7]/10 rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#FBFBFB]">
              Por que investir em um <span className="text-[#5DC0E7]">e-commerce personalizado</span>?
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#FBFBFB]/80">
              Um e-commerce bem desenvolvido é essencial para expandir seu negócio e alcançar novos mercados.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <ShoppingCart className="h-10 w-10" />,
                title: "Experiência de Compra Otimizada",
                description:
                  "Interface intuitiva e fluxo de compra simplificado para aumentar as conversões e reduzir o abandono de carrinho.",
              },
              {
                icon: <CreditCard className="h-10 w-10" />,
                title: "Múltiplos Meios de Pagamento",
                description:
                  "Integração com diversos gateways de pagamento, oferecendo mais opções para seus clientes finalizarem a compra.",
              },
              {
                icon: <TrendingUp className="h-10 w-10" />,
                title: "Estratégias de Upsell e Cross-sell",
                description:
                  "Funcionalidades que aumentam o valor médio do pedido através de recomendações personalizadas.",
              },
              {
                icon: <Package className="h-10 w-10" />,
                title: "Gestão de Estoque Eficiente",
                description:
                  "Controle de estoque em tempo real, com alertas automáticos para reposição e integração com fornecedores.",
              },
              {
                icon: <Shield className="h-10 w-10" />,
                title: "Segurança e Conformidade",
                description: "Proteção de dados dos clientes e conformidade com regulamentações como LGPD e PCI DSS.",
              },
              {
                icon: <Truck className="h-10 w-10" />,
                title: "Logística Integrada",
                description:
                  "Cálculo automático de frete, integração com transportadoras e rastreamento de pedidos em tempo real.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.03 }}
                className="bg-[#FBFBFB]/5 backdrop-blur-sm p-6 rounded-lg border border-[#5DC0E7]/20 hover:border-[#5DC0E7]/50 transition-all duration-300"
              >
                <div className="text-[#5DC0E7] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-[#FBFBFB]">{feature.title}</h3>
                <p className="text-[#FBFBFB]/80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach - Interactive Diagram */}
      <section className="w-full py-20 bg-[#FBFBFB] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#5DC0E7]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#5DC0E7]/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#212227]">
              Nossa <span className="text-[#5DC0E7]">Abordagem</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#212227]/80">
              Desenvolvemos e-commerces personalizados que atendem às necessidades específicas do seu negócio.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl border-4 border-[#5DC0E7]/10">
                <OptimizedImage
                  src="/images/websiteinicio.webp"
                  alt="Website"
                  width={1920}
                  height={1080}
                  priority={true}
                  className="w-full h-full object-cover"
                />

                {/* Overlay com efeito de fluxograma de e-commerce */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/80 to-transparent opacity-60">
                  <svg
                    className="absolute inset-0 w-full h-full text-[#5DC0E7]/30"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path d="M10,30 L90,30" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M10,50 L90,50" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M10,70 L90,70" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M30,10 L30,90" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M50,10 L50,90" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M70,10 L70,90" stroke="currentColor" strokeWidth="0.5" />

                    <circle cx="30" cy="30" r="3" fill="currentColor" />
                    <circle cx="50" cy="50" r="3" fill="currentColor" />
                    <circle cx="70" cy="70" r="3" fill="currentColor" />

                    <path d="M30,30 L50,50" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M50,50 L70,70" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-[#5DC0E7]/10 rounded-full z-0"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#5DC0E7]/20 rounded-full z-0"></div>

              {/* Elementos flutuantes */}
              <motion.div
                className="absolute top-10 right-10 z-20"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <ShoppingCart className="h-12 w-12 text-[#5DC0E7]" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6 text-[#212227]">Desenvolvimento Personalizado</h3>
              <p className="text-lg mb-6 text-[#212227]/80">
                Cada negócio é único, por isso desenvolvemos soluções de e-commerce personalizadas que atendem às
                necessidades específicas da sua empresa e do seu público-alvo.
              </p>

              <ul className="space-y-4">
                {[
                  "Análise detalhada do seu negócio e público-alvo",
                  "Design exclusivo e alinhado com sua identidade visual",
                  "Funcionalidades personalizadas para seu modelo de negócio",
                  "Integrações com sistemas existentes (ERP, CRM, etc.)",
                  "Estratégias de marketing digital para impulsionar vendas",
                  "Suporte contínuo e atualizações regulares",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 5 }}
                  >
                    <CheckCircle className="h-5 w-5 text-[#5DC0E7] mr-2 shrink-0 mt-0.5" />
                    <span className="text-[#212227]/80">{item}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Diagrama interativo do fluxo de e-commerce */}
              <motion.div
                className="mt-8 p-6 bg-[#F0F0F0] rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <h4 className="font-bold text-[#212227] mb-4">Fluxo de Compra Otimizado</h4>
                <div className="flex justify-between items-center">
                  {["Catálogo", "Carrinho", "Checkout", "Pagamento", "Confirmação"].map((step, index) => (
                    <motion.div key={index} className="flex flex-col items-center" whileHover={{ y: -5, scale: 1.05 }}>
                      <div className="w-10 h-10 rounded-full bg-[#5DC0E7] flex items-center justify-center text-white font-bold text-sm mb-2">
                        {index + 1}
                      </div>
                      <span className="text-xs text-center text-black">{step}</span>

                      {index < 4 && (
                        <motion.div
                          className="h-0.5 w-10 bg-[#5DC0E7]/50 absolute"
                          style={{
                            left: `calc(${(index + 0.5) * 25}% - 5px)`,
                            top: "calc(50% - 10px)",
                            width: "calc(25% - 20px)",
                          }}
                          initial={{ width: 0 }}
                          whileInView={{ width: "calc(25% - 20px)" }}
                          transition={{ duration: 0.5, delay: index * 0.2 }}
                          viewport={{ once: true }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technologies - Interactive Grid */}
      <section className="w-full py-20 bg-[#0A0A0F] text-[#FBFBFB] relative overflow-hidden">
        <SpaceBackground />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#FBFBFB]">
              Tecnologias que <span className="text-[#5DC0E7]">utilizamos</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#FBFBFB]/80">
              Trabalhamos com as plataformas e tecnologias mais modernas e eficientes para e-commerce.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                name: "WooCommerce",
                description: "Para lojas integradas ao WordPress",
                icon: "/images/logo/woocommerce.png",
              },
              {
                name: "Shopify",
                description: "Solução completa para e-commerce",
                icon: "/images/logo/shopify.png",
              },
              {
                name: "Magento",
                description: "Para lojas de grande porte",
                icon: "/images/logo/magento.png",
              },
              {
                name: "VTEX",
                description: "Plataforma omnichannel completa",
                icon: "/images/logo/vtex.png",
              },
              {
                name: "Stripe",
                description: "Gateway de pagamento seguro",
                icon: "/images/logo/stripe.png",
              },
              {
                name: "PayPal",
                description: "Soluções de pagamento global",
                icon: "/images/logo/paypal.png",
              },
              {
                name: "Correios",
                description: "Integração para cálculo de frete",
                icon: "/images/logo/correios.png",
              },
              {
                name: "Google Analytics",
                description: "Análise de dados e comportamento",
                icon: "/images/logo/google-analytics.webp",
              },
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-[#FBFBFB]/5 backdrop-blur-sm p-6 rounded-lg border border-[#5DC0E7]/20 hover:border-[#5DC0E7]/50 transition-all duration-300 flex flex-col items-center text-center"
              >
                <Image
                  src={tech.icon}
                  alt={tech.name}
                  width={60}
                  height={60}
                  className="mb-4"
                />
                <h3 className="text-xl font-bold mb-2 text-[#5DC0E7]">{tech.name}</h3>
                <p className="text-[#FBFBFB]/80 text-sm">{tech.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Space Theme */}
      <section className="w-full py-20 bg-gradient-to-r from-[#0A0A0F] to-[#141420] text-[#FBFBFB] relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0A0A0F]/50"></div>
          <div className="absolute inset-0">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-[#5DC0E7]"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 1}px`,
                  height: `${Math.random() * 4 + 1}px`,
                  opacity: Math.random() * 0.5 + 0.3,
                }}
                animate={{
                  y: [0, -Math.random() * 100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#FBFBFB]">
                Pronto para lançar sua <span className="text-[#5DC0E7]">loja virtual</span>?
              </h2>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Entre em contato conosco e vamos transformar sua ideia em um e-commerce de sucesso.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#5DC0E7] hover:bg-[#5DC0E7]/80 text-white relative overflow-hidden group"
              >
                <Link href="/orcamento">
                  <span className="relative z-10 flex items-center">
                    Solicitar Orçamento{" "}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Elementos flutuantes */}
        <motion.div
          className="absolute bottom-10 left-10 w-16 h-16 z-10"
          animate={{
            y: [0, -20, 0],
            rotate: 360,
          }}
          transition={{
            y: {
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            rotate: {
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
          }}
        >
          <ShoppingCart className="text-[#5DC0E7] w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute top-10 right-10 w-20 h-20 z-10"
          animate={{
            y: [0, 20, 0],
            rotate: -360,
          }}
          transition={{
            y: {
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            rotate: {
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
          }}
        >
          <Star className="text-[#5DC0E7]/30 w-full h-full" />
        </motion.div>
      </section>
    </main>
  )
}
