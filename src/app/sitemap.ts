import type { MetadataRoute } from "next"

const publicRoutes = [
  "",
  "/sobre",
  "/produtos",
  "/produtos/infinity-crm",
  "/portfolio",
  "/orcamento",
  "/marketing",
  "/servicos/websites",
  "/servicos/aplicativos-celular",
  "/servicos/aplicativos-computador",
  "/servicos/automacoes",
  "/servicos/ecommerce",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://infinitygroup.tech"
  const lastModified = new Date()

  return publicRoutes.map((route, index) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : route === "/orcamento" ? 0.9 : 0.8,
  }))
}
