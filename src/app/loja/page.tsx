"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import {
  Check,
  ChevronDown,
  CreditCard,
  Gift,
  ListChecks,
  MessageCircle,
  Minus,
  Nfc,
  Plus,
  QrCode,
  Smartphone,
  Truck,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  storeCategories,
  storeProducts,
  buildWhatsAppLink,
  buildProductMessage,
  buildOrderMessage,
  type StoreCategory,
  type StoreProduct,
} from "@/lib/store-products"

const GENERIC_MESSAGE =
  "Olá! Vim pela Loja NFC do site da Infinity Groups e gostaria de conhecer os produtos NFC."
const genericWhatsAppLink = buildWhatsAppLink(GENERIC_MESSAGE)

const MAX_QUANTITY = 9999

const categoryVisual: Record<StoreCategory, { gradient: string; Icon: LucideIcon }> = {
  cartoes: { gradient: "from-blue-600 via-blue-500 to-indigo-600", Icon: CreditCard },
  plaquinhas: { gradient: "from-slate-700 via-slate-600 to-cyan-600", Icon: QrCode },
  brindes: { gradient: "from-violet-600 via-violet-500 to-fuchsia-600", Icon: Gift },
}

const filterOptions: { id: StoreCategory | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  ...storeCategories.map((c) => ({ id: c.id, label: c.label })),
]

const steps: { title: string; text: string; Icon: LucideIcon }[] = [
  {
    title: "Escolha os produtos",
    text: "Navegue pelo catálogo, selecione os modelos e defina as quantidades.",
    Icon: ListChecks,
  },
  {
    title: "Fale com a gente no WhatsApp",
    text: "Envie o pedido pelo WhatsApp e tire suas dúvidas sobre valores e personalização.",
    Icon: MessageCircle,
  },
  {
    title: "Produzimos, programamos e entregamos",
    text: "Criamos a arte, gravamos o chip NFC com o seu conteúdo e enviamos o pedido.",
    Icon: Truck,
  },
]

const faqs: { question: string; answer: string }[] = [
  {
    question: "Existe pedido mínimo?",
    answer:
      "Não. Você pode pedir a cotação de qualquer quantidade direto pelo WhatsApp, sem compromisso.",
  },
  {
    question: "Qual é o prazo de produção?",
    answer:
      "O prazo depende do produto, da quantidade e da personalização. Consulte no WhatsApp a previsão para o seu pedido.",
  },
  {
    question: "Posso personalizar com o logo da minha empresa?",
    answer:
      "Sim. Os produtos podem ser personalizados com a sua marca. Envie seu logo pelo WhatsApp e confirme os detalhes antes da produção.",
  },
  {
    question: "Posso mudar o link depois?",
    answer:
      "Em geral sim: o conteúdo gravado no chip pode ser atualizado sem trocar o produto. Confirme no WhatsApp o que vale para o modelo escolhido.",
  },
  {
    question: "Vocês entregam para todo o Brasil?",
    answer:
      "Consulte no WhatsApp as condições e o prazo de entrega para a sua região.",
  },
]

type ProductCardProps = {
  product: StoreProduct
  quantity: number
  inOrder: boolean
  onQuantityChange: (id: string, quantity: number) => void
  onToggleOrder: (id: string) => void
}

function ProductCard({ product, quantity, inOrder, onQuantityChange, onToggleOrder }: ProductCardProps) {
  const { gradient, Icon } = categoryVisual[product.category]
  const min = 1
  const step = 1

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4 }}
      className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-5 min-w-0"
    >
      <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
            className="object-cover md:group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10" aria-hidden="true" />
            <div className="absolute -left-8 -top-8 w-28 h-28 rounded-full bg-white/10" aria-hidden="true" />
            <Icon className="relative w-20 h-20 text-white/90" strokeWidth={1.5} aria-hidden="true" />
          </>
        )}
        {product.badge && (
          <span className="absolute top-4 left-4 z-10 bg-white text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {product.badge}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
        <p className="text-slate-600 text-sm leading-relaxed mt-2">{product.description}</p>
      </div>

      <ul className="space-y-2">
        {product.highlights.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
            <Check className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-2 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-900">{product.price ?? "Sob consulta"}</p>
            <p className="text-xs text-slate-500">Peça sua cotação sem compromisso</p>
          </div>

          <div
            role="group"
            aria-label={`Quantidade de ${product.name}`}
            className="flex items-center rounded-full border border-slate-200 bg-slate-50 shrink-0"
          >
            <button
              type="button"
              aria-label="Diminuir quantidade"
              disabled={quantity <= min}
              onClick={() => onQuantityChange(product.id, Math.max(min, quantity - step))}
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="min-w-[3rem] text-center font-semibold text-slate-900 tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Aumentar quantidade"
              disabled={quantity >= MAX_QUANTITY}
              onClick={() => onQuantityChange(product.id, Math.min(MAX_QUANTITY, quantity + step))}
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            asChild
            className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a] text-slate-900 font-bold"
          >
            <a
              href={buildWhatsAppLink(buildProductMessage(product, quantity))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              Pedir no WhatsApp
            </a>
          </Button>

          <Button
            type="button"
            variant="outline"
            aria-pressed={inOrder}
            onClick={() => onToggleOrder(product.id)}
            className={`w-full h-12 rounded-xl font-semibold transition-colors ${
              inOrder
                ? "bg-blue-50 border-blue-200 text-[#2563EB] hover:bg-blue-100"
                : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
            }`}
          >
            {inOrder ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                No pedido (remover)
              </>
            ) : (
              "Adicionar ao pedido"
            )}
          </Button>
        </div>
      </div>
    </motion.article>
  )
}

