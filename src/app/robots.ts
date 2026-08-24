import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://infinitygroup.tech"

  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/portal/", "/client/", "/login"],
    }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
