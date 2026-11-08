export const STORE_WHATSAPP = "5511945332464"

export type StoreCategory = "cartoes" | "plaquinhas" | "brindes"

export const storeCategories: { id: StoreCategory; label: string; description: string }[] = [
  {
    id: "cartoes",
    label: "Cartões NFC",
    description: "Cartões de visita que compartilham seu contato com um toque.",
  },
  {
    id: "plaquinhas",
    label: "Plaquinhas NFC",
    description: "Plaquinhas para balcão, mesa e vitrine com link direto.",
  },
  {
    id: "brindes",
    label: "Brindes NFC",
    description: "Chaveiros, tags, adesivos e pulseiras para ações e eventos.",
  },
]

export type StoreProduct = {
  id: string
  category: StoreCategory
  name: string
  description: string
  highlights: string[]
  price?: string
  image?: string
  badge?: string
}

export const storeProducts: StoreProduct[] = [
  {
    id: "cartao-visita-nfc",
    category: "cartoes",
    name: "Cartão de Visita NFC",
    description:
      "Cartão de PVC personalizado com chip NFC. Compartilhe seu contato, redes sociais ou link com um toque no celular.",
    highlights: [
      "Impressão colorida em PVC",
      "Chip NFC programado com o seu link",
      "Frente e verso personalizados",
    ],
    image: "/images/loja/cartao-visita-nfc.webp",
    badge: "Mais pedido",
  },
  {
    id: "cartao-nfc-premium",
    category: "cartoes",
    name: "Cartão NFC Premium",
    description:
      "Acabamento em metal ou fosco para uma apresentação marcante. Ideal para executivos e marcas de alto padrão.",
    highlights: [
      "Acabamento fosco ou metálico",
      "Gravação a laser opcional",
      "Chip NFC de alta sensibilidade",
    ],
    image: "/images/loja/cartao-nfc-premium.webp",
  },
  {
    id: "plaquinha-avaliacao-google",
    category: "plaquinhas",
    name: "Plaquinha Avaliação Google",
    description:
      "Seu cliente encosta o celular e vai direto para a sua página de avaliações no Google.",
    highlights: [
      "Link direto para avaliações no Google",
      "Material resistente para balcão e vitrine",
      "Cliente não precisa instalar nada",
    ],
    image: "/images/loja/plaquinha-avaliacao-google.webp",
    badge: "Ideal para comércio",
  },
  {
    id: "plaquinha-nfc-multiuso",
    category: "plaquinhas",
    name: "Plaquinha NFC Multiuso",
    description:
      "Um toque abre o seu Instagram, o Wi-Fi, o cardápio digital ou qualquer link que você precisar.",
    highlights: [
      "Instagram, Wi-Fi, cardápio ou link",
      "Conteúdo atualizável a qualquer momento",
      "Ótima para restaurantes e lojas",
    ],
    image: "/images/loja/plaquinha-nfc-multiuso.webp",
  },
  {
    id: "chaveiro-nfc",
    category: "brindes",
    name: "Chaveiro NFC",
    description:
      "Brinde útil que leva a sua marca para o dia a dia do cliente, com o seu contato sempre a um toque de distância.",
    highlights: [
      "Formato compacto e resistente",
      "Personalização frente e verso",
      "Ótimo para ações de relacionamento",
    ],
    image: "/images/loja/chaveiro-nfc.webp",
  },
  {
    id: "tag-adesivo-nfc",
    category: "brindes",
    name: "Tag / Adesivo NFC",
    description:
      "Adesivos NFC para colar em produtos, embalagens, equipamentos ou no verso do celular.",
    highlights: [
      "Cola em qualquer superfície lisa",
      "Ideal para embalagens e produtos",
      "Conteúdo fácil de atualizar",
    ],
    image: "/images/loja/tag-adesivo-nfc.webp",
  },
  {
    id: "pulseira-nfc",
    category: "brindes",
    name: "Pulseira NFC",
    description:
      "Pulseira de silicone com chip NFC para credenciamento, eventos e acesso rápido a informações.",
    highlights: [
      "Silicone confortável e personalizável",
      "Ideal para eventos e credenciamento",
      "Ajuste fácil ao pulso",
    ],
    image: "/images/loja/pulseira-nfc.webp",
  },
]

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`
}

const GREETING = "Olá! Vim pela Loja NFC do site da Infinity Groups"

export function buildProductMessage(p: StoreProduct, quantity?: number): string {
  const qty = quantity !== undefined ? ` (quantidade: ${quantity})` : ""
  return `${GREETING} e tenho interesse em: *${p.name}*${qty}. Pode me enviar uma cotação?`
}

export function buildOrderMessage(items: { product: StoreProduct; quantity: number }[]): string {
  const lines = items.map(({ product, quantity }) => `• ${product.name} — ${quantity} un.`)
  return `${GREETING} e montei o seguinte pedido:\n\n${lines.join("\n")}\n\nPode me enviar uma cotação?`
}