export default function LojaPage() {
  const [category, setCategory] = useState<StoreCategory | "todos">("todos")
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [order, setOrder] = useState<Set<string>>(() => new Set())

  const getQuantity = (p: StoreProduct) => quantities[p.id] ?? 1

  const handleQuantityChange = (id: string, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [id]: quantity }))
  }

  const toggleOrder = (id: string) => {
    setOrder((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const clearOrder = () => setOrder(new Set())

  const scrollToCatalog = () => {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })
  }

  const visibleProducts =
    category === "todos" ? storeProducts : storeProducts.filter((p) => p.category === category)

  const activeCategory = storeCategories.find((c) => c.id === category)

  const orderItems = storeProducts
    .filter((p) => order.has(p.id))
    .map((p) => ({ product: p, quantity: getQuantity(p) }))

  return (
    <MotionConfig reducedMotion="user">
      <main className={`flex flex-col w-full bg-[#FAFBFC] ${orderItems.length > 0 ? "pb-32" : ""}`}>
        {/* HERO */}
        <section className="relative w-full min-h-[70svh] bg-slate-900 flex items-center overflow-hidden pt-28 pb-20">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" aria-hidden="true" />
          <div className="hidden md:block absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px]" aria-hidden="true" />

          <div className="container-premium relative z-10 w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-[#00B8FF] font-bold tracking-wider text-sm uppercase mb-4 block">
                  Loja Infinity
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Tecnologia{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    NFC
                  </span>{" "}
                  para a sua marca
                </h1>
                <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl">
                  Cartões, plaquinhas e brindes NFC personalizados com a sua marca. Cada produto é feito sob medida e
                  você faz o pedido direto pelo WhatsApp, sem complicação.
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                  <Button
                    type="button"
                    size="lg"
                    onClick={scrollToCatalog}
                    className="bg-[#00B8FF] hover:bg-[#009bd6] text-slate-900 font-bold text-lg h-14 px-8 rounded-full shadow-[0_0_20px_rgba(0,184,255,0.3)] hover:shadow-[0_0_30px_rgba(0,184,255,0.5)] transition-all"
                  >
                    Ver produtos
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="bg-[#25D366] hover:bg-[#1ebe5a] text-slate-900 font-bold text-lg h-14 px-8 rounded-full transition-all"
                  >
                    <a href={genericWhatsAppLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-5 h-5" aria-hidden="true" />
                      Pedir pelo WhatsApp
                    </a>
                  </Button>
                </div>
              </motion.div>

              {/* Decorative card mockup (desktop) */}
              <div className="hidden lg:flex justify-center relative" aria-hidden="true">
                <div className="absolute w-80 h-80 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="relative w-96 h-56 rounded-[2rem] bg-gradient-to-br from-blue-500 via-indigo-600 to-slate-900 shadow-2xl shadow-blue-900/50 border border-white/10 p-7 flex flex-col justify-between -rotate-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm font-semibold tracking-widest">INFINITY</span>
                    <Nfc className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-xl">Seu contato em um toque</p>
                    <p className="text-blue-100 text-sm">Cartão NFC personalizado</p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-2 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-[#2563EB]" />
                  <span className="text-sm font-semibold text-slate-900">Um toque e pronto</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATALOGO */}
        <section id="catalogo" className="py-24 bg-[#FAFBFC] scroll-mt-24">
          <div className="container-premium">
            <div className="max-w-3xl mb-10">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Escolha seus produtos NFC</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Monte seu pedido e envie tudo de uma vez pelo WhatsApp. Os valores são sob consulta, de acordo com a
                quantidade e a personalização.
              </p>
            </div>

            <div role="group" aria-label="Filtrar por categoria" className="flex flex-wrap gap-3 mb-4">
              {filterOptions.map((option) => {
                const active = category === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(option.id)}
                    className={`rounded-full px-5 py-2.5 text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 ${
                      active
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
            <p className="text-sm text-slate-500 mb-10 min-h-[1.25rem]">{activeCategory?.description}</p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={getQuantity(product)}
                  inOrder={order.has(product.id)}
                  onQuantityChange={handleQuantityChange}
                  onToggleOrder={toggleOrder}
                />
              ))}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="py-24 bg-white border-y border-slate-200">
          <div className="container-premium">
            <div className="text-center mb-16">
              <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-4 block">Como funciona</span>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Do catálogo ao seu produto em três passos</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {steps.map(({ title, text, Icon }, index) => (
                <div
                  key={title}
                  className="bg-[#FAFBFC] rounded-[2rem] p-8 border border-slate-100 flex flex-col gap-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <Icon className="w-7 h-7" aria-hidden="true" />
                    </div>
                    <span className="text-5xl font-bold text-slate-200" aria-hidden="true">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                  <p className="text-slate-600 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* O QUE E NFC */}
        <section className="py-24 bg-[#FAFBFC]">
          <div className="container-premium">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-4 block">Tecnologia</span>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">O que é NFC?</h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-4">
                  NFC é uma tecnologia de comunicação por aproximação. Um chip pequeno, colocado dentro do produto,
                  guarda um link ou uma informação, e o celular lê tudo ao encostar.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Na prática, seu cliente encosta o celular e acessa seu contato, suas redes, seu cardápio ou sua página
                  de avaliações na hora.
                </p>
              </div>

              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Compatibilidade</h3>
                <ul className="space-y-4">
                  {[
                    "Funciona sem precisar de aplicativo: basta encostar o celular.",
                    "Compatível com iPhone XS ou mais novo.",
                    "Compatível com a maioria dos Android com NFC ativado.",
                    "O link gravado pode ser alterado depois.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-white border-t border-slate-200">
          <div className="container-premium">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-12 text-center">Perguntas frequentes</h2>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-2xl border border-slate-200 bg-[#FAFBFC] p-6 open:bg-white open:shadow-lg open:shadow-slate-200/50"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-slate-900 [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-lg">
                      {faq.question}
                      <ChevronDown className="w-5 h-5 shrink-0 text-slate-500 transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <p className="mt-4 text-slate-600 leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-24 relative overflow-hidden bg-white">
          <div className="container-premium relative z-10">
            <div className="bg-[#0052CC] rounded-[3rem] px-6 py-16 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-900/30">
              <div className="hidden md:block absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3" aria-hidden="true" />
              <div className="hidden md:block absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] transform -translate-x-1/3 translate-y-1/3" aria-hidden="true" />

              <div className="relative z-10 max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight">Pronto para fazer seu pedido?</h2>
                <p className="text-xl text-blue-100 mb-12 leading-relaxed max-w-2xl mx-auto">
                  Escolha seus produtos ou fale direto com a nossa equipe pelo WhatsApp.
                </p>
                <div className="flex justify-center">
                  <Button
                    asChild
                    className="bg-[#25D366] hover:bg-[#1ebe5a] text-slate-900 font-bold text-lg md:text-xl h-auto min-h-[56px] md:h-20 w-full sm:w-auto whitespace-normal px-6 md:px-16 rounded-full shadow-lg transition-all md:hover:scale-105"
                  >
                    <a href={genericWhatsAppLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-6 h-6" aria-hidden="true" />
                      Pedir pelo WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* PEDIDO FLUTUANTE */}
      <AnimatePresence>
        {orderItems.length > 0 && (
          <motion.div
            key="order-bar"
            role="region"
            aria-label="Resumo do pedido"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-4 inset-x-4 max-w-2xl mx-auto z-50"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl bg-slate-900 text-white shadow-2xl shadow-slate-900/40 p-4">
              <p className="font-semibold">
                {orderItems.length} {orderItems.length === 1 ? "item" : "itens"} no pedido
              </p>
              <div className="flex items-center gap-3 sm:ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearOrder}
                  className="text-slate-300 hover:text-white hover:bg-white/10 rounded-xl h-11"
                >
                  Limpar
                </Button>
                <Button
                  asChild
                  className="flex-1 sm:flex-none bg-[#25D366] hover:bg-[#1ebe5a] text-slate-900 font-bold rounded-xl h-11"
                >
                  <a
                    href={buildWhatsAppLink(buildOrderMessage(orderItems))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-5 h-5" aria-hidden="true" />
                    Enviar pedido no WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
