import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ConditionalLayout } from "@/components/conditional-layout"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://infinitygroup.tech"),
  title: {
    default: "Infinity Groups | Software, Sites e Automação",
    template: "%s | Infinity Groups",
  },
  description:
    "Desenvolvimento de software, sites, aplicativos, e-commerce e automações sob medida para empresas que querem crescer com segurança e performance.",
  keywords: [
    "desenvolvimento de software",
    "criação de sites",
    "aplicativos mobile",
    "automação empresarial",
    "e-commerce",
    "empresa de tecnologia São Paulo",
  ],
  authors: [{ name: "Infinity Groups" }],
  creator: "Infinity Groups",
  publisher: "Infinity Groups",
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Infinity Groups",
    title: "Infinity Groups | Software, Sites e Automação",
    description: "Tecnologia sob medida para transformar operações, acelerar vendas e escalar empresas.",
    images: [{
      url: "/images/logo-Infinity/logo-optimized-next.webp",
      width: 640,
      height: 393,
      alt: "Infinity Groups",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infinity Groups | Software, Sites e Automação",
    description: "Tecnologia sob medida para transformar operações, acelerar vendas e escalar empresas.",
    images: ["/images/logo-Infinity/logo-optimized-next.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: { icon: "/favicon.ico" },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#071426",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://infinitygroup.tech"
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Infinity Groups",
    url: siteUrl,
    logo: `${siteUrl}/images/logo-Infinity/logo-optimized-next.webp`,
    email: "contato@infinitygroup.tech",
    telephone: "+55-11-94533-2464",
    address: {
      "@type": "PostalAddress",
      addressLocality: "São Paulo",
      addressRegion: "SP",
      addressCountry: "BR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+55-11-94533-2464",
      contactType: "sales",
      availableLanguage: ["Portuguese", "English", "Spanish"],
    },
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ConditionalLayout>{children}</ConditionalLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
